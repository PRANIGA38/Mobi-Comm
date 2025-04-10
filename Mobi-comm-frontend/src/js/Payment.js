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

window.onload = function () {
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
                            key: 'rzp_test_pRczkWgFWJTWHz', // Updated to match backend
                            amount: amount * 100, // Amount in paise
                            currency: 'INR',
                            name: 'Mobi-Comm',
                            description: `${method} Transaction`,
                            order_id: responseData.orderId,
                            ...(responseData.sessionToken && { session_token: responseData.sessionToken }), // Optional
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
};

// Scroll to top functionality
window.onscroll = function () {
    let scrollBtn = document.getElementById("scrollTopBtn");
    if (scrollBtn) {
        scrollBtn.style.display = (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) ? "block" : "none";
    }
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}