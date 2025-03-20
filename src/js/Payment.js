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
            form.addEventListener('submit', function (event) {
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

                setTimeout(() => {
                    window.location.href = `receipt.html?amount=${encodeURIComponent(amount)}&method=${encodeURIComponent(method)}&accountDetail=${encodeURIComponent(accountDetail)}&mobile=${encodeURIComponent(mobileNumber)}`;
                }, 2000);
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