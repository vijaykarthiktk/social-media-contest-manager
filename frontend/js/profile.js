// Profile Page JavaScript
let selectedContestId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadUserContests();
    setupEventListeners();
    populateContestSelectors();
    updateDashboardStats();
});

// Load and display user information
function loadUserInfo() {
    const user = getCurrentUser();
    if (user) {
        // Update sidebar user info
        const userNameElement = document.getElementById('userName');
        const userEmailElement = document.getElementById('userEmail');
        const userAvatarElement = document.getElementById('userAvatar');

        if (userNameElement) userNameElement.textContent = user.name || 'User';
        if (userEmailElement) userEmailElement.textContent = user.email || 'user@example.com';
        if (userAvatarElement) {
            userAvatarElement.textContent = (user.name || 'U').charAt(0).toUpperCase();
        }

        // Update settings form
        const settingsName = document.getElementById('settingsName');
        const settingsEmail = document.getElementById('settingsEmail');

        if (settingsName) settingsName.value = user.name || '';
        if (settingsEmail) settingsEmail.value = user.email || '';
    }
}

// Update dashboard stats
async function updateDashboardStats() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}?limit=1000`, {
            headers: getAuthHeaders()
        });
        const result = await response.json();

        if (result.success) {
            const contests = result.data;
            const activeContests = contests.filter(c => c.status === 'Active').length;
            const totalParticipants = contests.reduce((sum, c) => sum + (c.currentParticipants || 0), 0);
            const totalWinners = contests.reduce((sum, c) => sum + (c.winners?.length || 0), 0);

            // Update stat cards
            const totalContestsEl = document.getElementById('totalContests');
            const activeContestsEl = document.getElementById('activeContests');
            const totalParticipantsEl = document.getElementById('totalParticipants');
            const totalWinnersEl = document.getElementById('totalWinners');

            if (totalContestsEl) totalContestsEl.textContent = contests.length;
            if (activeContestsEl) activeContestsEl.textContent = activeContests;
            if (totalParticipantsEl) totalParticipantsEl.textContent = totalParticipants;
            if (totalWinnersEl) totalWinnersEl.textContent = totalWinners;
        }
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
}

function setupEventListeners() {
    const contestSelect = document.getElementById('adminContestSelect');
    if (contestSelect) {
        contestSelect.addEventListener('change', (e) => {
            selectedContestId = e.target.value;
            if (selectedContestId) {
                loadContestDetails();
                loadParticipants();
                loadContestAnalytics();
            }
        });
    }

    const createForm = document.getElementById('createContestForm');
    if (createForm) {
        createForm.addEventListener('submit', handleCreateContest);
    }
}

// Load user's contests and display in grid
async function loadUserContests() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}?limit=100`, {
            headers: getAuthHeaders()
        });
        const result = await response.json();

        if (result.success) {
            displayContestGrid(result.data);
            populateContestSelector(result.data);
        }
    } catch (error) {
        console.error('Error loading contests:', error);
    }
}

