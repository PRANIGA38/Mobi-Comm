document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        showPopup('Please log in to access this page.', false);
        setTimeout(() => window.location.href = '/src/pages/account.html', 2000);
        return;
    }

    // Initialize Bootstrap modal for user details
    if (typeof bootstrap !== 'undefined') {
        const userModalInstance = new bootstrap.Modal(document.getElementById('user-modal'));
    } else {
        console.error('Bootstrap is not loaded');
    }

    try {
        await fetchWithAuth('http://localhost:8083/api/admin/plans', { method: 'GET' });
        fetchDashboardStats();
        fetchExpiringSubscribers();
    } catch (error) {
        showPopup('Access denied: ' + error.message, false);
        setTimeout(() => window.location.href = '/src/pages/account.html', 2000);
    }
});

const API_BASE_URL = 'http://localhost:8083/api';
const jwtToken = localStorage.getItem('jwtToken');

// DOM Elements
const expiringSubscribersTable = document.getElementById('expiring-subscribers');
const userModal = document.getElementById('user-modal');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileSidebar = document.getElementById('mobileSidebar');
const logoutModal = document.getElementById('logoutModal');
const confirmLogoutButton = document.getElementById('confirmLogout');
const cancelLogoutButton = document.getElementById('cancelLogout');
const closeModal = document.querySelector('.modal-content .close');

// Bootstrap Modal Instance for user modal
let userModalInstance;
if (typeof bootstrap !== 'undefined') {
    userModalInstance = new bootstrap.Modal(userModal);
}

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
    const response = await fetch(url, options);
    if (response.status === 401) {
        console.error('Unauthorized - Redirecting to login');
        localStorage.removeItem('jwtToken');
        window.location.href = '/src/pages/account.html';
        return;
    }
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
    }
    return response;
}

// Fetch and display dashboard stats dynamically
async function fetchDashboardStats() {
    try {
        const statsResponse = await fetchWithAuth(`${API_BASE_URL}/admin/dashboard-stats`);
        if (!statsResponse) return;
        const stats = await statsResponse.json();

        document.getElementById('totalSubscribers').textContent = stats.totalSubscribers.toLocaleString();
        document.getElementById('expiringSoon').textContent = stats.expiringSoon;
        document.getElementById('activePlans').textContent = stats.activePlans;
        document.getElementById('monthlyRevenue').textContent = `₹${(stats.monthlyRevenue / 1000000).toFixed(1)}M`;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        ['totalSubscribers', 'expiringSoon', 'activePlans', 'monthlyRevenue'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = 'N/A';
        });
    }
}

// Fetch and display expiring subscribers
async function fetchExpiringSubscribers(searchTerm = '') {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/admin/subscribers/expiring-soon`);
        if (!response) return;
        const subscribers = await response.json();
        displayExpiringSubscribers(subscribers, searchTerm);
    } catch (error) {
        console.error('Error fetching expiring subscribers:', error);
        if (expiringSubscribersTable) {
            expiringSubscribersTable.innerHTML = `<tr><td colspan="6" class="text-center py-3">Error loading subscribers</td></tr>`;
        }
    }
}

function displayExpiringSubscribers(subscribers, searchTerm = '') {
    if (!expiringSubscribersTable) return;
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

// Search functionality
function handleSearch() {
    fetchExpiringSubscribers(searchInput.value.trim());
}

// Open user details modal
async function openUserModal(userId) {
    try {
        const subscriberResponse = await fetchWithAuth(`${API_BASE_URL}/admin/subscribers/${userId}`);
        if (!subscriberResponse) return;
        const user = await subscriberResponse.json();

        const historyResponse = await fetchWithAuth(`${API_BASE_URL}/admin/subscribers/${userId}/recharge-history`);
        if (!historyResponse) return;
        const rechargeHistory = await historyResponse.json();

        document.getElementById('modal-user-avatar').src = user.avatar || '/src/assets/icons/users.png';
        document.getElementById('modal-user-name').textContent = user.name;
        document.getElementById('modal-user-phone').textContent = user.mobileNumber;
        document.getElementById('modal-user-email').textContent = user.email || 'N/A';
        document.getElementById('modal-user-address').textContent = user.address || 'N/A';

        const rechargeHistoryTable = document.getElementById('recharge-history-table');
        if (rechargeHistoryTable) {
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
        }

        if (userModalInstance) userModalInstance.show();
    } catch (error) {
        console.error('Error fetching subscriber or recharge history:', error);
        alert('Failed to load subscriber details');
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

// Custom popup function
function showPopup(message, isSuccess) {
    alert(message); // Replace with your actual popup implementation if different
}

// Event Listeners
window.addEventListener('DOMContentLoaded', () => {
    fetchDashboardStats();
    fetchExpiringSubscribers();

    if (searchButton) searchButton.addEventListener('click', handleSearch);
    if (searchInput) searchInput.addEventListener('keyup', (e) => e.key === 'Enter' && handleSearch());
    if (sidebarToggle && mobileSidebar) sidebarToggle.addEventListener('click', () => mobileSidebar.classList.toggle('show'));

    if (mobileSidebar) {
        document.addEventListener('click', (e) => {
            if (mobileSidebar.classList.contains('show') && !mobileSidebar.contains(e.target) && e.target !== sidebarToggle) {
                mobileSidebar.classList.remove('show');
            }
        });
    }

    const logoutLink = document.querySelector('.menu-item a[href="/src/pages/account.html"]');
    if (logoutLink && logoutModal) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logoutModal.style.display = 'block';
        });
    }

    if (closeModal && logoutModal) closeModal.onclick = () => logoutModal.style.display = 'none';
    if (cancelLogoutButton && logoutModal) cancelLogoutButton.onclick = () => logoutModal.style.display = 'none';
    if (confirmLogoutButton && logoutModal) {
        confirmLogoutButton.onclick = () => {
            localStorage.removeItem('jwtToken');
            logoutModal.style.display = 'none';
            window.location.href = '/src/pages/MobilePrepaid.html';
        };
    }

    if (logoutModal) {
        window.onclick = (event) => {
            if (event.target === logoutModal) logoutModal.style.display = 'none';
        };
    }

    window.onscroll = () => {
        const scrollTopBtn = document.getElementById('scrollTopBtn');
        if (scrollTopBtn) {
            scrollTopBtn.style.display =
                (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) ? 'block' : 'none';
        }
    };
});