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

// Initialize Razorpay with your publishable key
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Handle page load and form submissions
document.addEventListener('DOMContentLoaded', function () {
    // Update profile icon
    const token = localStorage.getItem('jwtToken');
    const userProfileIcon = document.getElementById('userProfileIcon');

    if (token) {
        fetchWithAuth('http://localhost:8083/api/users/profile', { method: 'GET' }, true)
            .then(response => response.json())
            .then(user => {
                // Update profile icon with picture or initial
                const storedImage = localStorage.getItem('profileImage');
                if (storedImage || user.profilePicture) {
                    const imageSrc = storedImage || user.profilePicture;
                    userProfileIcon.innerHTML = `<img src="${imageSrc}" alt="Profile" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;">`;
                } else {
                    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
                    userProfileIcon.innerHTML = `<div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background-color: #8860D0; color: white; font-size: 20px;">${initial}</div>`;
                }
            })
            .catch(error => {
                // If no valid user data, show default bi-person-circle icon
                userProfileIcon.innerHTML = `<i class="bi bi-person-circle" style="font-size: 40px; color: white;"></i>`;
            });
    } else {
        // If no token, show default bi-person-circle icon
        userProfileIcon.innerHTML = `<i class="bi bi-person-circle" style="font-size: 40px; color: white;"></i>`;
    }

    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const amount = urlParams.get('amount');
    const mobileNumber = urlParams.get('mobile');

    // Set values in forms
    if (amount) {
        document.querySelectorAll('.payment-amount').forEach(field => {
            field.value = amount;
        });
    }
    if (mobileNumber) {
        document.querySelectorAll('.payment-mobile-number').forEach(field => {
            field.value = mobileNumber;
        });
    }

    // Form handling
    const forms = [
        document.getElementById('cardPaymentFormElement'),
        document.getElementById('upiPaymentFormElement'),
        document.getElementById('netBankingFormElement'),
        document.getElementById('mobileWalletFormElement')
    ];

    forms.forEach(form => {
        if (form) {
            form.addEventListener('submit', async function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                    form.classList.add('was-validated');
                    return;
                }

                event.preventDefault();

                let method = '';
                let accountDetail = 'N/A';
                const amount = form.querySelector('[name="amount"]').value;
                const mobileNumber = form.querySelector('[name="mobileNumber"]').value;
                let paymentMethodId = null;

                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
                submitBtn.disabled = true;

                try {
                    // Load Razorpay Checkout script
                    const res = await loadRazorpayScript();
                    if (!res) {
                        throw new Error('Razorpay SDK failed to load');
                    }

                    if (form.id === 'cardPaymentFormElement') {
                        method = 'Card Payment';
                    } else {
                        switch (form.id) {
                            case 'upiPaymentFormElement':
                                method = 'UPI Payment';
                                accountDetail = document.getElementById('upiId')?.value || 'N/A';
                                break;
                            case 'netBankingFormElement':
                                method = 'Net Banking';
                                accountDetail = document.getElementById('accountNumber')?.value || 'N/A';
                                break;
                            case 'mobileWalletFormElement':
                                method = 'Mobile Wallet';
                                accountDetail = document.getElementById('walletNumber')?.value || 'N/A';
                                break;
                        }
                    }

                    // Prepare transaction data
                    const transactionData = {
                        amount: parseFloat(amount),
                        transactionType: method,
                        paymentMethod: method,
                        accountDetail: accountDetail,
                        user: { mobileNumber: mobileNumber }
                    };

                    // Create Razorpay order via backend API
                    const response = await fetch('http://localhost:8083/api/transactions/save', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('jwtToken') || ''}`
                        },
                        body: JSON.stringify(transactionData)
                    });

                    const responseData = await response.json();

                    if (!response.ok) {
                        throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
                    }

                    if (!responseData.status || !responseData.orderId) {
                        console.log('Response data:', responseData);
                        throw new Error('Invalid response: missing status or orderId');
                    }

                    if (responseData.status === 'succeeded') {
                        const options = {
                            key: 'rzp_test_pRczkWgFWJTWHz',
                            amount: amount * 100, // Amount in paise
                            currency: 'INR',
                            name: 'Mobi-Comm',
                            description: `${method} Transaction`,
                            order_id: responseData.orderId,
                            ...(responseData.sessionToken && { session_token: responseData.sessionToken }),
                            handler: function (response) {
                                alert('Payment succeeded! Redirecting to receipt...');
                                setTimeout(() => {
                                    window.location.href = `receipt.html?amount=${encodeURIComponent(amount)}&method=${encodeURIComponent(method)}&accountDetail=${encodeURIComponent(accountDetail)}&mobile=${encodeURIComponent(mobileNumber)}`;
                                }, 1000);
                            },
                            prefill: {
                                contact: mobileNumber
                            },
                            notes: {
                                address: 'Test Address'
                            },
                            theme: {
                                color: '#004A55'
                            },
                            modal: {
                                ondismiss: function () {
                                    alert('Payment was cancelled or failed. Check console for details.');
                                    console.error('Payment dismissed');
                                    submitBtn.innerHTML = '<i class="bi bi-wallet me-2"></i>Pay Now';
                                    submitBtn.disabled = false;
                                }
                            }
                        };

                        const rzp1 = new Razorpay(options);
                        rzp1.on('payment.failed', function (error) {
                            console.error('Payment failed:', error.error);
                            alert('Payment failed: ' + error.error.description);
                            submitBtn.innerHTML = '<i class="bi bi-wallet me-2"></i>Pay Now';
                            submitBtn.disabled = false;
                        });
                        rzp1.open();
                    }
                } catch (error) {
                    console.error('Error processing payment:', error);
                    const displayError = document.getElementById('cardErrors');
                    if (form.id === 'cardPaymentFormElement' && displayError) {
                        displayError.textContent = error.message;
                        displayError.style.display = 'block';
                    } else {
                        alert('Failed to process payment. Please try again. Error: ' + error.message);
                    }
                    submitBtn.innerHTML = '<i class="bi bi-wallet me-2"></i>Pay Now';
                    submitBtn.disabled = false;
                }
            });
        }
    });

    // Scroll effect
    window.onscroll = function () {
        const scrollBtn = document.getElementById('scrollTopBtn');
        const navbar = document.querySelector('.navbar');
        if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
            scrollBtn.style.display = 'block';
            navbar.classList.add('scrolled');
        } else {
            scrollBtn.style.display = 'none';
            navbar.classList.remove('scrolled');
        }
    };
});