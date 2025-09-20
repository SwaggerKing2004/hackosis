let userProfile = {
    name: '',
    email: '',
    location: '',
    skills: [],
    interests: []
};

// Function to handle fetching matches from the backend
async function fetchMatches(profile) {
    try {
        const response = await fetch('/match', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profile)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const matches = await response.json();
        // Save the matches to sessionStorage to be accessed by the matches.html page
        sessionStorage.setItem('internshipMatches', JSON.stringify(matches));
        
        // Redirect to the matches page
        window.location.href = '/matches.html';

    } catch (error) {
        console.error('Error fetching matches:', error);
        alert('Failed to find matches. Please try again.');
    }
}

// Function to handle the profile form submission
function handleProfileForm(event) {
    event.preventDefault(); // Prevent default form submission

    userProfile.name = document.getElementById('name').value;
    userProfile.email = document.getElementById('email').value;
    userProfile.location = document.getElementById('location').value;

    const skillsTags = document.querySelectorAll('#skillsTags .tag-item');
    userProfile.skills = Array.from(skillsTags).map(tag => tag.dataset.value);

    const interestsTags = document.querySelectorAll('#interestsTags .tag-item');
    userProfile.interests = Array.from(interestsTags).map(tag => tag.dataset.value);
    
    // Call the function to fetch matches from the backend
    fetchMatches(userProfile);
}

// Function to initialize the profile form page
function initializeProfileForm() {
    const form = document.getElementById('profileForm');
    if (form) {
        form.addEventListener('submit', handleProfileForm);
    }
    
    // Tag input logic
    const skillsInput = document.getElementById('skillsInput');
    const skillsTagsContainer = document.getElementById('skillsTags');
    const interestsInput = document.getElementById('interestsInput');
    const interestsTagsContainer = document.getElementById('interestsTags');

    function createTag(text, container) {
        const tag = document.createElement('span');
        tag.classList.add('tag-item');
        tag.dataset.value = text;
        tag.textContent = text;
        const removeBtn = document.createElement('span');
        removeBtn.classList.add('remove-tag');
        removeBtn.textContent = '×';
        removeBtn.onclick = () => tag.remove();
        tag.appendChild(removeBtn);
        container.appendChild(tag);
    }

    if (skillsInput) {
        skillsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && skillsInput.value.trim() !== '') {
                e.preventDefault();
                createTag(skillsInput.value.trim(), skillsTagsContainer);
                skillsInput.value = '';
            }
        });
    }

    if (interestsInput) {
        interestsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && interestsInput.value.trim() !== '') {
                e.preventDefault();
                createTag(interestsInput.value.trim(), interestsTagsContainer);
                interestsInput.value = '';
            }
        });
    }
}

// Function to display the matches on the matches.html page
function displayMatches(matches) {
    const container = document.getElementById('matchesContainer');
    const noMatchesDiv = document.getElementById('noMatches');

    if (matches.length === 0) {
        container.style.display = 'none';
        noMatchesDiv.style.display = 'block';
        return;
    }

    container.style.display = 'grid';
    noMatchesDiv.style.display = 'none';
    container.innerHTML = '';

    matches.forEach(match => {
        const card = document.createElement('div');
        card.className = 'match-card';
        card.innerHTML = `
            <h3 class="match-title">${match.title}</h3>
            <p class="match-company">${match.company}</p>
            <p class="match-location">${match.location}</p>
            <div class="match-confidence">
                <div class="confidence-bar" style="width: ${match.confidence.toFixed(2)}%;"></div>
                <span class="confidence-text">${match.confidence.toFixed(2)}% Match</span>
            </div>
            <p class="match-reason">${match.reason}</p>
            <div class="match-skills">
                <span class="skill-label">Skills:</span>
                ${match.Skills.split(',').map(s => `<span class="skill-tag">${s.trim()}</span>`).join('')}
            </div>
            <div class="match-interests">
                <span class="interest-label">Interests:</span>
                ${match.Interests.split(',').map(i => `<span class="interest-tag">${i.trim()}</span>`).join('')}
            </div>
            <div class="match-actions">
                <button class="btn-secondary" onclick="generateTemplate('${match.title}', '${match.company}')">
                    Generate Template
                </button>
                <button class="btn-primary" onclick="acceptMatch(${JSON.stringify(match).split('"').join("'")})">
                    Accept
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Function to initialize the matches page
function initializeMatchesPage() {
    const matchesData = sessionStorage.getItem('internshipMatches');
    if (matchesData) {
        const matches = JSON.parse(matchesData);
        displayMatches(matches);
    } else {
        // If no matches are found, show the "no matches" message
        document.getElementById('matchesContainer').style.display = 'none';
        document.getElementById('noMatches').style.display = 'block';
    }
}

// Function to handle accepting a match (sends data back to Flask)
async function acceptMatch(match) {
    // Add user profile information to the accepted match data
    const profile = JSON.parse(sessionStorage.getItem('userProfile')) || {};
    const dataToSend = {
        title: match.title,
        company: match.company,
        confidence: match.confidence,
        reason: match.reason,
        Preferred_Location: profile.location || 'N/A',
        User_Skills: profile.skills ? profile.skills.join(',') : 'N/A',
        User_Interests: profile.interests ? profile.interests.join(',') : 'N/A'
    };
    
    try {
        const response = await fetch('/accept', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert('Internship accepted! Your preference has been recorded.');
        } else {
            alert('Failed to record acceptance.');
        }
    } catch (error) {
        console.error('Error accepting match:', error);
        alert('An error occurred. Please try again.');
    }
}

// Application template and modal functions
function generateTemplate(title, company) {
    const template = `Dear Hiring Manager at ${company},\n\nI am writing to express my strong interest in the ${title} internship opportunity. My skills and interests align closely with your company's mission.\n\nThank you for your time and consideration.\n\nSincerely,\n${userProfile.name || 'Your Name'}`;
    
    document.getElementById('templateContent').innerHTML = `
        <div class="template-content">${template}</div>
    `;
    
    document.getElementById('templateModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('templateModal').style.display = 'none';
}

function copyTemplate() {
    const templateText = document.querySelector('.template-content').textContent;
    navigator.clipboard.writeText(templateText).then(() => {
        alert('Application template copied to clipboard!');
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = templateText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Application template copied to clipboard!');
    });
}

// Initialize page based on current page
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Store user profile data
    if (currentPage === 'profile.html' && document.getElementById('profileForm')) {
        const form = document.getElementById('profileForm');
        form.addEventListener('submit', (e) => {
            const profileData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                location: document.getElementById('location').value,
                skills: Array.from(document.querySelectorAll('#skillsTags .tag-item')).map(tag => tag.dataset.value),
                interests: Array.from(document.querySelectorAll('#interestsTags .tag-item')).map(tag => tag.dataset.value)
            };
            sessionStorage.setItem('userProfile', JSON.stringify(profileData));
        });
        initializeProfileForm();
    }
    
    switch (currentPage) {
        case 'profile.html':
            initializeProfileForm();
            break;
        case 'matches.html':
            initializeMatchesPage();
            break;
    }
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('templateModal');
        if (event.target === modal) {
            closeModal();
        }
    };
});