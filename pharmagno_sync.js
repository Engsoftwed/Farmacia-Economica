const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL || 'SUA_URL_SUPABASE';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'SUA_CHAVE_SERVICE_ROLE';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function sincronizarEstoque(caminhoArquivoJson) {
    try {
        console.log("Iniciando leitura dos dados do Pharmagno...");
        const rawData = fs.readFileSync(caminhoArquivoJson, 'utf8');
        const produtos = JSON.parse(rawData);

        console.log(`Enviando ${produtos.length} produtos para o Supabase...`);
        const { data, error } = await supabase.rpc('upsert_produtos_pharmagno', {
            produtos_json: produtos
        });

        if (error) throw error;
        console.log("Sincronização concluída com sucesso!");
    } catch (err) {
        console.error("Erro na sincronização Pharmagno:", err.message);
    }
}
