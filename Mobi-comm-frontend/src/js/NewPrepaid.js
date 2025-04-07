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
        const formData = {
            name: form.name.value,
            number: form.number.value,
            email: form.email.value,
            address: form.address.value,
            idProof: form.idProof.value,
            idNumber: form.idNumber.value
        };

        fetch('http://localhost:8083/api/newprepaid/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            showSuccessMessage();
        })
        .catch(error => {
            console.error('Error:', error);
            if (error.message === "Phone number is already registered in the users table") {
                errors.number.textContent = "This phone number is already registered";
                errors.number.style.display = 'block';
            } else if (error.message === "Email is already registered in the newuser table") {
                errors.email.textContent = "This email is already registered";
                errors.email.style.display = 'block';
            } else {
                alert('Failed to submit the application: ' + error.message);
            }
        });
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