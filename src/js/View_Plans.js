

        // Plan data - expanded with more plans
        const plans = [
            // Popular Plans
            {
                id: 'plan209',
                amount: 209,
                validity: '28 Days',
                data: '1GB/Day',
                sms: '100 SMS/Day',
                calls: 'Unlimited Calls',
                benefits: 'Free access to Mobi-comm Music for 28 days. Enjoy ad-free music and unlimited downloads.',
                categories: ['popular']
            },
            {
                id: 'plan555',
                amount: 555,
                validity: '84 Days',
                data: '1.5GB/Day',
                sms: '100 SMS/Day',
                calls: 'Unlimited Calls',
                benefits: 'Free Mobi-comm Security subscription for 84 days. Protect your device from malware and viruses.',
                categories: ['popular']
            },
            {
                id: 'plan599',
                amount: 599,
                validity: '84 Days',
                data: '2GB/Day',
                sms: '100 SMS/Day',
                calls: 'Unlimited Calls',
                benefits: 'Amazon Prime Free for 3 months. Amazon Prime membership includes free fast delivery, access to Prime Video, and exclusive deals.',
                categories: ['popular', 'entertainment']
            },
            {
                id: 'plan299',
                amount: 299,
                validity: '28 Days',
                data: '2GB/Day',
                sms: '100 SMS/Day',
                calls: 'Unlimited Calls',
                benefits: 'Weekend Data Rollover - Unused weekday data gets added to your weekend allowance.',
                categories: ['popular'],
                isHotDeal: true,
                originalPrice: 349
            },

            // Validity Plans
            {
                id: 'plan91',
                amount: 91,
                validity: '28 Days',
                data: '100MB/Day',
                sms: '100 SMS',
                calls: 'Unlimited Calls',
                benefits: 'Low-cost validity plan with unlimited calling and basic data for essential communication.',
                categories: ['validity', 'budget']
            },
            {
                id: 'plan123',
                amount: 123,
                validity: '28 Days',
                data: '500MB/Day',
                sms: '100 SMS',
                calls: 'Unlimited Calls',
                benefits: 'Free national roaming. Enjoy seamless connectivity across India with free national roaming and a decent daily data limit.',
                categories: ['validity', 'budget']
            },
            {
                id: 'plan152',
                amount: 152,
                validity: '28 Days',
                data: '500MB/Day',
                sms: '100 SMS/Day',
                calls: 'Unlimited Calls',
               benefits: 'Affordable plan with priority customer care access. Get dedicated phone support for all your Mobi-comm related queries.',
                categories: ['validity']
            },
            {
                id: 'plan698',
                amount: 698,
                validity: '180 Days',
                data: '500MB/Day',
                sms: '100 SMS/Day',
                calls: 'Unlimited Calls',
                benefits: 'Long validity with consistent service. Worry-free usage for 6 months with no recharge hassles.',
                categories: ['validity']
            },
            {
                id: 'plan1799',
                amount: 1799,
                validity: '365 Days',
                data: '1GB/Day',
                sms: '100 SMS/Day',
                calls: 'Unlimited Calls',
                benefits: 'Annual plan with consistent service and data rollover. Any unused data gets carried forward to the next day.',
                categories: ['validity']
            },

            // Data Plans
            {
                id: 'plan149',
                amount: 149,
                validity: '28 Days',
                data: '2GB/Day',
                sms: '100 SMS/Day',
                calls: 'Unlimited Calls',
                benefits: 'Ideal for medium data users with full day coverage. Unlimited voice calling to any network.',
                categories: ['data'],
                isHotDeal: true,
                originalPrice: 179
            },
            {
                id: 'plan419',
                amount: 419,
                validity: '56 Days',
                data: '3GB/Day',
                sms: '100 SMS/Day',
                calls: 'Unlimited Calls',
                benefits: 'Heavy data pack with extended validity. Perfect for streaming and gaming enthusiasts.',
                categories: ['data']
            },
            {
                id: 'plan251',
                amount: 251,
                validity: '28 Days',
                data: '4GB/Day',
                sms: '100 SMS/Day',
                calls: 'Unlimited Calls',
                benefits: 'Extra high-speed data for power users. No speed throttling even after high usage.',
                categories: ['data']
            },
            {
                id: 'plan219',
                amount: 219,
                validity: '28 Days',
                data: '3GB/Day',
                sms: '100 SMS/Day',
                calls: 'Unlimited Calls',
                benefits: 'Free access to Mobi-comm TV. Stream live TV channels and catch up on your favorite shows.',
                categories: ['data', 'entertainment']
            },

            // Unlimited Plans
            {
                id: 'plan179',
                amount: 179,
                validity: '28 Days',
                data: 'Truly Unlimited',
                sms: '100 SMS/Day',
                calls: 'Unlimited Calls',
                benefits: 'No FUP limits or speed restrictions. True unlimited data for heavy users.',
                categories: ['unlimited']
            },
            {
                id: 'plan499',
                amount: 499,
                validity: '56 Days',
                data: 'Truly Unlimited',
                sms: '100 SMS/Day',
                calls: 'Unlimited Calls',
                benefits: 'Extended unlimited plan with no usage restrictions. Perfect for binge watchers and gamers.',
                categories: ['unlimited']
            },
            {
                id: 'plan999',
                amount: 999,
                validity: '84 Days',
                data: 'Truly Unlimited',
                sms: 'Unlimited SMS',
                calls: 'Unlimited Calls',
                benefits: 'Premium unlimited plan with priority network access. Get better network quality even during peak hours.',
                categories: ['unlimited']
            },

            // Entertainment Plans
            {
                id: 'plan399',
                amount: 399,
                validity: '28 Days',
                data: '2GB/Day',
                sms: '100 SMS/Day',
                calls: 'Unlimited Calls',
                benefits: 'Netflix Basic subscription included. Watch content on any one device at a time.',
                categories: ['entertainment']
            },
            {
                id: 'plan599e',
                amount: 599,
                validity: '28 Days',
                data: '2.5GB/Day',
                sms: '100 SMS/Day',
                calls: 'Unlimited Calls',
                benefits: 'Disney+ Hotstar Mobile subscription for 1 month. Access to live sports and exclusive content.',
                categories: ['entertainment']
            },
            {
                id: 'plan499e',
                amount: 499,
                validity: '28 Days',
                data: '2GB/Day',
                sms: '100 SMS/Day',
                calls: 'Unlimited Calls',
                benefits: 'Free access to all premium OTT apps for 28 days. Includes Netflix, Amazon Prime, Disney+ Hotstar, and more.',
                categories: ['entertainment'],
                isHotDeal: true,
                originalPrice: 649
            },

            // International Roaming
            {
                id: 'plan449',
                amount: 449,
                validity: '7 Days',
                data: '1GB/Day',
                sms: '50 SMS/Day',
                calls: '100 mins International',
                benefits: 'International roaming for SAARC countries. Includes Bangladesh, Nepal, Bhutan, Sri Lanka, and Maldives.',
                categories: ['international']
            },
            {
                id: 'plan649',
                amount: 649,
                validity: '10 Days',
                data: '1.5GB/Day',
                sms: '50 SMS/Day',
                calls: '200 mins International',
                benefits: 'Global roaming for popular destinations. Valid in USA, UK, Canada, Australia, Singapore, and UAE.',
                categories: ['international']
            },
            {
                id: 'plan1499',
                amount: 1499,
                validity: '30 Days',
                data: '2GB/Day',
                sms: '100 SMS/Day',
                calls: '500 mins International',
                benefits: 'Premium global roaming for business travelers. Valid in 100+ countries with priority service.',
                categories: ['international']
            },

            // Budget Plans
            {
                id: 'plan49',
                amount: 49,
                validity: '7 Days',
                data: '100MB/Day',
                sms: '10 SMS/Day',
                calls: 'Unlimited Calls',
                benefits: 'Emergency 7-day plan with basic connectivity. Perfect for temporary needs.',
                categories: ['budget']
            },
            {
                id: 'plan79',
                amount: 79,
                validity: '14 Days',
                data: '200MB/Day',
                sms: '25 SMS/Day',
                calls: 'Unlimited Calls',
                benefits: 'Two-week economy plan with essential services. Affordable option for light users.',
                categories: ['budget']
            },
            {
                id: 'plan99',
                amount: 99,
                validity: '14 Days',
                data: '500MB/Day',
                sms: '50 SMS/Day',
                calls: 'Unlimited Calls',
                benefits: 'Value-for-money plan with moderate data allocation. Good balance of price and benefits.',
                categories: ['budget'],
                isHotDeal: true,
                originalPrice: 129
            }
        ];

        // Function to display plans based on filters
        function displayPlans(filteredPlans = plans) {
            const plansContainer = document.getElementById('plansContainer');
            plansContainer.innerHTML = '';

            if (filteredPlans.length === 0) {
                plansContainer.innerHTML = `
                    <div class="no-plans-message">
                        <i class="bi bi-exclamation-circle" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 20px;"></i>
                        <h4>No plans match your current filters</h4>
                        <p>Try adjusting your filters or reset them to see all available plans.</p>
                    </div>
                `;
                return;
            }

            filteredPlans.forEach(plan => {
                const planCard = document.createElement('div');
                planCard.className = 'plan-card';
                planCard.setAttribute('data-plan-id', plan.id);

                // Add category badge
                const mainCategory = plan.categories[0];
                let categoryName = mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1);
                
                planCard.innerHTML = `
                    ${plan.isHotDeal ? '<div class="hot-deal">HOT DEAL</div>' : ''}
                    <div class="plan-category-badge">${categoryName}</div>
                    <div class="plan-header">
                        <h3 class="plan-title">₹${plan.amount}</h3>
                        <p class="plan-validity">Validity: ${plan.validity}</p>
                    </div>
                    <div class="plan-body">
                        <div class="plan-features">
                            <div class="plan-feature-item">
                                <i class="bi bi-wifi feature-icon"></i>
                                <span>${plan.data}</span>
                            </div>
                            <div class="plan-feature-item">
                                <i class="bi bi-chat-dots feature-icon"></i>
                                <span>${plan.sms}</span>
                            </div>
                            <div class="plan-feature-item">
                                <i class="bi bi-telephone feature-icon"></i>
                                <span>${plan.calls}</span>
                            </div>
                        </div>
                    </div>
                    <div class="plan-footer">
                        <div class="price-section">
                            ${plan.isHotDeal ? 
                                `<div class="discounted-price">
                                    <span class="original-price">₹${plan.originalPrice}</span>
                                    <span class="current-price">₹${plan.amount}</span>
                                </div>` : 
                                `<span class="current-price">₹${plan.amount}</span>`
                            }
                        </div>
                        <button class="btn-select-plan">Select Plan</button>
                        <button class="btn-plan-details" data-bs-toggle="modal" data-bs-target="#planDetailsModal" data-plan-id="${plan.id}">View Details</button>
                    </div>
                `;

                plansContainer.appendChild(planCard);
            });

            // Add event listeners to the buttons
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

        // Function to show plan details in modal
        function showPlanDetails(planId) {
            const plan = plans.find(p => p.id === planId);
            const modalBody = document.getElementById('planDetailsModalBody');
            const modalTitle = document.getElementById('planDetailsModalLabel');
            
            modalTitle.textContent = `Plan Details - ₹${plan.amount}`;
            
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h5>Plan Overview</h5>
                        <div class="modal-benefit-item">
                            <i class="bi bi-currency-rupee benefit-icon"></i>
                            <div class="benefit-text">
                                <strong>Price:</strong> ${plan.isHotDeal ? 
                                    `<span class="original-price">₹${plan.originalPrice}</span> ₹${plan.amount}` : 
                                    `₹${plan.amount}`}
                            </div>
                        </div>
                        <div class="modal-benefit-item">
                            <i class="bi bi-calendar-check benefit-icon"></i>
                            <div class="benefit-text">
                                <strong>Validity:</strong> ${plan.validity}
                            </div>
                        </div>
                        <div class="modal-benefit-item">
                            <i class="bi bi-wifi benefit-icon"></i>
                            <div class="benefit-text">
                                <strong>Data:</strong> ${plan.data}
                            </div>
                        </div>
                        <div class="modal-benefit-item">
                            <i class="bi bi-chat-dots benefit-icon"></i>
                            <div class="benefit-text">
                                <strong>SMS:</strong> ${plan.sms}
                            </div>
                        </div>
                        <div class="modal-benefit-item">
                            <i class="bi bi-telephone benefit-icon"></i>
                            <div class="benefit-text">
                                <strong>Calls:</strong> ${plan.calls}
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h5>Additional Benefits</h5>
                        <div class="modal-benefit-item">
                            <i class="bi bi-gift benefit-icon"></i>
                            <div class="benefit-text">
                                ${plan.benefits}
                            </div>
                        </div>
                        <div class="modal-benefit-item">
                            <i class="bi bi-tags benefit-icon"></i>
                            <div class="benefit-text">
                                <strong>Categories:</strong> ${plan.categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)).join(', ')}
                            </div>
                        </div>
                        ${plan.isHotDeal ? `
                        <div class="modal-benefit-item">
                            <i class="bi bi-fire benefit-icon" style="color: #ff5252;"></i>
                            <div class="benefit-text">
                                <strong>Hot Deal:</strong> Save ₹${plan.originalPrice - plan.amount} on this limited-time offer!
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <hr>
                <div class="terms-conditions mt-3">
                    <h5>Terms & Conditions</h5>
                    <ul>
                        <li>All plans are subject to Fair Usage Policy.</li>
                        <li>Data speeds may vary based on network congestion and location.</li>
                        <li>Unused benefits will expire at the end of plan validity.</li>
                        <li>SMS benefits are not applicable on blackout days (festive and national holidays).</li>
                        <li>ISD and premium services will be charged separately.</li>
                    </ul>
                </div>
            `;

            // Set the plan ID on the Select Plan button in the modal
            document.querySelector('.btn-select-from-modal').setAttribute('data-plan-id', planId);
        }

       // Function to handle plan selection
