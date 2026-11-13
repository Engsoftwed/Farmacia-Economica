/**
 * Função utilitária para corrigir e normalizar a categoria dos produtos no front-end.
 * Garante que fraldas adultas e geriátricas (ex: Bigfral) sejam removidas da seção Infantil
 * e exibidas na categoria correta, independentemente de como vêm da API ou do JSON local.
 */
export function normalizarCategoriasProdutos(produtos = []) {
  if (!Array.isArray(produtos)) return [];

  return produtos.map((prod) => {
    const nome = (prod.nome || prod.produto || prod.titulo || '').toUpperCase();

    // Regra 1: Identificar Fraldas Adultas / Geriátricas
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
        categoria: 'ADULTO',
        subcategoria: 'Adultas/Geriátricas',
        linha: 'Linha Adulta / Geriátrica',
      };
    }

    // Regra 2: Garantir que apenas produtos realmente infantis fiquem em Infantil
    if (
      nome.includes('FRALDA INFANTIL') ||
      nome.includes('PAMPERS') ||
      nome.includes('HUGGIES') ||
      nome.includes('TURMA DA MONICA') ||
      nome.includes('RECEM NASCIDO') ||
      nome.includes('BABYSEC') ||
      nome.includes('POM POM')
    ) {
      return {
        ...prod,
        categoria: 'INFANTIL',
        subcategoria: 'Linha Infantil',
        linha: 'Linha Infantil',
      };
    }

    return prod;
  });
}
