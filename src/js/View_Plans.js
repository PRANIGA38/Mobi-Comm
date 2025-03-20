// Base URL for API
const API_BASE_URL = 'http://localhost:8083/api';

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
        return await response.json();
    } catch (error) {
        console.error('Error fetching plans:', error);
        return [];
    }
}

// Function to display plans
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

// Show plan details in modal
async function showPlanDetails(planId) {
    const plans = await fetchPlans();
    const plan = plans.find(p => p.id == planId);
    const modalBody = document.getElementById('planDetailsModalBody');
    const modalTitle = document.getElementById('planDetailsModalLabel');

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
                        ${plan.benefits || 'No additional benefits'}
                    </div>
                </div>
                <div class="modal-benefit-item">
                    <i class="bi bi-tags benefit-icon"></i>
                    <div class="benefit-text">
                        <strong>Categories:</strong> ${plan.categories ? plan.categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)).join(', ') : 'N/A'}
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

// Handle plan selection
async function selectPlan(planId) {
    const plans = await fetchPlans();
    const plan = plans.find(p => p.id == planId);
    const mobileNumber = document.getElementById('sidebarMobile').value;
    window.location.href = `/src/pages/Payment.html?amount=${plan.price}&mobile=${mobileNumber}`;
}

// Apply filters
async function applyFilters() {
    const plans = await fetchPlans();
    const priceRange = document.getElementById('priceRange').value;
    const validityFilter = document.getElementById('validityFilter').value;
    const dataFilter = document.getElementById('dataFilter').value;
    const activeCategory = document.querySelector('.sidebar-item.active, .category-pill.active').getAttribute('data-category');

    let filteredPlans = [...plans];

    if (activeCategory !== 'all') {
        filteredPlans = filteredPlans.filter(plan => plan.categories && plan.categories.includes(activeCategory));
    }

    if (priceRange !== 'all') {
        if (priceRange === '1000+') {
            filteredPlans = filteredPlans.filter(plan => plan.price >= 1000);
        } else {
            const [min, max] = priceRange.split('-').map(Number);
            filteredPlans = filteredPlans.filter(plan => plan.price >= min && plan.price <= max);
        }
    }

    if (validityFilter !== 'all') {
        if (validityFilter === '181+') {
            filteredPlans = filteredPlans.filter(plan => plan.validity >= 181);
        } else {
            const [min, max] = validityFilter.split('-').map(Number);
            filteredPlans = filteredPlans.filter(plan => plan.validity >= min && plan.validity <= max);
        }
    }

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

// Validate and update mobile number
async function validateAndUpdateMobile() {
    const mobileInput = document.getElementById('sidebarMobile');
    const mobileError = document.getElementById('sidebarMobileError');
    const mobileNumber = mobileInput.value.trim();

    mobileError.style.display = 'none';
    mobileInput.style.borderColor = '';

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

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    const plans = await fetchPlans();
    displayPlans(plans);

    // Get mobile number from URL
    const urlParams = new URLSearchParams(window.location.search);
    const mobileNumber = urlParams.get('mobile');
    const mobileInput = document.getElementById('sidebarMobile');
    if (mobileNumber) {
        mobileInput.value = mobileNumber;
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
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}