function selectPlan(planId) {
    const plan = plans.find(p => p.id === planId);
    // Instead of showing an alert, redirect to Recharge.html with the amount parameter
    window.location.href = `Recharge.html?amount=${plan.amount}`;
}
        // Filter functions
        function applyFilters() {
            const priceRange = document.getElementById('priceRange').value;
            const validityFilter = document.getElementById('validityFilter').value;
            const dataFilter = document.getElementById('dataFilter').value;
            const activeCategoryElement = document.querySelector('.sidebar-item.active, .category-pill.active');
            const activeCategory = activeCategoryElement.getAttribute('data-category');

            let filteredPlans = [...plans];

            // Filter by category
            if (activeCategory !== 'all') {
                filteredPlans = filteredPlans.filter(plan => plan.categories.includes(activeCategory));
            }

            // Filter by price
            if (priceRange !== 'all') {
                if (priceRange === '1000+') {
                    filteredPlans = filteredPlans.filter(plan => plan.amount >= 1000);
                } else {
                    const [min, max] = priceRange.split('-').map(Number);
                    filteredPlans = filteredPlans.filter(plan => plan.amount >= min && plan.amount <= max);
                }
            }

            // Filter by validity
            if (validityFilter !== 'all') {
                // Convert validity string to days number
                function getValidityDays(validityStr) {
                    const days = parseInt(validityStr);
                    if (validityStr.includes('Days')) return days;
                    if (validityStr.includes('Month')) return days * 30;
                    if (validityStr.includes('Year')) return days * 365;
                    return days;
                }

                if (validityFilter === '181+') {
                    filteredPlans = filteredPlans.filter(plan => getValidityDays(plan.validity) >= 181);
                } else {
                    const [min, max] = validityFilter.split('-').map(Number);
                    filteredPlans = filteredPlans.filter(plan => {
                        const days = getValidityDays(plan.validity);
                        return days >= min && days <= max;
                    });
                }
            }

            // Filter by data
            if (dataFilter !== 'all') {
                function getDataValue(dataStr) {
                    if (dataStr.includes('Unlimited')) return 100; // arbitrary high value for unlimited
                    const match = dataStr.match(/(\d+(\.\d+)?)GB/);
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

        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            // Display all plans initially
            displayPlans();

            // Set up event listeners for sidebar categories
            document.querySelectorAll('.sidebar-item, .category-pill').forEach(item => {
                item.addEventListener('click', function() {
                    // Remove active class from all items
                    document.querySelectorAll('.sidebar-item, .category-pill').forEach(el => {
                        el.classList.remove('active');
                    });
                    
                    // Add active class to clicked item
                    this.classList.add('active');
                    
                    // Get category and update the active class on the corresponding item in the other nav
                    const category = this.getAttribute('data-category');
                    if (this.classList.contains('sidebar-item')) {
                        document.querySelector(`.category-pill[data-category="${category}"]`).classList.add('active');
                    } else {
                        document.querySelector(`.sidebar-item[data-category="${category}"]`).classList.add('active');
                    }
                    
                    // Apply filters with the new category
                    applyFilters();
                });
            });

            // Set up event listeners for filter buttons
            document.getElementById('applyFilters').addEventListener('click', applyFilters);
            
            document.getElementById('resetFilters').addEventListener('click', function() {
                document.getElementById('priceRange').value = 'all';
                document.getElementById('validityFilter').value = 'all';
                document.getElementById('dataFilter').value = 'all';
                
                // Set "All Plans" as active
                document.querySelectorAll('.sidebar-item, .category-pill').forEach(el => {
                    el.classList.remove('active');
                });
                document.querySelector('.sidebar-item[data-category="all"]').classList.add('active');
                document.querySelector('.category-pill[data-category="all"]').classList.add('active');
                
                // Display all plans
                displayPlans();
            });

            // Modal Select Plan button
            document.querySelector('.btn-select-from-modal').addEventListener('click', function() {
                const planId = this.getAttribute('data-plan-id');
                selectPlan(planId);
                // Close the modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('planDetailsModal'));
                modal.hide();
            });

            // Scroll to top button functionality
            window.onscroll = function() {
                if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                   document.getElementById('scrollTopBtn').style.display = 'block';
                } else {
                    document.getElementById('scrollTopBtn').style.display = 'none';
                }
            };

            // Navbar scroll effect
            window.addEventListener('scroll', function() {
                const navbar = document.querySelector('.navbar');
                if (window.scrollY > 10) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });
        });

        // Scroll to top function
        function scrollToTop() {
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        }
    