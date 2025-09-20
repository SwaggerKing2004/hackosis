let userProfile = {
    name: '',
    email: '',
    location: '',
    skills: [],
    interests: []
};

// Sample internship data
const internships = [
    {
        id: 1,
        title: "Software Engineering Intern",
        company: "TechCorp Inc.",
        location: "San Francisco, CA",
        skills: ["JavaScript", "React", "Node.js", "Python"],
        description: "Join our dynamic engineering team to build scalable web applications."
    },
    {
        id: 2,
        title: "Data Science Intern",
        company: "DataViz Solutions",
        location: "New York, NY",
        skills: ["Python", "Machine Learning", "SQL", "Statistics"],
        description: "Work with big data to derive meaningful insights for our clients."
    },
    {
        id: 3,
        title: "UX Design Intern",
        company: "Creative Studio",
        location: "Los Angeles, CA",
        skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
        description: "Create beautiful and intuitive user experiences for mobile and web."
    },
    {
        id: 4,
        title: "Marketing Intern",
        company: "Growth Marketing Co.",
        location: "Chicago, IL",
        skills: ["Digital Marketing", "Content Creation", "Analytics", "Social Media"],
        description: "Drive user acquisition and engagement through innovative marketing campaigns."
    },
    {
        id: 5,
        title: "Cybersecurity Intern",
        company: "SecureNet Systems",
        location: "Boston, MA",
        skills: ["Network Security", "Penetration Testing", "Risk Assessment", "Compliance"],
        description: "Protect digital assets and ensure security compliance for enterprise clients."
    }
];

// Load profile from localStorage
function loadProfile() {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
        userProfile = JSON.parse(saved);
    }
}

// Save profile to localStorage
function saveProfile() {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

// Tags input functionality
function initializeTagsInput(inputId, tagsId, profileKey) {
    const input = document.getElementById(inputId);
    const tagsContainer = document.getElementById(tagsId);
    
    if (!input || !tagsContainer) return;

    // Load existing tags
    renderTags(tagsContainer, userProfile[profileKey], profileKey);

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const value = input.value.trim();
            if (value && !userProfile[profileKey].includes(value)) {
                userProfile[profileKey].push(value);
                renderTags(tagsContainer, userProfile[profileKey], profileKey);
                input.value = '';
            }
        }
    });
}

function renderTags(container, tags, profileKey) {
    container.innerHTML = tags.map(tag => `
        <span class="tag">
            ${tag}
            <button type="button" class="tag-remove" onclick="removeTag('${profileKey}', '${tag}')">×</button>
        </span>
    `).join('');
}

function removeTag(profileKey, tagToRemove) {
    userProfile[profileKey] = userProfile[profileKey].filter(tag => tag !== tagToRemove);
    const container = document.getElementById(profileKey + 'Tags');
    renderTags(container, userProfile[profileKey], profileKey);
}

// Profile form handling
function initializeProfileForm() {
    const form = document.getElementById('profileForm');
    if (!form) return;

    // Load existing profile data
    loadProfile();
    
    // Populate form fields
    if (userProfile.name) document.getElementById('name').value = userProfile.name;
    if (userProfile.email) document.getElementById('email').value = userProfile.email;
    if (userProfile.location) document.getElementById('location').value = userProfile.location;

    // Initialize tags inputs
    initializeTagsInput('skillsInput', 'skillsTags', 'skills');
    initializeTagsInput('interestsInput', 'interestsTags', 'interests');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        userProfile.name = document.getElementById('name').value;
        userProfile.email = document.getElementById('email').value;
        userProfile.location = document.getElementById('location').value;

        // Validate required fields
        if (!userProfile.name || !userProfile.email || !userProfile.location || 
            userProfile.skills.length === 0 || userProfile.interests.length === 0) {
            alert('Please fill in all required fields and add at least one skill and interest.');
            return;
        }

        // Save profile and redirect
        saveProfile();
        window.location.href = 'matches.html';
    });
}

