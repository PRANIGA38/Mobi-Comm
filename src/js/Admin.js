document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        showPopup('Please log in to access this page.', false);
        setTimeout(() => window.location.href = '/src/pages/account.html', 2000);
        return;
    }
    try {
        await fetchWithAuth('http://localhost:8083/api/admin/plans', { method: 'GET' }, true);
        fetchPlans();
        fetchSubscribers();
        fetchCategories();
    } catch (error) {
        showPopup('Access denied: ' + error.message, false);
        setTimeout(() => window.location.href = '/src/pages/account.html', 2000);
    }
});

const API_BASE_URL = 'http://localhost:8083/api';
var jwtToken = localStorage.getItem('jwtToken');

// DOM Elements
const expiringSubscribersTable = document.getElementById('expiring-subscribers');
const plansTable = document.getElementById('plans-table');
const userModal = document.getElementById('user-modal');
const planModal = document.getElementById('plan-modal');
const categoryModal = document.getElementById('category-modal');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileSidebar = document.getElementById('mobileSidebar');
const addPlanBtns = document.querySelectorAll('.add-plan-btn');
const addCategoryBtn = document.querySelector('.add-category-btn');
const planForm = document.getElementById('plan-form');
const categoryForm = document.getElementById('category-form');
const logoutModal = document.getElementById('logoutModal');
const logoutButton = document.getElementById('logout');
const confirmLogoutButton = document.getElementById('confirmLogout');
const cancelLogoutButton = document.getElementById('cancelLogout');
const closeModal = document.querySelector('.modal-content .close');
const categoryButtonsContainer = document.getElementById('category-buttons');
const planCategoriesContainer = document.getElementById('plan-categories-container');
const categoriesTable = document.getElementById('categories-table');
const paginationControls = document.getElementById('pagination-controls');
const isHotDealSelect = document.getElementById('plan-is-hot-deal');
const hotDealPriceDiv = document.getElementById('hot-deal-price');

// Bootstrap Modal Instances
const userModalInstance = new bootstrap.Modal(userModal);
const planModalInstance = new bootstrap.Modal(planModal);
const categoryModalInstance = new bootstrap.Modal(categoryModal);

// Pagination settings
const PLANS_PER_PAGE = 4;
let currentPage = 1;
let allPlans = [];
let totalPages = 1;
let allCategories = [];

// Fetch utility with authentication
async function fetchWithAuth(url, options = {}) {
    if (!jwtToken) {
        console.error('No JWT token found, redirecting to login');
        window.location.href = '/src/pages/account.html';
        return;
    }
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
    };
    console.log('Fetching:', url, 'with headers:', options.headers);
    const response = await fetch(url, options);
    if (response.status === 401) {
        console.error('Unauthorized - Redirecting to login');
        localStorage.removeItem('jwtToken');
        window.location.href = '/src/pages/account.html';
        return;
    }
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Fetch failed: ${response.status} - ${errorText}`);
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
    }
    return response;
}

// Fetch and display dashboard stats
async function fetchDashboardStats() {
    try {
        const stats = { totalSubscribers: 2543, expiringSoon: 58, activePlans: 32, monthlyRevenue: 3200000 };
        document.querySelector('.user-card h4').textContent = stats.totalSubscribers.toLocaleString();
        document.querySelector('.expiry-card h4').textContent = stats.expiringSoon;
        document.querySelector('.plans-card h4').textContent = stats.activePlans;
        document.querySelector('.revenue-card h4').textContent = `₹${(stats.monthlyRevenue / 1000000).toFixed(1)}M`;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
    }
}

// Fetch and display expiring subscribers
async function fetchExpiringSubscribers(searchTerm = '') {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/admin/subscribers/expiring-soon`);
        const subscribers = await response.json();
        displayExpiringSubscribers(subscribers, searchTerm);
    } catch (error) {
        console.error('Error fetching expiring subscribers:', error);
        expiringSubscribersTable.innerHTML = `<tr><td colspan="6" class="text-center py-3">Error loading subscribers</td></tr>`;
    }
}

