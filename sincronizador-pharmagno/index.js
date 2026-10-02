"use strict";

require("dotenv").config();
const Firebird = require("node-firebird");
const fs = require("fs");
const path = require("path");

const ONCE = process.argv.includes("--once");
const DRY_RUN = process.argv.includes("--dry-run");
const INTERVAL_MS = Math.max(10, Number(process.env.SYNC_INTERVAL_SECONDS || 30)) * 1000;
const LOG_FILE = path.join(__dirname, "logs", "sincronizador.log");

function boolEnv(name, fallback = false) {
  const v = process.env[name];
  if (v == null) return fallback;
  return ["1", "true", "sim", "yes", "on"].includes(String(v).toLowerCase());
}

function log(...parts) {
  const line = `[${new Date().toISOString()}] ${parts.join(" ")}`;
  console.log(line);
  if (boolEnv("LOG_TO_FILE", true)) {
    try { fs.appendFileSync(LOG_FILE, line + "\n", "utf8"); } catch (_) {}
  }
}

function required(name) {
  const value = process.env[name];
  if (!value || /COLOQUE_A_/i.test(value)) throw new Error(`Configure ${name} no arquivo .env`);
  return value;
}

const firebirdOptions = {
  host: process.env.FIREBIRD_HOST || "127.0.0.1",
  port: Number(process.env.FIREBIRD_PORT || 3050),
  database: process.env.FIREBIRD_DATABASE || "C:\\MAGNO SYSTEM\\PHARMAGNO\\SISGEMP.FDB",
  user: process.env.FIREBIRD_USER || "SYSDBA",
  password: process.env.FIREBIRD_PASSWORD,
  lowercase_keys: true,
  role: null,
  pageSize: 4096,
  charset: process.env.FIREBIRD_CHARSET || "ISO8859_1"
};

// Baseada na consulta oficial enviada pela MAGNO SYSTEM.
// A única adaptação é não filtrar ESTOQUE > 0, para que o site também receba estoque zerado.
const PHARMAGNO_SQL = `
SELECT
  P.CODIGO AS SKU,
  (COALESCE(P.PRODUTO, '') || ' ' || COALESCE(P.APRESENTACAO, '')) AS DESCRICAO,
  COALESCE(P.ESTOQUEATUAL, 0.000) AS ESTOQUE,
  P.PRECOCUSTO AS CUSTO,
  P.PRECOWEB AS PRECOWEB,
  P.PRECOVENDA AS VENDA,
  CAST(
    P.PRECOVENDA - (
      (SELECT VALORDESCONTOVISTA
       FROM PROC_CALCULAPRECOPROMOCAO(P.CODIGO, 1.000, 'N'))
      / CAST(1.000 AS NUMERIC(15,3))
    ) AS NUMERIC(15,2)
  ) AS PROMOCAO
FROM PRODUTOS P
WHERE COALESCE(P.PRECOVENDA, 0.000) > 0.00
`;

function queryFirebird(sql) {
  return new Promise((resolve, reject) => {
    Firebird.attach(firebirdOptions, (err, db) => {
      if (err) return reject(err);
      db.query(sql, (queryErr, result) => {
        db.detach(() => {});
        if (queryErr) return reject(queryErr);
        resolve(result || []);
      });
    });
  });
}

function cleanText(value) {
  if (value == null) return "";
  if (Buffer.isBuffer(value)) return value.toString("latin1").trim();
  return String(value).replace(/\s+/g, " ").trim();
}

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeRow(r) {
  const codigo = cleanText(r.sku);
  const venda = num(r.venda);
  const promocaoBruta = num(r.promocao, venda);
  const promocao = promocaoBruta > 0 ? Math.min(venda, promocaoBruta) : venda;
  return {
    codigo,
    produto: cleanText(r.descricao),
    estoque: num(r.estoque),
    preco_prazo: venda,
    preco_vista: promocao,
    ativo: true
  };
}

function sbHeaders(extra = {}) {
  const key = required("SUPABASE_SERVICE_ROLE_KEY");
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extra
  };
}

