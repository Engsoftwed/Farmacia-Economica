/**
 * Helper de categorização e cálculo de desconto
 */

export const CATEGORIES = {
  MEDICAMENTOS: 'Medicamentos',
  PERFUMARIA: 'Perfumaria'
};

const PERFUMARIA_KEYWORDS = [
  'desodorante', 'absorvente', 'sabonete', 'shampoo', 'condicionador', 
  'creme', 'fralda', 'protetor', 'higiene', 'colonia', 'perfume', 
  'esponja', 'lamina', 'lâmina', 'hidratante', 'talco', 'batom', 
  'esmalte', 'lenco', 'lenço', 'preservativo'
];

export function getProductCategory(product) {
  if (!product) return CATEGORIES.MEDICAMENTOS;

  const nameLower = (product.produto || product.nome || '').toLowerCase();
  
  // Se for qualquer tipo de solução, gotas, xarope, comprimido ou vitamina (ex: AIDE 3, ATROVERAN), é Medicamento!
  const isMedicamentoForcado = ['sol', 'gts', 'comp', 'caps', 'vitamina', 'aide', 'atroveran', 'bacina', 'xarope', 'pom'].some(kw => nameLower.includes(kw));
  if (isMedicamentoForcado) {
    return CATEGORIES.MEDICAMENTOS;
  }

  // Se bater palavra-chave de perfumaria/higiene
  const isPerfumaria = PERFUMARIA_KEYWORDS.some(kw => nameLower.includes(kw));
  if (isPerfumaria) {
    return CATEGORIES.PERFUMARIA;
  }

  // Categoria do banco (se válida e não for o fallback 'Higiene')
  if (product.categoria && product.categoria !== 'Higiene' && product.categoria !== 'Não classificado') {
    return product.categoria;
  }

  return CATEGORIES.MEDICAMENTOS;
}

export function getDiscountPercentage(product) {
  const cat = getProductCategory(product);
  if (cat === CATEGORIES.PERFUMARIA) {
    return 12.0; // Perfumaria 12%
  }
  return 10.0; // Medicamentos 10%
}

export function calculateFinalPrice(product) {
  const origPrice = parseFloat(product.preco || 0);
  const desc = getDiscountPercentage(product);
  if (desc <= 0) return origPrice;
  return Math.max(0, origPrice * (1 - (desc / 100)));
}

export function getMedicamentoType(product) {
  const nameLower = (product.produto || '').toLowerCase();
  if (nameLower.includes('gen') || nameLower.includes('med.gen') || nameLower.includes('generico')) {
    return 'Genérico/Similar';
  }
  return 'Original/Referência';
}
