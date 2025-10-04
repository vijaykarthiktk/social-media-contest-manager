// Registration Form Handler
let selectedContestId = null;

// Load active contests on page load
document.addEventListener('DOMContentLoaded', () => {
    loadActiveContests();
    setupFormHandlers();
});

// Load active contests
async function loadActiveContests() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTESTS}?status=Active`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            displayContests(result.data);
        } else {
            document.getElementById('contestsList').innerHTML =
                '<p class="empty-state">No active contests available at the moment.</p>';
        }
    } catch (error) {
        console.error('Error loading contests:', error);
        document.getElementById('contestsList').innerHTML =
            '<p class="error">Error loading contests. Please try again later.</p>';
    }
}

// Display contests
function displayContests(contests) {
    const contestsList = document.getElementById('contestsList');
    contestsList.innerHTML = '';

    contests.forEach(contest => {
        const contestCard = document.createElement('div');
        contestCard.className = 'contest-card';
        contestCard.innerHTML = `
            <span class="contest-status active">${contest.status}</span>
            <h3>${contest.title}</h3>
            <p>${contest.description}</p>
            <p><strong>Participants:</strong> ${contest.currentParticipants} / ${contest.maxParticipants}</p>
            <p><strong>End Date:</strong> ${new Date(contest.endDate).toLocaleDateString()}</p>
        `;

        contestCard.addEventListener('click', () => selectContest(contest, contestCard));
        contestsList.appendChild(contestCard);
    });
}

// Select contest
function selectContest(contest, cardElement) {
    // Remove previous selection
    document.querySelectorAll('.contest-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Select new contest
    cardElement.classList.add('selected');
    selectedContestId = contest._id;

    // Show registration form
    document.getElementById('registrationSection').style.display = 'block';
    document.getElementById('selectedContestInfo').textContent =
        `You are registering for: ${contest.title}`;

    // Scroll to form
    document.getElementById('registrationSection').scrollIntoView({
        behavior: 'smooth'
    });
}

// Setup form handlers
function setupFormHandlers() {
    const form = document.getElementById('registrationForm');
    const emailInput = document.getElementById('email');

    // Email duplicate check on blur
    emailInput.addEventListener('blur', checkDuplicateEmail);

    // Form submission
    form.addEventListener('submit', handleFormSubmit);
}

// Check for duplicate email
async function checkDuplicateEmail() {
    if (!selectedContestId) return;

    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    if (!email) return;

    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PARTICIPANTS}/check-duplicate`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phone, contestId: selectedContestId })
            }
        );

        const result = await response.json();

        if (result.isDuplicate) {
            document.getElementById('duplicateWarning').style.display = 'block';
            document.getElementById('submitBtn').disabled = true;
        } else {
            document.getElementById('duplicateWarning').style.display = 'none';
            document.getElementById('submitBtn').disabled = false;
        }
    } catch (error) {
        console.error('Error checking duplicate:', error);
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    if (!selectedContestId) {
        showMessage('Please select a contest first', 'error');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        socialMediaHandle: document.getElementById('socialMediaHandle').value,
        platform: document.getElementById('platform').value,
        contestId: selectedContestId,
        referredBy: document.getElementById('referralCode').value || null
    };

    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PARTICIPANTS}/register`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            }
        );

        const result = await response.json();

        if (result.success) {
            showMessage('Registration successful! Good luck in the contest! 🎉', 'success');
            document.getElementById('registrationForm').reset();

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            showMessage(result.message || 'Registration failed. Please try again.', 'error');
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        showMessage('An error occurred. Please try again later.', 'error');
        submitBtn.disabled = false;
    } finally {
        submitBtn.textContent = 'Register for Contest';
    }
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.getElementById('formMessage');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth' });

    // Hide after 5 seconds for error messages
    if (type === 'error') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}
