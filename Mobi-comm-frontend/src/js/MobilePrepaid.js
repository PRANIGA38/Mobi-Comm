// Recharge functionality
document.getElementById('recharge-btn').addEventListener('click', async function () {
    const mobileInput = document.getElementById('mobile');
    const mobileError = document.getElementById('mobile-error');
    const mobileNumber = mobileInput.value.trim();

    // Reset previous styles
    mobileError.style.display = 'none';
    mobileInput.style.borderColor = '';

    // Validate Mobile Number
    if (!mobileNumber) {
        mobileError.textContent = 'Please enter a number';
        mobileError.style.display = 'block';
        mobileInput.style.borderColor = '#dc3545';
        return;
    }
    if (isNaN(mobileNumber) || !/^\d+$/.test(mobileNumber)) {
        mobileError.textContent = 'Please enter a valid number';
        mobileError.style.display = 'block';
        mobileInput.style.borderColor = '#dc3545';
        return;
    }
    if (mobileNumber.length !== 10) {
        mobileError.textContent = 'Please enter a valid 10-digit mobile number';
        mobileError.style.display = 'block';
        mobileInput.style.borderColor = '#dc3545';
        return;
    }

    mobileInput.style.borderColor = '#28a745';

    try {
        const response = await fetch('http://localhost:8083/api/recharge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || ''}`
            },
            body: JSON.stringify({ mobileNumber })
        });

        if (response.ok) {
            const data = await response.json();
            mobileError.textContent = data.id ? 'Number validated successfully!' : 'New number saved successfully!';
            mobileError.style.color = '#28a745';
            mobileError.style.display = 'block';
            setTimeout(() => {
                window.location.href = `/src/pages/View_Plans.html?mobile=${mobileNumber}`;
            }, 1000);
        } else {
            const errorText = await response.text();
            mobileError.textContent = errorText || 'Failed to process number';
            mobileError.style.display = 'block';
            mobileInput.style.borderColor = '#dc3545';
        }
    } catch (error) {
        mobileError.textContent = error.message || 'An error occurred. Please try again.';
        mobileError.style.display = 'block';
        mobileInput.style.borderColor = '#dc3545';
    }
});

// Navigation active state
document.addEventListener("DOMContentLoaded", function () {
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.parentElement.classList.add("active");
        }
    });
});

// Smooth scrolling, carousel, and UI enhancements
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    var carousel = new bootstrap.Carousel(document.getElementById('mainCarousel'), {
        interval: 5000,
        wrap: true,
        pause: 'hover'
    });
});

// Scroll animations and button
window.addEventListener('scroll', function () {
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(element => {
        const position = element.getBoundingClientRect();
        if (position.top < window.innerHeight && position.bottom >= 0) {
            element.classList.add('animate-slide-up');
        }
    });

    let scrollBtn = document.getElementById("scrollTopBtn");
    scrollBtn.style.display = (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) ? "block" : "none";
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

window.addEventListener('load', function () {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.style.transition = 'opacity 0.5s ease';
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }, 1000);
});

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
            // Optionally redirect to login page
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

// Load user profile icon on page load
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('jwtToken');
    const userProfileIcon = document.getElementById('userProfileIcon');

    if (token) {
        try {
            const response = await fetchWithAuth('http://localhost:8083/api/users/profile', { method: 'GET' }, true);
            const user = await response.json();

            // Update profile icon with picture or initial
            const storedImage = localStorage.getItem('profileImage');
            if (storedImage || user.profilePicture) {
                const imageSrc = storedImage || user.profilePicture;
                userProfileIcon.innerHTML = `<img src="${imageSrc}" alt="Profile" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;">`;
            } else {
                const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
                userProfileIcon.innerHTML = `<div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background-color: #5680E9; color: white; font-size: 20px;">${initial}</div>`;
            }
        } catch (error) {
            // If no valid user data, show default bi-person-circle icon
            userProfileIcon.innerHTML = `<i class="bi bi-person-circle" style="font-size: 40px; color: white;"></i>`;
        }
    } else {
        // If no token, show default bi-person-circle icon
        userProfileIcon.innerHTML = `<i class="bi bi-person-circle" style="font-size: 30px; color: white;"></i>`;
    }
});