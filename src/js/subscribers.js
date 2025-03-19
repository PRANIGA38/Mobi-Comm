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
    if (response.status === 401) {
        console.error('Unauthorized - Redirecting to login');
        localStorage.removeItem('jwtToken');
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

// Fetch and render subscribers
async function fetchSubscribers() {
    try {
        allSubscribers = await fetchWithAuth('http://localhost:8083/api/admin/subscribers'); 
        filterSubscribers();
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        subscribersList.innerHTML = '<tr><td colspan="7" class="text-center">Error loading subscribers</td></tr>';
    }
}

function renderSubscribers() {
    subscribersList.innerHTML = '';
    pagination.innerHTML = '';

    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;

    const filteredSubscribers = allSubscribers.filter(subscriber =>
        (subscriber.name.toLowerCase().includes(searchTerm) ||
         subscriber.email.toLowerCase().includes(searchTerm)) &&
        (statusValue === '' || subscriber.status === statusValue)
    );

    const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSubscribers = filteredSubscribers.slice(startIndex, endIndex);

    paginatedSubscribers.forEach(subscriber => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${subscriber.id}</td>
            <td>${subscriber.name}</td>
            <td>${subscriber.email}</td>
            <td>${subscriber.phone}</td>
            <td>${subscriber.plan}</td>
            <td>${subscriber.status}</td>
            <td>
                <button class="btn" onclick="openSubscriberDetails(${subscriber.id})">View</button>
                <button class="btn btn-secondary" onclick="toggleSubscriberStatus(${subscriber.id})">${subscriber.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                <button class="btn btn-danger" onclick="deleteSubscriber(${subscriber.id})">Delete</button>
            </td>
        `;
        subscribersList.appendChild(row);
    });

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.classList.add('btn');
        if (i === currentPage) pageBtn.classList.add('btn-secondary');
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
        const subscriber = await fetchWithAuth(`http://localhost:8083/api/admin/subscribers/${id}`); 
        const detailsContent = document.getElementById('subscriberDetailsContent');
        detailsContent.innerHTML = `
            <p><strong>Name:</strong> ${subscriber.name}</p>
            <p><strong>Email:</strong> ${subscriber.email}</p>
            <p><strong>Phone:</strong> ${subscriber.phone}</p>
            <p><strong>Plan:</strong> ${subscriber.plan}</p>
            <p><strong>Status:</strong> ${subscriber.status}</p>
            <p><strong>Registration Date:</strong> ${new Date(subscriber.registrationDate).toLocaleString()}</p>
            <p><strong>Expiration Date:</strong> ${new Date(subscriber.expirationDate).toLocaleString()}</p>
        `;
        document.getElementById('subscriberDetailsModal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching subscriber details:', error);
        alert('Failed to load subscriber details');
    }
}

function closeSubscriberDetailsModal() {
    document.getElementById('subscriberDetailsModal').style.display = 'none';
}

// CRUD operations
addSubscriberForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const subscriber = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        plan: document.getElementById('plan').value
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

async function deleteSubscriber(id) {
    if (confirm('Are you sure you want to delete this subscriber?')) {
        try {
            await fetchWithAuth(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
            fetchSubscribers();
        } catch (error) {
            console.error('Error deleting subscriber:', error);
            alert('Failed to delete subscriber');
        }
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

    window.onclick = (event) => {
        const addModal = document.getElementById('addSubscriberModal');
        const detailsModal = document.getElementById('subscriberDetailsModal');
        if (event.target === addModal) addModal.style.display = 'none';
        if (event.target === detailsModal) detailsModal.style.display = 'none';
    };
});