function displayExpiringSubscribers(subscribers, searchTerm = '') {
    expiringSubscribersTable.innerHTML = '';
    const filteredSubscribers = subscribers.filter(subscriber =>
        !searchTerm ||
        subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subscriber.email && subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        subscriber.mobileNumber.includes(searchTerm)
    );

    if (filteredSubscribers.length === 0) {
        expiringSubscribersTable.innerHTML = `<tr><td colspan="6" class="text-center py-3">No subscribers with expiring plans found</td></tr>`;
        return;
    }

    filteredSubscribers.forEach(subscriber => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <img src="${subscriber.avatar || '/src/assets/icons/users.png'}" alt="${subscriber.name}" class="rounded-circle me-2" style="width: 40px; height: 40px;">
                    <div>
                        <div class="fw-medium">${subscriber.name}</div>
                        <div class="small text-muted">${subscriber.email || 'N/A'}</div>
                    </div>
                </div>
            </td>
            <td>${subscriber.mobileNumber}</td>
            <td>${subscriber.currentPlan || 'N/A'}</td>
            <td>${formatDate(subscriber.planExpiryDate)}</td>
            <td><span class="status status-expiring">Expiring in ${getDaysUntil(subscriber.planExpiryDate)} days</span></td>
            <td><button class="btn btn-sm btn-view view-user" data-id="${subscriber.id}">View</button></td>
        `;
        expiringSubscribersTable.appendChild(row);
    });

    document.querySelectorAll('.view-user').forEach(button => {
        button.addEventListener('click', () => openUserModal(parseInt(button.getAttribute('data-id'))));
    });
}

// Fetch categories
async function fetchCategories() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/admin/categories`);
        allCategories = await response.json();
        displayCategories();
        renderCategoryFilters();
        renderPlanCategoryCheckboxes();
    } catch (error) {
        console.error('Error fetching categories:', error);
        categoriesTable.innerHTML = `<tr><td colspan="2" class="text-center py-3">Error loading categories</td></tr>`;
    }
}

// Display categories in the table
function displayCategories() {
    categoriesTable.innerHTML = '';
    if (allCategories.length === 0) {
        categoriesTable.innerHTML = `<tr><td colspan="2" class="text-center py-3">No categories found</td></tr>`;
        return;
    }
    allCategories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="fw-medium">${category.name.charAt(0).toUpperCase() + category.name.slice(1)}</td>
            <td>
                <button class="btn btn-sm btn-danger delete-category" data-id="${category.id}">Delete</button>
            </td>
        `;
        categoriesTable.appendChild(row);
    });

    document.querySelectorAll('.delete-category').forEach(button => {
        button.addEventListener('click', () => deleteCategory(parseInt(button.getAttribute('data-id'))));
    });
}

// Render category filter buttons
function renderCategoryFilters() {
    categoryButtonsContainer.innerHTML = '<button class="btn btn-outline-primary category-btn active" data-category="all">All Plans</button>';
    allCategories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary category-btn';
        button.setAttribute('data-category', category.name);
        button.textContent = `${category.name.charAt(0).toUpperCase() + category.name.slice(1)} Plans`;
        categoryButtonsContainer.appendChild(button);
    });

    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const category = button.getAttribute('data-category');
            fetchPlans(category);
        });
    });
}

// Render category checkboxes in the plan modal
function renderPlanCategoryCheckboxes() {
    planCategoriesContainer.innerHTML = '';
    allCategories.forEach(category => {
        const div = document.createElement('div');
        div.className = 'form-check';
        div.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${category.name}" id="category-${category.name}">
            <label class="form-check-label" for="category-${category.name}">
                ${category.name.charAt(0).toUpperCase() + category.name.slice(1)} Plans
            </label>
        `;
        planCategoriesContainer.appendChild(div);
    });
}

