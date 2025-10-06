// Dashboard - Real-time Analytics
let currentContestId = null;
let pollingInterval = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadContests();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    const contestSelect = document.getElementById('dashboardContestSelect');
    if (contestSelect) {
        contestSelect.addEventListener('change', (e) => {
            currentContestId = e.target.value;
            if (currentContestId) {
                loadDashboardData();
            }
        });
    }
}

// Refresh dashboard
function refreshDashboard() {
    if (currentContestId) {
        loadDashboardData();
    } else {
        loadContests();
    }
}

// Load dashboard data
function loadDashboardData() {
    if (currentContestId) {
        loadContestData(currentContestId);
        subscribeToRealtimeUpdates(currentContestId);
    }
}

// Load all contests
async function loadContests() {
    try {
        const select = document.getElementById('dashboardContestSelect');
        if (!select) return;
        select.innerHTML = '<option value="">Loading contests...</option>';

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}?limit=100`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
            populateContestSelector(result.data);
        } else {
            select.innerHTML = '<option value="">No contests available</option>';
            showEmptyState();
        }
    } catch (error) {
        console.error('Error loading contests:', error);
        const sel = document.getElementById('dashboardContestSelect');
        if (sel) sel.innerHTML = '<option value="">Error loading contests</option>';
        showErrorState(error.message);
    }
}

// Show empty state
function showEmptyState() {
    const container = document.getElementById('dashboardContent');
    if (!container) return;
    container.innerHTML = `
        <div class="card" style="text-align: center; padding: 64px 24px;">
            <div style="font-size: 80px; margin-bottom: 24px;">
                <i class="fas fa-inbox" style="color: #94a3b8;"></i>
            </div>
            <h2 style="font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 12px;">No Contests Available</h2>
            <p style="font-size: 16px; color: #64748b; max-width: 500px; margin: 0 auto 32px;">
                There are no contests in the system yet. Create your first contest to get started!
            </p>
            <a href="profile.html#create" class="btn btn-primary" style="display: inline-block; padding: 12px 24px; text-decoration: none;">
                <i class="fas fa-plus-circle"></i> Create Contest
            </a>
        </div>
    `;
}

// Show error state
function showErrorState(message) {
    const container = document.getElementById('dashboardContent');
    if (!container) return;
    container.innerHTML = `
        <div class="card" style="text-align: center; padding: 64px 24px;">
            <div style="font-size: 80px; margin-bottom: 24px;">
                <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
            </div>
            <h2 style="font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 12px;">Error Loading Dashboard</h2>
            <p style="font-size: 16px; color: #64748b; max-width: 500px; margin: 0 auto 24px;">
                ${message || 'Unable to load dashboard data. Please try again.'}
            </p>
            <button onclick="location.reload()" class="btn btn-primary" style="padding: 12px 24px;">
                <i class="fas fa-sync"></i> Retry
            </button>
        </div>
    `;
}

// Populate contest selector
function populateContestSelector(contests) {
    const select = document.getElementById('dashboardContestSelect');
    if (!select) return;
    select.innerHTML = '<option value="">Select a contest...</option>';

    contests.forEach(contest => {
        const option = document.createElement('option');
        option.value = contest._id;
        option.textContent = `${contest.title} (${contest.status})`;
        select.appendChild(option);
    });

    // Auto-select first active contest
    const activeContest = contests.find(c => c.status === 'Active');
    if (activeContest) {
        select.value = activeContest._id;
        currentContestId = activeContest._id;
        loadContestData(currentContestId);
        subscribeToRealtimeUpdates(currentContestId);
    }
}

// Load contest data
async function loadContestData(contestId) {
    const container = document.getElementById('dashboardContent');
    if (!container) return;

    // Show loading state
    container.innerHTML = `
        <div class="card" style="text-align: center; padding: 64px 24px;">
            <div style="font-size: 80px; margin-bottom: 24px;">
                <i class="fas fa-spinner fa-spin" style="color: #3b82f6;"></i>
            </div>
            <h2 style="font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 12px;">Loading Dashboard Data...</h2>
            <p style="font-size: 16px; color: #64748b;">Please wait while we fetch the latest analytics</p>
        </div>
    `;

    try {
        // Get auth token
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Load contest details
        const contestResponse = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}/${contestId}`,
            { headers }
        );

        if (!contestResponse.ok) {
            throw new Error('Failed to load contest details');
        }

        const contestResult = await contestResponse.json();

        // Load participants
        const participantsResponse = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PARTICIPANTS}?contestId=${contestId}&limit=1000`,
            { headers }
        );

        if (!participantsResponse.ok) {
            throw new Error('Failed to load participants');
        }

        const participantsResult = await participantsResponse.json();

        if (contestResult.success && participantsResult.success) {
            renderDashboard(contestResult.data, participantsResult.data);
        } else {
            showErrorState('Bad response from server while loading contest data');
        }

        // Load analytics & winners (non-blocking)
        loadAnalytics(contestId);
        loadWinners(contestId);

    } catch (error) {
        console.error('Error loading contest data:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle" style="color: #ef4444;"></i>
                <h3>Error Loading Data</h3>
                <p>Please try again or select a different contest</p>
            </div>
        `;
    }
}

