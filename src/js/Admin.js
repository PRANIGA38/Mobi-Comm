const API_BASE_URL = 'http://localhost:8083/api';
let jwtToken = localStorage.getItem('jwtToken');

// DOM Elements from your admin.html
const expiringSubscribersTable = document.getElementById('expiring-subscribers');
const plansTable = document.getElementById('plans-table');
const userModal = document.getElementById('user-modal');
const planModal = document.getElementById('plan-modal');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileSidebar = document.getElementById('mobileSidebar');
const addPlanBtns = document.querySelectorAll('.add-plan-btn'); // Correct: targets both buttons
const planForm = document.getElementById('plan-form');
const logoutModal = document.getElementById('logoutModal');
const logoutButton = document.getElementById('logout');
const confirmLogoutButton = document.getElementById('confirmLogout');
const cancelLogoutButton = document.getElementById('cancelLogout');
const closeModal = document.querySelector('.modal-content .close');

// Bootstrap Modal Instances
const userModalInstance = new bootstrap.Modal(userModal);
const planModalInstance = new bootstrap.Modal(planModal);

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
    console.log('Fetching:', url, 'with headers:', options.headers); // Debug log
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

// Fetch and display dashboard stats (static for now, replace with API if available)
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
        const response = await fetchWithAuth(`${API_BASE_URL}/admin/subscribers`);
        const subscribers = await response.json();
        displayExpiringSubscribers(subscribers, searchTerm);
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        expiringSubscribersTable.innerHTML = `<tr><td colspan="6" class="text-center py-3">Error loading subscribers</td></tr>`;
    }
}

function displayExpiringSubscribers(subscribers, searchTerm = '') {
    expiringSubscribersTable.innerHTML = '';
    const filteredSubscribers = subscribers.filter(subscriber =>
        !searchTerm ||
        subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subscriber.email && subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        subscriber.phone.includes(searchTerm)
    );

    if (filteredSubscribers.length === 0) {
        expiringSubscribersTable.innerHTML = `<tr><td colspan="6" class="text-center py-3">No matching subscribers found</td></tr>`;
        return;
    }

    filteredSubscribers.forEach(subscriber => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <img src="${subscriber.avatar || '/src/assets/images/default-avatar.png'}" alt="${subscriber.name}" class="rounded-circle me-2" style="width: 40px; height: 40px;">
                    <div>
                        <div class="fw-medium">${subscriber.name}</div>
                        <div class="small text-muted">${subscriber.email || 'N/A'}</div>
                    </div>
                </div>
            </td>
            <td>${subscriber.phone}</td>
            <td>${subscriber.currentPlan || 'N/A'}</td>
            <td>${formatDate(subscriber.expiry)}</td>
            <td><span class="status status-expiring">Expiring in ${getDaysUntil(subscriber.expiry)} days</span></td>
            <td><button class="btn btn-sm btn-view view-user" data-id="${subscriber.id}">View</button></td>
        `;
        expiringSubscribersTable.appendChild(row);
    });

    document.querySelectorAll('.view-user').forEach(button => {
        button.addEventListener('click', () => openUserModal(parseInt(button.getAttribute('data-id'))));
    });
}

// Fetch and display plans
async function fetchPlans() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/admin/plans`);
        const plans = await response.json();
        displayPlans(plans);
    } catch (error) {
        console.error('Error fetching plans:', error);
        plansTable.innerHTML = `<tr><td colspan="7" class="text-center py-3">Error loading plans</td></tr>`;
    }
}

