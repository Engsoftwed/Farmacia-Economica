/**
 * Força a remoção de fraldas adultas/geriátricas da seção infantil
 * e as move diretamente para a categoria de Perfumaria e Cosméticos.
 */
export function normalizarCategoriasProdutos(produtos = []) {
  if (!Array.isArray(produtos)) return [];

  return produtos.map((prod) => {
    const nome = (prod.nome || prod.produto || prod.titulo || '').toUpperCase();

    // Se for Bigfral ou qualquer fralda adulta/geriátrica, manda direto para Perfumaria e Cosméticos
    if (
      nome.includes('BIGFRAL') ||
      nome.includes('FRALDA ADULTO') ||
      nome.includes('FRALDA GERIATRICA') ||
      nome.includes('GERIATRICO') ||
      nome.includes('PLENITUD') ||
      nome.includes('TENA ')
    ) {
      return {
        ...prod,
        categoria: 'PERFUMARIA E COSMETICOS',
        subcategoria: 'Perfumaria e Cosméticos',
        linha: 'Perfumaria e Cosméticos',
      };
    }

    return prod;
  });
}
