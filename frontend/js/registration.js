// Registration Form Handler
let selectedContestId = null;
let allContests = [];
let filteredContests = [];
let isLoggedIn = false;
let currentUser = null;

// Get authentication token (check both possible keys)
function getAuthToken() {
    return localStorage.getItem('authToken') || localStorage.getItem('token');
}

// Get current user
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

// Check if user is logged in
function checkAuth() {
    const token = getAuthToken();
    currentUser = getCurrentUser();
    isLoggedIn = !!(token && currentUser);

    // Get elements
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const publicHero = document.getElementById('publicHero');
    const publicHeader = document.getElementById('publicHeader');
    const welcomeSection = document.getElementById('welcomeSection');
    const refreshBtn = document.getElementById('refreshBtn');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

    if (isLoggedIn) {
        // Logged in - show sidebar and user content
        if (sidebar) sidebar.style.display = 'flex';
        if (mainContent) mainContent.style.marginLeft = '260px';
        if (publicHero) publicHero.style.display = 'none';
        if (publicHeader) publicHeader.style.display = 'none';
        if (welcomeSection) {
            welcomeSection.style.display = 'block';
            const welcomeUserName = document.getElementById('welcomeUserName');
            if (welcomeUserName) {
                welcomeUserName.textContent = currentUser.name || 'User';
            }
        }
        if (refreshBtn) refreshBtn.style.display = 'inline-flex';
        if (mobileMenuBtn) mobileMenuBtn.style.display = 'flex';

        // Load user info in sidebar
        loadUserInfoInSidebar();
    } else {
        // Not logged in - show public view
        if (sidebar) sidebar.style.display = 'none';
        if (mainContent) mainContent.style.marginLeft = '0';
        if (publicHero) publicHero.style.display = 'block';
        if (publicHeader) publicHeader.style.display = 'block';
        if (welcomeSection) welcomeSection.style.display = 'none';
        if (refreshBtn) refreshBtn.style.display = 'none';
        if (mobileMenuBtn) mobileMenuBtn.style.display = 'none';
    }
}

// Load user info in sidebar
function loadUserInfoInSidebar() {
    if (!currentUser) return;

    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');

    if (userAvatar) {
        userAvatar.textContent = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
    }
    if (userName) {
        userName.textContent = currentUser.name || 'User';
    }
    if (userEmail) {
        userEmail.textContent = currentUser.email || '';
    }
}

// Load active contests on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadContests();
    setupFormHandlers();
    setupSearch();
    setupFilters();
    loadStats();
});

// Load all contests
async function loadContests() {
    try {
        const statusFilter = document.getElementById('statusFilter')?.value || 'Active';
        const url = statusFilter === 'all'
            ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}?limit=100`
            : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}?status=${statusFilter}&limit=100`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
            allContests = result.data;
            filteredContests = result.data;
            applyFiltersAndSort();
        } else {
            showNoContests();
        }
    } catch (error) {
        console.error('Error loading contests:', error);
        document.getElementById('contestGrid').innerHTML = `
            <div class="loading-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading contests. Please try again later.</p>
            </div>
        `;
    }
}

// Refresh contests
function refreshContests() {
    document.getElementById('contestGrid').innerHTML = `
        <div class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Refreshing contests...</p>
        </div>
    `;
    loadContests();
    loadStats();
}