async function fetchPlans(category = 'all') {
    try {
        const url = category === 'all' ? `${API_BASE_URL}/admin/plans` : `${API_BASE_URL}/admin/plans?category=${category}`;
        const response = await fetchWithAuth(url, { method: 'GET' }, true);
        allPlans = await response.json();
        currentPage = 1;
        displayPlansWithPagination();
    } catch (error) {
        console.error('Error fetching plans:', error);
        plansTable.innerHTML = `<tr><td colspan="8" class="text-center py-3">Error loading plans</td></tr>`;
    }
}

// Display plans with pagination
function displayPlansWithPagination() {
    if (allPlans.length === 0) {
        plansTable.innerHTML = `<tr><td colspan="8" class="text-center py-3">No plans found for this category</td></tr>`;
        paginationControls.innerHTML = '';
        return;
    }

    totalPages = Math.ceil(allPlans.length / PLANS_PER_PAGE);
    const startIndex = (currentPage - 1) * PLANS_PER_PAGE;
    const endIndex = startIndex + PLANS_PER_PAGE;
    const paginatedPlans = allPlans.slice(startIndex, endIndex);

    plansTable.innerHTML = '';
    paginatedPlans.forEach(plan => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="fw-medium">${plan.name}</td>
            <td>${plan.description || 'N/A'}</td>
            <td>${plan.validity} days</td>
            <td>${plan.data}GB</td>
            <td>₹${plan.price}</td>
            <td>${plan.activeUsers || 0}</td>
            <td>${plan.categories ? plan.categories.map(cat => cat.name.charAt(0).toUpperCase() + cat.name.slice(1)).join(', ') : 'N/A'}</td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-primary edit-plan" data-id="${plan.id}">Edit</button>
                    <button class="btn btn-sm btn-warning deactivate-plan" data-id="${plan.id}">Deactivate</button>
                </div>
            </td>
        `;
        plansTable.appendChild(row);
    });

    document.querySelectorAll('.edit-plan').forEach(button => {
        button.addEventListener('click', () => openPlanModal(parseInt(button.getAttribute('data-id'))));
    });
    document.querySelectorAll('.deactivate-plan').forEach(button => {
        button.addEventListener('click', () => deactivatePlan(parseInt(button.getAttribute('data-id'))));
    });

    renderPaginationControls();
}

// Render pagination controls
function renderPaginationControls() {
    paginationControls.innerHTML = '';

    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">«</span></a>`;
    prevLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            displayPlansWithPagination();
        }
    });
    paginationControls.appendChild(prevLi);

    for (let i = 1; i <= totalPages; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageLi.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            displayPlansWithPagination();
        });
        paginationControls.appendChild(pageLi);
    }

    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">»</span></a>`;
    nextLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            displayPlansWithPagination();
        }
    });
    paginationControls.appendChild(nextLi);
}

// Search functionality
function handleSearch() {
    fetchExpiringSubscribers(searchInput.value.trim());
}

