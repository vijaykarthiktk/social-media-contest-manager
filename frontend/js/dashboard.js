// Dashboard - Real-time Analytics
let currentContestId = null;
let firebaseDb = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
    loadContests();
    setupEventListeners();
});

// Initialize Firebase for real-time updates
function initializeFirebase() {
    if (firebaseInitialized) {
        firebaseDb = firebase.database();
        console.log('Firebase real-time database connected');
    }
}

// Setup event listeners
function setupEventListeners() {
    const contestSelect = document.getElementById('dashboardContestSelect');
    contestSelect.addEventListener('change', (e) => {
        currentContestId = e.target.value;
        if (currentContestId) {
            loadContestData(currentContestId);
            subscribeToRealtimeUpdates(currentContestId);
        }
    });
}

// Load all contests
async function loadContests() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            populateContestSelector(result.data);
        } else {
            document.getElementById('dashboardContestSelect').innerHTML =
                '<option value="">No contests available</option>';
        }
    } catch (error) {
        console.error('Error loading contests:', error);
    }
}

// Populate contest selector
function populateContestSelector(contests) {
    const select = document.getElementById('dashboardContestSelect');
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
    try {
        // Load contest details
        const contestResponse = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}/${contestId}`
        );
        const contestResult = await contestResponse.json();

        if (contestResult.success) {
            updateMetrics(contestResult.data);
        }

        // Load participants
        const participantsResponse = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PARTICIPANTS}?contestId=${contestId}&limit=1000`
        );
        const participantsResult = await participantsResponse.json();

        if (participantsResult.success) {
            updateStageFlow(participantsResult.data);
            updatePlatformDistribution(participantsResult.data);
        }

        // Load analytics
        loadAnalytics(contestId);

        // Load winners
        loadWinners(contestId);

    } catch (error) {
        console.error('Error loading contest data:', error);
    }
}

// Update metrics display
function updateMetrics(contest) {
    document.getElementById('totalParticipants').textContent =
        contest.currentParticipants || 0;
    document.getElementById('qualifiedCount').textContent =
        contest.analytics.qualifiedParticipants || 0;
    document.getElementById('winnersCount').textContent =
        contest.winners?.length || 0;
    document.getElementById('fairnessScore').textContent =
        (contest.analytics.fairnessScore || 100) + '%';
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

        document.getElementById(`stage${stage}`).textContent = count;
        document.getElementById(`progress${stage}`).style.width = percentage + '%';
    });
}

// Update platform distribution
function updatePlatformDistribution(participants) {
    const platforms = {};

    participants.forEach(p => {
        platforms[p.platform] = (platforms[p.platform] || 0) + 1;
    });

    const chartContainer = document.getElementById('platformChart');
    chartContainer.innerHTML = '';

    Object.entries(platforms)
        .sort((a, b) => b[1] - a[1])
        .forEach(([platform, count]) => {
            const total = participants.length;
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
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYTICS}/funnel?contestId=${contestId}`
        );
        const result = await response.json();

        if (result.success) {
            displayEngagementChart(result.data);
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// Display engagement chart
function displayEngagementChart(funnelData) {
    const chartContainer = document.getElementById('engagementChart');
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
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PARTICIPANTS}?contestId=${contestId}&stage=Winner`
        );
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            displayWinners(result.data);
        } else {
            document.getElementById('winnersList').innerHTML =
                '<p class="empty-state">No winners announced yet</p>';
        }
    } catch (error) {
        console.error('Error loading winners:', error);
    }
}

// Display winners
function displayWinners(winners) {
    const winnersList = document.getElementById('winnersList');
    winnersList.innerHTML = '';

    winners.forEach((winner, index) => {
        const winnerDiv = document.createElement('div');
        winnerDiv.className = 'winner-item';
        winnerDiv.innerHTML = `
            <div class="winner-icon">🏆</div>
            <div class="winner-info">
                <h4>${winner.name}</h4>
                <p>${winner.platform} • Engagement Score: ${winner.engagementScore}</p>
                <p style="font-size: 0.8rem; color: #9ca3af;">
                    Registered: ${new Date(winner.registrationDate).toLocaleDateString()}
                </p>
            </div>
        `;
        winnersList.appendChild(winnerDiv);
    });
}

// Subscribe to Firebase real-time updates
function subscribeToRealtimeUpdates(contestId) {
    if (!firebaseDb) {
        console.log('Firebase not available - polling for updates');
        // Fallback to polling
        startPolling(contestId);
        return;
    }

    try {
        // Listen to metrics updates
        const metricsRef = firebaseDb.ref(`contests/${contestId}/metrics`);
        metricsRef.on('value', (snapshot) => {
            const metrics = snapshot.val();
            if (metrics) {
                updateRealtimeMetrics(metrics);
                addActivityItem(`Metrics updated - ${metrics.totalParticipants} participants`);
            }
        });

        // Listen to winners
        const winnersRef = firebaseDb.ref(`contests/${contestId}/winners`);
        winnersRef.on('value', (snapshot) => {
            const winners = snapshot.val();
            if (winners) {
                addActivityItem(`🎉 Winners announced! (${Object.keys(winners).length})`);
            }
        });

        // Listen to new participants
        const participantsRef = firebaseDb.ref(`contests/${contestId}/participants`);
        participantsRef.on('child_added', (snapshot) => {
            const participant = snapshot.val();
            if (participant) {
                addActivityItem(`New participant: ${participant.name} (${participant.platform})`);
            }
        });

        console.log('Subscribed to real-time updates');
    } catch (error) {
        console.error('Firebase subscription error:', error);
        startPolling(contestId);
    }
}

// Update real-time metrics
function updateRealtimeMetrics(metrics) {
    if (metrics.totalParticipants !== undefined) {
        document.getElementById('totalParticipants').textContent = metrics.totalParticipants;
    }
    if (metrics.qualified !== undefined) {
        document.getElementById('qualifiedCount').textContent = metrics.qualified;
    }
    if (metrics.winners !== undefined) {
        document.getElementById('winnersCount').textContent = metrics.winners;
    }
    if (metrics.fairnessScore !== undefined) {
        document.getElementById('fairnessScore').textContent = metrics.fairnessScore + '%';
    }
}

// Add activity item to feed
function addActivityItem(message) {
    const feed = document.getElementById('activityFeed');

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

// Fallback polling for updates
function startPolling(contestId) {
    setInterval(() => {
        loadContestData(contestId);
    }, 10000); // Poll every 10 seconds
}

// Initial activity message
setTimeout(() => {
    addActivityItem('Dashboard loaded and monitoring contest');
}, 500);
