
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


     function validateForm(event) {
         event.preventDefault();
         
         const form = {
             name: document.getElementById("name"),
             number: document.getElementById("number"),
             email: document.getElementById("email"),
             address: document.getElementById("address"),
             idProof: document.getElementById("id-proof"),
             idNumber: document.getElementById("id-number")
         };
         
         const errors = {
             name: document.getElementById("nameError"),
             number: document.getElementById("numberError"),
             email: document.getElementById("emailError"),
             address: document.getElementById("addressError"),
             idProof: document.getElementById("idProofError"),
             idNumber: document.getElementById("idNumberError")
         };
         
         const validation = {
             phone: /^[0-9]{10}$/,
             email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
         };

         // Clear previous errors
         Object.values(errors).forEach(error => {
             error.style.display = 'none';
             error.textContent = '';
         });

         let isValid = true;

         // Validate name
         if (form.name.value.trim() === "") {
             errors.name.textContent = "Full Name is required";
             errors.name.style.display = 'block';
             isValid = false;
         }
         
         // Validate phone number
         if (!validation.phone.test(form.number.value)) {
             errors.number.textContent = "Enter a valid 10-digit phone number";
             errors.number.style.display = 'block';
             isValid = false;
         }
         
         // Validate email
         if (!validation.email.test(form.email.value)) {
             errors.email.textContent = "Enter a valid email address";
             errors.email.style.display = 'block';
             isValid = false;
         }
         
         // Validate address
         if (form.address.value.trim() === "") {
             errors.address.textContent = "SIM Delivery Address is required";
             errors.address.style.display = 'block';
             isValid = false;
         }
         
         // Validate ID proof selection
         if (form.idProof.value === "") {
             errors.idProof.textContent = "Please select an ID proof type";
             errors.idProof.style.display = 'block';
             isValid = false;
         }
         
         // Validate ID number
         if (form.idNumber.value.trim() === "") {
             errors.idNumber.textContent = "ID Number is required";
             errors.idNumber.style.display = 'block';
             isValid = false;
         }
         
         if (isValid) {
             showSuccessMessage();
         }
         
         return isValid;
     }

     function showSuccessMessage() {
         const overlay = document.getElementById("overlay");
         const successMessage = document.getElementById("successMessage");
         
         overlay.style.display = "block";
         successMessage.style.display = "block";
         
         setTimeout(() => {
             overlay.style.opacity = "1";
             successMessage.style.opacity = "1";
         }, 10);
     }

     // Enhanced form interactivity
     document.addEventListener("DOMContentLoaded", function() {
         const inputs = document.querySelectorAll('input, textarea, select');
         
         inputs.forEach(input => {
             input.addEventListener('focus', function() {
                 this.closest('.form-group').style.transform = 'translateX(5px)';
             });
             
             input.addEventListener('blur', function() {
                 this.closest('.form-group').style.transform = 'translateX(0)';
             });
         });
     });
 