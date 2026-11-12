// Função para classificar automaticamente os produtos antes de enviar para o Supabase
function classificarProduto(produto) {
    const nome = (produto.nome || '').toUpperCase();
    
    // Se for fralda ou item adulto/geriátrico
    if (nome.includes('ADULTO') || nome.includes('BIGFRAL') || nome.includes('GERIATRICA') || nome.includes('GERIATRICO')) {
        return {
            ...produto,
            categoria: 'ADULTO',
            subcategoria: 'Adultas/Geriátricas'
        };
    }
    
    // Se for infantil
    if (nome.includes('INFANTIL') || nome.includes('PAMPERS') || nome.includes('HUGGIES') || nome.includes('TURMA DA MONICA') || nome.includes('RECEM NASCIDO')) {
        return {
            ...produto,
            categoria: 'INFANTIL',
            subcategoria: 'Linha Infantil'
        };
    }
    
    return produto;
}

module.exports = { classificarProduto };
