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

// Form submission handler
document.getElementById('feedbackForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Reset error messages
    document.getElementById('nameError').innerText = '';
    document.getElementById('emailError').innerText = '';
    document.getElementById('phoneError').innerText = '';
    document.getElementById('feedbackError').innerText = '';

    let isValid = true;

    // Validate name
    const nameInput = document.getElementById('name');
    if (nameInput.value.trim() === '') {
        document.getElementById('nameError').innerText = 'Please enter your name!';
        isValid = false;
    }

    // Validate email
    const emailInput = document.getElementById('email');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailInput.value.trim() === '') {
        document.getElementById('emailError').innerText = 'Please enter your email!';
        isValid = false;
    } else if (!emailRegex.test(emailInput.value)) {
        document.getElementById('emailError').innerText = 'Invalid email format!';
        isValid = false;
    }

    // Validate phone number
    const phoneInput = document.getElementById('phone');
    const phoneRegex = /^\d{10}$/;
    if (phoneInput.value.trim() === '') {
        document.getElementById('phoneError').innerText = 'Please enter your phone number!';
        isValid = false;
    } else if (!phoneRegex.test(phoneInput.value)) {
        document.getElementById('phoneError').innerText = 'Invalid phone number format!';
        isValid = false;
    }

    // Validate feedback
    const feedbackInput = document.getElementById('feedback');
    if (feedbackInput.value.trim() === '') {
        document.getElementById('feedbackError').innerText = 'Please enter your feedback!';
        isValid = false;
    }

    if (isValid) {
        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) {
            alert('Please log in to submit feedback.');
            window.location.href = '/src/pages/account.html';
            return;
        }

        const feedbackData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            feedbackText: feedbackInput.value.trim()
        };

        fetchWithAuth('http://localhost:8083/api/feedback/submit', {
            method: 'POST',
            body: JSON.stringify(feedbackData)
        })
        .then(response => response.text())
        .then(data => {
            const popup = document.getElementById('thankYouPopup');
            popup.style.display = 'block';
            this.reset();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to submit feedback. Please try again or contact support.');
        });
    }
});

function closePopup() {
    const popup = document.getElementById('thankYouPopup');
    popup.style.display = 'none';
}

// Close popup when clicking outside
document.getElementById('thankYouPopup').addEventListener('click', function(e) {
    if (e.target === this) {
        closePopup();
    }
});

// Show button when scrolling down
window.onscroll = function() {
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

// Smooth Scrolling and Profile Update
document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            e.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: "smooth"
                });
            }
        });
    });

    // Create floating particles
    createParticles();

    // Update profile icon
    const token = localStorage.getItem('jwtToken');
    const userProfileIcon = document.getElementById('userProfileIcon');

    if (token) {
        fetchWithAuth('http://localhost:8083/api/users/profile', { method: 'GET' }, true)
            .then(response => response.json())
            .then(user => {
                // Update profile icon with picture or initial
                const storedImage = localStorage.getItem('profileImage');
                if (storedImage || user.profilePicture) {
                    const imageSrc = storedImage || user.profilePicture;
                    userProfileIcon.innerHTML = `<img src="${imageSrc}" alt="Profile" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;">`;
                } else {
                    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
                    userProfileIcon.innerHTML = `<div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background-color: #8860D0; color: white; font-size: 20px;">${initial}</div>`;
                }
            })
            .catch(error => {
                // If no valid user data, show default bi-person-circle icon
                userProfileIcon.innerHTML = `<i class="bi bi-person-circle" style="font-size: 40px; color: white;"></i>`;
            });
    } else {
        // If no token, show default bi-person-circle icon
        userProfileIcon.innerHTML = `<i class="bi bi-person-circle" style="font-size: 40px; color: white;"></i>`;
    }
});

// Particle Background
function createParticles() {
    const colors = ['#5680E9', '#84CEEB', '#5AB9EA', '#C1C8E4', '#8860D0'];
    const particles = document.getElementById('particles');

    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Random properties
        const size = Math.random() * 20 + 5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 10;

        // Apply styles
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = color;
        particle.style.left = `${left}%`;
        particle.style.bottom = `-${size}px`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;

        particles.appendChild(particle);
    }
}