// Exemplo de filtragem por aba selecionada no Catálogo (Catalog.jsx)
export function filtrarProdutosPorCategoria(produtos, filtroAtivo) {
    const filtro = (filtroAtivo || '').toUpperCase();
    
    return produtos.filter(produto => {
        const cat = (produto.categoria || '').toUpperCase();
        const sub = (produto.subcategoria || '').toUpperCase();
        
        if (filtro === 'ADULTO' || filtro === 'GERIATRICA' || filtro === 'GERIÁTRICA') {
            return cat.includes('ADULTO') || sub.includes('ADULTO') || sub.includes('GERIÁTRICA') || sub.includes('GERIATRICA');
        }
        if (filtro === 'INFANTIL' || filtro === 'INFANTIS') {
            return cat.includes('INFANTIL') || sub.includes('INFANTIL');
        }
        
        return true;
    });
}
