/**
 * Auth Guard - Frontend Route Protection
 * Handles user authentication checks
 */

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
}

/**
 * Get current user data
 */
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

/**
 * Protect page - require authentication
 * Redirects to login if not authenticated
 */
function requireAuth(redirectUrl = 'login.html') {
    if (!isAuthenticated()) {
        alert('You must be logged in to access this page.');
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

/**
 * Logout user
 */
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    window.location.href = 'login.html';
}

/**
 * Get auth token for API requests
 */
function getAuthToken() {
    return localStorage.getItem('authToken');
}

/**
 * Get auth headers for fetch requests
 */
function getAuthHeaders() {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

/**
 * Make authenticated API request
 */
async function authFetch(url, options = {}) {
    const token = getAuthToken();

    if (!token) {
        throw new Error('No authentication token found');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
        alert('Your session has expired. Please login again.');
        logout();
        throw new Error('Authentication expired');
    }

    // Handle 403 Forbidden - insufficient permissions
    if (response.status === 403) {
        const data = await response.json();
        alert(`Access Denied: ${data.message || 'Insufficient permissions'}`);
        throw new Error(data.message || 'Forbidden');
    }

    return response;
}

/**
 * Show user info in navbar or header
 */
function displayUserInfo(elementId = 'userInfo') {
    const user = getCurrentUser();
    const element = document.getElementById(elementId);

    if (element && user) {
        element.innerHTML = `
            <span class="user-name">${user.name}</span>
        `;
    }
}
