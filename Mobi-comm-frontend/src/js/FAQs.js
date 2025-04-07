

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

        // Smooth Scrolling
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
    