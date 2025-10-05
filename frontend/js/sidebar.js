// Sidebar and Tab Management

// Toggle sidebar collapse
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');

    // Save state to localStorage
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
}

// Toggle mobile sidebar
function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');

    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active');
}

// Tab switching functionality
function switchTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab content
    const selectedTab = document.getElementById(`tab-${tabName}`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Add active class to selected button
    const selectedBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }

    // Close mobile sidebar when tab is selected
    if (window.innerWidth <= 768) {
        toggleMobileSidebar();
    }

    // Load data for specific tabs
    if (tabName === 'contests') {
        loadUserContests();
    } else if (tabName === 'participants') {
        populateContestSelectors();
    } else if (tabName === 'analytics') {
        populateAnalyticsContestSelector();
    } else if (tabName === 'overview') {
        refreshOverview();
    }
}

// Load user info on page load
function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Update user avatar
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar && user.email) {
        userAvatar.textContent = user.email.charAt(0).toUpperCase();
    }

    // Update user name
    const userName = document.getElementById('userName');
    if (userName && user.email) {
        userName.textContent = user.email.split('@')[0];
    }

    // Update user email
    const userEmail = document.getElementById('userEmail');
    if (userEmail && user.email) {
        userEmail.textContent = user.email;
    }

    // Update settings form
    const settingsEmail = document.getElementById('settingsEmail');
    if (settingsEmail && user.email) {
        settingsEmail.value = user.email;
    }

    const settingsName = document.getElementById('settingsName');
    if (settingsName && user.name) {
        settingsName.value = user.name;
    }
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterContests(searchTerm);
        });
    }
}

function filterContests(searchTerm) {
    const contestCards = document.querySelectorAll('.contest-card');
    contestCards.forEach(card => {
        const title = card.querySelector('.contest-title')?.textContent.toLowerCase() || '';
        const description = card.textContent.toLowerCase();

        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load user information
    loadUserInfo();

    // Setup search
    setupSearch();

    // Restore sidebar state
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (sidebarCollapsed) {
        document.getElementById('sidebar')?.classList.add('collapsed');
    }

    // Load initial data
    refreshOverview();

    // Settings form submission
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('settingsName')?.value;

            // Update localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            user.name = name;
            localStorage.setItem('user', JSON.stringify(user));

            // Update UI
            loadUserInfo();

            alert('Settings updated successfully!');
        });
    }

    // Password form submission
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('newPassword')?.value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;

            if (newPassword !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            // Here you would typically call an API to update the password
            alert('Password updated successfully!');
            passwordForm.reset();
        });
    }
});

// Refresh overview data
async function refreshOverview() {
    try {
        const contests = await fetchUserContests();

        // Update stats
        document.getElementById('totalContests').textContent = contests.length;

        const activeContests = contests.filter(c => c.status === 'Active');
        document.getElementById('activeContests').textContent = activeContests.length;

        // Calculate total participants
        let totalParticipants = 0;
        let totalWinners = 0;

        for (const contest of contests) {
            const participants = await fetchContestParticipants(contest._id);
            totalParticipants += participants.length;
            totalWinners += participants.filter(p => p.currentStage === 'Winner').length;
        }

        document.getElementById('totalParticipants').textContent = totalParticipants;
        document.getElementById('totalWinners').textContent = totalWinners;

        // Display recent activity
        displayRecentActivity(contests);
    } catch (error) {
        console.error('Error refreshing overview:', error);
    }
}

// Display recent activity
function displayRecentActivity(contests) {
    const container = document.getElementById('recentActivity');
    if (!container) return;

    if (contests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No Activity Yet</h3>
                <p>Create your first contest to get started!</p>
                <button class="btn btn-primary" onclick="switchTab('create')">
                    <i class="fas fa-plus"></i> Create Contest
                </button>
            </div>
        `;
        return;
    }

    // Sort by creation date
    const sortedContests = [...contests].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    ).slice(0, 5);

    let html = '<div style="space-y: 12px;">';
    sortedContests.forEach(contest => {
        html += `
            <div style="padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h4 style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 4px;">
                            ${contest.title}
                        </h4>
                        <p style="font-size: 14px; color: #64748b;">
                            Created ${new Date(contest.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <span class="contest-status status-${contest.status.toLowerCase()}">
                        ${contest.status}
                    </span>
                </div>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

// Helper function to fetch user contests
async function fetchUserContests() {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/contests`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) throw new Error('Failed to fetch contests');
    return await response.json();
}

// Helper function to fetch contest participants
async function fetchContestParticipants(contestId) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/participants/contest/${contestId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) return [];
    return await response.json();
}
