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

    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '').slice(0, 16);
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = value;
        });
    }

    // Expiry date formatting
    const expiryDateInput = document.getElementById('expiryDate');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '').slice(0, 4);
            if (value.length > 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
            e.target.value = value;
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

                switch (form.id) {
                    case 'cardPaymentFormElement':
                        method = 'Card Payment';
                        accountDetail = document.getElementById('cardNumber').value;
                        break;
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

                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
                submitBtn.disabled = true;

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

                try {
                    // Send transaction data to the backend
                    const response = await fetch('http://localhost:8083/api/transactions/save', {
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
                    alert('Failed to process payment. Please try again.');
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