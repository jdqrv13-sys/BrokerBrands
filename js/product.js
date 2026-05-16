// Product Detail Page Logic
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'catalog.html';
        return;
    }

    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) {
        document.body.innerHTML = '<h1>Producto no encontrado</h1><a href="catalog.html">Volver al catálogo</a>';
        return;
    }

    renderProductDetails(product);
    renderRelatedProducts(product);
});

function renderProductDetails(p) {
    const mainImg = document.getElementById('product-image');
    const thumbContainer = document.getElementById('product-thumbnails');
    
    // Support for multiple images
    const images = p.images || [p.image];
    
    mainImg.src = images[0];
    mainImg.alt = p.name;
    mainImg.loading = 'lazy';

    // Render thumbnails if more than 1 image
    thumbContainer.innerHTML = '';
    if (images.length > 1) {
        images.forEach((url, index) => {
            const thumb = document.createElement('img');
            thumb.src = url;
            thumb.style.width = '60px';
            thumb.style.height = '60px';
            thumb.style.objectFit = 'cover';
            thumb.style.borderRadius = '4px';
            thumb.style.cursor = 'pointer';
            thumb.style.border = index === 0 ? '2px solid var(--navy)' : '1px solid var(--gray-200)';
            
            thumb.onclick = () => {
                mainImg.src = url;
                // Update active border
                document.querySelectorAll('#product-thumbnails img').forEach(t => t.style.border = '1px solid var(--gray-200)');
                thumb.style.border = '2px solid var(--navy)';
            };
            thumbContainer.appendChild(thumb);
        });
    }
    document.getElementById('product-category').textContent = p.category + ' / ' + p.subcategory;
    document.getElementById('product-name').textContent = p.name;
    document.getElementById('product-price').textContent = p.price.toFixed(2);
    document.getElementById('product-description').textContent = p.description;
    
    const specsTable = document.getElementById('product-specs');
    specsTable.innerHTML = '';
    for (const [key, value] of Object.entries(p.specs)) {
        specsTable.innerHTML += `
            <tr style="border-bottom: 1px solid var(--gray-200);">
                <td style="padding: 0.75rem 0; font-weight: 600; color: var(--navy); width: 30%; font-size: 0.875rem;">${key}</td>
                <td style="padding: 0.75rem 0; color: var(--gray-600); font-size: 0.875rem;">${value}</td>
            </tr>
        `;
    }

    // Set up WhatsApp Direct Contact
    const waLink = document.getElementById('whatsapp-direct');
    const message = `¡Hola! Me interesa el producto: ${p.name} ($${p.price.toFixed(2)}). ¿Tienen disponibilidad inmediata?`;
    waLink.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;

    // Set up Add to Quote button
    const quoteBtn = document.getElementById('add-to-quote');
    quoteBtn.onclick = () => {
        addToCart(p.id);
    };
}

function renderRelatedProducts(current) {
    const container = document.getElementById('related-grid');
    if (!container) return;

    const related = PRODUCTS
        .filter(p => p.id !== current.id && p.category === current.category)
        .slice(0, 4);

    related.forEach(p => {
        const card = `
            <div class="card">
                <div class="card-img-wrapper">
                    <img src="${p.image}" alt="${p.name}" class="card-img" loading="lazy">
                </div>
                <div class="card-content">
                    <h4 class="card-title" style="font-size: 0.875rem;">${p.name}</h4>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                        <span class="card-price" style="font-size: 1rem;">${p.price.toFixed(2)}</span>
                        <a href="product.html?id=${p.id}" class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.7rem;">Ver</a>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}
