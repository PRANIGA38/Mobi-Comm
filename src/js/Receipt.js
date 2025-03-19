

        // Show button when scrolling down
        window.onscroll = function () {
            let scrollBtn = document.getElementById("scrollTopBtn");
            if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
                scrollBtn.style.display = "block";
            } else {
                scrollBtn.style.display = "none";
            }
        };

        // Scroll to top function
        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    

        // Function to share receipt - defined outside window.onload for global scope
        function shareReceipt() {
            // Create shareable content
            const transactionId = document.getElementById('transactionId').textContent;
            const amount = document.getElementById('amount').textContent;

            const shareText = `I've successfully recharged my Mobi-comm account with ${amount}. Transaction ID: ${transactionId}`;

            // Check if Web Share API is available
            if (navigator.share) {
                navigator.share({
                    title: 'Mobi-comm Recharge Receipt',
                    text: shareText,
                })
                    .catch(err => {
                        alert('Sharing failed. You can copy your transaction ID manually.');
                    });
            } else {
                // Fallback for browsers that don't support Web Share API
                alert(`Share this information:\n\n${shareText}`);
            }
        }

        window.onload = function() {
    // Utility functions
    const generateTransactionId = () => {
        return 'MBTXN' + Math.random().toString(36).substr(2, 9).toUpperCase();
    };

    const formatDateTime = () => {
        const now = new Date();
        return now.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const getPaymentIcon = (method) => {
        const methodLower = method.toLowerCase();
        if (methodLower.includes('upi')) {
            return 'bi-phone';
        } else if (methodLower.includes('net')) {
            return 'bi-bank';
        } else if (methodLower.includes('wallet')) {
            return 'bi-wallet';
        }
        return 'bi-credit-card';
    };

    const maskAccountNumber = (account) => {
        if (!account) return '';
        const lastFour = account.slice(-4);
        return `xxxx-xxxx-xxxx-${lastFour}`;
    };

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Set receipt details
    const setReceiptDetails = () => {
        // Amount
        const amount = urlParams.get('amount') || '499';
        document.getElementById('amount').textContent = 
            amount.startsWith('₹') ? amount : '₹' + amount;

        // Payment Method
        const paymentMethod = urlParams.get('method') || 'Card Payment';
        const paymentIcon = getPaymentIcon(paymentMethod);
        document.getElementById('paymentMethod').innerHTML = 
            `<i class="${paymentIcon} me-1"></i> ${paymentMethod}`;

        // Mobile Number - Check URL parameters first, then input field
        const urlMobile = urlParams.get('mobile');
        const inputMobile = document.querySelector('input[name="mobile"]')?.value;
        const mobileNumber = urlMobile || inputMobile || '9876543210';
        
        // Set mobile number to both display and input field if it exists
        document.getElementById('mobileNumber').textContent = mobileNumber;
        const mobileInput = document.querySelector('input[name="mobile"]');
        if (mobileInput) {
            mobileInput.value = mobileNumber;
        }

        // Transaction ID / Account Details
        const accountDetail = urlParams.get('accountDetail');
        const transactionId = accountDetail ? 
            maskAccountNumber(accountDetail) : 
            generateTransactionId();
        document.getElementById('transactionId').textContent = transactionId;

        // Date and Time
        document.getElementById('dateTime').textContent = formatDateTime();
    };

    // Animate elements
    const animateElements = () => {
        document.querySelectorAll('.detail-row').forEach((row, index) => {
            row.style.animation = `fadeInUp 0.4s ease forwards ${0.4 + (index * 0.1)}s`;
            row.style.opacity = 0;
            row.style.transform = 'translateY(10px)';
        });
    };

    // Listen for mobile number input changes
    const mobileInput = document.querySelector('input[name="mobile"]');
    if (mobileInput) {
        mobileInput.addEventListener('input', (e) => {
            document.getElementById('mobileNumber').textContent = e.target.value || '9876543210';
        });
    }

    // Initialize receipt
    setReceiptDetails();
    animateElements();
};
    