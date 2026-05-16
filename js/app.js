document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    initWhatsAppFloat();
    updateCartBadge();
    initMobileMenu();
    initToastContainer();
    renderFeaturedProducts();
});

function initToastContainer() {
    if (!document.querySelector('.toast-container')) {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
}

function showToast(message, type = 'success') {
    const container = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '<i class="fas fa-check-circle"></i>';
    if (type === 'error') icon = '<i class="fas fa-exclamation-circle"></i>';
    
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toast-out 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function initWhatsAppFloat() {
    const float = document.createElement('a');
    float.className = 'whatsapp-float';
    float.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent('¡Hola! Me gustaría solicitar información sobre sus productos.')}`;
    float.target = '_blank';
    float.innerHTML = '<i class="fab fa-whatsapp"></i>'; // Assuming font-awesome or simple icon
    // Using a simple SVG instead of font-awesome dependency for now to ensure visibility
    float.innerHTML = `<svg viewBox="0 0 448 512" width="30" height="30" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.8 69.4 27.2 106.2 27.2h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.6-27.5-16.4-14.7-27.5-32.8-30.7-38.4-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.5-9.2 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>`;
    document.body.appendChild(float);
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('broker_cart') || '[]');
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    });
}

function initMobileMenu() {
    // Basic mobile menu toggle implementation
    const toggle = document.querySelector('.menu-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            links.classList.toggle('active');
        });
    }
}

// Global helper to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Global helper to add to cart
function addToCart(productId, quantity = 1) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('broker_cart') || '[]');
    const existingIndex = cart.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity: quantity
        });
    }

    localStorage.setItem('broker_cart', JSON.stringify(cart));
    updateCartBadge();
    
    // Modern feedback instead of alert
    showToast(`${product.name} agregado al carrito.`);
}
function renderFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;

    // Show 4 random or specific premium products
    const featured = PRODUCTS.slice(0, 4); 
    
    container.innerHTML = '';
    featured.forEach(p => {
        const card = `
            <div class="card">
                <div class="card-img-wrapper">
                    <img src="${p.image}" alt="${p.name}" class="card-img" loading="lazy">
                </div>
                <div class="card-content">
                    <span class="card-category">${p.category}</span>
                    <h3 class="card-title">${p.name}</h3>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                        <span class="card-price">${formatCurrency(p.price)}</span>
                        <a href="product.html?id=${p.id}" class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.75rem;">Ver Detalle</a>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}
