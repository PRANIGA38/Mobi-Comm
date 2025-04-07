// Show button when scrolling down
window.onscroll = function () {
    let scrollBtn = document.getElementById("scrollTopBtn");
    if (scrollBtn) {
        scrollBtn.style.display = (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) ? "block" : "none";
    }
};

// Scroll to top function
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Function to share receipt - defined outside window.onload for global scope
function shareReceipt() {
    const transactionId = document.getElementById('transactionId').textContent;
    const amount = document.getElementById('amount').textContent;
    const mobileNumber = document.getElementById('mobileNumber').textContent;

    const shareText = `I've successfully recharged my Mobi-comm account with ${amount} for mobile number ${mobileNumber}. Transaction ID: ${transactionId}`;

    if (navigator.share) {
        navigator.share({
            title: 'Mobi-comm Recharge Receipt',
            text: shareText,
        })
        .catch(err => {
            alert('Sharing failed. You can copy your transaction details manually.');
        });
    } else {
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
        if (methodLower.includes('upi')) return 'bi-phone';
        if (methodLower.includes('net')) return 'bi-bank';
        if (methodLower.includes('wallet')) return 'bi-wallet';
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

        // Mobile Number
        const mobileNumber = urlParams.get('mobile') || '9876543210';
        document.getElementById('mobileNumber').textContent = mobileNumber;

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

    // Initialize receipt
    setReceiptDetails();
    animateElements();
};