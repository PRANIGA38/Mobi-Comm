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

// FAQ Interaction
document.querySelectorAll('.faq-question').forEach(item => {
    item.addEventListener('click', () => {
        // Toggle active class
        item.classList.toggle('active');

        // Toggle answer visibility with animation
        let answer = item.nextElementSibling;
        if (answer.style.display === 'block') {
            answer.classList.remove('show');
            setTimeout(() => {
                answer.style.display = 'none';
            }, 500); // Match this with the CSS animation duration
        } else {
            answer.style.display = 'block';
            setTimeout(() => {
                answer.classList.add('show');
            }, 10); // Small delay to ensure display:block has taken effect
        }
    });
});

// Smooth Scrolling and Profile Update
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
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