// Open user details modal
async function openUserModal(userId) {
    try {
        const subscriberResponse = await fetchWithAuth(`${API_BASE_URL}/admin/subscribers/${userId}`);
        const user = await subscriberResponse.json();

        const historyResponse = await fetchWithAuth(`${API_BASE_URL}/admin/subscribers/${userId}/recharge-history`);
        const rechargeHistory = await historyResponse.json();

        document.getElementById('modal-user-avatar').src = user.avatar || '/src/assets/icons/users.png';
        document.getElementById('modal-user-name').textContent = user.name;
        document.getElementById('modal-user-phone').textContent = user.mobileNumber;
        document.getElementById('modal-user-email').textContent = user.email || 'N/A';
        document.getElementById('modal-user-address').textContent = user.address || 'N/A';

        const rechargeHistoryTable = document.getElementById('recharge-history-table');
        rechargeHistoryTable.innerHTML = '';
        const limitedHistory = rechargeHistory.slice(0, 4);

        if (limitedHistory.length === 0) {
            rechargeHistoryTable.innerHTML = `<tr><td colspan="5" class="text-center py-3">No recharge history available</td></tr>`;
        } else {
            limitedHistory.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formatDate(record.rechargeDate)}</td>
                    <td>${record.planName}</td>
                    <td>₹${record.amount.toFixed(2)}</td>
                    <td>${record.paymentMode}</td>
                    <td>${record.status}</td>
                `;
                rechargeHistoryTable.appendChild(row);
            });

            if (rechargeHistory.length > 4) {
                const viewAllRow = document.createElement('tr');
                viewAllRow.innerHTML = `
                    <td colspan="5" class="text-center">
                        <a href="/src/pages/subscribers.html?userId=${userId}" class="btn btn-sm btn-primary">View All (${rechargeHistory.length} entries)</a>
                    </td>
                `;
                rechargeHistoryTable.appendChild(viewAllRow);
            }
        }

        userModalInstance.show();
    } catch (error) {
        console.error('Error fetching subscriber or recharge history:', error);
        alert('Failed to load subscriber details');
    }
}

// Open plan modal (add/edit)
async function openPlanModal(planId = null) {
    document.getElementById('plan-modal-title').textContent = planId ? 'Edit Plan' : 'Add New Plan';
    document.getElementById('plan-id').value = planId || '';
    planForm.reset();
    document.querySelectorAll('#plan-form input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.getElementById('plan-is-hot-deal').value = 'false';
    hotDealPriceDiv.style.display = 'none';

    if (planId) {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/admin/plans/${planId}`);
            const plan = await response.json();
            document.getElementById('plan-name').value = plan.name;
            document.getElementById('plan-description').value = plan.description || '';
            document.getElementById('plan-validity').value = plan.validity;
            document.getElementById('plan-data').value = plan.data;
            document.getElementById('plan-price').value = plan.price;
            document.getElementById('plan-sms').value = plan.sms || '';
            document.getElementById('plan-calls').value = plan.calls || '';
            document.getElementById('plan-benefits').value = plan.benefits || '';
            if (plan.categories) {
                plan.categories.forEach(category => {
                    const checkbox = document.getElementById(`category-${category.name}`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            document.getElementById('plan-is-hot-deal').value = plan.isHotDeal ? 'true' : 'false';
            if (plan.isHotDeal) {
                hotDealPriceDiv.style.display = 'block';
                document.getElementById('plan-original-price').value = plan.originalPrice || '';
            }
        } catch (error) {
            console.error('Error fetching plan:', error);
            alert('Failed to load plan details');
        }
    }
    planModalInstance.show();
}

// Save plan (add or update)
async function savePlan(e) {
    e.preventDefault();
    const planId = document.getElementById('plan-id').value;
    const selectedCategories = Array.from(document.querySelectorAll('#plan-form input[type="checkbox"]:checked'))
        .map(checkbox => ({ name: checkbox.value }));
    const isHotDeal = document.getElementById('plan-is-hot-deal').value === 'true';
    const plan = {
        name: document.getElementById('plan-name').value,
        description: document.getElementById('plan-description').value || null,
        validity: parseInt(document.getElementById('plan-validity').value),
        data: parseFloat(document.getElementById('plan-data').value),
        price: parseFloat(document.getElementById('plan-price').value),
        activeUsers: planId ? undefined : 0,
        sms: document.getElementById('plan-sms').value || null,
        calls: document.getElementById('plan-calls').value || null,
        benefits: document.getElementById('plan-benefits').value || null,
        categories: selectedCategories.length > 0 ? selectedCategories : null,
        isHotDeal: isHotDeal,
        originalPrice: isHotDeal ? parseFloat(document.getElementById('plan-original-price').value) : null,
        isActive: true
    };

    if (!plan.name || isNaN(plan.validity) || isNaN(plan.data) || isNaN(plan.price)) {
        alert('Please fill all required fields with valid data');
        return;
    }
    if (isHotDeal && (isNaN(plan.originalPrice) || plan.originalPrice <= plan.price)) {
        alert('Original price must be greater than the current price for a hot deal');
        return;
    }

    try {
        const url = planId ? `${API_BASE_URL}/admin/plans/${planId}` : `${API_BASE_URL}/admin/plans`;
        const method = planId ? 'PUT' : 'POST';
        const response = await fetchWithAuth(url, { method, body: JSON.stringify(plan) });
        if (response.ok) {
            planModalInstance.hide();
            const activeCategory = document.querySelector('.category-btn.active').getAttribute('data-category');
            fetchPlans(activeCategory);
        }
    } catch (error) {
        console.error('Error saving plan:', error.message);
        alert('Failed to save plan: ' + error.message);
    }
}

// Deactivate plan
async function deactivatePlan(planId) {
    if (!confirm('Are you sure you want to deactivate this plan? It will no longer be visible to users.')) return;
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/admin/plans/${planId}`, { method: 'DELETE' });
        if (response.ok) {
            const activeCategory = document.querySelector('.category-btn.active').getAttribute('data-category');
            fetchPlans(activeCategory);
        } else {
            throw new Error('Failed to deactivate plan');
        }
    } catch (error) {
        console.error('Error deactivating plan:', error);
        alert(error.message);
    }
}

// Open category modal
function openCategoryModal() {
    categoryForm.reset();
    categoryModalInstance.show();
}

// Save category
async function saveCategory(e) {
    e.preventDefault();
    const categoryName = document.getElementById('category-name').value.trim();
    if (!categoryName) {
        alert('Please enter a category name');
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/admin/categories`, {
            method: 'POST',
            body: JSON.stringify({ name: categoryName.toLowerCase() })
        });
        if (response.ok) {
            categoryModalInstance.hide();
            fetchCategories();
        }
    } catch (error) {
        console.error('Error saving category:', error.message);
        alert('Failed to save category: ' + error.message);
    }
}