// Calculate match score
function calculateMatchScore(internship, profile) {
    let score = 0;
    let reasons = [];

    // Skills matching (40% weight)
    const skillMatches = internship.skills.filter(skill => 
        profile.skills.some(userSkill => 
            userSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(userSkill.toLowerCase())
        )
    );
    const skillScore = (skillMatches.length / internship.skills.length) * 40;
    score += skillScore;

    if (skillMatches.length > 0) {
        reasons.push(`${skillMatches.length} of your skills match: ${skillMatches.slice(0, 2).join(', ')}`);
    }

    // Location matching (30% weight)
    if (profile.location === internship.location || profile.location === 'Remote') {
        score += 30;
        reasons.push('Location matches your preference');
    } else if (profile.location && internship.location) {
        // Partial location match (same state)
        const userState = profile.location.split(', ')[1];
        const internState = internship.location.split(', ')[1];
        if (userState === internState) {
            score += 15;
            reasons.push('Same state as your preference');
        }
    }

    // Interest alignment (30% weight)
    const interestKeywords = {
        'Software Engineering': ['programming', 'coding', 'development', 'software', 'web', 'mobile'],
        'Data Science': ['data', 'analytics', 'machine learning', 'statistics', 'ai', 'research'],
        'UX Design': ['design', 'user experience', 'ui', 'ux', 'creative', 'visual'],
        'Marketing': ['marketing', 'business', 'growth', 'social media', 'content'],
        'Cybersecurity': ['security', 'cyber', 'networking', 'protection', 'privacy']
    };

    for (const [field, keywords] of Object.entries(interestKeywords)) {
        if (internship.title.includes(field.split(' ')[0])) {
            const matchingInterests = profile.interests.filter(interest =>
                keywords.some(keyword => interest.toLowerCase().includes(keyword))
            );
            if (matchingInterests.length > 0) {
                score += 30;
                reasons.push(`Your interests align with ${field.toLowerCase()}`);
                break;
            }
        }
    }

    return {
        score: Math.min(Math.round(score), 100),
        reasons: reasons.slice(0, 2) // Limit to 2 main reasons
    };
}

// Generate application template
function generateApplicationTemplate(internship, profile) {
    return `Subject: Application for ${internship.title} Position

Dear Hiring Manager,

I am writing to express my strong interest in the ${internship.title} position at ${internship.company}. As a motivated student with relevant skills and interests, I believe I would be a valuable addition to your team.

My Background:
- Name: ${profile.name}
- Email: ${profile.email}
- Location: ${profile.location}

Relevant Skills:
${profile.skills.slice(0, 5).map(skill => `- ${skill}`).join('\n')}

Areas of Interest:
${profile.interests.slice(0, 3).map(interest => `- ${interest}`).join('\n')}

I am particularly excited about this opportunity because:
- Your company's focus on ${internship.description.split(' ').slice(0, 10).join(' ')}...
- The chance to work with technologies like ${internship.skills.slice(0, 3).join(', ')}
- The opportunity to contribute to meaningful projects in ${internship.location}

I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to your team. Thank you for considering my application.

Best regards,
${profile.name}
${profile.email}`;
}

// Initialize matches page
function initializeMatchesPage() {
    loadProfile();
    
    const matchesContainer = document.getElementById('matchesContainer');
    const noMatches = document.getElementById('noMatches');
    
    if (!matchesContainer) return;

    // Check if profile is complete
    if (!userProfile.name || !userProfile.skills.length || !userProfile.interests.length) {
        if (noMatches) noMatches.style.display = 'block';
        return;
    }

    // Calculate matches
    const matches = internships.map(internship => {
        const matchData = calculateMatchScore(internship, userProfile);
        return {
            ...internship,
            matchScore: matchData.score,
            matchReasons: matchData.reasons
        };
    }).filter(match => match.matchScore > 20) // Only show matches with >20% score
      .sort((a, b) => b.matchScore - a.matchScore); // Sort by match score

    if (matches.length === 0) {
        if (noMatches) noMatches.style.display = 'block';
        return;
    }

    // Render matches
    matchesContainer.innerHTML = matches.map(match => `
        <div class="internship-card">
            <div class="card-header-info">
                <div>
                    <h3>${match.title}</h3>
                    <div class="company-location">${match.company} • ${match.location}</div>
                </div>
                <div class="confidence-score">${match.matchScore}% Match</div>
            </div>
            
            <div class="skills-required">
                <h4>Skills Required:</h4>
                <div class="skills-list">
                    ${match.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
            
            <div class="match-reason">
                <h4>Why you were matched:</h4>
                <p>${match.matchReasons.join('. ') || 'Good overall fit for your profile.'}</p>
            </div>
            
            <button class="btn-primary" onclick="showApplicationTemplate(${match.id})">
                Generate Application Template
            </button>
        </div>
    `).join('');
}

// Modal functions
function showApplicationTemplate(internshipId) {
    const internship = internships.find(i => i.id === internshipId);
    if (!internship) return;

    const template = generateApplicationTemplate(internship, userProfile);
    
    document.getElementById('templateContent').innerHTML = `
        <h3>Application for ${internship.title}</h3>
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
        // Fallback for older browsers
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