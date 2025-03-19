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
                window.location.href = `/src/pages/Recharge.html?mobile=${mobileNumber}`;
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

// Smooth scrolling, carousel, and other UI enhancements remain unchanged
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