// Display contests in card grid
function displayContestGrid(contests) {
    const container = document.getElementById('contestGrid');
    if (!container) return;

    if (contests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-trophy"></i>
                <h3>No Contests Yet</h3>
                <p>Create your first contest to get started!</p>
                <button class="btn btn-primary" onclick="switchTab('create')">
                    <i class="fas fa-plus"></i> Create Contest
                </button>
            </div>
        `;
        return;
    }

    let html = '';
    contests.forEach(contest => {
        const statusClass = contest.status === 'Active' ? 'active' :
            contest.status === 'Completed' ? 'completed' : 'pending';

        html += `
            <div class="contest-card">
                <div class="contest-header">
                    <div class="contest-title">${contest.title}</div>
                    <div class="contest-platform">Multi-Platform Contest</div>
                </div>
                <div class="contest-body">
                    <div class="contest-meta">
                        <div class="meta-item">
                            <i class="fas fa-users"></i>
                            <span>${contest.currentParticipants || 0} participants</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-trophy"></i>
                            <span>${contest.numberOfWinners || 1} winners</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>${new Date(contest.startDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <span class="contest-status status-${statusClass}">${contest.status}</span>
                    <div class="contest-actions">
                        <button class="btn btn-primary btn-sm" onclick="viewContestDetails('${contest._id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="editContest('${contest._id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// View contest details - switch to participants tab
function viewContestDetails(contestId) {
    selectedContestId = contestId;
    const contestSelect = document.getElementById('contestSelect');
    if (contestSelect) {
        contestSelect.value = contestId;
    }
    switchTab('participants');
    loadParticipants();
}

// Edit contest - future enhancement
function editContest(contestId) {
    alert('Edit functionality coming soon!');
}

// Populate all contest selectors
function populateContestSelectors() {
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}?limit=100`, {
        headers: getAuthHeaders()
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // Populate participants tab selector
                const contestSelect = document.getElementById('contestSelect');
                if (contestSelect) {
                    contestSelect.innerHTML = '<option value="">Select contest...</option>';
                    result.data.forEach(contest => {
                        const option = document.createElement('option');
                        option.value = contest._id;
                        option.textContent = `${contest.title} (${contest.currentParticipants || 0} participants)`;
                        contestSelect.appendChild(option);
                    });
                }

                // Populate analytics tab selector
                const analyticsSelect = document.getElementById('analyticsContestSelect');
                if (analyticsSelect) {
                    analyticsSelect.innerHTML = '<option value="">Select contest...</option>';
                    result.data.forEach(contest => {
                        const option = document.createElement('option');
                        option.value = contest._id;
                        option.textContent = contest.title;
                        analyticsSelect.appendChild(option);
                    });
                }
            }
        })
        .catch(error => console.error('Error loading contests:', error));
}

function populateContestSelector(contests) {
    const select = document.getElementById('adminContestSelect');
    if (!select) return;

    select.innerHTML = '<option value="">Select a contest...</option>';

    contests.forEach(contest => {
        const option = document.createElement('option');
        option.value = contest._id;
        option.textContent = `${contest.title} (${contest.status}) - ${contest.currentParticipants || 0} participants`;
        select.appendChild(option);
    });
}

// Handle create contest
async function handleCreateContest(e) {
    e.preventDefault();

    const contestData = {
        title: document.getElementById('contestTitle').value,
        description: document.getElementById('contestDescription').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        maxParticipants: parseInt(document.getElementById('maxParticipants').value),
        numberOfWinners: parseInt(document.getElementById('numberOfWinners').value),
        fairnessAlgorithm: document.getElementById('fairnessAlgorithm').value,
        status: 'Active',
        platforms: ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'TikTok', 'YouTube'],
        duplicateCheckEnabled: true,
        fraudDetectionEnabled: true
    };

    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}`,
            {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(contestData)
            }
        );

        const result = await response.json();

        if (result.success) {
            alert('Contest created successfully! ✅');
            document.getElementById('createContestForm').reset();
            loadUserContests();
            populateContestSelectors();
            updateDashboardStats();
            switchTab('contests');
        } else {
            alert('Error creating contest: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error creating contest');
    }
}

// Load contest details
async function loadContestDetails() {
    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}/${selectedContestId}`,
            {
                headers: getAuthHeaders()
            }
        );
        const result = await response.json();

        if (result.success) {
            const statusControl = document.getElementById('contestControls');
            if (statusControl) {
                statusControl.style.display = 'block';
            }
            const statusField = document.getElementById('contestStatus');
            if (statusField) {
                statusField.value = result.data.status;
            }
        }
    } catch (error) {
        console.error('Error loading contest details:', error);
    }
}

// Update contest status
async function updateContestStatus() {
    if (!selectedContestId) {
        alert('Please select a contest first');
        return;
    }

    const newStatus = document.getElementById('contestStatus').value;

    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}/${selectedContestId}`,
            {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: newStatus })
            }
        );

        const result = await response.json();

        if (result.success) {
            alert('Contest status updated successfully! ✅');
            loadUserContests();
            populateContestSelectors();
            updateDashboardStats();
        } else {
            alert('Error updating status: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating contest status');
    }
}

