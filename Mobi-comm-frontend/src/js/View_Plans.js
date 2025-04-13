// Base URL for API
const API_BASE_URL = 'http://localhost:8083/api';

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
            // Optionally redirect to login page
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

// Fetch plans from the backend
async function fetchPlans() {
    try {
        const response = await fetch(`${API_BASE_URL}/public/plans`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const plans = await response.json();
        // Ensure categories are properly formatted
        return plans.map(plan => ({
            ...plan,
            categories: plan.categories ? plan.categories.map(cat => cat.name.toLowerCase()) : []
        }));
    } catch (error) {
        console.error('Error fetching plans:', error);
        return [];
    }
}

// Show plan details in modal
async function showPlanDetails(planId) {
    const plans = await fetchPlans();
    const plan = plans.find(p => p.id == planId);
    const modalBody = document.getElementById('planDetailsModalBody');
    const modalTitle = document.getElementById('planDetailsModalLabel');

    if (!plan) {
        modalBody.innerHTML = '<p>Error: Plan not found.</p>';
        return;
    }

    modalTitle.textContent = `Plan Details - ₹${plan.price}`;
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h5>Plan Overview</h5>
                <div class="modal-benefit-item">
                    <i class="bi bi-currency-rupee benefit-icon"></i>
                    <div class="benefit-text">
                        <strong>Price:</strong> ${plan.isHotDeal ? 
                            `<span class="original-price">₹${plan.originalPrice}</span> ₹${plan.price}` : 
                            `₹${plan.price}`}
                    </div>
                </div>
                <div class="modal-benefit-item">
                    <i class="bi bi-calendar-check benefit-icon"></i>
                    <div class="benefit-text">
                        <strong>Validity:</strong> ${plan.validity} Days
                    </div>
                </div>
                <div class="modal-benefit-item">
                    <i class="bi bi-wifi benefit-icon"></i>
                    <div class="benefit-text">
                        <strong>Data:</strong> ${plan.data}GB${plan.data.includes('/Day') ? '' : '/Day'}
                    </div>
                </div>
                <div class="modal-benefit-item">
                    <i class="bi bi-chat-dots benefit-icon"></i>
                    <div class="benefit-text">
                        <strong>SMS:</strong> ${plan.sms || 'N/A'}
                    </div>
                </div>
                <div class="modal-benefit-item">
                    <i class="bi bi-telephone benefit-icon"></i>
                    <div class="benefit-text">
                        <strong>Calls:</strong> ${plan.calls || 'N/A'}
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <h5>Additional Benefits</h5>
                <div class="modal-benefit-item">
                    <i class="bi bi-gift benefit-icon"></i>
                    <div class="benefit-text">
                        ${plan.benefits && plan.benefits.trim() !== '' ? plan.benefits : 'No additional benefits available.'}
                    </div>
                </div>
                <div class="modal-benefit-item">
                    <i class="bi bi-tags benefit-icon"></i>
                    <div class="benefit-text">
                        <strong>Categories:</strong> ${plan.categories && plan.categories.length > 0 ? 
                            plan.categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)).join(', ') : 'N/A'}
                    </div>
                </div>
                ${plan.isHotDeal ? `
                <div class="modal-benefit-item">
                    <i class="bi bi-fire benefit-icon" style="color: #ff5252;"></i>
                    <div class="benefit-text">
                        <strong>Hot Deal:</strong> Save ₹${plan.originalPrice - plan.price} on this limited-time offer!
                    </div>
                </div>` : ''}
            </div>
        </div>
        <hr>
        <div class="terms-conditions mt-3">
            <h5>Terms & Conditions</h5>
            <ul>
                <li>All plans are subject to Fair Usage Policy.</li>
                <li>Data speeds may vary based on network congestion and location.</li>
                <li>Unused benefits will expire at the end of plan validity.</li>
                <li>SMS benefits are not applicable on blackout days.</li>
                <li>ISD and premium services will be charged separately.</li>
            </ul>
        </div>`;

    document.querySelector('.btn-select-from-modal').setAttribute('data-plan-id', planId);
}

function displayPlans(filteredPlans) {
    const plansContainer = document.getElementById('plansContainer');
    plansContainer.innerHTML = '';

    if (filteredPlans.length === 0) {
        plansContainer.innerHTML = `
            <div class="no-plans-message">
                <i class="bi bi-exclamation-circle" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 20px;"></i>
                <h4>No plans match your current filters</h4>
                <p>Try adjusting your filters or reset them to see all available plans.</p>
            </div>`;
        return;
    }

    filteredPlans.forEach(plan => {
        const planCard = document.createElement('div');
        planCard.className = 'plan-card';
        planCard.setAttribute('data-plan-id', plan.id);

        // Use the first category for the badge, or default to 'all'
        const mainCategory = plan.categories && plan.categories.length > 0 ? plan.categories[0] : 'all';
        let categoryName = mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1);

        planCard.innerHTML = `
            ${plan.isHotDeal ? '<div class="hot-deal">HOT DEAL</div>' : ''}
            <div class="plan-category-badge">${categoryName}</div>
            <div class="plan-header">
                <h3 class="plan-title">₹${plan.price}</h3>
                <p class="plan-validity">Validity: ${plan.validity} Days</p>
            </div>
            <div class="plan-body">
                <div class="plan-features">
                    <div class="plan-feature-item">
                        <i class="bi bi-wifi feature-icon"></i>
                        <span>${plan.data}GB${plan.data.includes('/Day') ? '' : '/Day'}</span>
                    </div>
                    <div class="plan-feature-item">
                        <i class="bi bi-chat-dots feature-icon"></i>
                        <span>${plan.sms || 'N/A'}</span>
                    </div>
                    <div class="plan-feature-item">
                        <i class="bi bi-telephone feature-icon"></i>
                        <span>${plan.calls || 'N/A'}</span>
                    </div>
                </div>
            </div>
            <div class="plan-footer">
                <div class="price-section">
                    ${plan.isHotDeal ? 
                        `<div class="discounted-price">
                            <span class="original-price">₹${plan.originalPrice}</span>
                            <span class="current-price">₹${plan.price}</span>
                        </div>` : 
                        `<span class="current-price">₹${plan.price}</span>`
                    }
                </div>
                <button class="btn-select-plan">Select Plan</button>
                <button class="btn-plan-details" data-bs-toggle="modal" data-bs-target="#planDetailsModal" data-plan-id="${plan.id}">View Details</button>
            </div>`;

        plansContainer.appendChild(planCard);
    });

    // Re-attach event listeners for buttons
    document.querySelectorAll('.btn-plan-details').forEach(button => {
        button.addEventListener('click', function() {
            const planId = this.getAttribute('data-plan-id');
            showPlanDetails(planId);
        });
    });

    document.querySelectorAll('.btn-select-plan').forEach(button => {
        button.addEventListener('click', function() {
            const planCard = this.closest('.plan-card');
            const planId = planCard.getAttribute('data-plan-id');
            selectPlan(planId);
        });
    });
}

async function selectPlan(planId) {
    const plans = await fetchPlans();
    const plan = plans.find(p => p.id == planId);
    const mobileInput = document.getElementById('sidebarMobile');
    const mobileNumber = mobileInput.value.trim();
    const mobileError = document.getElementById('sidebarMobileError');

    // Check if mobile number is empty
    if (!mobileNumber) {
        mobileError.textContent = 'Please enter a mobile number';
        mobileError.style.display = 'block';
        mobileInput.style.borderColor = '#dc3545';
        mobileInput.focus();
        return;
    }

    // Validate mobile number
    if (isNaN(mobileNumber) || !/^\d+$/.test(mobileNumber) || mobileNumber.length !== 10) {
        mobileError.textContent = 'Please enter a valid 10-digit mobile number';
        mobileError.style.display = 'block';
        mobileInput.style.borderColor = '#dc3545';
        mobileInput.focus();
        return;
    }

    // If mobile number is valid, proceed to payment page
    window.location.href = `/src/pages/Payment.html?amount=${plan.price}&mobile=${mobileNumber}&planId=${planId}`;
}

// Fetch categories from the backend
async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/public/categories`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const categories = await response.json();
        return categories.map(cat => cat.name.toLowerCase());
    } catch (error) {
        console.error('Error fetching categories:', error);
        const sidebarNav = document.querySelector('.sidebar-nav');
        sidebarNav.innerHTML += `
            <div class="text-danger" style="padding: 10px;">
                Failed to load categories. Please try again later.
            </div>`;
        return [];
    }
}