// Render dashboard layout
function renderDashboard(contest, participants) {
    const container = document.getElementById('dashboardContent');
    if (!container) return;

    // Calculate metrics
    const qualified = participants.filter(p => p.stage === 'Qualified').length;
    const finalists = participants.filter(p => p.stage === 'Finalist').length;
    const winners = participants.filter(p => p.stage === 'Winner').length;
    const avgEngagement = participants.length > 0
        ? (participants.reduce((sum, p) => sum + (p.engagementScore || 0), 0) / participants.length).toFixed(1)
        : 0;

    // Stage counts
    const stages = {
        Registered: participants.filter(p => p.stage === 'Registered').length,
        Qualified: qualified,
        Finalist: finalists,
        Winner: winners
    };

    // Platform distribution
    const platforms = {};
    participants.forEach(p => {
        const platform = p.platform || 'Other';
        platforms[platform] = (platforms[platform] || 0) + 1;
    });

    container.innerHTML = `
        <!-- Stats Grid -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Participants</div>
                <div class="stat-value" id="totalParticipants">${contest.currentParticipants || participants.length || 0}</div>
                <div class="stat-change"><i class="fas fa-users"></i> Registered</div>
            </div>
            <div class="stat-card green">
                <div class="stat-label">Qualified</div>
                <div class="stat-value" id="qualifiedCount">${qualified}</div>
                <div class="stat-change"><i class="fas fa-check-circle"></i> Approved</div>
            </div>
            <div class="stat-card purple">
                <div class="stat-label">Winners Selected</div>
                <div class="stat-value" id="winnersCount">${winners}</div>
                <div class="stat-change"><i class="fas fa-trophy"></i> Announced</div>
            </div>
            <div class="stat-card orange">
                <div class="stat-label">Avg Engagement</div>
                <div class="stat-value" id="avgEngagement">${avgEngagement}</div>
                <div class="stat-change"><i class="fas fa-star"></i> Score</div>
            </div>
        </div>
        
        <!-- Participant Flow -->
        <div class="card">
            <div class="card-header">
                <h2 class="card-title"><i class="fas fa-stream"></i> Participant Flow</h2>
            </div>
            <div class="stage-flow-container">
                ${Object.entries(stages).map(([stage, count]) => {
        const percentage = (contest.currentParticipants && contest.currentParticipants > 0)
            ? ((count / contest.currentParticipants) * 100).toFixed(1)
            : (participants.length > 0 ? ((count / participants.length) * 100).toFixed(1) : 0);
        return `
                        <div class="flow-stage">
                            <div class="flow-stage-header">
                                <span class="flow-stage-name">${stage}</span>
                                <span class="flow-stage-count" id="stage${stage}">${count}</span>
                            </div>
                            <div class="flow-progress-bar">
                                <div class="flow-progress-fill" id="progress${stage}" style="width: ${percentage}%"></div>
                            </div>
                            <div class="flow-stage-percent">${percentage}%</div>
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
        
        <!-- Platform Distribution -->
        <div class="card">
            <div class="card-header">
                <h2 class="card-title"><i class="fas fa-chart-pie"></i> Platform Distribution</h2>
            </div>
            <div class="platform-grid">
                ${Object.keys(platforms).length === 0 ?
            '<p style="padding: 20px; text-align: center; color: #64748b;">No platform data available yet</p>' :
            Object.entries(platforms).map(([platform, count]) => {
                const percentage = ((count / participants.length) * 100).toFixed(1);
                return `
                            <div class="platform-item">
                                <div class="platform-icon">${getPlatformIcon(platform)}</div>
                                <div class="platform-info">
                                    <div class="platform-name">${platform}</div>
                                    <div class="platform-stats">
                                        <span class="platform-count">${count} users</span>
                                        <span class="platform-percent">${percentage}%</span>
                                    </div>
                                </div>
                                <div class="platform-bar">
                                    <div class="platform-bar-fill" style="width: ${percentage}%"></div>
                                </div>
                            </div>
                        `;
            }).join('')}
            </div>
            <div id="platformChart" style="padding: 16px;"></div>
        </div>
        
        <!-- Recent Winners -->
        <div class="card">
            <div class="card-header">
                <h2 class="card-title"><i class="fas fa-trophy"></i> Recent Winners</h2>
            </div>
            <div id="winnersList"></div>
        </div>
        
        <!-- Live Activity -->
        <div class="card">
            <div class="card-header">
                <h2 class="card-title"><i class="fas fa-bolt"></i> Live Activity</h2>
                <button class="btn btn-secondary btn-sm" onclick="refreshDashboard()">
                    <i class="fas fa-sync"></i> Refresh
                </button>
            </div>
            <div id="activityFeed">
                <div class="activity-item">
                    <div class="activity-time">${new Date().toLocaleTimeString()}</div>
                    <div class="activity-text">Dashboard loaded - Monitoring contest activity</div>
                </div>
                <div class="activity-item">
                    <div class="activity-time">${new Date().toLocaleTimeString()}</div>
                    <div class="activity-text">Real-time updates enabled - Refreshing every 10 seconds</div>
                </div>
            </div>
        </div>
    `;
}

// Get platform icon
function getPlatformIcon(platform) {
    const icons = {
        'Instagram': '<i class="fab fa-instagram"></i>',
        'Twitter': '<i class="fab fa-twitter"></i>',
        'Facebook': '<i class="fab fa-facebook"></i>',
        'LinkedIn': '<i class="fab fa-linkedin"></i>',
        'TikTok': '<i class="fab fa-tiktok"></i>',
        'YouTube': '<i class="fab fa-youtube"></i>',
        'Other': '<i class="fas fa-globe"></i>'
    };
    return icons[platform] || '<i class="fas fa-share-alt"></i>';
}

// Update metrics display
function updateMetrics(contest) {
    const totalEl = document.getElementById('totalParticipants');
    if (totalEl) totalEl.textContent = contest.currentParticipants || 0;

    const qualEl = document.getElementById('qualifiedCount');
    if (qualEl) qualEl.textContent = (contest.analytics && contest.analytics.qualifiedParticipants) || 0;

    const winEl = document.getElementById('winnersCount');
    if (winEl) winEl.textContent = (contest.winners && contest.winners.length) || 0;

    const fairnessEl = document.getElementById('fairnessScore');
    if (fairnessEl) fairnessEl.textContent = ((contest.analytics && contest.analytics.fairnessScore) || 100) + '%';
}

// Update stage flow visualization
function updateStageFlow(participants) {
    const stages = {
        Registered: 0,
        Qualified: 0,
        Finalist: 0,
        Winner: 0
    };

    participants.forEach(p => {
        if (stages.hasOwnProperty(p.stage)) {
            stages[p.stage]++;
        }
    });

    const total = participants.length || 1;

    Object.keys(stages).forEach(stage => {
        const count = stages[stage];
        const percentage = (count / total) * 100;

        const stageId = `stage${stage}`;
        const progressId = `progress${stage}`;

        const stageEl = document.getElementById(stageId);
        if (stageEl) stageEl.textContent = count;

        const progressEl = document.getElementById(progressId);
        if (progressEl) progressEl.style.width = percentage + '%';
    });
}

// Update platform distribution
function updatePlatformDistribution(participants) {
    const platforms = {};

    participants.forEach(p => {
        const plat = p.platform || 'Other';
        platforms[plat] = (platforms[plat] || 0) + 1;
    });

    const chartContainer = document.getElementById('platformChart');
    if (!chartContainer) return;
    chartContainer.innerHTML = '';

    Object.entries(platforms)
        .sort((a, b) => b[1] - a[1])
        .forEach(([platform, count]) => {
            const total = participants.length || 1;
            const percentage = ((count / total) * 100).toFixed(1);

            const barContainer = document.createElement('div');
            barContainer.style.marginBottom = '15px';

            barContainer.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-weight: 600;">${platform}</span>
                    <span style="color: #6b7280;">${count} (${percentage}%)</span>
                </div>
                <div style="background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #6366f1, #8b5cf6); 
                                height: 100%; width: ${percentage}%; transition: width 0.5s;">
                    </div>
                </div>
            `;

            chartContainer.appendChild(barContainer);
        });
}