// Bulk qualify participants
async function bulkQualify() {
    if (!selectedContestId) {
        alert('Please select a contest first');
        return;
    }

    const count = parseInt(document.getElementById('qualifyCount').value);
    if (!count || count <= 0) {
        alert('Please enter a valid number');
        return;
    }

    if (!confirm(`Qualify ${count} participants using priority queue?`)) {
        return;
    }

    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PARTICIPANTS}/bulk-qualify`,
            {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    contestId: selectedContestId,
                    count: count
                })
            }
        );

        const result = await response.json();

        if (result.success) {
            alert(`✅ ${result.data.qualifiedCount} participants qualified!`);
            loadParticipants();
            loadContestAnalytics();
        } else {
            alert('Error qualifying participants: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error qualifying participants');
    }
}

// Select winners
async function selectWinners() {
    if (!selectedContestId) {
        alert('Please select a contest first');
        return;
    }

    const count = parseInt(document.getElementById('winnerCount').value);
    const algorithm = document.getElementById('winnerAlgorithm').value;

    if (!count || count <= 0) {
        alert('Please enter a valid number of winners');
        return;
    }

    if (!confirm(`Select ${count} winners using ${algorithm} algorithm?\n\nThis action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}/${selectedContestId}/select-winners`,
            {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    count: count,
                    algorithm: algorithm
                })
            }
        );

        const result = await response.json();

        if (result.success) {
            displayWinnerResults(result.data);
            loadParticipants();
            loadContestAnalytics();
        } else {
            alert('Error selecting winners: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error selecting winners');
    }
}

// Display winner results
function displayWinnerResults(data) {
    const { winners, fairnessReport } = data;

    let message = `🎉 Winners Selected Successfully!\n\n`;
    message += `Algorithm: ${fairnessReport.algorithm}\n`;
    message += `Fairness Score: ${fairnessReport.fairnessScore}/100\n`;
    message += `Total Winners: ${winners.length}\n\n`;
    message += `Winners:\n`;

    winners.forEach((w, i) => {
        message += `${i + 1}. ${w.name} (${w.email})\n`;
        message += `   Platform: ${w.platform} | Engagement: ${w.engagementScore}\n`;
    });

    alert(message);
}

// Load participants
async function loadParticipants() {
    const contestSelect = document.getElementById('contestSelect');
    const contestId = contestSelect ? contestSelect.value : selectedContestId;

    if (!contestId) {
        const container = document.getElementById('participantsTable');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No Contest Selected</h3>
                    <p>Select a contest to view participants</p>
                </div>
            `;
        }
        const actionsCard = document.getElementById('contestActionsCard');
        if (actionsCard) {
            actionsCard.style.display = 'none';
        }
        return;
    }

    selectedContestId = contestId;
    const stageFilter = document.getElementById('stageFilter');
    const stage = stageFilter ? stageFilter.value : '';
    let url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PARTICIPANTS}?contestId=${contestId}&limit=500`;

    if (stage) {
        url += `&stage=${stage}`;
    }

    try {
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        const result = await response.json();

        if (result.success) {
            displayParticipantsTable(result.data);
            // Show contest actions card
            const actionsCard = document.getElementById('contestActionsCard');
            if (actionsCard) {
                actionsCard.style.display = 'block';
            }
            // Load contest status
            loadContestStatus(contestId);
        }
    } catch (error) {
        console.error('Error loading participants:', error);
    }
}

// Load contest status for actions card
async function loadContestStatus(contestId) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}/${contestId}`, {
            headers: getAuthHeaders()
        });
        const result = await response.json();

        if (result.success) {
            const statusSelect = document.getElementById('contestStatus');
            if (statusSelect) {
                statusSelect.value = result.data.status;
            }
        }
    } catch (error) {
        console.error('Error loading contest status:', error);
    }
}

