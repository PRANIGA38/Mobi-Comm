// Fetch utility with authentication (unchanged)
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
        const response = await fetch(url, { ...options, headers });
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

        // Profile picture logic
        const profilePic = document.getElementById('profilePic');
        const storedImage = localStorage.getItem('profileImage');
        if (storedImage) {
            profilePic.innerHTML = `<img src="${storedImage}" alt="Profile Picture" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else {
            const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
            profilePic.innerHTML = `<span style="font-size: 2rem; color: #fff;">${initial}</span>`;
            profilePic.style.display = 'flex';
            profilePic.style.alignItems = 'center';
            profilePic.style.justifyContent = 'center';
            profilePic.style.backgroundColor = '#007bff';
        }

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
            const plan = userPlan.plan;
            document.getElementById('planName').textContent = plan.name || 'No Active Plan';
            document.getElementById('planPrice').textContent = plan.price ? `₹${plan.price}` : 'N/A';
            document.getElementById('planValidity').textContent = userPlan.expirationDate ? new Date(userPlan.expirationDate).toLocaleDateString() : 'N/A';

            const planFeatures = document.getElementById('planFeatures');
            planFeatures.innerHTML = '';
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

                    if (index % 2 === 0) leftColumn.appendChild(featureDiv);
                    else rightColumn.appendChild(featureDiv);
                });

                planFeatures.appendChild(leftColumn);
                planFeatures.appendChild(rightColumn);
            }
        } else {
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

        // Fetch and display transactions
        const transactionsResponse = await fetchWithAuth('http://localhost:8083/api/transactions/user/top5', { method: 'GET' }, true);
        const transactions = await transactionsResponse.json();

        const transactionHistoryTable = document.getElementById('transactionHistoryTable');
        transactionHistoryTable.innerHTML = '';
        if (transactions.length === 0) {
            transactionHistoryTable.innerHTML = '<tr><td colspan="3" class="text-muted text-center">No transactions found.</td></tr>';
        } else {
            transactions.forEach((transaction, index) => {
                const tr = document.createElement('tr');
                tr.className = index < 4 ? '' : 'hidden-transaction'; // Hide transactions beyond 4 initially
                tr.innerHTML = `
                    <td>${transaction.transactionType || 'N/A'}</td> <!-- Changed to transactionType -->
                    <td>${new Date(transaction.date).toLocaleDateString() || 'N/A'}</td>
                    <td>${transaction.amount ? `₹${Math.abs(transaction.amount)}` : 'N/A'}</td>
                `;
                transactionHistoryTable.appendChild(tr);
            });

            // Show "View All" button if more than 4 transactions
            const toggleBtnContainer = document.getElementById('transactionToggleBtnContainer');
            const toggleBtn = document.getElementById('toggleTransactionsBtn');
            if (transactions.length > 4) {
                toggleBtnContainer.style.display = 'block';
                toggleBtn.addEventListener('click', () => {
                    const hiddenRows = transactionHistoryTable.querySelectorAll('.hidden-transaction');
                    if (toggleBtn.textContent === 'View All') {
                        hiddenRows.forEach(row => row.classList.remove('hidden-transaction'));
                        toggleBtn.textContent = 'View Less';
                    } else {
                        hiddenRows.forEach(row => row.classList.add('hidden-transaction'));
                        toggleBtn.textContent = 'View All';
                    }
                });
            }
        }

        // Update notification count
        document.getElementById('notificationCount').textContent = 0;

    } catch (error) {
        showToast('Access denied: ' + error.message, 'danger');
        setTimeout(() => window.location.href = '/src/pages/account.html', 2000);
    }
});

// Profile picture upload
document.getElementById('editProfilePic').addEventListener('click', () => {
    document.getElementById('profileImageInput').click();
});

document.getElementById('profileImageInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            localStorage.setItem('profileImage', imageData);
            const profilePic = document.getElementById('profilePic');
            profilePic.innerHTML = `<img src="${imageData}" alt="Profile Picture" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            showToast('Profile picture updated!', 'success');
        };
        reader.readAsDataURL(file);
    }
});

// Clear profile image on logout
const confirmLogoutBtn = document.getElementById('confirmLogout');
confirmLogoutBtn.onclick = function() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('profileImage');
    window.location.href = '/src/pages/account.html';
};

// Remaining functions (unchanged)
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'success') {
        const successContainer = document.getElementById('success-container');
        successContainer.style.display = 'block';
        setTimeout(() => successContainer.style.display = 'none', 3000);
    }
};

document.getElementById('editProfileBtn').addEventListener('click', () => {
    const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    editProfileModal.show();
});

document.getElementById('editProfileForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
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

const logoutModal = document.getElementById('logoutModal');
const logoutBtn = document.getElementById('logout');
const closeBtn = document.getElementsByClassName('close')[0];
const cancelLogoutBtn = document.getElementById('cancelLogout');

logoutBtn.onclick = () => logoutModal.style.display = 'block';
closeBtn.onclick = () => logoutModal.style.display = 'none';
cancelLogoutBtn.onclick = () => logoutModal.style.display = 'none';
window.onclick = (event) => { if (event.target == logoutModal) logoutModal.style.display = 'none'; };

window.onscroll = () => {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        document.getElementById("scrollTopBtn").style.display = "block";
    } else {
        document.getElementById("scrollTopBtn").style.display = "none";
    }
};

function scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

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
            <div class="toast-body">${message}</div>
        </div>
    `;

    toastContainer.innerHTML += toastHtml;
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
}

document.getElementById('rechargeBtn').addEventListener('click', () => window.location.href = '/src/pages/MobilePrepaid.html');
document.getElementById('startChatBtn').addEventListener('click', () => showToast('Chat support coming soon!', 'info'));
document.getElementById('notificationBtn').addEventListener('click', (e) => {
    e.preventDefault();
    const count = document.getElementById('notificationCount').textContent;
    showToast(`You have ${count} new notifications!`, 'info');
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 100,
                behavior: "smooth"
            });
        }
    });
});