// Fetch utility with authentication
async function fetchWithAuth(url, options = {}, requiresAuth = true) {
    const token = localStorage.getItem('jwtToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (requiresAuth && token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('jwtToken');
            showToast('Session expired. Please log in again.', 'danger');
            setTimeout(() => window.location.href = '/src/pages/account.html', 2000);
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! Status: ${response.status}`);
        }

        return response;
    } catch (error) {
        console.error(`Fetch error for ${url}:`, error.message);
        throw error;
    }
}

// Load all dynamic data on page load
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        showToast('Please log in to access this page.', 'danger');
        setTimeout(() => window.location.href = '/src/pages/account.html', 2000);
        return;
    }

    try {
        // Fetch user profile
        const userResponse = await fetchWithAuth('http://localhost:8083/api/users/profile', { method: 'GET' }, true);
        const user = await userResponse.json();

        // Update user profile section
        document.getElementById('userName').textContent = user.name || 'N/A';
        document.getElementById('userMobile').textContent = user.mobileNumber ? `+91 ${user.mobileNumber}` : 'N/A';
        document.getElementById('membershipStatus').textContent = user.membershipStatus || 'Standard';
        document.getElementById('joinDate').textContent = user.joinDate ? new Date(user.joinDate).getFullYear() : 'N/A';

        // Pre-fill edit profile modal
        document.getElementById('userNameInput').value = user.name || '';
        document.getElementById('primaryMobileInput').value = user.mobileNumber ? `+91 ${user.mobileNumber}` : '';
        document.getElementById('alternativeMobileInput').value = user.alternativeMobileNumber || '';
        document.getElementById('emailInput').value = user.email || '';
        document.getElementById('addressInput').value = user.address || '';

        // Fetch current plan
        const userPlanResponse = await fetchWithAuth('http://localhost:8083/api/users/current-plan', { method: 'GET' }, true);
        if (userPlanResponse.status === 200) {
            const userPlan = await userPlanResponse.json();
            const plan = userPlan.plan; // Extract the Plan object from UserPlan

            document.getElementById('planName').textContent = plan.name || 'No Active Plan';
            document.getElementById('planPrice').textContent = plan.price ? `₹${plan.price}` : 'N/A';
            document.getElementById('planValidity').textContent = userPlan.expirationDate ? new Date(userPlan.expirationDate).toLocaleDateString() : 'N/A';

            const planFeatures = document.getElementById('planFeatures');
            planFeatures.innerHTML = ''; // Clear static content

            // Create a list of features based on the Plan fields
            const features = [];
            if (plan.data) features.push(`${plan.data} data`);
            if (plan.calls) features.push(`${plan.calls} Calls`);
            if (plan.sms) features.push(`${plan.sms} SMS`);
            if (plan.benefits) features.push(plan.benefits);

            if (features.length > 0) {
                const leftColumn = document.createElement('div');
                leftColumn.className = 'col-md-6';
                const rightColumn = document.createElement('div');
                rightColumn.className = 'col-md-6';

                features.forEach((feature, index) => {
                    const featureDiv = document.createElement('div');
                    featureDiv.className = 'plan-feature';
                    const icon = document.createElement('i');
                    icon.className = 'bi bi-check-circle me-2';
                    const text = document.createElement('div');
                    text.textContent = feature;
                    featureDiv.appendChild(icon);
                    featureDiv.appendChild(text);

                    if (index % 2 === 0) {
                        leftColumn.appendChild(featureDiv);
                    } else {
                        rightColumn.appendChild(featureDiv);
                    }
                });

                planFeatures.appendChild(leftColumn);
                planFeatures.appendChild(rightColumn);
            }
        } else {
            // Handle the case where no active plan is found (status 404)
            document.getElementById('planName').textContent = 'No Active Plan';
            document.getElementById('planPrice').textContent = 'N/A';
            document.getElementById('planValidity').textContent = 'N/A';
            document.getElementById('planFeatures').innerHTML = '<p class="text-muted text-center">No active plan found. Please recharge to activate a plan.</p>';
        }

        // Fetch data usage
        const dataUsageResponse = await fetchWithAuth('http://localhost:8083/api/users/data-usage', { method: 'GET' }, true);
        const dataUsage = await dataUsageResponse.json();

        const dailyData = dataUsage.daily;
        const dailyPercentage = (dailyData.used / dailyData.total) * 100;
        document.getElementById('dailyDataProgress').style.width = `${dailyPercentage}%`;
        document.getElementById('dailyDataUsed').textContent = `${dailyData.used} GB used`;
        document.getElementById('dailyDataTotal').textContent = `${dailyData.total} GB total`;

        const monthlyData = dataUsage.monthly;
        const monthlyPercentage = (monthlyData.used / monthlyData.total) * 100;
        document.getElementById('monthlyDataProgress').style.width = `${monthlyPercentage}%`;
        document.getElementById('monthlyDataUsed').textContent = `${monthlyData.used} GB used`;
        document.getElementById('monthlyDataTotal').textContent = `${monthlyData.total} GB total`;

        // Fetch recent transactions
        const transactionsResponse = await fetchWithAuth('http://localhost:8083/api/users/transactions', { method: 'GET' }, true);
        const transactions = await transactionsResponse.json();

        const transactionList = document.getElementById('transactionList');
        transactionList.innerHTML = ''; // Clear static content
        if (transactions.length === 0) {
            transactionList.innerHTML = '<p class="text-muted text-center">No recent transactions found.</p>';
        } else {
            transactions.forEach(transaction => {
                const transactionDiv = document.createElement('div');
                transactionDiv.className = 'transaction';
                transactionDiv.innerHTML = `
                    <div class="transaction-icon ${transaction.transactionType}">
                        <i class="bi ${transaction.type.includes('Recharge') || transaction.type.includes('Bill Payment') ? 'bi-currency-rupee' : 'bi-wifi'}"></i>
                    </div>
                    <div class="transaction-info">
                        <div class="transaction-title">${transaction.type}</div>
                        <div class="transaction-date">${new Date(transaction.date).toLocaleDateString()}</div>
                    </div>
                    <div class="transaction-amount ${transaction.transactionType}">${transaction.transactionType === 'credit' ? '+' : '-'}₹${Math.abs(transaction.amount)}</div>
                `;
                transactionList.appendChild(transactionDiv);
            });
        }

        // Fetch offers
        const offersResponse = await fetchWithAuth('http://localhost:8083/api/users/offers', { method: 'GET' }, true);
        const offers = await offersResponse.json();

        const offersList = document.getElementById('offersList');
        offersList.innerHTML = ''; // Clear static content
        if (offers.length === 0) {
            offersList.innerHTML = '<p class="text-muted text-center">No offers available at the moment.</p>';
        } else {
            offers.forEach(offer => {
                const offerDiv = document.createElement('div');
                offerDiv.className = 'col-md-6';
                offerDiv.innerHTML = `
                    <div class="p-3 border rounded bg-light">
                        <div class="d-flex align-items-center mb-2">
                            <i class="bi ${offer.icon} text-${offer.icon.includes('music') ? 'success' : 'primary'} me-2"></i>
                            <h6 class="mb-0">${offer.title}</h6>
                        </div>
                        <p class="small mb-2">${offer.description}</p>
                        <button class="btn btn-sm btn-custom">${offer.action}</button>
                    </div>
                `;
                offersList.appendChild(offerDiv);
            });
        }

        // Update notification count
        document.getElementById('notificationCount').textContent = offers.length || 0;

    } catch (error) {
        showToast('Access denied: ' + error.message, 'danger');
        setTimeout(() => window.location.href = '/src/pages/account.html', 2000);
    }
});

// Show success message on page load
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'success') {
        const successContainer = document.getElementById('success-container');
        successContainer.style.display = 'block';
        
        setTimeout(function() {
            successContainer.style.display = 'none';
        }, 3000);
    }
};

// Profile edit modal
document.getElementById('editProfileBtn').addEventListener('click', function() {
    const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    editProfileModal.show();
});

// Form submission for updating profile
document.getElementById('editProfileForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const form = this;

    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    const updatedProfile = {
        alternativeMobileNumber: document.getElementById('alternativeMobileInput').value,
        email: document.getElementById('emailInput').value,
        address: document.getElementById('addressInput').value
    };

    try {
        const response = await fetchWithAuth('http://localhost:8083/api/users/update-profile', {
            method: 'PUT',
            body: JSON.stringify(updatedProfile)
        }, true);

        const updatedUser = await response.json();
        document.getElementById('userMobile').textContent = updatedUser.mobileNumber ? `+91 ${updatedUser.mobileNumber}` : 'N/A';

        const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
        modal.hide();
        showToast('Profile updated successfully!', 'success');
    } catch (error) {
        showToast('Failed to update profile: ' + error.message, 'danger');
    }

    form.classList.add('was-validated');
});

// Logout modal
const logoutModal = document.getElementById('logoutModal');
const logoutBtn = document.getElementById('logout');
const closeBtn = document.getElementsByClassName('close')[0];
const confirmLogoutBtn = document.getElementById('confirmLogout');
const cancelLogoutBtn = document.getElementById('cancelLogout');

logoutBtn.onclick = function() {
    logoutModal.style.display = 'block';
}

closeBtn.onclick = function() {
    logoutModal.style.display = 'none';
}

cancelLogoutBtn.onclick = function() {
    logoutModal.style.display = 'none';
}

confirmLogoutBtn.onclick = function() {
    localStorage.removeItem('jwtToken');
    window.location.href = '/src/pages/account.html';
}

window.onclick = function(event) {
    if (event.target == logoutModal) {
        logoutModal.style.display = 'none';
    }
}

// Scroll to top button
window.onscroll = function() {
    scrollFunction();
};

function scrollFunction() {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        document.getElementById("scrollTopBtn").style.display = "block";
    } else {
        document.getElementById("scrollTopBtn").style.display = "none";
    }
}

function scrollToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

// Toast notifications
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toastId = 'toast-' + Date.now();
    
    let toastBgClass = 'bg-info';
    if (type === 'success') toastBgClass = 'bg-success';
    if (type === 'warning') toastBgClass = 'bg-warning';
    if (type === 'danger') toastBgClass = 'bg-danger';
    
    const toastHtml = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
            <div class="toast-header ${toastBgClass} text-white">
                <strong class="me-auto">MobiComm</strong>
                <small>Just now</small>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.innerHTML += toastHtml;
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    toastElement.addEventListener('hidden.bs.toast', function () {
        toastElement.remove();
    });
}

// Button actions
document.getElementById('rechargeBtn').addEventListener('click', function() {
    window.location.href = '/src/pages/MobilePrepaid.html';
});

document.getElementById('changePlanBtn').addEventListener('click', function() {
    window.location.href = '/src/pages/View_Plans.html';
});

document.getElementById('viewAllTransactionsBtn').addEventListener('click', function() {
    showToast('No more transaction history!', 'info');
});

document.getElementById('startChatBtn').addEventListener('click', function() {
    showToast('Chat support coming soon!', 'info');
});

// Notification Button
document.getElementById('notificationBtn').addEventListener('click', function(e) {
    e.preventDefault();
    const count = document.getElementById('notificationCount').textContent;
    showToast(`You have ${count} new notifications!`, 'info');
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
        e.preventDefault();
        const targetId = this.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 100,
                behavior: "smooth"
            });
        }
    });
});