// Cart Management Logic
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    renderCart();
});

function renderCart() {
    const container = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('subtotal-val');
    const totalEl = document.getElementById('total-val');
    const cartContent = document.getElementById('cart-content');
    const cartEmpty = document.getElementById('cart-empty');
    
    if (!container) return;

    const cart = JSON.parse(localStorage.getItem('broker_cart') || '[]');

    if (cart.length === 0) {
        cartContent.style.display = 'none';
        cartEmpty.style.display = 'block';
        return;
    }

    cartContent.style.display = 'grid';
    cartEmpty.style.display = 'none';
    container.innerHTML = '';
    
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const row = document.createElement('tr');
        row.className = 'cart-item';
        row.innerHTML = `
            <td>
                <div class="cart-item-info">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div>
                        <strong style="display: block; font-size: 0.875rem;">${item.name}</strong>
                        <span style="font-size: 0.75rem; color: var(--gray-500);">${item.category}</span>
                    </div>
                </div>
            </td>
            <td>$${item.price.toFixed(2)}</td>
            <td>
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
                    <span style="font-weight: 600; width: 2.5rem; text-align: center;">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
                </div>
            </td>
            <td>$${itemTotal.toFixed(2)}</td>
            <td style="text-align: right;">
                <button onclick="removeItem('${item.id}')" style="color: var(--error); cursor: pointer; padding: 0.5rem;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        container.appendChild(row);
    });

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    totalEl.textContent = `$${subtotal.toFixed(2)}`;
    
    // Update global badge just in case
    updateCartBadge();
}

function updateQty(productId, change) {
    let cart = JSON.parse(localStorage.getItem('broker_cart') || '[]');
    const index = cart.findIndex(item => item.id === productId);
    
    if (index > -1) {
        cart[index].quantity += change;
        
        if (cart[index].quantity < 1) {
            removeItem(productId);
            return;
        }
    }
    
    localStorage.setItem('broker_cart', JSON.stringify(cart));
    renderCart();
}

function removeItem(productId) {
    let cart = JSON.parse(localStorage.getItem('broker_cart') || '[]');
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('broker_cart', JSON.stringify(cart));
    
    showToast("Producto eliminado del carrito.", "error");
    renderCart();
}
