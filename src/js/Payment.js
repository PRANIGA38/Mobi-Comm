// Initialize Stripe with your publishable key
const stripe = Stripe('pk_test_51R7foIQsXpFEKVlGzFzF2iHH3WW6RdOaYjGaF10rnCdrPSAiYv3H9eHS9SXDdrowS7pcZZassZyKR3BcgQ4uAf6d00hzNp9vBQ'); 
const elements = stripe.elements();

// Create an instance of the card Element
const cardElement = elements.create('card', {
    style: {
        base: {
            fontSize: '16px',
            color: '#32325d',
        },
    },
});

window.onload = function () {
    // Mount Stripe Elements
    cardElement.mount('#cardElement');

    // Handle real-time validation errors from the card Element
    cardElement.on('change', function (event) {
        const displayError = document.getElementById('cardErrors');
        if (event.error) {
            displayError.textContent = event.error.message;
            displayError.style.display = 'block';
        } else {
            displayError.textContent = '';
            displayError.style.display = 'none';
        }
    });

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
                let accountDetail = '';
                const amount = form.querySelector('[name="amount"]').value;
                const mobileNumber = form.querySelector('[name="mobileNumber"]').value;
                let paymentMethodId = null;

                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
                submitBtn.disabled = true;

                try {
                    if (form.id === 'cardPaymentFormElement') {
                        method = 'Card Payment';

                        // Create a payment method using Stripe
                        const { paymentMethod, error } = await stripe.createPaymentMethod({
                            type: 'card',
                            card: cardElement,
                        });

                        if (error) {
                            throw new Error(error.message);
                        }

                        paymentMethodId = paymentMethod.id;
                        accountDetail = paymentMethod.card.last4; // Last 4 digits of the card
                    } else {
                        switch (form.id) {
                            case 'upiPaymentFormElement':
                                method = 'UPI Payment';
                                accountDetail = document.getElementById('upiId').value;
                                break;
                            case 'netBankingFormElement':
                                method = 'Net Banking';
                                accountDetail = document.getElementById('accountNumber').value;
                                break;
                            case 'mobileWalletFormElement':
                                method = 'Mobile Wallet';
                                accountDetail = document.getElementById('walletNumber').value;
                                break;
                        }
                    }

                    // Prepare transaction data to match the Transaction entity
                    const transactionData = {
                        amount: parseFloat(amount),
                        transactionType: method,
                        accountDetail: accountDetail,
                        user: {
                            mobileNumber: mobileNumber
                        }
                    };

                    console.log('Sending transaction data:', transactionData);

                    // Send transaction data to the backend
                    const response = await fetch('http://localhost:8083/api/transactions/save' + (paymentMethodId ? `?paymentMethodId=${paymentMethodId}` : ''), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` // Include JWT token if user is logged in
                        },
                        body: JSON.stringify(transactionData)
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Server response:', errorText);
                        throw new Error('Failed to save transaction');
                    }

                    // Redirect to receipt page after successful transaction save
                    setTimeout(() => {
                        window.location.href = `receipt.html?amount=${encodeURIComponent(amount)}&method=${encodeURIComponent(method)}&accountDetail=${encodeURIComponent(accountDetail)}&mobile=${encodeURIComponent(mobileNumber)}`;
                    }, 1000);
                } catch (error) {
                    console.error('Error saving transaction:', error);
                    alert('Failed to process payment. Please try again: ' + error.message);
                    submitBtn.innerHTML = '<i class="bi bi-wallet me-2"></i>Pay Now';
                    submitBtn.disabled = false;

                    if (form.id === 'cardPaymentFormElement') {
                        const displayError = document.getElementById('cardErrors');
                        displayError.textContent = error.message;
                        displayError.style.display = 'block';
                    }
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