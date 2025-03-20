

        // Show success message on page load
        window.onload = function() {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('login') === 'success') {
                const successContainer = document.getElementById('success-container');
                successContainer.style.display = 'block';
                
                // Hide success message after 3 seconds
                setTimeout(function() {
                    successContainer.style.display = 'none';
                }, 3000);
            }
        };
        
        // Profile edit modal
        document.getElementById('editProfileBtn').addEventListener('click', function() {
            const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
            editProfileModal.show();
        });
        
        // Form validation
        (function () {
            'use strict'
            
            const forms = document.querySelectorAll('.needs-validation');
            
            Array.from(forms).forEach(form => {
                form.addEventListener('submit', event => {
                    if (!form.checkValidity()) {
                        event.preventDefault();
                        event.stopPropagation();
                    } else {
                        event.preventDefault();
                        const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
                        modal.hide();
                        showToast('Profile updated successfully!', 'success');
                    }
                    
                    form.classList.add('was-validated');
                }, false);
            });
        })();
        
        // Logout modal
        const logoutModal = document.getElementById('logoutModal');
        const logoutBtn = document.getElementById('logout');
        const closeBtn = document.getElementsByClassName('close')[0];
        const confirmLogoutBtn = document.getElementById('confirmLogout');
        const cancelLogoutBtn = document.getElementById('cancelLogout');
        
        logoutBtn.onclick = function() {
            logoutModal.style.display = 'block';
        }
        
        closeBtn.onclick = function() {
            logoutModal.style.display = 'none';
        }
        
        cancelLogoutBtn.onclick = function() {
            logoutModal.style.display = 'none';
        }
        
        confirmLogoutBtn.onclick = function() {
            window.location.href = 'Login.html';
        }
        
        window.onclick = function(event) {
            if (event.target == logoutModal) {
                logoutModal.style.display = 'none';
            }
        }
        
        // Scroll to top button
        window.onscroll = function() {
            scrollFunction();
        };
        
        function scrollFunction() {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                document.getElementById("scrollTopBtn").style.display = "block";
            } else {
                document.getElementById("scrollTopBtn").style.display = "none";
            }
        }
        
        function scrollToTop() {
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        }
        
        // Toast notifications
        function showToast(message, type = 'info') {
            const toastContainer = document.getElementById('toastContainer');
            const toastId = 'toast-' + Date.now();
            
            let toastBgClass = 'bg-info';
            if (type === 'success') toastBgClass = 'bg-success';
            if (type === 'warning') toastBgClass = 'bg-warning';
            if (type === 'danger') toastBgClass = 'bg-danger';
            
            const toastHtml = `
                <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
                    <div class="toast-header ${toastBgClass} text-white">
                        <strong class="me-auto">MobiComm</strong>
                        <small>Just now</small>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div class="toast-body">
                        ${message}
                    </div>
                </div>
            `;
            
            toastContainer.innerHTML += toastHtml;
            const toastElement = document.getElementById(toastId);
            const toast = new bootstrap.Toast(toastElement);
            toast.show();
            
            // Remove toast from DOM after it's hidden
            toastElement.addEventListener('hidden.bs.toast', function () {
                toastElement.remove();
            });
        }
        
        // Demo button actions with toast notifications
        document.getElementById('rechargeBtn').addEventListener('click', function() {
            window.location.href = 'MobilePrepaid.html';
        });
        
        document.getElementById('changePlanBtn').addEventListener('click', function() {
            window.location.href = 'View_Plans.html';
        });
        
        document.getElementById('viewAllTransactionsBtn').addEventListener('click', function() {
            showToast('No more Transactions history !', 'info');
        });
        
        document.getElementById('startChatBtn').addEventListener('click', function() {
            showToast('Chat support !', 'info');
        });
        
        // Notification Button
        document.getElementById('notificationBtn').addEventListener('click', function(e) {
            e.preventDefault();
            showToast('You have 3 new notifications!', 'info');
        });
        
        // Smooth Scrolling
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
        });