const OTP_EXPIRY_TIME = 60; // seconds
let otpExpiryTimer = null;

function showForm(type) {
    const mobileLogin = document.getElementById('mobileLogin');
    const adminLogin = document.getElementById('adminLogin');
    const buttons = document.querySelectorAll('.toggle-btn');

    buttons.forEach(btn => btn.classList.remove('active'));
    if (type === 'mobile') {
        mobileLogin.style.display = 'block';
        adminLogin.style.display = 'none';
        buttons[0].classList.add('active');
    } else {
        mobileLogin.style.display = 'none';
        adminLogin.style.display = 'block';
        buttons[1].classList.add('active');
    }
}

function validateMobile(mobile) {
    return /^[6-9]\d{9}$/.test(mobile);
}

function startOTPTimer() {
    let timeLeft = OTP_EXPIRY_TIME;
    const timerElement = document.getElementById('timer');
    const resendBtn = document.getElementById('resend-btn');

    if (otpExpiryTimer) clearInterval(otpExpiryTimer);
    resendBtn.disabled = true;
    timerElement.textContent = `${timeLeft}s`;

    otpExpiryTimer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(otpExpiryTimer);
            timerElement.textContent = 'Expired';
            resendBtn.disabled = false;
        }
    }, 1000);
}

async function sendOTP(mobile) {
    try {
        const response = await fetch('http://localhost:8083/api/auth/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || ''}`
            },
            body: JSON.stringify({ mobileNumber: mobile })
        });

        if (!response.ok) throw new Error(await response.text() || 'Failed to send OTP');

        const otpModal = new bootstrap.Modal(document.getElementById('otpModal'));
        otpModal.show();
        document.getElementById('mobile-container').style.display = 'none';
        document.getElementById('otp-container').style.display = 'block';
        document.getElementById('mobile-display').textContent = mobile;
        document.getElementById('otpMobileDisplay').textContent = mobile;
        startOTPTimer();
    } catch (error) {
        document.getElementById('mobile-error').textContent = error.message;
        document.getElementById('mobile-error').style.display = 'block';
    }
}

function resendOTP() {
    const mobile = document.getElementById('mobile').value.trim();
    if (validateMobile(mobile)) sendOTP(mobile);
}

async function verifyOTP() {
    const enteredOTP = document.getElementById('otp-input').value.trim();
    const otpError = document.getElementById('otp-error');
    const mobile = document.getElementById('mobile').value.trim();

    if (!enteredOTP) {
        otpError.textContent = 'Please enter the OTP';
        otpError.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('http://localhost:8083/api/auth/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || ''}`
            },
            body: JSON.stringify({ mobileNumber: mobile, otp: enteredOTP })
        });

        if (!response.ok) throw new Error(await response.text() || 'Invalid OTP');

        const token = await response.text();
        localStorage.setItem('jwtToken', token);
        otpError.style.display = 'none';
        clearInterval(otpExpiryTimer);
        document.getElementById('otp-container').style.display = 'none';
        document.getElementById('success-container').style.display = 'block';
        await checkUserRole(token);
    } catch (error) {
        otpError.textContent = error.message;
        otpError.style.display = 'block';
    }
}

function goBackToMobile() {
    document.getElementById('mobile-container').style.display = 'block';
    document.getElementById('otp-container').style.display = 'none';
    document.getElementById('otp-input').value = '';
    document.getElementById('otp-error').style.display = 'none';
    clearInterval(otpExpiryTimer);
}

document.getElementById('otpForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const mobile = document.getElementById('mobile').value.trim();
    const mobileError = document.getElementById('mobile-error');

    if (!validateMobile(mobile)) {
        mobileError.textContent = 'Please enter a valid 10-digit mobile number';
        mobileError.style.display = 'block';
        return;
    }
    mobileError.style.display = 'none';
    sendOTP(mobile);
});

document.getElementById('adminForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');

    usernameError.style.display = username ? 'none' : 'block';
    passwordError.style.display = password ? 'none' : 'block';
    if (!username || !password) return;

    const button = this.querySelector('button[type="submit"]');
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
    button.disabled = true;

    try {
        const response = await fetch('http://localhost:8083/api/auth/admin-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || ''}`
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) throw new Error(await response.text() || 'Invalid credentials');

        const token = await response.text();
        localStorage.setItem('jwtToken', token);
        await checkAdminRole(token);
    } catch (error) {
        showPopup(error.message, false);
    } finally {
        button.innerHTML = 'Login';
        button.disabled = false;
    }
});

async function checkUserRole(token) {
    try {
        const response = await fetch('http://localhost:8083/api/users/profile', { // Fixed endpoint typo
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            showPopup('Login successful! Redirecting to profile...', true);
            setTimeout(() => window.location.href = '/src/pages/profile.html', 1000);
        } else {
            throw new Error('Unauthorized');
        }
    } catch (error) {
        showPopup('Access denied', false);
    }
}

async function checkAdminRole(token) {
    try {
        const response = await fetch('http://localhost:8083/api/admin/plans', { // Changed to a valid admin endpoint
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            showPopup('Login successful! Redirecting to admin...', true);
            setTimeout(() => window.location.href = '/src/pages/admin.html', 1000);
        } else {
            throw new Error('Unauthorized');
        }
    } catch (error) {
        showPopup('Access denied', false);
    }
}

document.getElementById('mobile').addEventListener('input', function () {
    const error = document.getElementById('mobile-error');
    if (this.value.length > 0 && !/^\d+$/.test(this.value)) {
        error.textContent = 'Please enter numbers only';
        error.style.display = 'block';
    } else if (this.value.length === 10 && validateMobile(this.value)) {
        error.style.display = 'none';
    } else if (this.value.length > 0) {
        error.textContent = 'Please enter a valid 10-digit mobile number';
        error.style.display = 'block';
    } else {
        error.style.display = 'none';
    }
});

document.getElementById('otp-input').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 6);
    document.getElementById('otp-error').style.display = this.value.length > 0 ? 'none' : 'block';
});

function showPopup(message, isSuccess) {
    const existingPopup = document.querySelector('.popup-message');
    if (existingPopup) existingPopup.remove();

    const popup = document.createElement('div');
    popup.className = `popup-message ${isSuccess ? 'popup-success' : 'popup-error'}`;
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => popup.classList.add('fade-in'), 10);
    setTimeout(() => {
        popup.classList.remove('fade-in');
        setTimeout(() => popup.remove(), 300);
    }, 3000);
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

const passwordInput = document.getElementById('password');
passwordInput.addEventListener('input', function () {
    const strength = this.value.length;
    this.style.borderColor = strength === 0 ? '#E1E1E1' :
        strength < 6 ? '#FF6B6B' :
        strength < 10 ? '#FFA500' : '#4CAF50';
});

window.onscroll = function () {
    document.getElementById("scrollTopBtn").style.display =
        (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) ? "block" : "none";
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}