// Load analytics
async function loadAnalytics(contestId) {
    try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYTICS}/funnel?contestId=${contestId}`,
            { headers }
        );

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                displayEngagementChart(result.data);
            }
        } else {
            console.log('Analytics endpoint requires authentication or is not available');
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// Display engagement chart
function displayEngagementChart(funnelData) {
    const chartContainer = document.getElementById('engagementChart');
    if (!chartContainer) return;
    chartContainer.innerHTML = '';

    funnelData.forEach((stage, index) => {
        const stageDiv = document.createElement('div');
        stageDiv.style.marginBottom = '20px';

        const conversionText = stage.conversionRate
            ? ` (${stage.conversionRate.toFixed(1)}% conversion)`
            : '';

        stageDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 600;">${stage.stage}</span>
                <span style="color: #6b7280;">
                    ${stage.count} participants${conversionText}
                </span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="flex: 1; background: #e5e7eb; height: 25px; border-radius: 12px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #10b981, #059669); 
                                height: 100%; width: ${stage.count > 0 ? 100 : 0}%; 
                                transition: width 0.5s;">
                    </div>
                </div>
                <span style="min-width: 80px; text-align: right; color: #6b7280;">
                    Avg Engagement: ${stage.avgEngagement || 0}
                </span>
            </div>
        `;

        chartContainer.appendChild(stageDiv);
    });
}

