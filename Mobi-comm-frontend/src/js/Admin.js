document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        showPopup('Please log in to access this page.', false);
        setTimeout(() => window.location.href = '../../src/pages/account.html', 2000);
        return;
    }

    if (typeof bootstrap !== 'undefined') {
        const userModalInstance = new bootstrap.Modal(document.getElementById('user-modal'));
    } else {
        console.error('Bootstrap is not loaded');
    }

    try {
        await fetchWithAuth('http://localhost:8083/api/admin/plans', { method: 'GET' });
        fetchDashboardStats();
        await fetchAndPaginateExpiringSubscribers();
        await fetchAndPaginateFeedback();
    } catch (error) {
        showPopup('Access denied: ' + error.message, false);
        setTimeout(() => window.location.href = '../../src/pages/account.html', 2000);
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
const feedbackList = document.getElementById('feedbackList');
const noFeedbackMessage = document.getElementById('noFeedbackMessage');
const prevSubscriberPage = document.getElementById('prevSubscriberPage');
const nextSubscriberPage = document.getElementById('nextSubscriberPage');
const subscriberPageInfo = document.getElementById('subscriberPageInfo');
const prevFeedbackPage = document.getElementById('prevFeedbackPage');
const nextFeedbackPage = document.getElementById('nextFeedbackPage');
const feedbackPageInfo = document.getElementById('feedbackPageInfo');

let allSubscribers = [];
let allFeedback = [];
let subscriberCurrentPage = 0;
let feedbackCurrentPage = 0;
const pageSize = 5; // Adjust as needed

let userModalInstance;
if (typeof bootstrap !== 'undefined') {
    userModalInstance = new bootstrap.Modal(userModal);
}

async function fetchWithAuth(url, options = {}) {
    if (!jwtToken) {
        console.error('No JWT token found, redirecting to login');
        window.location.href = '../../src/pages/account.html';
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
        window.location.href = '../../src/pages/account.html';
        return;
    }
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! Status: ${response.status} - ${errorText}`);
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
    }
    return response;
}

async function fetchDashboardStats() {
    try {
        const statsResponse = await fetchWithAuth(`${API_BASE_URL}/admin/dashboard-stats`);
        const stats = await statsResponse.json();
        document.getElementById('totalSubscribers').textContent = stats.totalSubscribers.toLocaleString();
        document.getElementById('expiringSoon').textContent = stats.expiringSoon;
        document.getElementById('activePlans').textContent = stats.activatedPlans || stats.activePlans || 'N/A';
        document.getElementById('monthlyRevenue').textContent = `₹${(stats.monthlyRevenue / 1000000).toFixed(1)}M`;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        ['totalSubscribers', 'expiringSoon', 'activePlans', 'monthlyRevenue'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = 'N/A';
        });
    }
}

async function fetchAndPaginateExpiringSubscribers() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/admin/subscribers/expiring-soon`);
        allSubscribers = await response.json();
        paginateSubscribers(0);
    } catch (error) {
        console.error('Error fetching expiring subscribers:', error);
        expiringSubscribersTable.innerHTML = '<tr><td colspan="6" class="text-center py-3">Error loading subscribers</td></tr>';
    }
}

function paginateSubscribers(page) {
    const start = page * pageSize;
    const end = start + pageSize;
    const paginatedSubscribers = allSubscribers.slice(start, end);

    expiringSubscribersTable.innerHTML = '';
    if (paginatedSubscribers.length === 0) {
        expiringSubscribersTable.innerHTML = '<tr><td colspan="6" class="text-center py-3">No subscribers with expiring plans found</td></tr>';
        prevSubscriberPage.classList.add('disabled');
        nextSubscriberPage.classList.add('disabled');
        return;
    }

    paginatedSubscribers.forEach(subscriber => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <img src="${subscriber.avatar || '../../src/assets/icons/users.png'}" alt="${subscriber.name}" class="rounded-circle me-2" style="width: 40px; height: 40px;">
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

    subscriberCurrentPage = page;
    const totalPages = Math.ceil(allSubscribers.length / pageSize);
    subscriberPageInfo.textContent = `Page ${page + 1} of ${totalPages}`;
    prevSubscriberPage.classList.toggle('disabled', page === 0);
    nextSubscriberPage.classList.toggle('disabled', page >= totalPages - 1);
}

async function fetchAndPaginateFeedback() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/feedback/all`);
        allFeedback = await response.json();
        paginateFeedback(0);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        feedbackList.innerHTML = '<tr><td colspan="5" class="text-center py-3">Error loading feedback</td></tr>';
        noFeedbackMessage.style.display = 'none';
    }
}

function paginateFeedback(page) {
    const start = page * pageSize;
    const end = start + pageSize;
    const paginatedFeedback = allFeedback.slice(start, end);

    feedbackList.innerHTML = '';
    if (paginatedFeedback.length === 0) {
        noFeedbackMessage.style.display = 'block';
        prevFeedbackPage.classList.add('disabled');
        nextFeedbackPage.classList.add('disabled');
        return;
    } else {
        noFeedbackMessage.style.display = 'none';
    }

    paginatedFeedback.forEach(feedback => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${feedback.name}</td>
            <td>${feedback.email || 'N/A'}</td>
            <td>${feedback.phone}</td>
            <td>${feedback.feedbackText}</td>
            <td>${formatDate(feedback.createdAt || new Date().toISOString())}</td>
        `;
        feedbackList.appendChild(row);
    });

    feedbackCurrentPage = page;
    const totalPages = Math.ceil(allFeedback.length / pageSize);
    feedbackPageInfo.textContent = `Page ${page + 1} of ${totalPages}`;
    prevFeedbackPage.classList.toggle('disabled', page === 0);
    nextFeedbackPage.classList.toggle('disabled', page >= totalPages - 1);
}