// Dynamically populate categories in the sidebar and pills
async function populateCategories() {
    const categories = await fetchCategories();
    const sidebarNav = document.querySelector('.sidebar-nav');
    const categoryPills = document.querySelector('.category-pills');

    // Clear existing categories (except "All Plans")
    sidebarNav.innerHTML = `
        <div class="sidebar-item active" data-category="all">
            <i class="bi bi-grid sidebar-icon"></i> All Plans
        </div>`;
    categoryPills.innerHTML = `
        <div class="category-pill active" data-category="all">All Plans</div>`;

    // Define icons for each category
    const categoryIcons = {
        'popular': 'bi-award',
        'validity': 'bi-hourglass-bottom',
        'data': 'bi-file-bar-graph',
        'unlimited': 'bi-infinity',
        'entertainment': 'bi-film',
        'international': 'bi-globe',
        'budget': 'bi-piggy-bank'
    };

    // Add dynamic categories
    categories.forEach(category => {
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        const iconClass = categoryIcons[category] || 'bi-tag';

        // Add to sidebar
        const sidebarItem = document.createElement('div');
        sidebarItem.className = 'sidebar-item';
        sidebarItem.setAttribute('data-category', category);
        sidebarItem.innerHTML = `
            <i class="bi ${iconClass} sidebar-icon"></i> ${categoryName} Plans`;
        sidebarNav.appendChild(sidebarItem);

        // Add to category pills
        const categoryPill = document.createElement('div');
        categoryPill.className = 'category-pill';
        categoryPill.setAttribute('data-category', category);
        categoryPill.textContent = categoryName;
        categoryPills.appendChild(categoryPill);
    });

    // Re-attach event listeners for category selection
    document.querySelectorAll('.sidebar-item, .category-pill').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.sidebar-item, .category-pill').forEach(el => el.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            if (this.classList.contains('sidebar-item')) {
                document.querySelector(`.category-pill[data-category="${category}"]`).classList.add('active');
            } else {
                document.querySelector(`.sidebar-item[data-category="${category}"]`).classList.add('active');
            }
            applyFilters();
        });
    });
}

