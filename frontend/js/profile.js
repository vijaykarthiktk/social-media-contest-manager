// Profile Page JavaScript
let selectedContestId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadUserContests();
    setupEventListeners();
});

function setupEventListeners() {
    const contestSelect = document.getElementById('adminContestSelect');
    contestSelect.addEventListener('change', (e) => {
        selectedContestId = e.target.value;
        if (selectedContestId) {
            loadContestDetails();
            loadParticipants();
            loadContestAnalytics();
        }
    });

    const createForm = document.getElementById('createContestForm');
    createForm.addEventListener('submit', handleCreateContest);
}

// Load user's contests
async function loadUserContests() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}?limit=100`);
        const result = await response.json();

        if (result.success) {
            populateContestSelector(result.data);
        }
    } catch (error) {
        console.error('Error loading contests:', error);
    }
}

function populateContestSelector(contests) {
    const select = document.getElementById('adminContestSelect');
    select.innerHTML = '<option value="">Select a contest...</option>';

    contests.forEach(contest => {
        const option = document.createElement('option');
        option.value = contest._id;
        option.textContent = `${contest.title} (${contest.status}) - ${contest.currentParticipants} participants`;
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
        status: 'Draft',
        platforms: ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'TikTok', 'YouTube'],
        duplicateCheckEnabled: true,
        fraudDetectionEnabled: true
    };

    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contestData)
            }
        );

        const result = await response.json();

        if (result.success) {
            alert('Contest created successfully! ✅');
            document.getElementById('createContestForm').reset();
            loadContestsForAdmin();
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
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}/${selectedContestId}`
        );
        const result = await response.json();

        if (result.success) {
            document.getElementById('contestControls').style.display = 'block';
            document.getElementById('contestStatus').value = result.data.status;
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            }
        );

        const result = await response.json();

        if (result.success) {
            alert('Contest status updated successfully! ✅');
            loadContestsForAdmin();
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
                headers: { 'Content-Type': 'application/json' },
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
                headers: { 'Content-Type': 'application/json' },
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
    if (!selectedContestId) return;

    const stage = document.getElementById('stageFilter').value;
    let url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PARTICIPANTS}?contestId=${selectedContestId}&limit=500`;

    if (stage) {
        url += `&stage=${stage}`;
    }

    try {
        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
            displayParticipantsTable(result.data);
        }
    } catch (error) {
        console.error('Error loading participants:', error);
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
                <td><span class="contest-status ${p.stage.toLowerCase()}">${p.stage}</span></td>
                <td>${p.engagementScore}</td>
                <td>${p.priority}</td>
                <td ${fraudClass}>${p.fraudScore}</td>
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

// Load contest analytics
async function loadContestAnalytics() {
    if (!selectedContestId) return;

    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}/${selectedContestId}/analytics`
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
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Total Registrations</div>
                <div class="metric-value">${contest.totalRegistrations}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Qualified</div>
                <div class="metric-value">${contest.qualifiedParticipants}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Finalists</div>
                <div class="metric-value">${contest.finalists}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Fairness Score</div>
                <div class="metric-value">${contest.fairnessScore}%</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Duplicates Detected</div>
                <div class="metric-value" style="color: #f59e0b;">${contest.duplicatesDetected}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Fraud Attempts</div>
                <div class="metric-value" style="color: #ef4444;">${contest.fraudAttempts}</div>
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
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYTICS}/fraud?contestId=${selectedContestId}`
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
