import React from 'react';

export default function ProductCard({ produto }) {
  // 1. Correção do mapeamento de imagem placeholder baseada na categoria REAL do produto
  const getPlaceholderImage = (categoria, subcategoria) => {
    const catLower = (categoria || '').toLowerCase();
    const subLower = (subcategoria || '').toLowerCase();
    
    if (catLower.includes('infantil') || subLower.includes('infantil')) {
      return '/images/placeholders/linha-infantil.jpg';
    }
    if (catLower.includes('adulto') || catLower.includes('geriátrica') || subLower.includes('adulto') || subLower.includes('geriátricas')) {
      return '/images/placeholders/linha-adulto.jpg';
    }
    return '/images/placeholders/produto-generico.jpg';
  };

  // 2. Correção da Badge Superior (Estava fixada em "INFANTIL" por erro de propriedade)
  const categoriaExibida = produto.subcategoria || produto.categoria || 'Geral';
  const imagemSrc = produto.imagem_url || getPlaceholderImage(produto.categoria, produto.subcategoria);

  return (
    <div className="product-card border rounded-xl p-4 shadow-sm bg-white relative flex flex-col justify-between">
      <div>
        {/* Placeholder / Imagem do Produto */}
        <div className="w-full h-40 bg-gray-50 rounded-lg flex flex-col items-center justify-center p-2 mb-3 relative">
          {produto.imagem_url ? (
            <img src={produto.imagem_url} alt={produto.nome} className="max-h-full object-contain" />
          ) : (
            <div className="text-center">
              <span className="text-xs font-semibold text-gray-500 uppercase block">
                {produto.categoria || 'Medicamento'}
              </span>
              <span className="text-xs text-gray-400">Foto não cadastrada</span>
            </div>
          )}
        </div>

        {/* Tag Superior Correta (Subcategoria ou Categoria Principal) */}
        <span className="text-[10px] font-bold tracking-wider text-red-600 uppercase">
          {categoriaExibida}
        </span>

        {/* Nome do Produto */}
        <h3 className="font-bold text-gray-900 text-sm mt-1 line-clamp-2">
          {produto.nome}
        </h3>

        {/* Tags Secundárias */}
        <div className="text-xs text-gray-500 mt-1">
          {produto.tags || produto.subcategoria_nome || 'Geral'}
        </div>

        {/* Estoque */}
        <div className="mt-2">
          <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
            Em estoque: {produto.estoque} un.
          </span>
        </div>
      </div>

      {/* Preço e Botão Adicionar */}
      <div className="mt-4 flex items-center justify-between pt-2 border-t">
        <div>
          {produto.preco_de && (
            <span className="text-xs line-through text-gray-400 block">
              R$ {Number(produto.preco_de).toFixed(2).replace('.', ',')}
            </span>
          )}
          <span className="text-lg font-bold text-gray-900">
            R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
          </span>
        </div>
        <button className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
