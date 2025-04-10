const API_BASE_URL = 'http://localhost:8083/api/admin/subscribers';
let jwtToken = localStorage.getItem('jwtToken');

// DOM Elements
const subscribersList = document.getElementById('subscribersList');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const addSubscriberForm = document.getElementById('addSubscriberForm');
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileSidebar = document.querySelector('.sidebar');
const rechargeHistoryTable = document.getElementById('subscriber-recharge-history-table');
const logoutModal = document.getElementById('logoutModal');
const logoutButton = document.getElementById('logout');
const confirmLogoutButton = document.getElementById('confirmLogout');
const cancelLogoutButton = document.getElementById('cancelLogout');
const closeModal = document.querySelector('#logoutModal .close');

// Pagination settings
const itemsPerPage = 10;
let currentPage = 1;
let allSubscribers = []; 

// Fetch utility with authentication
async function fetchWithAuth(url, options = {}) {
    console.log('JWT Token:', jwtToken); 
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
    console.log('Request URL:', url, 'Options:', options); 
    const response = await fetch(url, options);
    if (response.status === 401 || response.status === 403) {
        console.error('Unauthorized or Forbidden - Redirecting to login');
        localStorage.removeItem('jwtToken');
        alert('Access denied. Please log in as an admin.');
        window.location.href = '/src/pages/account.html';
        return;
    }
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Fetch failed: ${response.status} - ${errorText}`);
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
}

// Fetch and render subscribers (users)
async function fetchSubscribers() {
    try {
        allSubscribers = await fetchWithAuth(API_BASE_URL); 
        filterSubscribers();

        // Check for userId in URL and open details modal if present
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');
        if (userId) {
            openSubscriberDetails(parseInt(userId));
        }
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        subscribersList.innerHTML = '<tr><td colspan="6" class="text-center">Error loading subscribers</td></tr>';
    }
}

function renderSubscribers() {
    subscribersList.innerHTML = '';
    pagination.innerHTML = '';

    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;

    const filteredSubscribers = allSubscribers.filter(subscriber =>
        (subscriber.name.toLowerCase().includes(searchTerm) ||
         (subscriber.email && subscriber.email.toLowerCase().includes(searchTerm)) ||
         subscriber.mobileNumber.includes(searchTerm)) &&
        (statusValue === '' || subscriber.status === statusValue)
    );

    const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSubscribers = filteredSubscribers.slice(startIndex, endIndex);

    if (paginatedSubscribers.length === 0) {
        subscribersList.innerHTML = '<tr><td colspan="6" class="text-center">No subscribers found</td></tr>';
        return;
    }

    paginatedSubscribers.forEach(subscriber => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${subscriber.id}</td>
            <td>${subscriber.name}</td>
            <td>${subscriber.email || 'N/A'}</td>
            <td>${subscriber.mobileNumber}</td>
            <td>${subscriber.status}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="openSubscriberDetails(${subscriber.id})">View</button>
                <button class="btn btn-secondary btn-sm" onclick="toggleSubscriberStatus(${subscriber.id})">${subscriber.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button>
            </td>
        `;
        subscribersList.appendChild(row);
    });

    // Render pagination controls
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.classList.add('btn', i === currentPage ? 'btn-primary' : 'btn-outline-primary', 'mx-1');
        pageBtn.onclick = () => {
            currentPage = i;
            renderSubscribers();
        };
        pagination.appendChild(pageBtn);
    }
}

// Filter subscribers
function filterSubscribers() {
    currentPage = 1;
    renderSubscribers();
}

// Modal functions
function openAddSubscriberModal() {
    document.getElementById('addSubscriberModal').style.display = 'block';
}

function closeAddSubscriberModal() {
    document.getElementById('addSubscriberModal').style.display = 'none';
    addSubscriberForm.reset();
}

