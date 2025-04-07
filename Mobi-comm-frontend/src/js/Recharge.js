document.querySelectorAll(".select-plan").forEach(button => {
    button.addEventListener("click", function (event) {
        event.preventDefault();
        const amount = this.getAttribute("data-amount");
        const amountInput = document.getElementById("amount");
        if (amountInput) {
            amountInput.value = amount;
        }
    });
});
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
});
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const mobileNumber = urlParams.get('mobile');
    if (mobileNumber) {
const mobileInput = document.getElementById('mobile');
if (mobileInput) {
    mobileInput.value = mobileNumber;
}
}
});
document.addEventListener('DOMContentLoaded', function () {
    // Get amount from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const amount = urlParams.get('amount');
    // If amount exists in URL, set it in the amount input
    if (amount) {
        const amountInput = document.getElementById('amount');
        if (amountInput) {
            amountInput.value = amount;
        }
    }
    // Plan selection from recharge plans section
    document.querySelectorAll(".select-plan").forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            const amount = this.getAttribute("data-amount");
            const amountInput = document.getElementById("amount");
            if (amountInput) {
                amountInput.value = amount;
            }
        });
    });
});
// scoll to top
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
//validation
document.getElementById('rechargeForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevents form submission and redirection
    let isValid = true;
    const mobileInput = document.getElementById('mobile');
    const amountInput = document.getElementById('amount');
    const mobileError = document.getElementById('mobile-error');
    const amountError = document.getElementById('amount-error');

    // Mobile Number Validation
    const mobileNumber = mobileInput.value.trim();
    if (mobileNumber === '') {
        mobileError.textContent = 'Please enter a mobile number';
        mobileError.style.display = 'block';
        isValid = false;
    } else if (!/^\d+$/.test(mobileNumber)) {
        mobileError.textContent = 'Please enter a valid number';
        mobileError.style.display = 'block';
        isValid = false;
    } else if (mobileNumber.length !== 10) {
        mobileError.textContent = 'Please enter a valid 10-digit mobile number';
        mobileError.style.display = 'block';
        isValid = false;
    } else {
        mobileError.style.display = 'none';
    }
    // Amount Validation
    const amount = amountInput.value.trim();
    if (amount === "" || isNaN(amount) || Number(amount) <= 28) {
        amountError.textContent = 'Oops our starting plan amount is ₹29';
        amountError.style.display = 'block';
        isValid = false;
    } else {
        amountError.style.display = 'none';
    }
    if (isValid) {
  window.location.href = `Payment.html?amount=${amountInput.value}&mobile=${mobileNumber}`;    
        }
});