// Display participants table
function displayParticipantsTable(participants) {
    const container = document.getElementById('participantsTable');

    if (participants.length === 0) {
        container.innerHTML = '<p class="empty-state">No participants found</p>';
        return;
    }

    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Platform</th>
                    <th>Stage</th>
                    <th>Engagement</th>
                    <th>Priority</th>
                    <th>Fraud Score</th>
                    <th>Registered</th>
                </tr>
            </thead>
            <tbody>
    `;

    participants.forEach(p => {
        const fraudClass = p.fraudScore > 70 ? 'style="color: red; font-weight: bold;"' : '';
        html += `
            <tr>
                <td>${p.name}</td>
                <td>${p.email}</td>
                <td>${p.platform}</td>
                <td><span class="contest-status ${p.stage ? p.stage.toLowerCase() : 'registered'}">${p.stage || 'Registered'}</span></td>
                <td>${p.engagementScore || 0}</td>
                <td>${p.priority || 0}</td>
                <td ${fraudClass}>${p.fraudScore || 0}</td>
                <td>${new Date(p.registrationDate).toLocaleDateString()}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
        <p style="margin-top: 10px; color: #6b7280;">
            Total: ${participants.length} participants
        </p>
    `;

    container.innerHTML = html;
}

// Load analytics for selected contest
async function loadAnalytics() {
    const analyticsSelect = document.getElementById('analyticsContestSelect');
    const contestId = analyticsSelect ? analyticsSelect.value : null;

    if (!contestId) {
        const container = document.getElementById('analyticsContainer');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-pie"></i>
                    <h3>No Contest Selected</h3>
                    <p>Select a contest to view detailed analytics</p>
                </div>
            `;
        }
        const fraudCard = document.getElementById('fraudCard');
        if (fraudCard) {
            fraudCard.style.display = 'none';
        }
        return;
    }

    selectedContestId = contestId;

    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}/${contestId}/analytics`,
            {
                headers: getAuthHeaders()
            }
        );
        const result = await response.json();

        if (result.success) {
            displayAnalytics(result.data);
            const fraudCard = document.getElementById('fraudCard');
            if (fraudCard) {
                fraudCard.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// Load contest analytics (legacy function - still used by some parts)
async function loadContestAnalytics() {
    if (!selectedContestId) return;

    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}/${selectedContestId}/analytics`,
            {
                headers: getAuthHeaders()
            }
        );
        const result = await response.json();

        if (result.success) {
            displayAnalytics(result.data);
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// Display analytics
function displayAnalytics(analytics) {
    const container = document.getElementById('analyticsContainer');

    const { contest, detailed } = analytics;

    let html = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Registrations</div>
                <div class="stat-value">${contest.totalRegistrations || 0}</div>
                <div class="stat-change">
                    <i class="fas fa-users"></i> All entries
                </div>
            </div>
            <div class="stat-card green">
                <div class="stat-label">Qualified</div>
                <div class="stat-value">${contest.qualifiedParticipants || 0}</div>
                <div class="stat-change">
                    <i class="fas fa-check-circle"></i> Approved
                </div>
            </div>
            <div class="stat-card purple">
                <div class="stat-label">Finalists</div>
                <div class="stat-value">${contest.finalists || 0}</div>
                <div class="stat-change">
                    <i class="fas fa-star"></i> Top performers
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Fairness Score</div>
                <div class="stat-value">${contest.fairnessScore || 100}%</div>
                <div class="stat-change">
                    <i class="fas fa-balance-scale"></i> Algorithm rating
                </div>
            </div>
            <div class="stat-card orange">
                <div class="stat-label">Duplicates Detected</div>
                <div class="stat-value">${contest.duplicatesDetected || 0}</div>
                <div class="stat-change">
                    <i class="fas fa-exclamation-triangle"></i> Flagged
                </div>
            </div>
            <div class="stat-card" style="border-left-color: #ef4444;">
                <div class="stat-label">Fraud Attempts</div>
                <div class="stat-value">${contest.fraudAttempts || 0}</div>
                <div class="stat-change" style="color: #ef4444;">
                    <i class="fas fa-shield-alt"></i> Blocked
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

// Load fraud report
async function loadFraudReport() {
    if (!selectedContestId) {
        alert('Please select a contest first');
        return;
    }

    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYTICS}/fraud?contestId=${selectedContestId}`,
            {
                headers: getAuthHeaders()
            }
        );
        const result = await response.json();

        if (result.success) {
            displayFraudReport(result.data);
        }
    } catch (error) {
        console.error('Error loading fraud report:', error);
        alert('Error loading fraud report');
    }
}

// Display fraud report
function displayFraudReport(report) {
    const container = document.getElementById('fraudReport');

    let html = '<h3>🛡️ Fraud Detection Analysis</h3>';

    // High risk participants
    if (report.highRiskParticipants && report.highRiskParticipants.length > 0) {
        html += '<h4 style="color: #ef4444; margin-top: 20px;">High Risk Participants</h4>';
        html += '<table class="data-table"><thead><tr><th>Name</th><th>Email</th><th>Fraud Score</th><th>Stage</th></tr></thead><tbody>';

        report.highRiskParticipants.forEach(p => {
            html += `
                <tr>
                    <td>${p.name}</td>
                    <td>${p.email}</td>
                    <td style="color: red; font-weight: bold;">${p.fraudScore}</td>
                    <td>${p.stage}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
    }

    // IP analysis
    if (report.ipAnalysis && report.ipAnalysis.length > 0) {
        html += '<h4 style="margin-top: 20px;">Suspicious IP Addresses (Multiple Registrations)</h4>';
        html += '<table class="data-table"><thead><tr><th>IP Address</th><th>Count</th></tr></thead><tbody>';

        report.ipAnalysis.forEach(ip => {
            html += `
                <tr>
                    <td>${ip._id}</td>
                    <td style="font-weight: bold;">${ip.count}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
    }

    container.innerHTML = html;
}

// Tab switching function
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab content
    const selectedTab = document.getElementById(`tab-${tabName}`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Add active class to selected tab button
    const selectedBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }

    // Load data for specific tabs
    if (tabName === 'participants') {
        loadParticipants();
    } else if (tabName === 'analytics') {
        loadAnalytics();
    }
}

// Refresh overview
function refreshOverview() {
    updateDashboardStats();
    loadUserContests();
}
