import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ProductCard from '../components/ProductCard';
import { getProductCategory, getMedicamentoType } from '../utils/categoryHelper';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [selectedMedType, setSelectedMedType] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('produtos_pharmagno')
      .select('id, produto, preco, categoria, percentual_desconto, tipo_medicamento, estoque, link_foto');
    
    if (error) {
      console.error('Erro ao buscar produtos:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }

  // Filter products cleanly using helper
  const filteredProducts = products.filter(p => {
    const realCategory = getProductCategory(p);
    const medType = getMedicamentoType(p);
    
    // Search match
    const matchesSearch = (p.produto || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    // Category match
    if (selectedCategory !== 'TODOS' && realCategory !== selectedCategory) {
      return false;
    }

    // Medicamento Type match (Similares vs Originais)
    if (selectedCategory === 'Medicamentos' && selectedMedType !== 'TODOS') {
      if (selectedMedType === 'Similar' && medType !== 'Genérico/Similar') return false;
      if (selectedMedType === 'Original' && medType !== 'Original/Referência') return false;
    }

    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Category Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 border-b pb-3">
        {['TODOS', 'Medicamentos', 'Perfumaria'].map(cat => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); setSelectedMedType('TODOS'); }}
            className={`px-4 py-2 rounded-lg font-bold text-sm ${
              selectedCategory === cat ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat === 'Medicamentos' ? 'Medicamentos (-10%)' : cat === 'Perfumaria' ? 'Perfumaria (-12%)' : 'Todos os Produtos'}
          </button>
        ))}
      </div>

      {/* Sub-filter for Medicamentos (Similares vs Originais) */}
      {selectedCategory === 'Medicamentos' && (
        <div className="flex gap-2 mb-4 bg-gray-50 p-2 rounded">
          <span className="text-xs font-semibold self-center text-gray-600">Filtrar Medicamentos:</span>
          <button
            onClick={() => setSelectedMedType('TODOS')}
            className={`px-3 py-1 text-xs rounded ${selectedMedType === 'TODOS' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedMedType('Original')}
            className={`px-3 py-1 text-xs rounded ${selectedMedType === 'Original' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
          >
            Originais / Referência
          </button>
          <button
            onClick={() => setSelectedMedType('Similar')}
            className={`px-3 py-1 text-xs rounded ${selectedMedType === 'Similar' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
          >
            Genéricos / Similares
          </button>
        </div>
      )}

      {/* Search Input */}
      <input
        type="text"
        placeholder="Buscar produto por nome..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded-lg mb-6 text-sm"
      />

      {/* Grid Display */}
      {loading ? (
        <p className="text-center py-10">Carregando catálogo atualizado...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