async function sbFetch(pathname, options = {}) {
  const base = required("SUPABASE_URL").replace(/\/$/, "");
  const res = await fetch(base + pathname, {
    ...options,
    headers: sbHeaders(options.headers || {})
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase ${res.status}: ${body.slice(0, 500)}`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function loadSupabaseProducts() {
  const all = [];
  const page = 1000;
  for (let offset = 0; ; offset += page) {
    const rows = await sbFetch(`/rest/v1/produtos_pharmagno?select=id,codigo,produto,preco_prazo,preco_vista,estoque,ativo&order=id.asc&limit=${page}&offset=${offset}`);
    all.push(...(rows || []));
    if (!rows || rows.length < page) break;
  }
  return all;
}

function changed(a, b) {
  const moneyDiff = (x, y) => Math.abs(num(x) - num(y)) > 0.004;
  if (moneyDiff(a.preco_prazo, b.preco_prazo)) return true;
  if (moneyDiff(a.preco_vista, b.preco_vista)) return true;
  if (Math.abs(num(a.estoque) - num(b.estoque)) > 0.0004) return true;
  if (boolEnv("SYNC_PRODUCT_NAME", true) && cleanText(a.produto) !== cleanText(b.produto)) return true;
  if (b.ativo === false) return true;
  return false;
}

async function updateProduct(id, p) {
  const body = {
    preco_prazo: p.preco_prazo,
    preco_vista: p.preco_vista,
    estoque: p.estoque,
    ativo: true
  };
  if (boolEnv("SYNC_PRODUCT_NAME", true)) body.produto = p.produto;
  if (DRY_RUN) return;
  await sbFetch(`/rest/v1/produtos_pharmagno?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(body)
  });
}

async function insertProduct(p) {
  if (!boolEnv("SYNC_INSERT_NEW_PRODUCTS", true)) return false;
  if (DRY_RUN) return true;
  await sbFetch(`/rest/v1/produtos_pharmagno`, {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(p)
  });
  return true;
}

async function syncOnce() {
  const started = Date.now();
  log(DRY_RUN ? "Teste sem gravar: iniciando..." : "Sincronização iniciada...");

  const raw = await queryFirebird(PHARMAGNO_SQL);
  const pharmRows = raw.map(normalizeRow).filter(p => p.codigo && p.preco_prazo > 0);
  log(`Pharmagno: ${pharmRows.length} produtos consultados.`);

  const existing = await loadSupabaseProducts();
  const byCode = new Map(existing.map(p => [cleanText(p.codigo), p]));

  let updated = 0, inserted = 0, unchanged = 0;
  for (const p of pharmRows) {
    const current = byCode.get(p.codigo);
    if (!current) {
      if (await insertProduct(p)) inserted++;
      continue;
    }
    if (!changed(p, current)) {
      unchanged++;
      continue;
    }
    await updateProduct(current.id, p);
    updated++;
  }

  log(`Concluído em ${((Date.now() - started) / 1000).toFixed(1)}s. Atualizados=${updated}, novos=${inserted}, sem mudança=${unchanged}.`);
  return { updated, inserted, unchanged, total: pharmRows.length };
}

let running = false;
async function safeRun() {
  if (running) return;
  running = true;
  try {
    await syncOnce();
  } catch (err) {
    log("ERRO:", err && err.stack ? err.stack.replace(/\n/g, " | ") : String(err));
  } finally {
    running = false;
  }
}

(async () => {
  try {
    required("FIREBIRD_PASSWORD");
    required("SUPABASE_URL");
    required("SUPABASE_SERVICE_ROLE_KEY");
  } catch (e) {
    console.error(`\nCONFIGURAÇÃO PENDENTE: ${e.message}\nAbra o arquivo .env antes de iniciar.\n`);
    process.exit(1);
  }

  await safeRun();
  if (ONCE) process.exit(0);
  log(`Modo contínuo ativo: nova consulta a cada ${Math.round(INTERVAL_MS/1000)}s.`);
  setInterval(safeRun, INTERVAL_MS);
})();
