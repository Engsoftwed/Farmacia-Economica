/**
 * Auxiliary file to standardize categories and calculate tiered discounts:
 * - Perfumaria / Higiene: 12% discount
 * - Medicamento (Original/Referência vs Genérico/Similar): 10% discount
 */

export const CATEGORIES = {
  MEDICAMENTOS: 'Medicamentos',
  PERFUMARIA: 'Perfumaria',
  OUTROS: 'Diversos'
};

const PERFUMARIA_KEYWORDS = [
  'desodorante', 'absorvente', 'sabonete', 'shampoo', 'condicionador', 
  'creme', 'fralda', 'protetor', 'higiene', 'colonia', 'perfume', 
  'esponja', 'lamina', 'lâmina', 'hidratante', 'talco', 'batom', 
  'esmalte', 'lenco', 'lenço', 'cuidado', 'preservativo'
];

export function getProductCategory(product) {
  if (!product) return CATEGORIES.MEDICAMENTOS;

  // Use explicit category from DB if valid and not "Higiene" fallback
  if (product.categoria && product.categoria !== 'Higiene' && product.categoria !== 'Não classificado') {
    return product.categoria;
  }

  const nameLower = (product.produto || product.nome || '').toLowerCase();
  
  const isPerfumaria = PERFUMARIA_KEYWORDS.some(kw => nameLower.includes(kw));
  if (isPerfumaria) {
    return CATEGORIES.PERFUMARIA;
  }

  return CATEGORIES.MEDICAMENTOS;
}

export function getDiscountPercentage(product) {
  if (product && typeof product.percentual_desconto === 'number') {
    return product.percentual_desconto;
  }
  
  const category = getProductCategory(product);
  if (category === CATEGORIES.PERFUMARIA) {
    return 12.0; // Fixed 12% for Perfumaria
  }
  return 10.0; // Fixed 10% for Medicamentos
}

export function calculateFinalPrice(product) {
  const originalPrice = parseFloat(product.preco || product.preco_original || 0);
  const discountPercent = getDiscountPercentage(product);
  
  if (discountPercent <= 0) return originalPrice;
  
  const discounted = originalPrice * (1 - (discountPercent / 100));
  return Math.max(0, discounted);
}

export function getMedicamentoType(product) {
  if (product.tipo_medicamento) return product.tipo_medicamento;
  
  const nameLower = (product.produto || '').toLowerCase();
  if (nameLower.includes('gen') || nameLower.includes('med.gen') || nameLower.includes('generico')) {
    return 'Genérico/Similar';
  }
  return 'Original/Referência';
}
