// Global state
let allPlayers = [];
let filteredPlayers = [];
let teams = [];

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        showLoading();
        
        // Fetch initial data
        await Promise.all([
            fetchPlayers(),
            fetchTeams()
        ]);
        
        // Setup event listeners
        setupEventListeners();
        
        // Initial render
        renderPlayers();
        
        hideLoading();
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to load players. Please check your internet connection and try again.');
    }
}

/**
 * Fetch all players from API (Python backend: object of team -> [players])
 */
async function fetchPlayers() {
    try {
        const response = await fetch(API_ENDPOINTS.profiles);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        // Python backend returns { "Team A": [ {...} ], "Team B": [ ... ] }
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            allPlayers = [];
            for (const teamName of Object.keys(data)) {
                const list = data[teamName] || [];
                for (const p of list) {
                    allPlayers.push({
                        username: p.username,
                        displayName: p.full_name || p.username,
                        team: p.team || teamName,
                        position: p.position || null,
                        profileData: { profilePictureUrl: p.avatar_url || null },
                        instagramUrl: p.profile_url || `https://www.instagram.com/${p.username}/`
                    });
                }
            }
            teams = Object.keys(data).sort();
        } else {
            allPlayers = [];
            teams = [];
        }
        filteredPlayers = [...allPlayers];
        updatePlayerCount();
    } catch (error) {
        console.error('Error fetching players:', error);
        throw error;
    }
}

/**
 * Fetch teams from API (or use teams from profiles response)
 */
async function fetchTeams() {
    try {
        const response = await fetch(API_ENDPOINTS.teams);
        if (!response.ok) return;
        const data = await response.json();
        if (data && data.teams && data.teams.length) teams = data.teams;
        populateTeamFilter();
    } catch (error) {
        // Teams already set from fetchPlayers; just ensure dropdown is filled
        populateTeamFilter();
    }
}

// No fetchPlayerPosts: feed is shown via Instagram embed on profile.html?username=xxx

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Team filter
    const teamFilter = document.getElementById('teamFilter');
    teamFilter.addEventListener('change', handleTeamFilter);
    
    // Sort filter
    const sortFilter = document.getElementById('sortFilter');
    sortFilter.addEventListener('change', handleSort);
}

/**
 * Handle search input
 */
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    filteredPlayers = allPlayers.filter(player => {
        return player.displayName.toLowerCase().includes(searchTerm) ||
               player.username.toLowerCase().includes(searchTerm) ||
               (player.team && player.team.toLowerCase().includes(searchTerm));
    });
    
    // Apply current team filter if set
    const teamFilter = document.getElementById('teamFilter').value;
    if (teamFilter) {
        filteredPlayers = filteredPlayers.filter(player => player.team === teamFilter);
    }
    
    renderPlayers();
    updatePlayerCount();
}

/**
 * Handle team filter change
 */
function handleTeamFilter(event) {
    const selectedTeam = event.target.value;
    
    if (selectedTeam === '') {
        // Show all players
        filteredPlayers = [...allPlayers];
    } else {
        // Filter by team
        filteredPlayers = allPlayers.filter(player => player.team === selectedTeam);
    }
    
    // Apply search filter if set
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    if (searchTerm) {
        filteredPlayers = filteredPlayers.filter(player => {
            return player.displayName.toLowerCase().includes(searchTerm) ||
                   player.username.toLowerCase().includes(searchTerm) ||
                   (player.team && player.team.toLowerCase().includes(searchTerm));
        });
    }
    
    renderPlayers();
    updatePlayerCount();
}

/**
 * Handle sort change
 */
function handleSort(event) {
    const sortBy = event.target.value;
    
    switch (sortBy) {
        case 'name':
            filteredPlayers.sort((a, b) => a.displayName.localeCompare(b.displayName));
            break;
        case 'team':
            filteredPlayers.sort((a, b) => {
                const teamCompare = a.team.localeCompare(b.team);
                return teamCompare !== 0 ? teamCompare : a.displayName.localeCompare(b.displayName);
            });
            break;
        case 'posts':
            filteredPlayers.sort((a, b) => a.displayName.localeCompare(b.displayName));
            break;
    }
    
    renderPlayers();
}

/**
 * Render players grid
 */
function renderPlayers() {
    const grid = document.getElementById('playersGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (filteredPlayers.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    grid.innerHTML = filteredPlayers.map(player => createPlayerCard(player)).join('');
    
    // Add click listeners: go to profile page with Instagram embed (same as instagram-gallery-display)
    document.querySelectorAll('.player-card').forEach(card => {
        card.addEventListener('click', () => {
            const username = card.dataset.username;
            window.location.href = 'profile.html?username=' + encodeURIComponent(username);
        });
    });
}

/**
 * Create player card HTML
 */
function createPlayerCard(player) {
    const avatar = player.profileData?.profilePictureUrl
        ? `<img src="${player.profileData.profilePictureUrl}" alt="${player.displayName}" class="player-avatar">`
        : `<div class="player-avatar-placeholder">${player.displayName.charAt(0)}</div>`;
    
    const followers = player.profileData?.followersCount
        ? formatNumber(player.profileData.followersCount)
        : '—';
    const posts = ''; // Not used with embed; feed is on profile page
    
    return `
        <div class="player-card" data-username="${player.username}">
            <div class="player-card-header">
                ${avatar}
                <div class="player-info">
                    <h3>${escapeHtml(player.displayName)}</h3>
                    <p class="player-team">${escapeHtml(player.team)}</p>
                    ${player.position ? `<p class="player-position">${escapeHtml(player.position)}</p>` : ''}
                </div>
            </div>
            <div class="player-card-body">
                <div class="player-stats">
                    <div class="stat">
                        <span class="stat-value">${followers}</span>
                        <span class="stat-label">Followers</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">View</span>
                        <span class="stat-label">Feed</span>
                    </div>
                </div>
            </div>
            <div class="player-card-footer">
                @${player.username}
            </div>
        </div>
    `;
}

/**
 * Populate team filter dropdown
 */
function populateTeamFilter() {
    const teamFilter = document.getElementById('teamFilter');
    
    // Clear existing options except "All Teams"
    teamFilter.innerHTML = '<option value="">All Teams</option>';
    
    // Add team options
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        teamFilter.appendChild(option);
    });
}

/**
 * Update player count display
 */
function updatePlayerCount() {
    const playerCount = document.getElementById('playerCount');
    playerCount.textContent = `${filteredPlayers.length} player${filteredPlayers.length !== 1 ? 's' : ''}`;
}

/**
 * Show loading state
 */
function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('playersGrid').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
}

/**
 * Hide loading state
 */
function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('playersGrid').style.display = 'grid';
}

/**
 * Show error message
 */
function showError(message) {
    const errorContainer = document.getElementById('errorMessage');
    const errorText = errorContainer.querySelector('.error-text');
    
    errorText.textContent = message;
    errorContainer.style.display = 'flex';
    
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('playersGrid').style.display = 'none';
}

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Utility: Format large numbers
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Utility: Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

