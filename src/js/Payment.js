

        // Scroll to top functionality 
        window.onscroll = function () {
            let scrollBtn = document.getElementById("scrollTopBtn");
            if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
                scrollBtn.style.display = "block";
            } else {
                scrollBtn.style.display = "none";
            }
        };

        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }

      window.onload = function () {
    // Get amount from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const amount = urlParams.get('amount');
    console.log("Amount from URL:", amount);

    // Get mobile number from URL parameter
    const mobileNumber = urlParams.get('mobile'); // Corrected parameter name
    console.log("Mobile number from URL:", mobileNumber);

    // Set amount for all payment forms using class selector
    if (amount) {
        const amountFields = document.querySelectorAll('.payment-amount');
        amountFields.forEach(field => {
            field.value = amount;
            console.log("Amount set for field:", field.id);
        });
    }

    // Set mobile number for all payment forms using class selector
    if (mobileNumber) {
        const mobileNumberFields = document.querySelectorAll('.payment-mobile-number');
        mobileNumberFields.forEach(field => {
            field.value = mobileNumber;
            console.log("Mobile number set for field:", field.id);
        });
    }

    // Format card number input with spaces
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 16) value = value.slice(0, 16);
            // Insert spaces every 4 digits
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = value;
        });
    }

    // Format expiry date with slash
    const expiryDateInput = document.getElementById('expiryDate');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 4) value = value.slice(0, 4);
            if (value.length > 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
            e.target.value = value;
        });
    }

    // Get all forms - FIX: Define the forms array
    const forms = [
        document.getElementById('cardPaymentFormElement'),
        document.getElementById('upiPaymentFormElement'),
        document.getElementById('netBankingFormElement'),
        document.getElementById('mobileWalletFormElement')
    ];
    
    // Form validation and redirection
    forms.forEach(form => {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                form.classList.add('was-validated');
            } else {
                event.preventDefault();
                
                // Get the payment method from the form id
                let method = '';
                let accountDetail = '';

                if (form.id === 'cardPaymentFormElement') {
                    method = 'Card Payment';
                    accountDetail = document.getElementById('cardNumber').value;
                } else if (form.id === 'upiPaymentFormElement') {
                    method = 'UPI Payment';
                    accountDetail = document.getElementById('upiId').value;
                } else if (form.id === 'netBankingFormElement') {
                    method = 'Net Banking';
                    accountDetail = document.getElementById('accountNumber').value;
                } else if (form.id === 'mobileWalletFormElement') {
                    method = 'Mobile Wallet';
                    accountDetail = document.getElementById('walletNumber').value;
                }
                
                // Get the amount from the respective form
                const amountField = form.querySelector('[name="amount"]');
                const amount = amountField ? amountField.value : '';

                // Get the mobile number from the respective form
                const mobileNumberField = form.querySelector('[name="mobileNumber"]');
                const mobileNumber = mobileNumberField ? mobileNumberField.value : '';
                
                // Show processing state
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
                submitBtn.disabled = true;
                
                // Redirect after 2 seconds to simulate processing
                setTimeout(() => {
                    // Redirect with all parameters
                    window.location.href = `receipt.html?amount=${amount}&method=${method}&accountDetail=${accountDetail}&mobile=${mobileNumber}`;
                }, 2000);
            }
        });
    });
};
    