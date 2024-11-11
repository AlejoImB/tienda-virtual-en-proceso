// Inicialización de Swiper para los sliders
document.addEventListener('DOMContentLoaded', () => {
    initializeSliders();
    new FashionStore(); // Inicializa la tienda
});

// Función para inicializar los sliders
function initializeSliders() {
    new Swiper('.announcement-slider', {
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
    });

    new Swiper('.hero-swiper', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
}

// Clase principal para gestionar la tienda
class FashionStore {
    constructor() {
        this.cart = [];
        this.elements = this.getElements();
        this.init();
    }

    getElements() {
        return {
            cartItems: document.querySelector('.cart-items'),
            cartCount: document.querySelector('.cart-count'),
            cartTotal: document.querySelector('.total-amount'),
            productGrid: document.querySelector('.product-grid'),
            cartSidebar: document.querySelector('.cart-sidebar'),
            overlay: document.querySelector('#overlay'),
            menuToggle: document.querySelector('#menuToggle'),
            mainNav: document.querySelector('#mainNav'),
            cartToggle: document.querySelector('#cartToggle'),
            closeCart: document.querySelector('#closeCart'),
            userMenuToggle: document.querySelector('#userMenuToggle'),
            checkoutButton: document.querySelector('.btn-checkout'),
            filterButtons: document.querySelectorAll('.filter-btn'),
            newsletterForm: document.querySelector('.newsletter-form'),
        };
    }

    async init() {
        this.loadCartFromLocalStorage();
        await this.loadProducts();
        this.setupEventListeners();
        this.updateCartDisplay();
        this.setupMobileMenu();
    }

    // Gestión del menú móvil y dropdowns
    setupMobileMenu() {
        this.elements.menuToggle?.addEventListener('click', () => {
            this.toggleClass(this.elements.mainNav, 'active');
            this.toggleClass(this.elements.overlay, 'active');
            this.toggleClass(this.elements.menuToggle, 'active');
        });

        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.querySelector('.dropdown-toggle')?.addEventListener('click', (e) => {
                if (window.innerWidth < 768) {
                    e.preventDefault();
                    this.toggleClass(dropdown, 'active');
                }
            });
        });

        this.elements.overlay?.addEventListener('click', () => {
            this.closeMenus();
        });
    }

    toggleClass(element, className) {
        if (element) {
            element.classList.toggle(className);
        }
    }

    closeMenus() {
        this.toggleClass(this.elements.mainNav, 'active');
        this.toggleClass(this.elements.cartSidebar, 'active');
        this.toggleClass(this.elements.overlay, 'active');
        this.toggleClass(this.elements.menuToggle, 'active');
    }

    loadCartFromLocalStorage() {
        const savedCart = localStorage.getItem('fashion-store-cart');
        if (savedCart) {
            try {
                this.cart = JSON.parse(savedCart);
            } catch (error) {
                console.error('Error al cargar el carrito:', error);
                this.showNotification('Error al cargar el carrito guardado', 'error');
            }
        }
    }

    saveCartToLocalStorage() {
        localStorage.setItem('fashion-store-cart', JSON.stringify(this.cart));
    }

    async loadProducts() {
        try {
            const response = await fetch('http://localhost:5000/api/products'); // Asegúrate de que esta URL sea correcta
            if (!response.ok) throw new Error('Error al cargar productos');
            
            const products = await response.json();
            this.renderProducts(products);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    renderProducts(products) {
        if (!this.elements.productGrid) return;

        this.elements.productGrid.innerHTML = products.map(product => this.createProductCard(product)).join('');
    }

    createProductCard(product) {
        return `
            <div class="product-card" data-category="${product.category}">
                <div class="product-image">
                    <img src="${product.imageUrl}" alt="${product.name}" loading="lazy">
                    ${product.discount ? `<span class="discount-badge">-${product.discount}%</span>` : ''}
                    <div class="product-actions">
                        <button class="btn-wishlist" data-product-id="${product.id}">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="btn-quickview" data-product-id="${product.id}">
                            <i class="far fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price">
                        ${product.discount ? `<span class="original-price">${product.price.toFixed(2)}</span>` : ''}
                        <span class="current-price">${(product.price * (1 - (product.discount || 0) / 100)).toFixed(2)}</span>
                    </div>
                    <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                        Añadir al Carrito
                    </button>
                </div>
            </div>
        `;
    }

    addToCart(product) {
        const existingProduct = this.cart.find(item => item.id === product.id);
        
        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }

        this.showNotification(`${product.name} añadido al carrito`, 'success');
        this.updateCartDisplay();
        this.saveCartToLocalStorage();
    }

    removeFromCart(productId) {
        const index = this.cart.findIndex(item => item.id === productId);
        if (index !== -1) {
            const removedItem = this.cart[index];
            this.cart.splice(index, 1);
            this.showNotification(`${removedItem.name} eliminado del carrito`, 'success');
            this.updateCartDisplay();
            this.saveCartToLocalStorage();
        }
    }

    updateCartDisplay() {
        if (!this.elements.cartItems) return;

        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        this.elements.cartCount.textContent = totalItems;
        
        this.elements.cartItems.innerHTML = this.cart.map(item => this.createCartItem(item)).join('');

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.elements.cartTotal.textContent = `${total.toFixed(2)}`;
    }

    createCartItem(item) {
        return `
            <div class="cart-item">
                <img src="${item.imageUrl}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <div class="item-price">${item.price.toFixed(2)}</div>
                    <div class="item-quantity">
                        <button class="quantity-btn minus" data-product-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn plus" data-product-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="remove-item" data-product-id="${item.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    setupEventListeners() {
        this.elements.cartToggle?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleClass(this.elements.cartSidebar, 'active');
            this.toggleClass(this.elements.overlay, 'active');
        });

        this.elements.closeCart?.addEventListener('click', () => {
            this.closeMenus();
        });

        this.elements.cartItems?.addEventListener('click', (e) => {
            const target = e.target;

            if (target.closest('.remove-item')) {
                const productId = target.closest('.remove-item').dataset.productId;
                this.removeFromCart(productId);
            }
            
            if (target.classList.contains('quantity-btn')) {
                const productId = target.dataset.productId;
                const item = this.cart.find(item => item.id === productId);
                
                if (target.classList.contains('plus')) {
                    item.quantity++;
                } else if (target.classList.contains('minus') && item.quantity > 1) {
                    item.quantity--;
                }
                
                this.updateCartDisplay();
                this.saveCartToLocalStorage();
            }
        });

        this.elements.filterButtons?.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.dataset.filter;
                this.updateFilterButtons(button);
                this.filterProducts(filter);
            });
        });

        this.elements.newsletterForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.querySelector('input[type="email"]').value;
            this.showNotification('¡Gracias por suscribirte!', 'success');
            e.target.reset();
        });

        this.elements.checkoutButton?.addEventListener('click', () => {
            if (this.cart.length === 0) {
                this.showNotification('El carrito está vacío', 'warning');
                return;
            }
            this.processCheckout();
        });
    }

    updateFilterButtons(activeButton) {
        this.elements.filterButtons.forEach(button => {
            button.classList.toggle('active', button === activeButton);
        });
    }

    filterProducts(filter) {
        const products = document.querySelectorAll('.product-card');
        products.forEach(product => {
            product.style.display = (filter === 'all' || product.dataset.category === filter) ? 'block' : 'none';
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.classList.add('notification', `notification-${type}`);
        notification.textContent = message;

        document.body.appendChild(notification);
        
        requestAnimationFrame(() => notification.classList.add('show'));

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    async processCheckout() {
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: this.cart })
            });

            if (!response.ok) throw new Error('Error en el checkout');

            await response.json();
            this.showNotification('¡Compra realizada con éxito!', 'success');
            this.cart = [];
            this.updateCartDisplay();
            this.saveCartToLocalStorage();
            this.closeMenus();

        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error al procesar la compra', 'error');
        }
    }
}

// Estilos para las notificaciones
const styles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 4px;
        color: white;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
        z-index: 1000;
    }

    .notification.show {
        opacity: 1;
        transform: translateY(0);
    }

    .notification-success {
        background-color: #4CAF50;
    }

    .notification-error {
        background-color: #f44336;
    }

    .notification-warning {
        background-color: #ff9800;
    }
`;

// Agregar estilos
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);