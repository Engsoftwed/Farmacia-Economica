// Base de Dados Completa e Funcional dos Produtos
const produtos = [
    {
        id: 1,
        nome: "Dipirona Sódica 500mg - 10 Comprimidos",
        categoria: "Medicamentos",
        preco: 6.50,
        imagem: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80",
        descricao: "Analgésico e antitérmico eficaz no combate a dores e febre."
    },
    {
        id: 2,
        nome: "Paracetamol 750mg - 20 Comprimidos",
        categoria: "Medicamentos",
        preco: 12.90,
        imagem: "https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&w=500&q=80",
        descricao: "Indicado para dores de cabeça, dores no corpo e febre."
    },
    {
        id: 3,
        nome: "Vitamina C 1g Efervescente - 30 Comprimidos",
        categoria: "Vitaminas",
        preco: 27.50,
        imagem: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=500&q=80",
        descricao: "Reforço para a imunidade diária com ação antioxidante."
    },
    {
        id: 4,
        nome: "Protetor Solar Facial FPS 50 - 50g",
        categoria: "Perfumaria",
        preco: 45.90,
        imagem: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80",
        descricao: "Proteção UVA/UVB com toque seco e controle de oleosidade."
    },
    {
        id: 5,
        nome: "Ibuprofeno 600mg - 20 Cápsulas",
        categoria: "Medicamentos",
        preco: 19.90,
        imagem: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=500&q=80",
        descricao: "Ação anti-inflamatória e analgésica rápida."
    },
    {
        id: 6,
        nome: "Shampoo Neutro Hidratante - 400ml",
        categoria: "Higiene",
        preco: 18.50,
        imagem: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=500&q=80",
        descricao: "Limpeza suave e hidratação diária para todos os tipos de cabelo."
    },
    {
        id: 7,
        nome: "Multivitamínico A-Z - 60 Cápsulas",
        categoria: "Vitaminas",
        preco: 39.90,
        imagem: "https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=500&q=80",
        descricao: "Suplemento completo de vitaminas e minerais essenciais."
    },
    {
        id: 8,
        nome: "Sabonete Líquido Antisséptico - 250ml",
        categoria: "Higiene",
        preco: 11.90,
        imagem: "https://images.unsplash.com/photo-1607006482602-76ca7bfac553?auto=format&fit=crop&w=500&q=80",
        descricao: "Proteção e higiene diária para as mãos e corpo."
    }
];

let categoriaAtual = 'Todos';

// Função para exibir os produtos na tela
function renderizarProdutos(lista) {
    const container = document.getElementById('produtos-container');
    const counter = document.getElementById('productCounter');
    
    if (!container) return;
    
    container.innerHTML = "";
    
    if (counter) {
        counter.textContent = `${lista.length} produto(s) encontrado(s)`;
    }

    if (lista.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm p-8">
                <i class="fa-solid fa-box-open text-5xl text-gray-300 mb-3"></i>
                <p class="text-lg font-semibold text-gray-700">Nenhum produto encontrado</p>
                <p class="text-xs text-gray-400 mt-1">Tente pesquisar por outro nome ou mudar a categoria.</p>
            </div>
        `;
        return;
    }

    lista.forEach(produto => {
        const card = document.createElement('div');
        card.className = "product-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between";
        
        card.innerHTML = `
            <div>
                <div class="h-48 overflow-hidden relative bg-gray-100">
                    <img src="${produto.imagem}" alt="${produto.nome}" class="w-full h-full object-cover">
                    <span class="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
                        ${produto.categoria}
                    </span>
                </div>
                <div class="p-4">
                    <h3 class="font-bold text-gray-800 text-sm mt-1 mb-1 line-clamp-2 leading-tight">${produto.nome}</h3>
                    <p class="text-gray-500 text-xs mb-3 line-clamp-2">${produto.descricao}</p>
                </div>
            </div>
            <div class="p-4 pt-0 flex items-center justify-between mt-auto">
                <span class="text-lg font-extrabold text-emerald-700">R$ ${produto.preco.toFixed(2).replace('.', ',')}</span>
                <button onclick="adicionarAoCarrinho('${produto.nome}')" class="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-lg transition shadow flex items-center space-x-1">
                    <i class="fa-solid fa-cart-plus"></i>
                    <span>Comprar</span>
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Filtragem por Categoria
function filtrarCategoria(categoria) {
    categoriaAtual = categoria;
    
    // Atualiza botões visuais
    const btns = document.querySelectorAll('.cat-btn');
    btns.forEach(btn => {
        if (btn.textContent.trim() === categoria) {
            btn.classList.add('active', 'bg-white', 'text-emerald-800');
            btn.classList.remove('bg-emerald-800/60', 'text-white');
        } else {
            btn.classList.remove('active', 'bg-white', 'text-emerald-800');
            btn.classList.add('bg-emerald-800/60', 'text-white');
        }
    });

    aplicarFiltros();
}

// Filtro Combinado (Busca + Categoria)
function aplicarFiltros() {
    const termo = document.getElementById('searchInput')?.value.toLowerCase() || '';
    
    const filtrados = produtos.filter(produto => {
        const bateCategoria = categoriaAtual === 'Todos' || produto.categoria === categoriaAtual;
        const bateBusca = produto.nome.toLowerCase().includes(termo) || produto.descricao.toLowerCase().includes(termo);
        return bateCategoria && bateBusca;
    });

    renderizarProdutos(filtrados);
}

// Busca em Tempo Real
document.getElementById('searchInput')?.addEventListener('input', aplicarFiltros);

// Carrinho de Compras
let quantidadeCarrinho = 0;
function adicionarAoCarrinho(nomeProduto) {
    quantidadeCarrinho++;
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = quantidadeCarrinho;
    alert(`"${nomeProduto}" foi adicionado ao seu carrinho!`);
}

// Inicialização Garantida
document.addEventListener('DOMContentLoaded', () => {
    renderizarProdutos(produtos);
});
