/**
 * Register Page JavaScript
 * Handles user registration
 */

const registerForm = document.getElementById('registerForm');
const registerBtn = document.getElementById('registerBtn');
const alertBox = document.getElementById('alertBox');

// Toggle password visibility
function togglePassword(fieldId) {
    const passwordInput = document.getElementById(fieldId);
    const toggleIcon = passwordInput.nextElementSibling;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = '👁️';
    }
}

// Show alert message
function showAlert(message, type = 'error') {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type} show`;

    if (type === 'success') {
        setTimeout(() => {
            alertBox.className = 'alert';
        }, 3000);
    } else {
        setTimeout(() => {
            alertBox.className = 'alert';
        }, 5000);
    }
}

// Show field error
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(`${fieldId}Error`);

    field.classList.add('error');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

// Clear field error
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(`${fieldId}Error`);

    field.classList.remove('error');
    errorDiv.textContent = '';
    errorDiv.classList.remove('show');
}

// Clear all errors
function clearAllErrors() {
    clearFieldError('name');
    clearFieldError('email');
    clearFieldError('password');
    clearFieldError('confirmPassword');
}

// Validate email format
function validateEmail(email) {
    // Standard email validation regex
    // Allows most common email formats
    // const re = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    // return re.test(String(email).toLowerCase());
    return true;

}

// Set loading state
function setLoading(isLoading) {
    if (isLoading) {
        registerBtn.disabled = true;
        registerBtn.classList.add('loading');
    } else {
        registerBtn.disabled = false;
        registerBtn.classList.remove('loading');
    }
}

// Handle registration form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    clearAllErrors();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validation
    let hasError = false;

    if (!name) {
        showFieldError('name', 'Name is required');
        hasError = true;
    } else if (name.length < 2) {
        showFieldError('name', 'Name must be at least 2 characters');
        hasError = true;
    }

    if (!email) {
        showFieldError('email', 'Email is required');
        hasError = true;
    } else if (!validateEmail(email)) {
        showFieldError('email', 'Please enter a valid email');
        hasError = true;
    }

    if (!password) {
        showFieldError('password', 'Password is required');
        hasError = true;
    } else if (password.length < 6) {
        showFieldError('password', 'Password must be at least 6 characters');
        hasError = true;
    }

    if (!confirmPassword) {
        showFieldError('confirmPassword', 'Please confirm your password');
        hasError = true;
    } else if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'Passwords do not match');
        hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        // Success!
        if (data.success && data.token) {
            showAlert('Registration successful! Redirecting to login...', 'success');

            // Save token (optional - could auto-login)
            localStorage.setItem('authToken', data.token);

            // Save user info
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            throw new Error('Invalid response from server');
        }

    } catch (error) {
        console.error('Registration error:', error);
        showAlert(error.message || 'An error occurred during registration. Please try again.');
        setLoading(false);
    }
});

// Clear errors on input
document.getElementById('name').addEventListener('input', () => clearFieldError('name'));
document.getElementById('email').addEventListener('input', () => clearFieldError('email'));
document.getElementById('password').addEventListener('input', () => clearFieldError('password'));
document.getElementById('confirmPassword').addEventListener('input', () => clearFieldError('confirmPassword'));

// Password match validation on typing
document.getElementById('confirmPassword').addEventListener('input', () => {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (confirmPassword && password !== confirmPassword) {
        showFieldError('confirmPassword', 'Passwords do not match');
    } else {
        clearFieldError('confirmPassword');
    }
});

// Check if already logged in
function checkExistingAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');

    if (token && user) {
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }
}

// Check for existing authentication on page load
checkExistingAuth();
