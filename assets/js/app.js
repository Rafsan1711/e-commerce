/**
 * ============================================
 * JAWAD'S BIKE PARTS - MAIN APP LOGIC
 * Shop, Cart, Products Management
 * ============================================
 */

let allProducts = [];
let filteredProducts = [];
let cart = [];

/**
 * LOAD PRODUCTS
 */
async function loadProducts() {
    try {
        const productsRef = db.ref('products');
        const snapshot = await productsRef.once('value');
        const productsData = snapshot.val();
        
        if (productsData) {
            allProducts = Object.keys(productsData).map(key => ({
                id: key,
                ...productsData[key]
            }));
            
            filteredProducts = [...allProducts];
            renderProducts();
        } else {
            // No products found
            document.getElementById('products-container').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h4>No Products Available</h4>
                    <p>Check back soon for new products!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('products-container').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Error Loading Products</h4>
                <p>Please refresh the page to try again</p>
            </div>
        `;
    }
}

/**
 * RENDER PRODUCTS
 */
function renderProducts() {
    const container = document.getElementById('products-container');
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h4>No Products Found</h4>
                <p>Try adjusting your filters</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="product-grid">
            ${filteredProducts.map(product => `
                <div class="product-card" data-aos="fade-up">
                    ${product.badge ? `<div class="product-badge ${product.badge.toLowerCase()}">${product.badge}</div>` : ''}
                    <div class="product-image">
                        ${product.imageUrl ? 
                            `<img src="${product.imageUrl}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: contain;">` :
                            `<i class="fas fa-${getIconForCategory(product.category)} fa-5x"></i>`
                        }
                    </div>
                    <div class="product-info">
                        <h5>${product.name}</h5>
                        <p class="text-muted">${product.description || 'Premium quality product'}</p>
                        <div class="product-footer">
                            <span class="price">$${product.price}</span>
                            <button class="btn btn-sm btn-primary" onclick="addToCart('${product.id}')">
                                <i class="fas fa-cart-plus"></i> Add
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * GET ICON FOR CATEGORY
 */
function getIconForCategory(category) {
    const icons = {
        'engine': 'cog',
        'brakes': 'compact-disc',
        'electronics': 'bolt',
        'accessories': 'wrench',
        'lubricants': 'oil-can'
    };
    return icons[category] || 'box';
}

/**
 * ADD TO CART
 */
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartUI();
    saveCartToStorage();
    
    // Show notification
    showNotification('Product added to cart!', 'success');
}

/**
 * UPDATE CART UI
 */
function updateCartUI() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

/**
 * SAVE CART TO STORAGE
 */
function saveCartToStorage() {
    if (currentUser) {
        db.ref('carts/' + currentUser.uid).set(cart);
    } else {
        localStorage.setItem('guest-cart', JSON.stringify(cart));
    }
}

/**
 * LOAD CART FROM STORAGE
 */
async function loadCart() {
    try {
        if (currentUser) {
            const snapshot = await db.ref('carts/' + currentUser.uid).once('value');
            cart = snapshot.val() || [];
        } else {
            const savedCart = localStorage.getItem('guest-cart');
            cart = savedCart ? JSON.parse(savedCart) : [];
        }
        updateCartUI();
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

/**
 * INITIALIZE CART
 */
async function initializeCart() {
    await loadCart();
    
    // Cart button click
    document.getElementById('cart-btn')?.addEventListener('click', showCart);
}

/**
 * SHOW CART
 */
function showCart() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'info');
        return;
    }
    
    const cartHTML = `
        <div class="modal fade show" id="cart-modal" style="display: block; background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-lg">
                <div class="modal-content" style="background: var(--bg-card); border: 1px solid var(--border);">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-shopping-cart me-2"></i>Shopping Cart</h5>
                        <button type="button" class="btn-close btn-close-white" onclick="closeCart()"></button>
                    </div>
                    <div class="modal-body">
                        ${cart.map(item => `
                            <div class="d-flex align-items-center justify-content-between mb-3 p-3" style="background: var(--bg-dark); border-radius: 12px;">
                                <div class="d-flex align-items-center gap-3">
                                    <i class="fas fa-${getIconForCategory(item.category)} fa-2x text-primary"></i>
                                    <div>
                                        <h6 class="mb-0">${item.name}</h6>
                                        <small class="text-muted">$${item.price} each</small>
                                    </div>
                                </div>
                                <div class="d-flex align-items-center gap-3">
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-outline-light" onclick="updateQuantity('${item.id}', -1)">-</button>
                                        <button class="btn btn-sm btn-outline-light" disabled>${item.quantity}</button>
                                        <button class="btn btn-sm btn-outline-light" onclick="updateQuantity('${item.id}', 1)">+</button>
                                    </div>
                                    <span class="fw-bold">$${(item.price * item.quantity).toFixed(2)}</span>
                                    <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart('${item.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                        <hr>
                        <div class="d-flex justify-content-between align-items-center">
                            <h5>Total:</h5>
                            <h5 class="text-primary">$${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</h5>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-light" onclick="closeCart()">Continue Shopping</button>
                        <button type="button" class="btn btn-primary btn-glow" onclick="checkout()">
                            <i class="fas fa-credit-card me-2"></i>Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', cartHTML);
}

/**
 * CLOSE CART
 */
function closeCart() {
    document.getElementById('cart-modal')?.remove();
}

/**
 * UPDATE QUANTITY
 */
function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    updateCartUI();
    saveCartToStorage();
    closeCart();
    setTimeout(showCart, 100);
}

/**
 * REMOVE FROM CART
 */
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    saveCartToStorage();
    closeCart();
    if (cart.length > 0) {
        setTimeout(showCart, 100);
    }
}

/**
 * CHECKOUT
 */
function checkout() {
    showNotification('Checkout feature coming soon!', 'info');
    // আপাতত এটা placeholder, পরে payment gateway integrate করবে
}

/**
 * LOAD USER PROFILE
 */
async function loadUserProfile() {
    if (!currentUser) return;
    
    try {
        const userRef = db.ref('users/' + currentUser.uid);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val();
        
        if (userData) {
            // Update UI
            document.getElementById('user-name').textContent = userData.username;
            
            const avatar = document.getElementById('user-avatar');
            if (userData.photoURL) {
                avatar.innerHTML = `<img src="${userData.photoURL}" alt="${userData.username}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            } else {
                avatar.textContent = userData.username.charAt(0).toUpperCase();
            }
            
            // Show admin menu if admin
            if (userData.role === 'admin' || currentUser.email === window.firebaseApp.ADMIN_EMAIL) {
                document.getElementById('admin-menu-item').style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

/**
 * FILTERS
 */
document.getElementById('category-filter')?.addEventListener('change', applyFilters);
document.getElementById('sort-filter')?.addEventListener('change', applyFilters);
document.getElementById('price-filter')?.addEventListener('input', function() {
    document.getElementById('price-value').textContent = '$' + this.value;
    applyFilters();
});

document.getElementById('search-input')?.addEventListener('input', applyFilters);

function applyFilters() {
    const category = document.getElementById('category-filter').value;
    const maxPrice = parseInt(document.getElementById('price-filter').value);
    const sort = document.getElementById('sort-filter').value;
    const search = document.getElementById('search-input')?.value.toLowerCase() || '';
    
    // Filter
    filteredProducts = allProducts.filter(product => {
        const matchCategory = !category || product.category === category;
        const matchPrice = product.price <= maxPrice;
        const matchSearch = !search || 
            product.name.toLowerCase().includes(search) || 
            (product.description && product.description.toLowerCase().includes(search));
        
        return matchCategory && matchPrice && matchSearch;
    });
    
    // Sort
    if (sort === 'price-low') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sort === 'newest') {
        filteredProducts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    
    renderProducts();
}

function clearFilters() {
    document.getElementById('category-filter').value = '';
    document.getElementById('price-filter').value = 1000;
    document.getElementById('price-value').textContent = '$1000';
    document.getElementById('sort-filter').value = 'newest';
    if (document.getElementById('search-input')) {
        document.getElementById('search-input').value = '';
    }
    applyFilters();
}

/**
 * SHOW NOTIFICATION
 */
function showNotification(message, type = 'info') {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10001;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * PROFILE, ORDERS, SETTINGS
 */
function showProfile() {
    showNotification('Profile page coming soon!', 'info');
}

function showOrders() {
    showNotification('Orders page coming soon!', 'info');
}

function showSettings() {
    showNotification('Settings page coming soon!', 'info');
}

/**
 * SHOW ADMIN PANEL
 */
function showAdminPanel() {
    document.getElementById('admin-menu-item').style.display = 'block';
}

// Animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('✅ App.js loaded');
