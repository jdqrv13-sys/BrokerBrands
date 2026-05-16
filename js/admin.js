document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts(); // Cargar productos desde Supabase al iniciar

    const loginScreen = document.getElementById('loginScreen');
    const adminPanel = document.getElementById('adminPanel');
    const loginForm = document.getElementById('loginForm');
    const addProductForm = document.getElementById('addProductForm');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const searchInput = document.getElementById('searchInput');
    const productsListContainer = document.getElementById('productsListContainer');
    
    const ADMIN_PASS = 'admin123';
    let isEditing = false;

    // --- LOGIN LOGIC ---
    if (sessionStorage.getItem('brokerAdminAuth') === 'true') {
        loginScreen.style.display = 'none';
        adminPanel.style.display = 'block';
        initAdmin();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = document.getElementById('adminPassword').value;
        if (pass === ADMIN_PASS) {
            sessionStorage.setItem('brokerAdminAuth', 'true');
            loginScreen.style.display = 'none';
            adminPanel.style.display = 'block';
            initAdmin();
        } else {
            alert('Contraseña incorrecta');
        }
    });

    function initAdmin() {
        renderProducts();
        updateCount();
        setupFileUploads();
    }

    // --- FILE UPLOAD LOGIC (Supabase Storage) ---
    function setupFileUploads() {
        for (let i = 1; i <= 5; i++) {
            const fileInput = document.getElementById(`pFile${i}`);
            const urlInput = document.getElementById(`pImage${i}`);
            
            if (fileInput) {
                fileInput.addEventListener('change', async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    try {
                        showToast('Subiendo imagen...', 'success');
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${Math.random()}.${fileExt}`;
                        const filePath = `products/${fileName}`;

                        const { data, error } = await supabase.storage
                            .from('product-images')
                            .upload(filePath, file);

                        if (error) throw error;

                        // Obtener URL pública
                        const { data: { publicUrl } } = supabase.storage
                            .from('product-images')
                            .getPublicUrl(filePath);

                        urlInput.value = publicUrl;
                        showToast(`Imagen ${i} subida con éxito.`);
                    } catch (err) {
                        console.error('Upload error:', err);
                        alert('Error al subir imagen a Supabase Storage: ' + err.message);
                    }
                });
            }
        }
    }

    // --- CRUD LOGIC (Supabase Database) ---

    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const images = [
            document.getElementById('pImage1').value,
            document.getElementById('pImage2').value,
            document.getElementById('pImage3').value,
            document.getElementById('pImage4').value,
            document.getElementById('pImage5').value
        ].filter(url => url.trim() !== '');

        if (images.length === 0) {
            alert('Debe agregar al menos una imagen.');
            return;
        }

        const productId = isEditing ? document.getElementById('pId').value : 'item-' + Date.now();
        
        const productData = {
            id: productId,
            category: document.getElementById('pCategory').value,
            subcategory: 'General',
            name: document.getElementById('pName').value,
            price: parseFloat(document.getElementById('pPrice').value),
            image: images[0],
            images: images,
            description: document.getElementById('pDesc').value,
            specs: isEditing ? (PRODUCTS.find(p => p.id === productId)?.specs || {}) : { "Agregado": "Admin" }
        };

        try {
            showToast('Guardando en Supabase...', 'success');
            const { error } = await supabase
                .from('products')
                .upsert([productData]);

            if (error) throw error;

            alert('¡Producto guardado exitosamente!');
            
            // Recargar datos locales
            await loadProducts();
            resetForm();
            renderProducts();
            updateCount();
        } catch (err) {
            console.error('Error al guardar:', err);
            alert('Error al guardar en base de datos: ' + err.message);
        }
    });

    function renderProducts(filter = '') {
        const query = filter.toLowerCase();
        const filtered = PRODUCTS.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query)
        );

        productsListContainer.innerHTML = '';
        
        if (filtered.length === 0) {
            productsListContainer.innerHTML = '<p style="text-align: center; color: var(--gray-400); padding: 2rem;">No se encontraron productos.</p>';
            return;
        }

        filtered.forEach(p => {
            const item = document.createElement('div');
            item.className = 'product-item';
            const displayImg = p.images ? p.images[0] : p.image;
            item.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
                    <img src="${displayImg}" alt="${p.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid var(--gray-200);">
                    <div>
                        <strong style="display: block; font-size: 0.95rem;">${p.name}</strong>
                        <span style="font-size: 0.8rem; color: var(--gray-500);">${p.category} • $${p.price.toFixed(2)}</span>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-outline" onclick="editProduct('${p.id}')" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; border-color: var(--navy); color: var(--navy);">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-outline" onclick="deleteProduct('${p.id}')" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; border-color: var(--error); color: var(--error);">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            productsListContainer.appendChild(item);
        });
    }

    window.editProduct = function(id) {
        const p = PRODUCTS.find(prod => prod.id === id);
        if (!p) return;

        isEditing = true;
        document.getElementById('pId').value = p.id;
        document.getElementById('pName').value = p.name;
        document.getElementById('pCategory').value = p.category;
        document.getElementById('pPrice').value = p.price;
        document.getElementById('pDesc').value = p.description;

        // Populate images
        const imgs = p.images || [p.image];
        for(let i=1; i<=5; i++) {
            document.getElementById('pImage' + i).value = imgs[i-1] || '';
        }

        document.getElementById('formActionTitle').innerText = 'Editando: ' + p.name;
        document.getElementById('submitBtn').innerHTML = '<i class="fas fa-check"></i> Actualizar Cambios';
        cancelEditBtn.style.display = 'block';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteProduct = async function(id) {
        const p = PRODUCTS.find(prod => prod.id === id);
        if (!p) return;

        if (confirm(`¿Está seguro de eliminar "${p.name}"?`)) {
            try {
                const { error } = await supabase
                    .from('products')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                alert('Producto eliminado.');
                await loadProducts();
                renderProducts(searchInput.value);
                updateCount();
            } catch (err) {
                console.error('Error al eliminar:', err);
                alert('Error al eliminar de Supabase: ' + err.message);
            }
        }
    };

    cancelEditBtn.addEventListener('click', resetForm);

    function resetForm() {
        isEditing = false;
        addProductForm.reset();
        document.getElementById('pId').value = '';
        document.getElementById('formActionTitle').innerText = 'Agregar Nuevo Producto';
        document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
        cancelEditBtn.style.display = 'none';
    }

    searchInput.addEventListener('input', (e) => {
        renderProducts(e.target.value);
    });

    function updateCount() {
        document.getElementById('productCount').innerText = `${PRODUCTS.length} productos en total`;
    }
});