// Delete category
async function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category? Plans associated with this category will lose this category.')) return;
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/admin/categories/${categoryId}`, { method: 'DELETE' });
        if (response.ok) {
            fetchCategories();
        } else {
            throw new Error('Failed to delete category');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        alert(error.message);
    }
}

// Utility functions
function formatDate(dateString) {
    return dateString ? new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
}

function getDaysUntil(dateString) {
    if (!dateString) return 'N/A';
    const today = new Date();
    const targetDate = new Date(dateString);
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    const diffMs = targetDate - today;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Event Listeners
window.addEventListener('DOMContentLoaded', () => {
    fetchDashboardStats();
    fetchExpiringSubscribers();
    fetchPlans();
    fetchCategories();

    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (e) => e.key === 'Enter' && handleSearch());
    sidebarToggle.addEventListener('click', () => mobileSidebar.classList.toggle('show'));
    addPlanBtns.forEach(btn => btn.addEventListener('click', () => openPlanModal()));
    addCategoryBtn.addEventListener('click', openCategoryModal);
    planForm.addEventListener('submit', savePlan);
    categoryForm.addEventListener('submit', saveCategory);

    isHotDealSelect.addEventListener('change', () => {
        hotDealPriceDiv.style.display = isHotDealSelect.value === 'true' ? 'block' : 'none';
    });

    document.addEventListener('click', (e) => {
        if (mobileSidebar.classList.contains('show') && !mobileSidebar.contains(e.target) && e.target !== sidebarToggle) {
            mobileSidebar.classList.remove('show');
        }
    });

    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        logoutModal.style.display = 'block';
    });

    closeModal.onclick = () => logoutModal.style.display = 'none';
    cancelLogoutButton.onclick = () => logoutModal.style.display = 'none';
    confirmLogoutButton.onclick = () => {
        localStorage.removeItem('jwtToken');
        window.location.href = '/src/pages/MobilePrepaid.html';
    };
    window.onclick = (event) => {
        if (event.target === logoutModal) logoutModal.style.display = 'none';
    };

    window.onscroll = () => {
        document.getElementById('scrollTopBtn').style.display =
            (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) ? 'block' : 'none';
    };
});