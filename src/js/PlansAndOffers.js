document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        alert('Please log in to access this page.');
        setTimeout(() => window.location.href = '/src/pages/account.html', 2000);
        return;
    }
    try {
        await fetchWithAuth('http://localhost:8083/api/admin/plans', { method: 'GET' });
        fetchPlans();
        fetchCategories();
    } catch (error) {
        alert('Access denied: ' + error.message);
        setTimeout(() => window.location.href = '/src/pages/account.html', 2000);
    }
});

const API_BASE_URL = 'http://localhost:8083/api';
const jwtToken = localStorage.getItem('jwtToken');

// DOM Elements
const plansTable = document.getElementById('plans-table');
const planModal = document.getElementById('plan-modal');
const categoryModal = document.getElementById('category-modal');
const categoryButtonsContainer = document.getElementById('category-buttons');
const planCategoriesContainer = document.getElementById('plan-categories-container');
const paginationControls = document.getElementById('pagination-controls');
const planForm = document.getElementById('plan-form');
const addPlanBtn = document.querySelector('.add-plan-btn');
const addCategoryBtn = document.querySelector('.add-category-btn');
const categoryForm = document.getElementById('category-form');
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileSidebar = document.getElementById('mobileSidebar');
const logoutModal = document.getElementById('logoutModal');
const logoutButton = document.getElementById('logout');
const confirmLogoutButton = document.getElementById('confirmLogout');
const cancelLogoutButton = document.getElementById('cancelLogout');
const closeModal = document.querySelector('.modal-content .close');
const categoriesTable = document.getElementById('categories-table');
const categoriesPaginationControls = document.getElementById('categories-pagination-controls');
const isHotDealSelect = document.getElementById('plan-is-hot-deal');
const hotDealPriceDiv = document.getElementById('hot-deal-price');

// Bootstrap Modal Instances
const planModalInstance = new bootstrap.Modal(planModal);
const categoryModalInstance = new bootstrap.Modal(categoryModal);

// Pagination settings for Plans
const PLANS_PER_PAGE = 5;
let currentPagePlans = 1;
let allPlans = [];
let totalPagesPlans = 1;

// Pagination settings for Categories
const CATEGORIES_PER_PAGE = 3; 
let currentPageCategories = 1;
let allCategories = [];
let totalPagesCategories = 1;

async function fetchWithAuth(url, options = {}) {
    if (!jwtToken) {
        window.location.href = '/src/pages/account.html';
        return;
    }
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
    };
    const response = await fetch(url, options);
    if (response.status === 401) {
        localStorage.removeItem('jwtToken');
        window.location.href = '/src/pages/account.html';
        return;
    }
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response;
}

async function fetchPlans(category = 'all') {
    try {
        const url = category === 'all' ? `${API_BASE_URL}/admin/plans` : `${API_BASE_URL}/admin/plans?category=${category}`;
        const response = await fetchWithAuth(url);
        allPlans = await response.json();
        currentPagePlans = 1;
        displayPlansWithPagination();
    } catch (error) {
        console.error('Error fetching plans:', error);
        plansTable.innerHTML = `<tr><td colspan="7" class="text-center py-3">Error loading plans</td></tr>`;
    }
}

function displayPlansWithPagination() {
    if (allPlans.length === 0) {
        plansTable.innerHTML = `<tr><td colspan="7" class="text-center py-3">No plans found for this category</td></tr>`;
        paginationControls.innerHTML = '';
        return;
    }

    totalPagesPlans = Math.ceil(allPlans.length / PLANS_PER_PAGE);
    const startIndex = (currentPagePlans - 1) * PLANS_PER_PAGE;
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

    renderPlansPaginationControls();
}

function renderPlansPaginationControls() {
    paginationControls.innerHTML = '';

    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPagePlans === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">«</span></a>`;
    prevLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPagePlans > 1) {
            currentPagePlans--;
            displayPlansWithPagination();
        }
    });
    paginationControls.appendChild(prevLi);

    for (let i = 1; i <= totalPagesPlans; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPagePlans ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageLi.addEventListener('click', (e) => {
            e.preventDefault();
            currentPagePlans = i;
            displayPlansWithPagination();
        });
        paginationControls.appendChild(pageLi);
    }

    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPagePlans === totalPagesPlans ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">»</span></a>`;
    nextLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPagePlans < totalPagesPlans) {
            currentPagePlans++;
            displayPlansWithPagination();
        }
    });
    paginationControls.appendChild(nextLi);
}

async function fetchCategories() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/admin/categories`);
        allCategories = await response.json();
        currentPageCategories = 1;
        displayCategoriesWithPagination();
        renderCategoryFilters();
        renderPlanCategoryCheckboxes();
    } catch (error) {
        console.error('Error fetching categories:', error);
        categoriesTable.innerHTML = `<tr><td colspan="2" class="text-center py-3">Error loading categories</td></tr>`;
    }
}

function displayCategoriesWithPagination() {
    if (allCategories.length === 0) {
        categoriesTable.innerHTML = `<tr><td colspan="2" class="text-center py-3">No categories found</td></tr>`;
        categoriesPaginationControls.innerHTML = '';
        return;
    }

    totalPagesCategories = Math.ceil(allCategories.length / CATEGORIES_PER_PAGE);
    const startIndex = (currentPageCategories - 1) * CATEGORIES_PER_PAGE;
    const endIndex = startIndex + CATEGORIES_PER_PAGE;
    const paginatedCategories = allCategories.slice(startIndex, endIndex);

    categoriesTable.innerHTML = '';
    paginatedCategories.forEach(category => {
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

    renderCategoriesPaginationControls();
}

function renderCategoriesPaginationControls() {
    categoriesPaginationControls.innerHTML = '';

    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPageCategories === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">«</span></a>`;
    prevLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPageCategories > 1) {
            currentPageCategories--;
            displayCategoriesWithPagination();
        }
    });
    categoriesPaginationControls.appendChild(prevLi);

    for (let i = 1; i <= totalPagesCategories; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPageCategories ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageLi.addEventListener('click', (e) => {
            e.preventDefault();
            currentPageCategories = i;
            displayCategoriesWithPagination();
        });
        categoriesPaginationControls.appendChild(pageLi);
    }

    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPageCategories === totalPagesCategories ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">»</span></a>`;
    nextLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPageCategories < totalPagesCategories) {
            currentPageCategories++;
            displayCategoriesWithPagination();
        }
    });
    categoriesPaginationControls.appendChild(nextLi);
}

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
            fetchCategories(); // Refresh categories after saving a plan
        }
    } catch (error) {
        console.error('Error saving plan:', error.message);
        alert('Failed to save plan: ' + error.message);
    }
}

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

function openCategoryModal() {
    categoryForm.reset();
    categoryModalInstance.show();
}

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

async function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category? Plans associated with this category will lose this category.')) return;
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/admin/categories/${categoryId}`, { method: 'DELETE' });
        if (response.ok) {
            fetchCategories();
            const activeCategory = document.querySelector('.category-btn.active').getAttribute('data-category');
            fetchPlans(activeCategory); // Refresh plans after category deletion
        } else {
            throw new Error('Failed to delete category');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        alert(error.message);
    }
}

// Event Listeners
addPlanBtn.addEventListener('click', () => openPlanModal());
planForm.addEventListener('submit', savePlan);
addCategoryBtn.addEventListener('click', openCategoryModal);
categoryForm.addEventListener('submit', saveCategory);
sidebarToggle.addEventListener('click', () => mobileSidebar.classList.toggle('show'));
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