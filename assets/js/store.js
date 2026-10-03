/*
 * LOJA
 * -----------------------------------------------------------------------------
 * Este arquivo controla somente a experiência do cliente:
 * catálogo, pesquisa, filtros, sacola, promoções e encaminhamento.
 */

let dados = carregarDados();
let sacola = [];
let promocoesCatalogo = [];

// Paginação do catálogo
const PRODUTOS_POR_PAGINA = 24;
let paginaAtual = 1;
let filtroAtual = "Todos";
let termoAtual = "";
let tipoBelezaAtual = "Todos";
let detalheBelezaAtual = "Todos";

// Referências da interface. Mantidas em um único lugar para evitar falhas silenciosas
// quando o catálogo remoto terminar de carregar.
const el = {
  categorias: document.querySelector("#categoryGrid"),
  produtos: document.querySelector("#productGrid"),
  promo: document.querySelector("#activePromo"),
  contador: document.querySelector("#bagCount"),
  itens: document.querySelector("#bagItems"),
  total: document.querySelector("#bagTotal"),
  drawer: document.querySelector("#bagDrawer"),
  backdrop: document.querySelector("#drawerBackdrop"),
  searchbar: document.querySelector("#searchbar"),
  busca: document.querySelector("#searchInput"),
  entregas: document.querySelector("#deliveryOptions"),
  subfiltros: document.querySelector("#catalogSubfilters")
};

function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {style:"currency", currency:"BRL"});
}

function linkWhatsapp(mensagem) {
  const numero = String(dados?.configuracoes?.whatsapp || "5577998514808").replace(/\D/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem || "")}`;
}

function categoriaLoja(p) {
  const classe = String(p.classe || '').trim();
  const subclasse = String(p.subclasse || '').trim();
  const texto = `${p.produto || ''} ${p.laboratorio || ''} ${classe} ${subclasse}`
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const nome = String(p.produto || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

  // 1) O nome/apresentação do produto é a evidência mais forte para medicamentos.
  // Isso impede que xaropes pediátricos virem "Infantil" só por conterem a palavra infantil.
  const medicamentoPeloProduto =
    /\b(COMPRIMID|CAPSUL|XAROPE|XPE|SUSPENSAO|SOLUCAO ORAL|GOTAS?|AMPOLA|INJET|COLIRIO|SUPOSITORIO|ANTIBIOT|ANALGES|ANTITERM|ANTI-INFLAM|ANTIALERG|VERMIFUG|BRONCODIL|EXPECTOR|MUCOLIT|ANTIGRIPAL)\b/.test(nome) ||
    /\b\d+(?:[.,]\d+)?\s*(MG|MCG|UI)(?:\s*\/\s*\d*(?:[.,]\d+)?\s*ML)?\b/.test(nome) ||
    /\b(ACEBROFILINA|ALBENDAZOL|ABRYFLUI|DIPIRONA|PARACETAMOL|IBUPROFENO|AMOXICILINA|AZITROMICINA|LORATADINA|PREDNISOLONA|SIMETICONA|ACETILCISTEINA|AMBROXOL|DEXCLORFENIRAMINA|NIMESULIDA|CETIRIZINA|DESLORATADINA)\b/.test(nome);
  if (medicamentoPeloProduto) return 'Medicamentos Éticos e Similares Equivalentes';

  // 2) A lista curada de Perfumaria/Cosméticos corrige cadastros antigos do Pharmagno.
  // Ex.: absorventes não devem virar medicamentos só porque a classe de origem veio errada.
  const especial = window.classificarPerfumariaCosmeticos?.(p.produto);
  if (especial) return especial.tipo;

  // 3) Produtos de higiene/perfumaria podem estar cadastrados no Pharmagno com classe
  // farmacêutica antiga. O NOME do produto prevalece antes da classe de origem.
  // Ex.: ABS.ENLACE / absorventes nunca devem aparecer em Medicamentos.
  const higienePeloNome =
    /\b(ABSORVENTE|PROTETOR DIARIO|ALGODAO|COTONETE|HASTE FLEXIVEL|PAPEL HIGIENICO|FRALDA GERIATRICA|SABONETE|CREME DENTAL|PASTA DENTAL|ESCOVA DENTAL|FIO DENTAL|ENXAGUANTE)\b/.test(nome) ||
    /^(ABS[. _-]|ABSORB)/.test(nome);
  if (higienePeloNome) return 'Higiene';

  // 4) Só depois das exceções por produto respeitamos a classe farmacêutica do Pharmagno.
  const classeSub = `${classe} ${subclasse}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  if (/MEDICAMENT|ETIC|GENERICO|SIMILAR|FARMACO/.test(classeSub)) {
    return 'Medicamentos Éticos e Similares Equivalentes';
  }

  const infantil = /\b(FRALDA|PAMPERS|HUGGIES|BABYSEC|ISABABY|PIQUITUCHO|POMPOM|LENCO UMEDECIDO|MAMADEIRA|CHUPETA|BICO DE MAMADEIRA|ABSORVENTE SEIO|ESCOVA INFANTIL|PENTE INFANTIL)\b/.test(texto);
  if (infantil) return 'Infantil';

  const classeNorm = classe.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  if (/COSMET/.test(classeNorm)) return 'Cosméticos';
  if (/PERFUM/.test(classeNorm)) return 'Perfumaria';
  if (/HIGIENE/.test(classeNorm)) return 'Higiene';
  if (/INFANTIL/.test(classeNorm)) return 'Infantil';

  if (/\b(ABSORVENTE|SABONETE|CREME DENTAL|PASTA DENTAL|ESCOVA DENTAL|FIO DENTAL|ENXAGUANTE|ALGODAO|COTONETE|PAPEL HIGIENICO|PROTETOR DIARIO|HASTE FLEXIVEL)\b/.test(texto)) return 'Higiene';
  return 'Higiene';
}
async function carregarTodasPaginas(base, headers) {
  const todos = [];
  for (let ini = 0; ; ini += 1000) {
    const fim = ini + 999;
    const r = await fetch(base, {headers:{...headers, Range:`${ini}-${fim}`, Prefer:'count=exact'}});
    if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
    const lote = await r.json(); todos.push(...lote);
    if (lote.length < 1000) break;
  }
  return todos;
}