async function applyFilters() {
    const plans = await fetchPlans();
    const priceRange = document.getElementById('priceRange').value;
    const validityFilter = document.getElementById('validityFilter').value;
    const dataFilter = document.getElementById('dataFilter').value;
    const activeCategory = document.querySelector('.sidebar-item.active, .category-pill.active').getAttribute('data-category');

    let filteredPlans = [...plans];

    // Filter by category
    if (activeCategory !== 'all') {
        filteredPlans = filteredPlans.filter(plan => plan.categories && plan.categories.includes(activeCategory));
    }

    // Filter by price range
    if (priceRange !== 'all') {
        if (priceRange === '1000+') {
            filteredPlans = filteredPlans.filter(plan => plan.price >= 1000);
        } else {
            const [min, max] = priceRange.split('-').map(Number);
            filteredPlans = filteredPlans.filter(plan => plan.price >= min && plan.price <= max);
        }
    }

    // Filter by validity
    if (validityFilter !== 'all') {
        if (validityFilter === '181+') {
            filteredPlans = filteredPlans.filter(plan => plan.validity >= 181);
        } else {
            const [min, max] = validityFilter.split('-').map(Number);
            filteredPlans = filteredPlans.filter(plan => plan.validity >= min && plan.validity <= max);
        }
    }

    // Filter by data allowance
    if (dataFilter !== 'all') {
        function getDataValue(data) {
            if (data.includes('Unlimited')) return 100;
            const match = data.match(/(\d+(\.\d+)?)GB/);
            return match ? parseFloat(match[1]) : 0;
        }

        if (dataFilter === 'basic') {
            filteredPlans = filteredPlans.filter(plan => getDataValue(plan.data) <= 1);
        } else if (dataFilter === 'standard') {
            filteredPlans = filteredPlans.filter(plan => {
                const value = getDataValue(plan.data);
                return value > 1 && value <= 2;
            });
        } else if (dataFilter === 'high') {
            filteredPlans = filteredPlans.filter(plan => getDataValue(plan.data) > 2);
        }
    }

    displayPlans(filteredPlans);
}

