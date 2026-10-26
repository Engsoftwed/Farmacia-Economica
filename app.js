let cart = [];
let currentCategory = 'todos';

document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
});

function renderProducts(items) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';

    if (items.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">Nenhum produto encontrado nesta categoria.</p>';
        return;
    }

    items.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-img">
            <div>
                <span class="product-category-tag">${product.categoryLabel}</span>
                <h3>${product.name}</h3>
                <div class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
            </div>
            <button class="btn-add" onclick="addToCart(${product.id})">Adicionar ao Carrinho</button>
        `;
        grid.appendChild(card);
    });
}

function filterCategory(categoryKey) {
    currentCategory = categoryKey;
    const titleElement = document.getElementById('currentCategoryTitle');

    const titles = {
        'todos': 'Todos os Produtos',
        'fraldas': 'Fraldas Infantil',
        'anticoncepcionais': 'Anticoncepcionais',
        'saude-intima': 'Saúde Íntima',
        'perfumaria': 'Perfumaria & Cosméticos',
        'medicamentos': 'Medicamentos'
    };

    titleElement.innerText = titles[categoryKey] || 'Produtos';

    if (categoryKey === 'todos') {
        renderProducts(products);
    } else {
        const filtered = products.filter(p => p.category === categoryKey);
        renderProducts(filtered);
    }
}

function filterProducts() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = products.filter(p => {
        const matchesCategory = (currentCategory === 'todos' || p.category === currentCategory);
        const matchesQuery = p.name.toLowerCase().includes(query) || p.categoryLabel.toLowerCase().includes(query);
        return matchesCategory && matchesQuery;
    });
    renderProducts(filtered);
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        updateCart();
        alert(`${product.name} foi adicionado ao seu carrinho!`);
    }
}

function updateCart() {
    document.getElementById('cartCount').innerText = cart.length;
    const cartItemsDiv = document.getElementById('cartItems');
    cartItemsDiv.innerHTML = '';

    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <span>${item.name}</span>
            <strong>R$ ${item.price.toFixed(2).replace('.', ',')}</strong>
            <button onclick="removeFromCart(${index})" style="background:red; color:white; border:none; border-radius:4px; padding:2px 6px; cursor:pointer;">X</button>
        `;
        cartItemsDiv.appendChild(div);
    });

    document.getElementById('cartTotal').innerText = total.toFixed(2).replace('.', ',');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function toggleCart() {
    const modal = document.getElementById('cartModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function checkout() {
    if (cart.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    let message = "Olá! Gostaria de fazer o seguinte pedido:\n\n";
    cart.forEach((item, idx) => {
        message += `${idx + 1}. ${item.name} - R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
    });

    const total = cart.reduce((acc, item) => acc + item.price, 0);
    message += `\n*Total: R$ ${total.toFixed(2).replace('.', ',')}*`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/5577999998888?text=${encoded}`, '_blank');
}
