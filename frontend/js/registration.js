// Registration Form Handler
let selectedContestId = null;
let allContests = [];
let isLoggedIn = false;

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    isLoggedIn = !!token;

    // Show/hide sidebar based on auth
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const publicHero = document.getElementById('publicHero');
    const loginBtn = document.getElementById('loginBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

    if (isLoggedIn) {
        sidebar.style.display = 'flex';
        mainContent.style.marginLeft = '260px';
        publicHero.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'none';
        if (refreshBtn) refreshBtn.style.display = 'block';
        if (mobileMenuBtn) mobileMenuBtn.style.display = 'flex';

        // Load user info in sidebar
        if (typeof loadUserInfo === 'function') {
            loadUserInfo();
        }
    } else {
        sidebar.style.display = 'none';
        mainContent.style.marginLeft = '0';
        publicHero.style.display = 'block';
        if (loginBtn) loginBtn.style.display = 'flex';
        if (refreshBtn) refreshBtn.style.display = 'none';
        if (mobileMenuBtn) mobileMenuBtn.style.display = 'none';
    }
}

// Load active contests on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadActiveContests();
    setupFormHandlers();
    setupSearch();
});

// Load active contests
async function loadActiveContests() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}?status=Active`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            allContests = result.data;
            displayContests(result.data);
        } else {
            document.getElementById('contestGrid').innerHTML = '';
            document.getElementById('noContestsMessage').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading contests:', error);
        document.getElementById('contestGrid').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading contests. Please try again later.</p>
            </div>
        `;
    }
}

// Refresh contests
function refreshContests() {
    loadActiveContests();
}

// Display contests
function displayContests(contests) {
    const contestGrid = document.getElementById('contestGrid');

    if (contests.length === 0) {
        contestGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No Active Contests</h3>
                <p>There are no active contests available at the moment. Please check back later!</p>
            </div>
        `;
        return;
    }

    contestGrid.innerHTML = '';

    contests.forEach(contest => {
        const spotsLeft = contest.maxParticipants - (contest.currentParticipants || 0);
        const endDate = new Date(contest.endDate);
        const startDate = new Date(contest.startDate);
        const isExpiringSoon = (endDate - new Date()) < 7 * 24 * 60 * 60 * 1000; // 7 days
        const isActive = contest.status === 'Active';

        const contestCard = document.createElement('div');
        contestCard.className = 'contest-card';
        contestCard.innerHTML = `
            <div class="contest-header">
                <div class="contest-icon">
                    <i class="fas fa-trophy"></i>
                </div>
                <span class="contest-badge ${isActive ? 'badge-success' : 'badge-secondary'}">
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
                    ${isExpiringSoon ? '<div class="meta-item warning"><i class="fas fa-clock"></i><span>Ending Soon</span></div>' : ''}
                </div>
                <div class="contest-footer">
                    <div class="spots-indicator" style="color: ${spotsLeft < 10 ? '#ef4444' : '#10b981'};">
                        <i class="fas fa-chair"></i>
                        <strong>${spotsLeft}</strong> spots left
                    </div>
                </div>
            </div>
        `;

        if (isActive && spotsLeft > 0) {
            contestCard.style.cursor = 'pointer';
            contestCard.addEventListener('click', () => selectContest(contest, contestCard));
            contestCard.addEventListener('mouseenter', () => {
                contestCard.style.transform = 'translateY(-4px)';
                contestCard.style.boxShadow = '0 8px 16px rgba(59, 130, 246, 0.15)';
            });
            contestCard.addEventListener('mouseleave', () => {
                contestCard.style.transform = 'translateY(0)';
                contestCard.style.boxShadow = '';
            });
        } else {
            contestCard.style.opacity = '0.6';
            contestCard.style.cursor = 'not-allowed';
        }

        contestGrid.appendChild(contestCard);
    });
}

// Select contest
function selectContest(contest, cardElement) {
    if (!isLoggedIn) {
        alert('Please login to register for contests');
        window.location.href = 'login.html';
        return;
    }

    // Remove previous selection
    document.querySelectorAll('.contest-selection-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Select new contest
    cardElement.classList.add('selected');
    selectedContestId = contest._id;

    // Show registration form
    document.getElementById('registrationForm').style.display = 'block';
    document.getElementById('selectedContestName').textContent = `Registration for: ${contest.title}`;
    document.getElementById('successMessage').style.display = 'none';

    // Scroll to form
    document.getElementById('registrationForm').scrollIntoView({
        behavior: 'smooth'
    });
}

// Cancel registration
function cancelRegistration() {
    document.getElementById('registrationForm').style.display = 'none';
    document.getElementById('participantForm').reset();
    selectedContestId = null;

    // Remove selection
    document.querySelectorAll('.contest-selection-card').forEach(card => {
        card.classList.remove('selected');
    });
}

// Register another
function registerAnother() {
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('participantForm').reset();
    selectedContestId = null;

    // Remove selection
    document.querySelectorAll('.contest-selection-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allContests.filter(contest =>
            contest.title.toLowerCase().includes(query) ||
            (contest.description && contest.description.toLowerCase().includes(query))
        );
        displayContests(filtered);
    });
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
        socialMediaHandle: document.getElementById('profileUrl').value,
        platform: document.getElementById('platform').value,
        followerCount: parseInt(document.getElementById('followerCount').value),
        bio: document.getElementById('bio').value,
        contestId: selectedContestId
    };

    try {
        const token = localStorage.getItem('token');
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
            // Hide form and show success message
            document.getElementById('registrationForm').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';

            // Reset form
            form.reset();

            // Scroll to success message
            document.getElementById('successMessage').scrollIntoView({
                behavior: 'smooth'
            });
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

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}
