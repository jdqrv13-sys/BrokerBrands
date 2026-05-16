// Checkout Logic
let shippingCost = 5; // Default for Local

document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    updateSummary();
    handleFormSubmission();
});

function setShipping(type, cost) {
    shippingCost = cost;
    
    // UI Visual for options
    const options = document.querySelectorAll('.shipping-option');
    options.forEach(opt => opt.classList.remove('active'));
    
    const selected = document.querySelector(`.shipping-option input[value="${type}"]`).parentElement;
    selected.classList.add('active');
    
    updateSummary();
}

function updateSummary() {
    const list = document.getElementById('summary-items-list');
    const subtotalEl = document.getElementById('summ-subtotal');
    const shippingEl = document.getElementById('summ-shipping');
    const totalEl = document.getElementById('summ-total');
    
    if (!list) return;

    const cart = JSON.parse(localStorage.getItem('broker_cart') || '[]');
    let subtotal = 0;
    
    list.innerHTML = '';
    cart.forEach(item => {
        subtotal += (item.price * item.quantity);
        const div = document.createElement('div');
        div.style.marginBottom = '0.5rem';
        div.style.fontSize = '0.8rem';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
                <span>${item.quantity}x ${item.name}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;
        list.appendChild(div);
    });

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    shippingEl.textContent = `$${shippingCost.toFixed(2)}`;
    totalEl.textContent = `$${(subtotal + shippingCost).toFixed(2)}`;
}

function handleFormSubmission() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    form.onsubmit = (e) => {
        e.preventDefault();
        
        const cart = JSON.parse(localStorage.getItem('broker_cart') || '[]');
        if (cart.length === 0) {
            showToast("Tu carrito está vacío.", "error");
            return;
        }

        const data = {
            name: document.getElementById('cust-name').value,
            company: document.getElementById('cust-company').value,
            phone: document.getElementById('cust-phone').value,
            email: document.getElementById('cust-email').value,
            address: document.getElementById('cust-address').value,
            shipping: document.querySelector('input[name="shipping"]:checked').value === 'local' ? 'Caracas (Zona A)' : 'Nacional (Zona B)',
            total: document.getElementById('summ-total').textContent
        };

        const message = generateWAMessage(data, cart);
        const waLink = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
        
        // Success feedback
        showToast("Procesando pedido...", "success");
        
        // Open WhatsApp
        setTimeout(() => {
            // Optional: Clear cart after redirection if desired, but better to keep for confirmation
            // localStorage.removeItem('broker_cart');
            window.location.href = waLink;
        }, 1000);
    };
}

function generateWAMessage(user, cart) {
    let msg = `🛍️ *PEDIDO BROKER BRANDS*\n\n`;
    msg += `👤 *Cliente:* ${user.name}\n`;
    if (user.company) msg += `🏢 *Empresa:* ${user.company}\n`;
    msg += `📞 *Teléfono:* ${user.phone}\n`;
    msg += `📧 *Email:* ${user.email}\n`;
    msg += `📍 *Dirección:* ${user.address}\n`;
    msg += `🚚 *Método Envío:* ${user.shipping}\n\n`;
    
    msg += `🛒 *DETALLES DEL PEDIDO:*\n`;
    cart.forEach(item => {
        msg += `• ${item.quantity}x ${item.name} ($${item.price.toFixed(2)} c/u)\n`;
    });
    
    msg += `\n💰 *TOTAL FINAL:* ${user.total}\n\n`;
    msg += `Favor confirmar disponibilidad y datos bancarios para el pago.`;
    
    return msg;
}