function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const filteredSubscribers = allSubscribers.filter(subscriber =>
        subscriber.name.toLowerCase().includes(searchTerm) ||
        (subscriber.email && subscriber.email.toLowerCase().includes(searchTerm)) ||
        subscriber.mobileNumber.includes(searchTerm)
    );
    allSubscribers = filteredSubscribers;
    paginateSubscribers(0); // Reset to first page
}

async function openUserModal(userId) {
    try {
        const subscriberResponse = await fetchWithAuth(`${API_BASE_URL}/admin/subscribers/${userId}`);
        const user = await subscriberResponse.json();
        const historyResponse = await fetchWithAuth(`${API_BASE_URL}/admin/subscribers/${userId}/recharge-history`);
        const rechargeHistory = await historyResponse.json();

        document.getElementById('modal-user-avatar').src = user.avatar || '../../src/assets/icons/users.png';
        document.getElementById('modal-user-name').textContent = user.name;
        document.getElementById('modal-user-phone').textContent = user.mobileNumber;
        document.getElementById('modal-user-email').textContent = user.email || 'N/A';
        document.getElementById('modal-user-address').textContent = user.address || 'N/A';

        const rechargeHistoryTable = document.getElementById('recharge-history-table');
        rechargeHistoryTable.innerHTML = '';
        const limitedHistory = rechargeHistory.slice(0, 4);

        if (limitedHistory.length === 0) {
            rechargeHistoryTable.innerHTML = '<tr><td colspan="5" class="text-center py-3">No recharge history available</td></tr>';
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
                        <a href="../../src/pages/subscribers.html?userId=${userId}" class="btn btn-sm btn-primary">View All (${rechargeHistory.length} entries)</a>
                    </td>
                `;
                rechargeHistoryTable.appendChild(viewAllRow);
            }
        }

        if (userModalInstance) userModalInstance.show();
    } catch (error) {
        console.error('Error fetching subscriber or recharge history:', error);
        alert('Failed to load subscriber details');
    }
}

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

function showPopup(message, isSuccess) {
    alert(message);
}

window.addEventListener('DOMContentLoaded', () => {
    fetchDashboardStats();
    fetchAndPaginateExpiringSubscribers();
    fetchAndPaginateFeedback();

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

    const logoutLinks = document.querySelectorAll('.menu-item a[href="../../src/pages/account.html"]');
    if (logoutLinks.length > 0 && logoutModal) {
        logoutLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                logoutModal.style.display = 'block';
                console.log('Logout modal displayed');
            });
        });
    }

    if (cancelLogoutButton && logoutModal) cancelLogoutButton.onclick = () => {
        logoutModal.style.display = 'none';
        console.log('Logout modal closed via cancel button');
    };
    if (confirmLogoutButton && logoutModal) {
        confirmLogoutButton.onclick = () => {
            try {
                localStorage.removeItem('jwtToken');
                logoutModal.style.display = 'none';
                console.log('Logged out and redirected');
                window.location.href = '../../src/pages/MobilePrepaid.html';
            } catch (error) {
                console.error('Error during logout:', error);
                showPopup('Failed to log out. Please try again.', false);
            }
        };
    }

    if (logoutModal) {
        window.onclick = (event) => {
            if (event.target === logoutModal) {
                logoutModal.style.display = 'none';
                console.log('Logout modal closed via background click');
            }
        };
    }

    prevSubscriberPage.addEventListener('click', () => {
        if (!prevSubscriberPage.classList.contains('disabled')) {
            paginateSubscribers(subscriberCurrentPage - 1);
        }
    });

    nextSubscriberPage.addEventListener('click', () => {
        if (!nextSubscriberPage.classList.contains('disabled')) {
            paginateSubscribers(subscriberCurrentPage + 1);
        }
    });

    prevFeedbackPage.addEventListener('click', () => {
        if (!prevFeedbackPage.classList.contains('disabled')) {
            paginateFeedback(feedbackCurrentPage - 1);
        }
    });

    nextFeedbackPage.addEventListener('click', () => {
        if (!nextFeedbackPage.classList.contains('disabled')) {
            paginateFeedback(feedbackCurrentPage + 1);
        }
    });

    window.onscroll = () => {
        const scrollTopBtn = document.getElementById('scrollTopBtn');
        if (scrollTopBtn) {
            scrollTopBtn.style.display =
                (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) ? 'block' : 'none';
        }
    };
});