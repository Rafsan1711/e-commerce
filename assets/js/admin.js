/**
 * ============================================
 * JAWAD'S BIKE PARTS - ADMIN PANEL LOGIC
 * Product Management, Orders, Analytics
 * ============================================
 */

let currentUser = null;
let allProducts = [];
let allCustomers = [];

/**
 * AUTH CHECK
 */
auth.onAuthStateChanged(async user => {
    if (!user) {
        window.location.href = '/app.html';
        return;
    }
    
    // Check if user is admin
    const userRef = db.ref('users/' + user.uid);
    const snapshot = await userRef.once('value');
    const userData = snapshot.val();
    
    if (!userData || (userData.role !== 'admin' && user.email !== window.firebaseApp.ADMIN_EMAIL)) {
        alert('Access denied. Admin only!');
        window.location.href = '/app.html';
        return;
    }
    
    currentUser = user;
    console.log('✅ Admin authenticated:', user.email);
    
    // Load dashboard data
    loadDashboardStats();
    loadProducts();
    loadCustomers();
});

/**
 * SHOW SECTION
 */
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(el => {
        el.style.display = 'none';
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.admin-nav-item').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show selected section
    const sectionEl = document.getElementById(section + '-section');
    if (sectionEl) {
        sectionEl.style.display = 'block';
    }
    
    // Add active class to clicked nav item
    event.target.closest('.admin-nav-item')?.classList.add('active');
}

/**
 * LOAD DASHBOARD STATS
 */
async function loadDashboardStats() {
    try {
        // Get products count
        const productsSnapshot = await db.ref('products').once('value');
        const products = productsSnapshot.val();
        const productsCount = products ? Object.keys(products).length : 0;
        document.getElementById('total-products').textContent = productsCount;
        
        // Get customers count
        const usersSnapshot = await db.ref('users').once('value');
        const users = usersSnapshot.val();
        const usersCount = users ? Object.keys(users).length : 0;
        document.getElementById('total-customers').textContent = usersCount;
        
        // Orders and revenue - placeholder for now
        document.getElementById('total-orders').textContent = '0';
        document.getElementById('total-revenue').textContent = '$0';
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

/**
 * LOAD PRODUCTS
 */
async function loadProducts() {
    try {
        const snapshot = await db.ref('products').once('value');
        const productsData = snapshot.val();
        
        if (productsData) {
            allProducts = Object.keys(productsData).map(key => ({
                id: key,
                ...productsData[key]
            }));
            
            renderProductsList();
        } else {
            document.getElementById('products-list').innerHTML = `
                <p class="text-muted text-center py-4">No products yet. Add your first product!</p>
            `;
        }
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('products-list').innerHTML = `
            <p class="text-danger text-center py-4">Error loading products</p>
        `;
    }
}

/**
 * RENDER PRODUCTS LIST
 */
function renderProductsList() {
    const container = document.getElementById('products-list');
    
    if (allProducts.length === 0) {
        container.innerHTML = `
            <p class="text-muted text-center py-4">No products yet. Add your first product!</p>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-dark table-hover">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Badge</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${allProducts.map(product => `
                        <tr>
                            <td>${product.name}</td>
                            <td><span class="badge bg-secondary">${product.category}</span></td>
                            <td>$${product.price}</td>
                            <td>${product.badge ? `<span class="badge bg-primary">${product.badge}</span>` : '-'}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${product.id}', '${product.name}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * SHOW ADD PRODUCT FORM
 */
function showAddProduct() {
    document.getElementById('add-product-form').style.display = 'block';
    document.getElementById('product-form').reset();
}

/**
 * HIDE ADD PRODUCT FORM
 */
function hideAddProduct() {
    document.getElementById('add-product-form').style.display = 'none';
}

/**
 * ADD PRODUCT
 */
document.getElementById('product-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('product-name').value.trim(),
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        badge: document.getElementById('product-badge').value,
        description: document.getElementById('product-description').value.trim(),
        imageUrl: document.getElementById('product-image').value.trim(),
        createdAt: Date.now(),
        createdBy: currentUser.uid
    };
    
    try {
        const newProductRef = db.ref('products').push();
        await newProductRef.set(productData);
        
        showNotification('Product added successfully!', 'success');
        hideAddProduct();
        loadProducts();
        loadDashboardStats();
        
    } catch (error) {
        console.error('Error adding product:', error);
        showNotification('Failed to add product', 'error');
    }
});

/**
 * DELETE PRODUCT
 */
async function deleteProduct(productId, productName) {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
        return;
    }
    
    try {
        await db.ref('products/' + productId).remove();
        showNotification('Product deleted successfully!', 'success');
        loadProducts();
        loadDashboardStats();
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Failed to delete product', 'error');
    }
}

/**
 * LOAD CUSTOMERS
 */
async function loadCustomers() {
    try {
        const snapshot = await db.ref('users').once('value');
        const usersData = snapshot.val();
        
        if (usersData) {
            allCustomers = Object.keys(usersData).map(key => ({
                id: key,
                ...usersData[key]
            }));
            
            renderCustomersList();
        } else {
            document.getElementById('customers-list').innerHTML = `
                <p class="text-muted text-center py-4">No customers yet</p>
            `;
        }
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

/**
 * RENDER CUSTOMERS LIST
 */
function renderCustomersList() {
    const container = document.getElementById('customers-list');
    
    if (allCustomers.length === 0) {
        container.innerHTML = `
            <p class="text-muted text-center py-4">No customers yet</p>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-dark table-hover">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                    </tr>
                </thead>
                <tbody>
                    ${allCustomers.map(customer => `
                        <tr>
                            <td>${customer.username || 'N/A'}</td>
                            <td>${customer.email}</td>
                            <td><span class="badge ${customer.role === 'admin' ? 'bg-danger' : 'bg-secondary'}">${customer.role || 'customer'}</span></td>
                            <td>${customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
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
        top: 20px;
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
 * SIGN OUT
 */
function signOut() {
    if (confirm('Are you sure you want to sign out?')) {
        auth.signOut().then(() => {
            window.location.href = '/';
        });
    }
}

// Animation styles
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

console.log('✅ Admin.js loaded');