function displayPlans(plans) {
    plansTable.innerHTML = '';
    plans.forEach(plan => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="fw-medium">${plan.name}</td>
            <td>${plan.description || 'N/A'}</td>
            <td>${plan.validity} days</td>
            <td>${plan.data}GB</td>
            <td>₹${plan.price}</td>
            <td>${plan.activeUsers || 0}</td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-primary edit-plan" data-id="${plan.id}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-plan" data-id="${plan.id}">Delete</button>
                </div>
            </td>
        `;
        plansTable.appendChild(row);
    });

    document.querySelectorAll('.edit-plan').forEach(button => {
        button.addEventListener('click', () => openPlanModal(parseInt(button.getAttribute('data-id'))));
    });
    document.querySelectorAll('.delete-plan').forEach(button => {
        button.addEventListener('click', () => deletePlan(parseInt(button.getAttribute('data-id'))));
    });
}

// Search functionality
function handleSearch() {
    fetchExpiringSubscribers(searchInput.value.trim());
}

// Open user details modal
async function openUserModal(userId) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/admin/subscribers/${userId}`);
        const user = await response.json();
        document.getElementById('modal-user-avatar').src = user.avatar || '/src/assets/images/default-avatar.png';
        document.getElementById('modal-user-name').textContent = user.name;
        document.getElementById('modal-user-phone').textContent = user.phone;
        document.getElementById('modal-user-email').textContent = user.email || 'N/A';
        document.getElementById('modal-user-address').textContent = user.address || 'N/A';
        document.getElementById('recharge-history-table').innerHTML = `
            <tr><td colspan="5" class="text-center py-3">Recharge history not implemented</td></tr>`;
        userModalInstance.show();
    } catch (error) {
        console.error('Error fetching subscriber:', error);
        alert('Failed to load subscriber details');
    }
}

// Open plan modal (add/edit)
async function openPlanModal(planId = null) {
    document.getElementById('plan-modal-title').textContent = planId ? 'Edit Plan' : 'Add New Plan';
    document.getElementById('plan-id').value = planId || '';
    if (planId) {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/admin/plans/${planId}`);
            const plan = await response.json();
            document.getElementById('plan-name').value = plan.name;
            document.getElementById('plan-description').value = plan.description || '';
            document.getElementById('plan-validity').value = plan.validity;
            document.getElementById('plan-data').value = plan.data;
            document.getElementById('plan-price').value = plan.price;
        } catch (error) {
            console.error('Error fetching plan:', error);
            alert('Failed to load plan details');
        }
    } else {
        planForm.reset();
    }
    planModalInstance.show();
}

// Save plan (add or update)
async function savePlan(e) {
    e.preventDefault();
    console.log('Saving plan with JWT:', jwtToken); // Debug JWT
    const planId = document.getElementById('plan-id').value;
    const plan = {
        name: document.getElementById('plan-name').value,
        description: document.getElementById('plan-description').value || null,
        validity: parseInt(document.getElementById('plan-validity').value),
        data: parseFloat(document.getElementById('plan-data').value),
        price: parseFloat(document.getElementById('plan-price').value),
        activeUsers: planId ? undefined : 0
    };

    if (!plan.name || isNaN(plan.validity) || isNaN(plan.data) || isNaN(plan.price)) {
        alert('Please fill all required fields with valid data');
        return;
    }

    try {
        const url = planId ? `${API_BASE_URL}/admin/plans/${planId}` : `${API_BASE_URL}/admin/plans`;
        const method = planId ? 'PUT' : 'POST';
        console.log('Request payload:', JSON.stringify(plan)); // Debug payload
        const response = await fetchWithAuth(url, { method, body: JSON.stringify(plan) });
        if (response.ok) {
            console.log('Plan saved successfully');
            planModalInstance.hide();
            fetchPlans();
        }
    } catch (error) {
        console.error('Error saving plan:', error.message);
        alert('Failed to save plan: ' + error.message);
    }
}

// Delete plan
async function deletePlan(planId) {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/admin/plans/${planId}`, { method: 'DELETE' });
        if (response.ok) fetchPlans();
        else throw new Error('Failed to delete plan');
    } catch (error) {
        console.error('Error deleting plan:', error);
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
    console.log('Admin page loaded, JWT:', jwtToken); // Debug JWT on load
    fetchDashboardStats();
    fetchExpiringSubscribers();
    fetchPlans();

    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (e) => e.key === 'Enter' && handleSearch());
    sidebarToggle.addEventListener('click', () => mobileSidebar.classList.toggle('show'));
    addPlanBtns.forEach(btn => btn.addEventListener('click', () => openPlanModal())); // Fixed: Use addPlanBtns
    planForm.addEventListener('submit', savePlan);

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