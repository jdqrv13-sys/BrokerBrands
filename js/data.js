let PRODUCTS = [];

// Función para cargar productos desde Supabase
async function loadProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        PRODUCTS = data || [];
        return PRODUCTS;
    } catch (err) {
        console.error('Error cargando productos de Supabase:', err);
        // Si hay error, intentamos cargar de localStorage como respaldo
        const saved = localStorage.getItem('broker_products_backup');
        if (saved) PRODUCTS = JSON.parse(saved);
        return PRODUCTS;
    }
}

// Configuration constants
const CONFIG = {
    whatsapp: "584248797088",
    businessName: "Broker Brands",
    shipping: {
        express: { name: "Delivery Express Caracas", price: "Tarifa plana o acordada" },
        national: [
            { id: "zoom", name: "Envío Nacional Zoom" },
            { id: "tealca", name: "Envío Nacional Tealca" },
            { id: "mrw", name: "Envío Nacional MRW" }
        ],
        storePickup: { name: "Retiro en Tienda (Caracas)", price: "Gratis" }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PRODUCTS, CONFIG };
}