async function openSubscriberDetails(id) {
    try {
        // Fetch subscriber details
        const subscriber = await fetchWithAuth(`${API_BASE_URL}/${id}`); 
        const detailsContent = document.getElementById('subscriberDetailsContent');
        detailsContent.innerHTML = `
            <p><strong>Name:</strong> ${subscriber.name}</p>
            <p><strong>Email:</strong> ${subscriber.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${subscriber.mobileNumber}</p>
            <p><strong>Status:</strong> ${subscriber.status}</p>
            <p><strong>Join Date:</strong> ${subscriber.joinDate ? new Date(subscriber.joinDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</p>
            <p><strong>Membership Status:</strong> ${subscriber.membershipStatus || 'N/A'}</p>
            <p><strong>Alternative Phone:</strong> ${subscriber.alternativeMobileNumber || 'N/A'}</p>
            <p><strong>Address:</strong> ${subscriber.address || 'N/A'}</p>
        `;

        // Fetch and display recharge history
        const rechargeHistory = await fetchWithAuth(`${API_BASE_URL}/${id}/recharge-history`);
        rechargeHistoryTable.innerHTML = '';
        if (rechargeHistory.length === 0) {
            rechargeHistoryTable.innerHTML = `<tr><td colspan="5" class="text-center py-3">No recharge history available</td></tr>`;
        } else {
            rechargeHistory.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date(record.rechargeDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>${record.planName}</td>
                    <td>₹${record.amount.toFixed(2)}</td>
                    <td>${record.paymentMode}</td>
                    <td>${record.status}</td>
                `;
                rechargeHistoryTable.appendChild(row);
            });
        }

        document.getElementById('subscriberDetailsModal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching subscriber details or recharge history:', error);
        alert('Failed to load subscriber details');
    }
}

function closeSubscriberDetailsModal() {
    document.getElementById('subscriberDetailsModal').style.display = 'none';
    // Remove userId from URL without reloading the page
    const url = new URL(window.location);
    url.searchParams.delete('userId');
    window.history.replaceState({}, '', url);
}

// CRUD operations
addSubscriberForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const subscriber = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        mobileNumber: document.getElementById('phone').value,
        status: 'ACTIVE',
        joinDate: new Date().toISOString().split('T')[0], 
        membershipStatus: 'Standard', 
        role: 'ROLE_USER', 
        password: 'defaultPassword123' 
    };
    console.log('Submitting subscriber:', subscriber); 
    try {
        await fetchWithAuth(API_BASE_URL, { 
            method: 'POST',
            body: JSON.stringify(subscriber)
        });
        closeAddSubscriberModal();
        fetchSubscribers();
    } catch (error) {
        console.error('Error adding subscriber:', error);
        alert('Failed to add subscriber');
    }
});

async function toggleSubscriberStatus(id) {
    try {
        await fetchWithAuth(`${API_BASE_URL}/${id}/toggle-status`, { method: 'PUT' });
        fetchSubscribers();
    } catch (error) {
        console.error('Error toggling status:', error);
        alert('Failed to toggle status');
    }
}



// Event listeners
window.addEventListener('DOMContentLoaded', () => {
    console.log('Subscribers page loaded, JWT:', jwtToken);
    fetchSubscribers();

    searchInput.addEventListener('keyup', filterSubscribers);
    statusFilter.addEventListener('change', filterSubscribers);
    sidebarToggle.addEventListener('click', () => mobileSidebar.classList.toggle('show'));

    document.addEventListener('click', (e) => {
        if (mobileSidebar.classList.contains('show') && !mobileSidebar.contains(e.target) && e.target !== sidebarToggle) {
            mobileSidebar.classList.remove('show');
        }
    });

    // Logout functionality
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        logoutModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        logoutModal.style.display = 'none';
    });

    cancelLogoutButton.addEventListener('click', () => {
        logoutModal.style.display = 'none';
    });

    confirmLogoutButton.addEventListener('click', () => {
        localStorage.removeItem('jwtToken');
        window.location.href = '/src/pages/MobilePrepaid.html';
    });

    window.addEventListener('click', (event) => {
        if (event.target === logoutModal) {
            logoutModal.style.display = 'none';
        }
        const addModal = document.getElementById('addSubscriberModal');
        const detailsModal = document.getElementById('subscriberDetailsModal');
        if (event.target === addModal) closeAddSubscriberModal();
        if (event.target === detailsModal) closeSubscriberDetailsModal();
    });
});