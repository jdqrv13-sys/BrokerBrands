// Catalog Filtering and Rendering Logic
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    updateCatalog();
    initFilters();
});

function updateCatalog() {
    const container = document.getElementById('catalog-grid');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const categoryFilter = urlParams.get('category');
    const searchFilter = urlParams.get('search');
    const priceFilter = urlParams.get('max_price');

    let filtered = PRODUCTS;

    if (categoryFilter) {
        filtered = filtered.filter(p => p.category === categoryFilter);
        document.getElementById('current-category').textContent = categoryFilter;
    }

    if (searchFilter) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchFilter.toLowerCase()));
    }

    if (priceFilter) {
        filtered = filtered.filter(p => p.price <= parseFloat(priceFilter));
    }

    container.innerHTML = '';
    
    if (filtered.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--gray-500);">No se encontraron productos coincidentes.</div>';
    }

    filtered.forEach(p => {
        const card = `
            <div class="card">
                <div class="card-img-wrapper">
                    <img src="${p.image}" alt="${p.name}" class="card-img" loading="lazy">
                    ${p.price > 1000 ? '<span class="badge badge-new" style="position: absolute; top: 1rem; right: 1rem;">PREMIUM</span>' : ''}
                </div>
                <div class="card-content">
                    <span class="card-category">${p.category}</span>
                    <h3 class="card-title">${p.name}</h3>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                        <span class="card-price">${p.price.toFixed(2)}</span>
                        <a href="product.html?id=${p.id}" class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.75rem;">Ver Detalle</a>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });

    document.getElementById('product-count').textContent = filtered.length;
}

function initFilters() {
    const categoryLinks = document.querySelectorAll('.filter-link');
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const cat = e.target.dataset.category;
            const url = new URL(window.location);
            if (cat === 'all') {
                url.searchParams.delete('category');
            } else {
                url.searchParams.set('category', cat);
            }
            window.history.pushState({}, '', url);
            updateCatalog();
        });
    });

    const priceInput = document.getElementById('max-price');
    if (priceInput) {
        priceInput.addEventListener('change', (e) => {
            const url = new URL(window.location);
            url.searchParams.set('max_price', e.target.value);
            window.history.pushState({}, '', url);
            updateCatalog();
        });
    }
}