async function validateAndUpdateMobile() {
    const mobileInput = document.getElementById('sidebarMobile');
    const mobileError = document.getElementById('sidebarMobileError');
    const mobileNumber = mobileInput.value.trim();

    mobileError.style.display = 'none';
    mobileInput.style.borderColor = '';

    // Validate mobile number
    if (!mobileNumber) {
        mobileError.textContent = 'Please enter a number';
        mobileError.style.display = 'block';
        mobileInput.style.borderColor = '#dc3545';
        return false;
    }
    if (isNaN(mobileNumber) || !/^\d+$/.test(mobileNumber)) {
        mobileError.textContent = 'Please enter a valid number';
        mobileError.style.display = 'block';
        mobileInput.style.borderColor = '#dc3545';
        return false;
    }
    if (mobileNumber.length !== 10) {
        mobileError.textContent = 'Please enter a valid 10-digit mobile number';
        mobileError.style.display = 'block';
        mobileInput.style.borderColor = '#dc3545';
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/recharge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || ''}`
            },
            body: JSON.stringify({ mobileNumber })
        });

        if (response.ok) {
            mobileInput.style.borderColor = '#28a745';
            mobileError.textContent = 'Number updated successfully!';
            mobileError.style.color = '#28a745';
            mobileError.style.display = 'block';
            mobileInput.setAttribute('readonly', true);
            document.getElementById('changeNumberBtn').textContent = 'Change';
            // Store the mobile number in localStorage for persistence
            localStorage.setItem('rechargeMobileNumber', mobileNumber);
            return true;
        } else {
            const errorText = await response.text();
            mobileError.textContent = errorText || 'Failed to update number';
            mobileError.style.display = 'block';
            mobileInput.style.borderColor = '#dc3545';
            return false;
        }
    } catch (error) {
        mobileError.textContent = error.message || 'An error occurred';
        mobileError.style.display = 'block';
        mobileInput.style.borderColor = '#dc3545';
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    const plans = await fetchPlans();
    displayPlans(plans);
    await populateCategories();
    // Get mobile number from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    let mobileNumber = urlParams.get('mobile');
    const mobileInput = document.getElementById('sidebarMobile');

    if (mobileNumber) {
        mobileInput.value = mobileNumber;
        mobileInput.setAttribute('readonly', true);
        document.getElementById('changeNumberBtn').textContent = 'Change';
    }

    // Load user profile icon
    const token = localStorage.getItem('jwtToken');
    const userProfileIcon = document.getElementById('userProfileIcon');

    if (token) {
        try {
            const response = await fetchWithAuth('http://localhost:8083/api/users/profile', { method: 'GET' }, true);
            const user = await response.json();

            // Update profile icon with picture or initial
            const storedImage = localStorage.getItem('profileImage');
            if (storedImage || user.profilePicture) {
                const imageSrc = storedImage || user.profilePicture;
                userProfileIcon.innerHTML = `<img src="${imageSrc}" alt="Profile" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;">`;
            } else {
                const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
                userProfileIcon.innerHTML = `<div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background-color: #5680E9; color: white; font-size: 20px;">${initial}</div>`;
            }
        } catch (error) {
            // If no valid user data, show default bi-person-circle icon
            userProfileIcon.innerHTML = `<i class="bi bi-person-circle" style="font-size: 40px; color: white;"></i>`;
        }
    } else {
        // If no token, show default bi-person-circle icon
        userProfileIcon.innerHTML = `<i class="bi bi-person-circle" style="font-size: 30px; color: white;"></i>`;
    }

    // Change number functionality
    const changeBtn = document.getElementById('changeNumberBtn');
    changeBtn.addEventListener('click', function() {
        if (mobileInput.hasAttribute('readonly')) {
            mobileInput.removeAttribute('readonly');
            mobileInput.focus();
            this.textContent = 'Save';
        } else {
            validateAndUpdateMobile();
        }
    });

    // Navigation active state
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.parentElement.classList.add("active");
        }
    });

    // Filter buttons
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', async function() {
        document.getElementById('priceRange').value = 'all';
        document.getElementById('validityFilter').value = 'all';
        document.getElementById('dataFilter').value = 'all';
        document.querySelectorAll('.sidebar-item, .category-pill').forEach(el => el.classList.remove('active'));
        document.querySelector('.sidebar-item[data-category="all"]').classList.add('active');
        document.querySelector('.category-pill[data-category="all"]').classList.add('active');
        const plans = await fetchPlans();
        displayPlans(plans);
    });

    // Modal select plan
    document.querySelector('.btn-select-from-modal').addEventListener('click', function() {
        const planId = this.getAttribute('data-plan-id');
        selectPlan(planId);
        bootstrap.Modal.getInstance(document.getElementById('planDetailsModal')).hide();
    });

    // Scroll effects
    window.onscroll = function() {
        const scrollBtn = document.getElementById('scrollTopBtn');
        const navbar = document.querySelector('.navbar');
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            scrollBtn.style.display = 'block';
            navbar.classList.add('scrolled');
        } else {
            scrollBtn.style.display = 'none';
            navbar.classList.remove('scrolled');
        }
    };

    // Category selection
    document.querySelectorAll('.sidebar-item, .category-pill').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.sidebar-item, .category-pill').forEach(el => el.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            if (this.classList.contains('sidebar-item')) {
                document.querySelector(`.category-pill[data-category="${category}"]`).classList.add('active');
            } else {
                document.querySelector(`.sidebar-item[data-category="${category}"]`).classList.add('active');
            }
            applyFilters();
        });
    });
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}