// Load winners
async function loadWinners(contestId) {
    try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PARTICIPANTS}?contestId=${contestId}&stage=Winner`,
            { headers }
        );

        const winnersList = document.getElementById('winnersList');
        if (!winnersList) return;

        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data && result.data.length > 0) {
                displayWinners(result.data);
            } else {
                winnersList.innerHTML = '<p style="padding: 20px; text-align: center; color: #64748b;">No winners announced yet</p>';
            }
        } else {
            winnersList.innerHTML = '<p style="padding: 20px; text-align: center; color: #94a3b8;">Winner information not available</p>';
        }
    } catch (error) {
        console.error('Error loading winners:', error);
        const winnersList = document.getElementById('winnersList');
        if (winnersList) {
            winnersList.innerHTML = '<p style="padding: 20px; text-align: center; color: #94a3b8;">Unable to load winner information</p>';
        }
    }
}

// Display winners
function displayWinners(winners) {
    const winnersList = document.getElementById('winnersList');
    if (!winnersList) return;
    winnersList.innerHTML = '';

    winners.forEach((winner) => {
        const winnerDiv = document.createElement('div');
        winnerDiv.className = 'winner-item';
        winnerDiv.innerHTML = `
            <div class="winner-icon">🏆</div>
            <div class="winner-info">
                <h4>${winner.name}</h4>
                <p>${winner.platform || 'Unknown'} • Engagement Score: ${winner.engagementScore || 0}</p>
                <p style="font-size: 0.8rem; color: #9ca3af;">
                    Registered: ${winner.registrationDate ? new Date(winner.registrationDate).toLocaleDateString() : 'N/A'}
                </p>
            </div>
        `;
        winnersList.appendChild(winnerDiv);
    });
}

// Subscribe to updates via polling
function subscribeToRealtimeUpdates(contestId) {
    console.log('Starting polling for contest updates');
    startPolling(contestId);
}

// Update real-time metrics
function updateRealtimeMetrics(metrics) {
    if (metrics.totalParticipants !== undefined) {
        const el = document.getElementById('totalParticipants');
        if (el) el.textContent = metrics.totalParticipants;
    }
    if (metrics.qualified !== undefined) {
        const el = document.getElementById('qualifiedCount');
        if (el) el.textContent = metrics.qualified;
    }
    if (metrics.winners !== undefined) {
        const el = document.getElementById('winnersCount');
        if (el) el.textContent = metrics.winners;
    }
    if (metrics.fairnessScore !== undefined) {
        const el = document.getElementById('fairnessScore');
        if (el) el.textContent = metrics.fairnessScore + '%';
    }
}

// Add activity item to feed
function addActivityItem(message) {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;

    // Remove empty state if exists
    const emptyState = feed.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    const activityDiv = document.createElement('div');
    activityDiv.className = 'activity-item';
    activityDiv.innerHTML = `
        <div>${message}</div>
        <div class="activity-time">${new Date().toLocaleTimeString()}</div>
    `;

    feed.insertBefore(activityDiv, feed.firstChild);

    // Keep only last 20 items
    while (feed.children.length > 20) {
        feed.removeChild(feed.lastChild);
    }
}

// Polling for updates
function startPolling(contestId) {
    // Clear existing interval
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }

    // Poll every 10 seconds
    pollingInterval = setInterval(() => {
        loadContestData(contestId);
    }, 10000);
}

// Initial activity message
setTimeout(() => {
    addActivityItem('Dashboard loaded and monitoring contest');
}, 500);
