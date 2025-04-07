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
const planCategoriesDropdown = document.getElementById('plan-categories-dropdown');
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
const closeModal = document.querySelector('.Logout-Modal-content .close');
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
        console.log('Fetched plans for category:', category, allPlans); // Debug log
        currentPagePlans = 1; // Reset to first page when filtering
        displayPlansWithPagination(category);
    } catch (error) {
        console.error('Error fetching plans:', error);
        plansTable.innerHTML = `<tr><td colspan="7" class="text-center py-3">Error loading plans</td></tr>`;
    }
}

function displayPlansWithPagination(category) {
    if (allPlans.length === 0) {
        plansTable.innerHTML = `<tr><td colspan="7" class="text-center py-3">No plans found for this category</td></tr>`;
        paginationControls.innerHTML = '';
        return;
    }

    // Client-side filtering as a fallback
    let filteredPlans = category === 'all' ? allPlans : allPlans.filter(plan => {
        return plan.categories && plan.categories.some(cat => cat.name === category.toLowerCase());
    });
    console.log('Filtered plans for category:', category, filteredPlans); // Debug log

    totalPagesPlans = Math.ceil(filteredPlans.length / PLANS_PER_PAGE);
    const startIndex = (currentPagePlans - 1) * PLANS_PER_PAGE;
    const endIndex = startIndex + PLANS_PER_PAGE;
    const paginatedPlans = filteredPlans.slice(startIndex, endIndex);

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
                    <button class="btn btn-sm btn-${plan.isActive ? 'warning' : 'success'} toggle-plan" data-id="${plan.id}">
                        ${plan.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            </td>
        `;
        plansTable.appendChild(row);
    });

    document.querySelectorAll('.edit-plan').forEach(button => {
        button.addEventListener('click', () => openPlanModal(parseInt(button.getAttribute('data-id'))));
    });
    document.querySelectorAll('.toggle-plan').forEach(button => {
        button.addEventListener('click', () => togglePlanStatus(parseInt(button.getAttribute('data-id'))));
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
            displayPlansWithPagination(category);
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
            displayPlansWithPagination(category);
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
            displayPlansWithPagination(category);
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
        categoriesTable.innerHTML = `<tr><td colspan="3" class="text-center py-3">Error loading categories</td></tr>`;
    }
}

function displayCategoriesWithPagination() {
    if (allCategories.length === 0) {
        categoriesTable.innerHTML = `<tr><td colspan="3" class="text-center py-3">No categories found</td></tr>`;
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
            <td>${category.isActive ? 'Active' : 'Inactive'}</td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-primary edit-category" data-id="${category.id}">Edit</button>
                    <button class="btn btn-sm btn-${category.isActive ? 'warning' : 'success'} toggle-category" data-id="${category.id}">
                        ${category.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            </td>
        `;
        categoriesTable.appendChild(row);
    });

    document.querySelectorAll('.edit-category').forEach(button => {
        button.addEventListener('click', () => openEditCategoryModal(parseInt(button.getAttribute('data-id'))));
    });
    document.querySelectorAll('.toggle-category').forEach(button => {
        button.addEventListener('click', () => toggleCategoryStatus(parseInt(button.getAttribute('data-id'))));
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
        button.setAttribute('data-category', category.name.toLowerCase()); // Ensure lowercase for consistency
        button.textContent = `${category.name.charAt(0).toUpperCase() + category.name.slice(1)} Plans`;
        categoryButtonsContainer.appendChild(button);
    });

    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const category = button.getAttribute('data-category');
            fetchPlans(category); // Fetch plans with the selected category
            console.log('Filtering by category:', category); // Debug log
        });
    });
}

function renderPlanCategoryCheckboxes() {
    planCategoriesDropdown.innerHTML = '';
    allCategories.filter(category => category.isActive).forEach(category => {
        const li = document.createElement('li');
        li.className = 'dropdown-item';
        li.innerHTML = `
            <div class="form-check">
                <input class="form-check-input category-checkbox" type="checkbox" value="${category.name.toLowerCase()}" id="category-${category.name}">
                <label class="form-check-label" for="category-${category.name}">
                    ${category.name.charAt(0).toUpperCase() + category.name.slice(1)} Plans
                </label>
            </div>
        `;
        planCategoriesDropdown.appendChild(li);
    });

    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateDropdownText);
    });
}

function updateDropdownText() {
    const selectedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked'))
        .map(checkbox => checkbox.value.charAt(0).toUpperCase() + checkbox.value.slice(1));
    const dropdownButton = document.getElementById('categoriesDropdown');
    dropdownButton.textContent = selectedCategories.length > 0 ? selectedCategories.join(', ') : 'Select Categories';
}

