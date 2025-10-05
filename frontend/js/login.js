/**
 * Login Page JavaScript
 * Handles user authentication
 */

const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const alertBox = document.getElementById('alertBox');

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password');

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

    setTimeout(() => {
        alertBox.className = 'alert';
    }, 5000);
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
    clearFieldError('email');
    clearFieldError('password');
}

// Validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Set loading state
function setLoading(isLoading) {
    if (isLoading) {
        loginBtn.disabled = true;
        loginBtn.classList.add('loading');
    } else {
        loginBtn.disabled = false;
        loginBtn.classList.remove('loading');
    }
}

// Save auth token
function saveAuthToken(token) {
    localStorage.setItem('authToken', token);

    // If remember me is checked, also save to localStorage
    const rememberMe = document.getElementById('rememberMe').checked;
    if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
    }
}

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    clearAllErrors();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Validation
    let hasError = false;

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

    if (hasError) return;

    setLoading(true);

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Success!
        if (data.success && data.token) {
            showAlert('Login successful! Redirecting...', 'success');

            // Save token
            saveAuthToken(data.token);

            // Save user info
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            throw new Error('Invalid response from server');
        }

    } catch (error) {
        console.error('Login error:', error);
        showAlert(error.message || 'An error occurred during login. Please try again.');
        setLoading(false);
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

// Clear errors on input
document.getElementById('email').addEventListener('input', () => clearFieldError('email'));
document.getElementById('password').addEventListener('input', () => clearFieldError('password'));

// Check for existing authentication on page load
checkExistingAuth();

// Handle forgot password
document.querySelector('.forgot-password').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Password reset feature coming soon!');
});