// Load statistics
async function loadStats() {
    try {
        // Get all contests for stats
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}?limit=1000`);
        const result = await response.json();

        if (result.success) {
            const contests = result.data;
            const activeContests = contests.filter(c => c.status === 'Active').length;
            const totalParticipants = contests.reduce((sum, c) => sum + (c.currentParticipants || 0), 0);
            const totalWinners = contests.reduce((sum, c) => sum + (c.winners?.length || 0), 0);

            document.getElementById('totalContests').textContent = activeContests;
            document.getElementById('totalParticipants').textContent = totalParticipants.toLocaleString();
            document.getElementById('totalWinners').textContent = totalWinners.toLocaleString();
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Display contests
function displayContests(contests) {
    const contestGrid = document.getElementById('contestGrid');
    const noContestsMessage = document.getElementById('noContestsMessage');

    if (contests.length === 0) {
        showNoContests();
        return;
    }

    contestGrid.innerHTML = '';
    noContestsMessage.style.display = 'none';

    contests.forEach(contest => {
        const spotsLeft = contest.maxParticipants - (contest.currentParticipants || 0);
        const endDate = new Date(contest.endDate);
        const startDate = new Date(contest.startDate);
        const now = new Date();
        const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        const isExpiringSoon = daysLeft <= 7 && daysLeft > 0;
        const isActive = contest.status === 'Active';
        const isUpcoming = contest.status === 'Upcoming';
        const isCompleted = contest.status === 'Completed';

        let badgeClass = 'badge-secondary';
        if (isActive) badgeClass = 'badge-success';
        if (isUpcoming) badgeClass = 'badge-warning';

        const contestCard = document.createElement('div');
        contestCard.className = 'contest-card';
        contestCard.innerHTML = `
            <div class="contest-header">
                <div class="contest-icon">
                    <i class="fas fa-trophy"></i>
                </div>
                <span class="contest-badge ${badgeClass}">
                    ${contest.status}
                </span>
            </div>
            <div class="contest-body">
                <h3 class="contest-title">${contest.title}</h3>
                <p class="contest-description">${contest.description || 'Join this exciting contest and showcase your talent!'}</p>
                <div class="contest-meta">
                    <div class="meta-item">
                        <i class="fas fa-users"></i>
                        <span>${contest.currentParticipants || 0} / ${contest.maxParticipants}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${endDate.toLocaleDateString()}</span>
                    </div>
                    ${isExpiringSoon ? `<div class="meta-item warning"><i class="fas fa-clock"></i><span>${daysLeft} days left</span></div>` : ''}
                    ${isCompleted && contest.winners?.length ? `<div class="meta-item"><i class="fas fa-crown"></i><span>${contest.winners.length} winners</span></div>` : ''}
                </div>
                <div class="contest-footer">
                    <div class="spots-indicator" style="color: ${spotsLeft < 10 ? '#ef4444' : spotsLeft === 0 ? '#6b7280' : '#10b981'};">
                        <i class="fas fa-chair"></i>
                        <strong>${spotsLeft}</strong> spots ${spotsLeft === 0 ? 'filled' : 'left'}
                    </div>
                </div>
            </div>
        `;

        if (isActive && spotsLeft > 0) {
            contestCard.style.cursor = 'pointer';
            contestCard.addEventListener('click', () => openRegistrationModal(contest));
        } else if (isCompleted || spotsLeft === 0 || isUpcoming) {
            contestCard.style.opacity = '0.7';
            contestCard.style.cursor = 'default';
        }

        contestGrid.appendChild(contestCard);
    });
}

// Show no contests message
function showNoContests() {
    document.getElementById('contestGrid').innerHTML = '';
    document.getElementById('noContestsMessage').style.display = 'flex';
}

// Open registration modal
function openRegistrationModal(contest) {
    // Check authentication
    if (!isLoggedIn) {
        if (confirm('You need to be logged in to register for contests. Would you like to go to the login page?')) {
            window.location.href = 'login.html';
        }
        return;
    }

    selectedContestId = contest._id;
    document.getElementById('selectedContestName').textContent = `${contest.title}`;
    document.getElementById('registrationModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Pre-fill email if available
    if (currentUser && currentUser.email) {
        document.getElementById('email').value = currentUser.email;
    }
}

// Close registration modal
function closeRegistrationModal() {
    document.getElementById('registrationModal').style.display = 'none';
    document.getElementById('participantForm').reset();
    selectedContestId = null;
    document.body.style.overflow = 'auto';
}

// Close success modal
function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    refreshContests();
}

// Setup form handlers
function setupFormHandlers() {
    const form = document.getElementById('participantForm');
    if (!form) return;

    // Form submission
    form.addEventListener('submit', handleFormSubmit);
}

// Setup search
function setupSearch() {
    const searchInput = document.getElementById('contestSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        applyFiltersAndSort();
    });
}

// Setup filters
function setupFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const sortBy = document.getElementById('sortBy');

    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            loadContests();
        });
    }

    if (sortBy) {
        sortBy.addEventListener('change', () => {
            applyFiltersAndSort();
        });
    }
}

// Apply filters and sorting
function applyFiltersAndSort() {
    const searchQuery = document.getElementById('contestSearch')?.value.toLowerCase() || '';
    const sortBy = document.getElementById('sortBy')?.value || 'newest';

    // Filter by search query
    filteredContests = allContests.filter(contest =>
        contest.title.toLowerCase().includes(searchQuery) ||
        (contest.description && contest.description.toLowerCase().includes(searchQuery))
    );

    // Sort contests
    switch (sortBy) {
        case 'newest':
            filteredContests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            filteredContests.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'ending':
            filteredContests.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
            break;
        case 'spots':
            filteredContests.sort((a, b) => {
                const spotsA = a.maxParticipants - (a.currentParticipants || 0);
                const spotsB = b.maxParticipants - (b.currentParticipants || 0);
                return spotsB - spotsA;
            });
            break;
    }

    displayContests(filteredContests);
}



// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    if (!selectedContestId) {
        alert('Please select a contest first');
        return;
    }

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        bio: document.getElementById('bio').value,
        contestId: selectedContestId
    };

    try {
        const token = getAuthToken();
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PARTICIPANTS}/register`,
            {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(formData)
            }
        );

        const result = await response.json();

        if (result.success) {
            // Close registration modal
            closeRegistrationModal();

            // Show success modal
            document.getElementById('successModal').style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // Reset form
            form.reset();
        } else {
            alert(result.message || 'Registration failed. Please try again.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('An error occurred. Please try again later.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const registrationModal = document.getElementById('registrationModal');
    const successModal = document.getElementById('successModal');

    if (e.target === registrationModal) {
        closeRegistrationModal();
    }

    if (e.target === successModal) {
        closeSuccessModal();
    }
});

// Logout function
function logout() {
    // Clear both possible token keys
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');

    // Show logout message
    alert('You have been logged out successfully.');
    window.location.href = 'login.html';
}