async function carregarCatalogoSupabase() {
  const cfg = window.SUPABASE_CONFIG;
  if (!cfg?.url || !cfg?.key) return false;
  const headers = { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` };
  const endpoint = `${cfg.url}/rest/v1/produtos_pharmagno?select=id,codigo,produto,laboratorio,classe,subclasse,preco_prazo,preco_vista,estoque,imagem_url,desconto_fixo_pct,excecao_promocao,promocao_manual,ativo&ativo=eq.true&estoque=gt.0&order=produto.asc`;
  const linhas = await carregarTodasPaginas(endpoint, headers);
  try {
    const rr = await fetch(`${cfg.url}/rest/v1/promocoes_catalogo?select=*&ativo=eq.true`, {headers});
    promocoesCatalogo = rr.ok ? await rr.json() : [];
  } catch (_) { promocoesCatalogo = []; }
  dados.produtos = linhas.map(p => {
    const especial = window.classificarPerfumariaCosmeticos?.(p.produto);
    const classeCatalogo = categoriaLoja(p);
    const usaCatalogoBeleza = especial && ['Perfumaria','Cosméticos'].includes(classeCatalogo);
    const subclasseCatalogo = usaCatalogoBeleza ? especial.tipo : (p.subclasse||'');
    return {
    id:p.id, codigo:p.codigo, nome:p.produto, marca:p.laboratorio||'',
    setor:subclasseCatalogo || p.classe || 'Higiene', subclasse:subclasseCatalogo,
    categoriaDetalhe:usaCatalogoBeleza ? (especial?.categoria||'') : '',
    eanReferencia:usaCatalogoBeleza ? (especial?.ean||'') : '',
    classeOriginal:usaCatalogoBeleza ? 'Perfumaria e Cosméticos' : (p.classe||''), categoria: classeCatalogo,
    // Pharmagno: preco_prazo = preço cheio; preco_vista = preço à vista/valor já descontado.
    // Mantemos os dois separados para não exibir o mesmo valor duas vezes no WhatsApp.
    preco:Number(p.preco_prazo ?? p.preco_vista ?? 0),
    precoCheio:Number(p.preco_prazo ?? p.preco_vista ?? 0),
    precoVista:Number(p.preco_vista ?? p.preco_prazo ?? 0),
    estoque:Number(p.estoque||0),
    descontoFixo:Number(p.desconto_fixo_pct||0), excecaoPromocao:p.excecao_promocao||'',
    promocaoManual:p.promocao_manual||'', imagemUrl:p.imagem_url||'', icone:'✚', ativo:p.ativo!==false,
    descricao:usaCatalogoBeleza ? `${especial.tipo} • ${especial.categoria}` : (p.subclasse ? `${p.classe} • ${p.subclasse}` : (p.classe||''))
  };
  });
  const ordem=['Medicamentos Éticos e Similares Equivalentes','Perfumaria','Cosméticos','Higiene','Infantil'];
  dados.categorias = ordem.filter(nome=>dados.produtos.some(p=>p.categoria===nome)).map(nome=>({nome,icone:'✚',descricao:'Ver produtos'}));
  return true;
}

function renderCategorias() {
  el.categorias.innerHTML = dados.categorias.map(c => `
    <button class="category" data-category="${c.nome}">
      <i>${c.icone}</i><b>${c.nome}</b><small>${c.descricao}</small>
    </button>
  `).join("");

  el.categorias.querySelectorAll("[data-category]").forEach(btn => {
    btn.addEventListener("click", () => {
      tipoBelezaAtual='Todos'; detalheBelezaAtual='Todos';
      renderProdutos(btn.dataset.category);
      document.querySelector("#ofertas").scrollIntoView({behavior:"smooth"});
    });
  });
}

function placeholderProduto(produto) {
  // O placeholder segue a categoria FINAL do catálogo, não palavras soltas do nome.
  // Assim "ACEBROFILINA ... INFANTIL" continua com símbolo de Medicamentos.
  const categoria = String(produto.categoria || 'Higiene');
  let tipo = 'higiene', simbolo = '◉', titulo = 'Higiene & Cuidados';

  if (categoria === 'Medicamentos Éticos e Similares Equivalentes') {
    tipo = 'medicamentos'; simbolo = '✚'; titulo = 'Medicamentos';
  } else if (categoria === 'Infantil') {
    tipo = 'infantil'; simbolo = '♡'; titulo = 'Linha Infantil';
  } else if (categoria === 'Perfumaria' || categoria === 'Cosméticos') {
    tipo = 'perfumaria'; simbolo = '✦'; titulo = categoria;
  } else if (/suplement/i.test(categoria)) {
    tipo = 'suplementos'; simbolo = '◆'; titulo = 'Vitaminas & Suplementos';
  }

  return `<div class="product-placeholder ${tipo}" aria-label="${titulo}">
    <span class="placeholder-symbol">${simbolo}</span>
    <b>${titulo}</b>
    <small>Foto não cadastrada</small>
  </div>`;
}
function obterOfertaProduto(produto) {
  const precoCheio = Number(produto.precoCheio ?? produto.preco ?? 0);
  const precoVista = Number(produto.precoVista ?? precoCheio);

  // Começa pelo menor preço real informado pelo Pharmagno.
  let precoFinal = precoVista > 0 ? Math.min(precoCheio || precoVista, precoVista) : precoCheio;
  let origem = precoFinal < precoCheio - 0.009 ? "Pharmagno / à vista" : "Preço normal";

  // Promoções locais não são somadas entre si nem sobre o preço à vista.
  // Comparamos as opções e usamos somente o menor preço final.
  const base = calcularPrecoPromocional({...produto, preco: precoCheio}, dados.promocoes);
  if (Number(base.precoFinal) < precoFinal - 0.009) {
    precoFinal = Number(base.precoFinal);
    origem = base.promocao?.nome || "Promoção do site";
  }

  const descontoFixo = produto.excecaoPromocao ? 0 : Number(produto.descontoFixo || 0);
  const regras = produto.excecaoPromocao ? [] : promocoesCatalogo.filter(r =>
    r.ativo && (
      (r.tipo === "classe" && r.classe === (produto.classeOriginal || produto.categoria)) ||
      (r.tipo === "subclasse" && r.classe === (produto.classeOriginal || produto.categoria) && r.subclasse === produto.subclasse)
    )
  );
  const descontoGrupo = regras.length ? Math.max(...regras.map(r => Number(r.desconto || 0))) : 0;
  const melhorConfigurado = Math.max(descontoFixo, descontoGrupo);
  const precoConfigurado = melhorConfigurado ? precoCheio * (1 - melhorConfigurado / 100) : precoCheio;
  if (precoConfigurado < precoFinal - 0.009) {
    precoFinal = precoConfigurado;
    origem = "Promoção cadastrada";
  }

  // Regra comercial da loja: Medicamentos, Perfumaria e Cosméticos têm
  // no mínimo 10% OFF. Independe de foto, pois é calculada pelos dados do produto.
  const categoriaPromo = String(produto.categoria || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const minimoDez = /MEDICAMENT|PERFUMARIA|COSMETIC/.test(categoriaPromo);
  if (minimoDez && !produto.excecaoPromocao && precoCheio > 0) {
    const precoMinimo10 = precoCheio * 0.90;
    if (precoMinimo10 < precoFinal - 0.009) {
      precoFinal = precoMinimo10;
      origem = "Oferta 10% da loja";
    }
  }

  const desconto = precoCheio > 0 && precoFinal < precoCheio - 0.009
    ? ((precoCheio - precoFinal) / precoCheio) * 100
    : 0;

  return {precoCheio, precoFinal, desconto, origem};
}

function cardProduto(produto) {
  const oferta = obterOfertaProduto(produto);
  // A tarja é determinada pela promoção/categoria, nunca pela existência de foto.
  const categoriaNormalizada = String(produto.categoria || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const categoriaComPromoMinima = /MEDICAMENT|PERFUMARIA|COSMETIC/.test(categoriaNormalizada) && !produto.excecaoPromocao;
  const percentualTarja = categoriaComPromoMinima ? Math.max(10, Math.round(oferta.desconto || 0)) : Math.round(oferta.desconto || 0);

  return `
    <article class="product">
      <div class="product-visual">
        ${percentualTarja > 0 ? `<span class="discount">-${percentualTarja}%</span>` : ""}
        ${produto.imagemUrl ? `<img src="${produto.imagemUrl}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';const p=this.nextElementSibling;if(p&&p.classList.contains('product-placeholder'))p.style.display='flex'">${placeholderProduto(produto).replace('class="product-placeholder ', 'style="display:none" class="product-placeholder ')}` : placeholderProduto(produto)}
      </div>
      <div class="product-meta">${['Perfumaria','Cosméticos'].includes(produto.categoria) ? `${produto.categoria}${produto.categoriaDetalhe ? ` • ${produto.categoriaDetalhe}` : ''}` : produto.categoria}</div>
      <h3>${produto.nome}</h3>
      <div class="brand-name">${produto.marca}${produto.eanReferencia ? ` • EAN ${produto.eanReferencia}` : ` • ${produto.setor}`}</div>
      <div class="stock-info">Em estoque: <strong>${Math.max(0, Number(produto.estoque || 0))}</strong> un.</div>
      <p>${produto.descricao}</p>
      <div class="product-bottom">
        <div class="price-box">
          ${oferta.desconto ? `<del>${moeda(oferta.precoCheio)}</del>` : ""}
          <strong>${moeda(oferta.precoFinal)}</strong>
        </div>
        <button class="add" data-add="${produto.id}" aria-label="Adicionar ${produto.nome}">+</button>
      </div>
    </article>`;
}

function renderPaginacao(totalItens) {
  let area = document.querySelector("#catalogPagination");
  if (!area) {
    area = document.createElement("nav");
    area.id = "catalogPagination";
    area.className = "catalog-pagination";
    area.setAttribute("aria-label", "Paginação do catálogo");
    el.produtos.insertAdjacentElement("afterend", area);
  }

  const totalPaginas = Math.ceil(totalItens / PRODUTOS_POR_PAGINA);
  if (totalPaginas <= 1) {
    area.innerHTML = "";
    area.classList.add("hidden");
    return;
  }
  area.classList.remove("hidden");

  const paginas = [];
  const adicionarPagina = n => paginas.push(`<button class="page-btn ${n === paginaAtual ? "active" : ""}" data-page="${n}">${n}</button>`);
  const adicionarReticencias = () => paginas.push('<span class="page-dots">…</span>');

  paginas.push(`<button class="page-btn page-nav" data-page="${paginaAtual - 1}" ${paginaAtual === 1 ? "disabled" : ""}>← Anterior</button>`);

  if (totalPaginas <= 7) {
    for (let i = 1; i <= totalPaginas; i++) adicionarPagina(i);
  } else {
    adicionarPagina(1);
    if (paginaAtual > 4) adicionarReticencias();
    const inicio = Math.max(2, paginaAtual - 1);
    const fim = Math.min(totalPaginas - 1, paginaAtual + 1);
    for (let i = inicio; i <= fim; i++) adicionarPagina(i);
    if (paginaAtual < totalPaginas - 3) adicionarReticencias();
    adicionarPagina(totalPaginas);
  }

  paginas.push(`<button class="page-btn page-nav" data-page="${paginaAtual + 1}" ${paginaAtual === totalPaginas ? "disabled" : ""}>Próxima →</button>`);
  area.innerHTML = paginas.join("");

  area.querySelectorAll("[data-page]:not([disabled])").forEach(btn => {
    btn.addEventListener("click", () => {
      paginaAtual = Number(btn.dataset.page);
      renderProdutos(filtroAtual, termoAtual, false);
      document.querySelector("#ofertas")?.scrollIntoView({behavior:"smooth", block:"start"});
    });
  });
}

function renderSubfiltrosCatalogo(listaBase) {
  if (!el.subfiltros) return;
  if (!['Perfumaria','Cosméticos'].includes(filtroAtual)) {
    el.subfiltros.innerHTML = '';
    el.subfiltros.classList.add('hidden');
    return;
  }
  const detalhes = ['Todos', ...new Set(listaBase.map(p=>p.categoriaDetalhe).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  el.subfiltros.classList.remove('hidden');
  el.subfiltros.innerHTML = `<div class="subfilter-block"><b>Categoria:</b>${detalhes.map(t=>`<button class="subfilter-btn small ${detalheBelezaAtual===t?'active':''}" data-detalhe-beleza="${t}">${t}</button>`).join('')}</div>`;
  el.subfiltros.querySelectorAll('[data-detalhe-beleza]').forEach(b=>b.onclick=()=>{detalheBelezaAtual=b.dataset.detalheBeleza;renderProdutos(filtroAtual,termoAtual)});
}


function categoriaCatalogoSegura(produto) {
  // A categoria já foi definida uma única vez em categoriaLoja().
  // Não reclassificar aqui: a lógica antiga era a causa de medicamentos aparecerem em Higiene.
  return produto?.categoria || "Higiene";
}

function renderProdutos(filtro="Todos", termo="", resetarPagina=true) {
  filtroAtual = filtro;
  termoAtual = termo;
  if (resetarPagina) paginaAtual = 1;

  const listaCategoria = dados.produtos
    .filter(p => p.ativo && Number(p.estoque || 0) > 0)
    .filter(p => filtroAtual === "Todos" || categoriaCatalogoSegura(p) === filtroAtual)
    .filter(p => !termoAtual || `${p.nome} ${p.marca} ${p.categoria} ${p.setor} ${p.categoriaDetalhe||''}`.toLowerCase().includes(termoAtual.toLowerCase()));
  renderSubfiltrosCatalogo(listaCategoria);
  const lista = listaCategoria
    .filter(p => !['Perfumaria','Cosméticos'].includes(filtroAtual) || detalheBelezaAtual === 'Todos' || p.categoriaDetalhe === detalheBelezaAtual);

  const totalPaginas = Math.max(1, Math.ceil(lista.length / PRODUTOS_POR_PAGINA));
  if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
  const inicio = (paginaAtual - 1) * PRODUTOS_POR_PAGINA;
  const pagina = lista.slice(inicio, inicio + PRODUTOS_POR_PAGINA);

  el.produtos.innerHTML = pagina.length ? pagina.map(cardProduto).join("") : "<p>Nenhum produto encontrado.</p>";
  renderPaginacao(lista.length);

  el.produtos.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => adicionar(Number(btn.dataset.add)));
  });

  const globais = dados.promocoes.filter(p => p.tipo === "site" && promocaoEstaValida(p));
  if (globais.length) {
    const maior = globais.reduce((a,b)=>Number(b.desconto)>Number(a.desconto)?b:a);
    el.promo.innerHTML = `<b>${maior.nome}</b> — ${maior.desconto}% de desconto em produtos participantes de todo o site.`;
    el.promo.classList.remove("hidden");
  } else {
    el.promo.classList.add("hidden");
  }
}

function adicionar(id) {
  const produto = dados.produtos.find(p => p.id === id);
  if (!produto) return;

  const estoque = Math.max(0, Number(produto.estoque || 0));
  if (estoque < 1) return alert("Produto sem estoque no momento.");

  const existente = sacola.find(p => String(p.id) === String(id));
  if (existente) {
    const atual = Number(existente.quantidade || 1);
    if (atual >= estoque) return alert(`Há somente ${estoque} unidade(s) disponível(is) em estoque.`);
    existente.quantidade = atual + 1;
    existente.qtd = existente.quantidade;
  } else {
    const oferta = obterOfertaProduto(produto);
    sacola.push({...produto, preco: oferta.precoCheio, precoCheio: oferta.precoCheio, precoFinal: oferta.precoFinal, quantidade: 1, qtd: 1});
  }
  atualizarSacola();
}

function remover(indice) {
  sacola.splice(indice,1);
  atualizarSacola();
}

function alterarQuantidade(indice, novaQuantidade) {
  const item = sacola[indice];
  if (!item) return;
  const estoque = Math.max(0, Number(item.estoque || 0));
  const quantidade = Math.max(1, Math.min(estoque, Number(novaQuantidade) || 1));
  item.quantidade = quantidade;
  item.qtd = quantidade;
  atualizarSacola();
}

function atualizarSacola() {
  const totalItens = sacola.reduce((t,p)=>t + Number(p.quantidade || p.qtd || 1), 0);
  el.contador.textContent = totalItens;

  el.itens.innerHTML = sacola.length
    ? sacola.map((p,i)=>{
      const estoque = Math.max(0, Number(p.estoque || 0));
      const quantidade = Math.max(1, Math.min(estoque || 1, Number(p.quantidade || p.qtd || 1)));
      p.quantidade = quantidade;
      p.qtd = quantidade;
      return `
      <div class="bag-item">
        <div class="bag-item-info"><span>${p.nome}</span><small>${p.marca || ""}</small>
          <div class="cart-stock-box">
            <span>Em estoque: <strong>${estoque} un.</strong></span>
            <div class="qty-control" aria-label="Selecionar quantidade">
              <button type="button" class="qty-btn" data-qty-minus="${i}" ${quantidade <= 1 ? "disabled" : ""}>−</button>
              <input class="cart-qty-input" data-qty-input="${i}" type="number" min="1" max="${estoque}" value="${quantidade}" aria-label="Quantidade de ${p.nome}">
              <button type="button" class="qty-btn" data-qty-plus="${i}" ${quantidade >= estoque ? "disabled" : ""}>+</button>
            </div>
          </div>
        </div>
        <div class="bag-item-price"><strong>${moeda(Number(p.precoFinal || 0) * quantidade)}</strong><button data-remove="${i}">remover</button></div>
      </div>`;
    }).join("")
    : "<p>Sua sacola está vazia.</p>";

  el.total.textContent = moeda(sacola.reduce((t,p)=>t + Number(p.precoFinal || 0) * Number(p.quantidade || p.qtd || 1),0));

  el.itens.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click",()=>remover(Number(btn.dataset.remove)));
  });
  el.itens.querySelectorAll("[data-qty-minus]").forEach(btn => {
    btn.addEventListener("click",()=>{
      const i=Number(btn.dataset.qtyMinus), atual=Number(sacola[i]?.quantidade || 1);
      alterarQuantidade(i, atual-1);
    });
  });
  el.itens.querySelectorAll("[data-qty-plus]").forEach(btn => {
    btn.addEventListener("click",()=>{
      const i=Number(btn.dataset.qtyPlus), atual=Number(sacola[i]?.quantidade || 1);
      alterarQuantidade(i, atual+1);
    });
  });
  el.itens.querySelectorAll("[data-qty-input]").forEach(input => {
    input.addEventListener("change",()=>alterarQuantidade(Number(input.dataset.qtyInput), input.value));
  });
}

function abrirSacola() {
  el.drawer.classList.add("open");
  el.backdrop.classList.add("open");
}

function fecharSacola() {
  el.drawer.classList.remove("open");
  el.backdrop.classList.remove("open");
}

async function carregarConfiguracoesLoja(){
  const cfg=window.SUPABASE_CONFIG;
  if(!cfg?.url||!cfg?.key)return;
  try{
    const r=await fetch(`${cfg.url}/rest/v1/configuracoes_loja?chave=eq.operacao&select=valor&limit=1`,{headers:{apikey:cfg.key,Authorization:`Bearer ${cfg.key}`}});
    if(!r.ok)return;
    const rows=await r.json();
    if(rows?.[0]?.valor){
      const remoto=typeof rows[0].valor==='string'?JSON.parse(rows[0].valor):rows[0].valor;
      if(Array.isArray(remoto.entregas))dados.entregas=remoto.entregas;
      if(remoto.configuracoes)dados.configuracoes={...(dados.configuracoes||{}),...remoto.configuracoes};
      if(Array.isArray(remoto.kits))dados.kits=remoto.kits;
      if(Array.isArray(remoto.sorteios))dados.sorteios=remoto.sorteios;
    }
  }catch(e){console.warn('Configurações da loja indisponíveis; usando contingência local.',e)}
}

function renderEntregas() {
  const icones = {retirada:"⌂",whatsapp:"◉",parceiro:"↗"};

  el.entregas.innerHTML = dados.entregas.filter(e=>e.ativo).map(e => {
    let href = "#";
    if (e.tipo === "whatsapp") href = linkWhatsapp("Olá! Gostaria de informações sobre entrega.");
    else if (e.url) href = e.url;

    return `<a class="delivery-card" href="${href}" ${href !== "#" ? 'target="_blank" rel="noopener"' : ""}>
      <span>${icones[e.tipo] || "↗"}</span>
      <b>${e.nome}</b><small>${e.descricao}</small>
    </a>`;
  }).join("");
}

function finalizar() {
  if (!sacola.length) return alert("Adicione pelo menos um produto à sacola.");

  const linhas = sacola.map(p => {
    const quantidade = Number(p.quantidade || p.qtd || 1);
    const precoCheio = Number(p.precoCheio ?? p.preco ?? 0);
    const precoFinal = Number(p.precoFinal ?? p.preco ?? 0);
    const temDesconto = precoFinal < precoCheio - 0.009;

    if (temDesconto) {
      const percentual = precoCheio > 0 ? Math.round((1 - precoFinal / precoCheio) * 100) : 0;
      return `• ${p.nome}
Quantidade: ${quantidade}
Preço cheio unitário: ${moeda(precoCheio)}
Preço com desconto unitário${percentual ? ` (${percentual}% OFF)` : ""}: ${moeda(precoFinal)}
Subtotal: ${moeda(precoFinal * quantidade)}`;
    }

    return `• ${p.nome}
Quantidade: ${quantidade}
Preço unitário: ${moeda(precoFinal)}
Subtotal: ${moeda(precoFinal * quantidade)}`;
  }).join(`\n\n`);

  const mensagem = `Olá! Gostaria de consultar este pedido:

${linhas}

Podem confirmar disponibilidade, valor final e opções de entrega?`;
  window.open(linkWhatsapp(mensagem),"_blank","noopener");
}

document.querySelector("#bagOpen").addEventListener("click",abrirSacola);
document.querySelector("#bagClose").addEventListener("click",fecharSacola);
el.backdrop.addEventListener("click",fecharSacola);
document.querySelector("#checkout").addEventListener("click",finalizar);

function normalizarBusca(txt) {
  return String(txt || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function garantirSugestoesBusca() {
  let box = document.querySelector("#searchSuggestions");
  if (box) return box;
  box = document.createElement("div");
  box.id = "searchSuggestions";
  box.className = "search-suggestions";
  el.busca.parentElement.style.position = "relative";
  el.busca.insertAdjacentElement("afterend", box);
  return box;
}

function atualizarSugestoesBusca() {
  const box = garantirSugestoesBusca();
  const termo = normalizarBusca(el.busca.value);
  if (termo.length < 2) {
    box.innerHTML = "";
    box.classList.remove("open");
    return;
  }

  const inicio = [];
  const contem = [];
  const vistos = new Set();

  dados.produtos
    .filter(p => p.ativo && Number(p.estoque || 0) > 0)
    .forEach(p => {
      const nome = String(p.nome || "").trim();
      const chave = normalizarBusca(nome);
      if (!nome || vistos.has(chave) || !chave.includes(termo)) return;
      vistos.add(chave);
      (chave.startsWith(termo) ? inicio : contem).push(nome);
    });

  const sugestoes = [...inicio, ...contem].slice(0, 8);
  if (!sugestoes.length) {
    box.innerHTML = "";
    box.classList.remove("open");
    return;
  }

  box.innerHTML = sugestoes.map(nome =>
    `<button type="button" class="search-suggestion" data-search-suggestion="${encodeURIComponent(nome)}"><span>⌕</span><b>${nome}</b></button>`
  ).join("");
  box.classList.add("open");

  box.querySelectorAll("[data-search-suggestion]").forEach(btn => {
    btn.addEventListener("click", () => {
      const nome = decodeURIComponent(btn.dataset.searchSuggestion);
      el.busca.value = nome;
      box.classList.remove("open");
      renderProdutos("Todos", nome);
      document.querySelector("#ofertas")?.scrollIntoView({behavior:"smooth"});
    });
  });
}

document.querySelector("#searchToggle").addEventListener("click",()=>{el.searchbar.classList.toggle("open");el.busca.focus()});
document.querySelector("#searchClose").addEventListener("click",()=>{el.searchbar.classList.remove("open");document.querySelector("#searchSuggestions")?.classList.remove("open")});
el.busca.addEventListener("input",()=>{atualizarSugestoesBusca();renderProdutos("Todos",el.busca.value)});
document.querySelectorAll("[data-filter]").forEach(b=>b.addEventListener("click",()=>renderProdutos(b.dataset.filter)));

const atendimento = linkWhatsapp("Olá! Gostaria de atendimento da Farmácia Mais Econômica.");
document.querySelector("#heroWhatsapp").href = atendimento;
document.querySelector("#serviceWhatsapp").href = atendimento;


function renderKits() {
  const area = document.querySelector("#kitGrid");
  if (!area) return;

  const kits = (dados.kits || []).filter(k => k.ativo);
  area.innerHTML = kits.length ? kits.map(k => `
    <article class="kit-card">
      <div class="kit-visual">${k.icone || "✦"}</div>
      <div>
        <span class="kicker">${k.destaque || "KIT ESPECIAL"}</span>
        <h3>${k.nome}</h3>
        <p>${k.descricao}</p>
        <div class="kit-price">
          ${k.precoOriginal ? `<del>${moeda(k.precoOriginal)}</del>` : ""}
          <strong>${moeda(k.preco)}</strong>
        </div>
        <button class="btn primary" data-kit="${k.id}">Consultar kit</button>
      </div>
    </article>`).join("") : "<p>Nenhum kit ativo no momento.</p>";

  area.querySelectorAll("[data-kit]").forEach(btn => {
    btn.addEventListener("click", () => {
      const kit = kits.find(k => k.id === Number(btn.dataset.kit));
      const msg = `Olá! Gostaria de consultar o ${kit.nome}, anunciado por ${moeda(kit.preco)}. Podem confirmar disponibilidade e condições?`;
      window.open(linkWhatsapp(msg), "_blank", "noopener");
    });
  });
}

function renderSorteios() {
  const area = document.querySelector("#giveawayGrid");
  if (!area) return;

  const sorteios = (dados.sorteios || []).filter(s => s.ativo);
  area.innerHTML = sorteios.length ? sorteios.map(s => `
    <article class="giveaway-card">
      <span class="kicker light">SORTEIO / CAMPANHA</span>
      <h3>${s.titulo}</h3>
      <div class="period">${s.inicio || "Data a definir"} → ${s.fim || "Data a definir"}</div>
      <p><b>Prêmio:</b> ${s.premio}</p>
      <p>${s.descricao}</p>
      <details><summary>Ver regulamento informado</summary><p>${s.regulamento || "Regulamento ainda não cadastrado."}</p></details>
    </article>`).join("") : "<p>Nenhum sorteio ativo no momento.</p>";
}

let realtimeClient = null;
let realtimeTimer = null;
let recargaEmAndamento = false;

function sincronizarSacolaComCatalogo() {
  if (!sacola.length) return;
  sacola = sacola.map(item => {
    const atual = dados.produtos.find(p => String(p.id) === String(item.id));
    if (!atual) return item;
    const oferta = obterOfertaProduto(atual);
    return {...item, ...atual, preco: oferta.precoCheio, precoCheio: oferta.precoCheio, precoFinal: oferta.precoFinal};
  });
  atualizarSacola();
}

async function recarregarCatalogoAutomaticamente() {
  if (recargaEmAndamento) return;
  recargaEmAndamento = true;
  try {
    await carregarCatalogoSupabase();
    renderCategorias();
    renderProdutos(filtroAtual, termoAtual, false);
    sincronizarSacolaComCatalogo();
  } catch (erro) {
    console.warn("Atualização automática do catálogo falhou:", erro);
  } finally {
    recargaEmAndamento = false;
  }
}

function agendarRecargaRealtime() {
  clearTimeout(realtimeTimer);
  realtimeTimer = setTimeout(recarregarCatalogoAutomaticamente, 800);
}

function ativarAtualizacaoAutomatica() {
  const cfg = window.SUPABASE_CONFIG;

  // Atualização imediata quando o Supabase Realtime estiver habilitado na tabela.
  if (window.supabase?.createClient && cfg?.url && cfg?.key) {
    try {
      realtimeClient = window.supabase.createClient(cfg.url, cfg.key, {
        auth: {persistSession:false, autoRefreshToken:false}
      });
      realtimeClient
        .channel("farmacia-catalogo-tempo-real")
        .on("postgres_changes", {event:"*", schema:"public", table:"produtos_pharmagno"}, agendarRecargaRealtime)
        .on("postgres_changes", {event:"*", schema:"public", table:"promocoes_catalogo"}, agendarRecargaRealtime)
        .subscribe();
    } catch (erro) {
      console.warn("Realtime indisponível; usando atualização periódica.", erro);
    }
  }

  // Segurança: atualiza quando o cliente volta para a aba e a cada 60 s.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") recarregarCatalogoAutomaticamente();
  });
  window.addEventListener("focus", recarregarCatalogoAutomaticamente);
  setInterval(recarregarCatalogoAutomaticamente, 60000);
}

async function iniciarLoja() {
  await carregarConfiguracoesLoja();
  try {
    await carregarCatalogoSupabase();
  } catch (erro) {
    console.error("Falha ao carregar catálogo do Supabase:", erro);
    const aviso = document.querySelector("#activePromo");
    if (aviso) {
      aviso.innerHTML = "Não foi possível sincronizar o catálogo agora. Exibindo dados locais de contingência.";
      aviso.classList.remove("hidden");
    }
  }
  renderCategorias();
  renderProdutos();
  renderKits();
  renderSorteios();
  renderEntregas();
  atualizarSacola();
  ativarAtualizacaoAutomatica();
}

iniciarLoja();

document.addEventListener("click", (event) => {
  if (!event.target.closest("#searchbar")) {
    document.querySelector("#searchSuggestions")?.classList.remove("open");
  }
});

