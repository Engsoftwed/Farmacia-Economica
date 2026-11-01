import React from 'react';
import { getProductCategory, getDiscountPercentage, calculateFinalPrice, getMedicamentoType } from '../utils/categoryHelper';

export default function ProductCard({ product, onAddToCart }) {
  const category = getProductCategory(product);
  const discountPercent = getDiscountPercentage(product);
  const finalPrice = calculateFinalPrice(product);
  const originalPrice = parseFloat(product.preco || 0);
  const medType = category === 'Medicamentos' ? getMedicamentoType(product) : null;

  return (
    <div className="product-card border rounded-lg p-4 shadow-sm bg-white flex flex-col justify-between">
      <div>
        {/* Top Tag & Category Badge */}
        <div className="flex justify-between items-center mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
            category === 'Perfumaria' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {category.toUpperCase()}
          </span>

          {discountPercent > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Product Image Placeholder */}
        <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center mb-3 text-gray-400">
          {product.link_foto ? (
            <img src={product.link_foto} alt={product.produto} className="h-full object-contain" />
          ) : (
            <span className="text-xs">{category} & Cuidados</span>
          )}
        </div>

        {/* Product Title */}
        <h3 className="font-bold text-gray-800 text-sm mb-1 uppercase line-clamp-2">
          {product.produto}
        </h3>

        {/* Subtitle / Type */}
        <p className="text-xs text-gray-500 mb-2">
          {medType ? `${medType}` : (product.apresentacao || 'Estoque disponível')}
        </p>
      </div>

      {/* Pricing & Add Button */}
      <div className="mt-3 border-t pt-2 flex items-center justify-between">
        <div>
          {discountPercent > 0 && originalPrice > finalPrice && (
            <span className="text-xs text-gray-400 line-through block">
              R$ {originalPrice.toFixed(2).replace('.', ',')}
            </span>
          )}
          <span className="text-base font-extrabold text-green-700">
            R$ {finalPrice.toFixed(2).replace('.', ',')}
          </span>
        </div>

        <button 
          onClick={() => onAddToCart && onAddToCart(product)}
          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full font-bold shadow"
          title="Adicionar à sacola"
        >
          +
        </button>
      </div>
    </div>
  );
}