async function openPlanModal(planId = null) {
    document.getElementById('plan-modal-title').textContent = planId ? 'Edit Plan' : 'Add New Plan';
    document.getElementById('plan-id').value = planId || '';
    planForm.reset();
    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.getElementById('plan-is-hot-deal').value = 'false';
    hotDealPriceDiv.style.display = 'none';
    updateDropdownText();

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
                updateDropdownText();
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
    const selectedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked'))
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
        isActive: true // Default to active for new plans
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
            fetchCategories();
        }
    } catch (error) {
        console.error('Error saving plan:', error.message);
        alert('Failed to save plan: ' + error.message);
    }
}

async function togglePlanStatus(planId) {
    const plan = allPlans.find(p => p.id === planId);
    const action = plan.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this plan? It will ${action === 'deactivate' ? 'hide' : 'show'} on the user side.`)) return;

    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/admin/plans/${planId}/toggle`, { method: 'PUT' });
        if (response.ok) {
            const activeCategory = document.querySelector('.category-btn.active').getAttribute('data-category');
            fetchPlans(activeCategory);
        } else {
            throw new Error(`Failed to ${action} plan`);
        }
    } catch (error) {
        console.error(`Error toggling plan status:`, error);
        alert(error.message);
    }
}

async function openEditCategoryModal(categoryId) {
    const category = allCategories.find(cat => cat.id === categoryId);
    if (!category) return;

    document.getElementById('category-modal-title').textContent = 'Edit Category';
    document.getElementById('category-name').value = category.name;
    categoryForm.dataset.categoryId = categoryId;
    categoryModalInstance.show();
}

function openAddCategoryModal() {
    document.getElementById('category-modal-title').textContent = 'Add New Category';
    categoryForm.reset();
    delete categoryForm.dataset.categoryId;
    categoryModalInstance.show();
}

async function saveCategory(e) {
    e.preventDefault();
    const categoryName = document.getElementById('category-name').value.trim();
    const categoryId = categoryForm.dataset.categoryId;

    if (!categoryName) {
        alert('Please enter a category name');
        return;
    }

    try {
        const url = categoryId ? `${API_BASE_URL}/admin/categories/${categoryId}` : `${API_BASE_URL}/admin/categories`;
        const method = categoryId ? 'PUT' : 'POST';
        const response = await fetchWithAuth(url, {
            method,
            body: JSON.stringify({ name: categoryName.toLowerCase(), isActive: true })
        });
        if (response.ok) {
            categoryModalInstance.hide();
            delete categoryForm.dataset.categoryId;
            fetchCategories();
        }
    } catch (error) {
        console.error('Error saving category:', error.message);
        alert('Failed to save category: ' + error.message);
    }
}

async function toggleCategoryStatus(categoryId) {
    const category = allCategories.find(cat => cat.id === categoryId);
    const action = category.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this category? Plans with this category may be affected.`)) return;

    try {
        console.log('Toggling category ID:', categoryId);
        const response = await fetchWithAuth(`${API_BASE_URL}/admin/categories/${categoryId}/toggle`, { method: 'PUT' });
        if (response.ok) {
            fetchCategories();
            const activeCategory = document.querySelector('.category-btn.active').getAttribute('data-category');
            fetchPlans(activeCategory);
        } else {
            throw new Error(`Failed to ${action} category - Status: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error toggling category status:`, error);
        alert(error.message);
    }
}

// Event Listeners
addPlanBtn.addEventListener('click', () => openPlanModal());
planForm.addEventListener('submit', savePlan);
addCategoryBtn.addEventListener('click', openAddCategoryModal);
categoryForm.addEventListener('submit', saveCategory);
sidebarToggle.addEventListener('click', () => mobileSidebar.classList.toggle('show'));
isHotDealSelect.addEventListener('change', () => {
    hotDealPriceDiv.style.display = isHotDealSelect.value === 'true' ? 'block' : 'none';
});

document.addEventListener('click', (e) => {
    if (mobileSidebar.classList.contains('show') && !mobileSidebar.contains(e.target) && e.target !== sidebarToggle) {
        mobileSidebar.classList.remove('show');
    }
    if (e.target === logoutModal) {
        logoutModal.style.display = 'none';
    }
});

logoutButton.addEventListener('click', (e) => {
    e.preventDefault();
    logoutModal.style.display = 'block';
    console.log('Logout modal displayed');
});

closeModal.addEventListener('click', () => {
    logoutModal.style.display = 'none';
    console.log('Logout modal closed via close button');
});

cancelLogoutButton.addEventListener('click', () => {
    logoutModal.style.display = 'none';
    console.log('Logout modal closed via cancel button');
});

confirmLogoutButton.addEventListener('click', () => {
    localStorage.removeItem('jwtToken');
    window.location.href = '/src/pages/MobilePrepaid.html';
    console.log('Logged out and redirected');
});