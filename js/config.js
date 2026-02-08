// Backend API configuration (Render backend)
const API_BASE_URL = 'https://soccerupgrades-playersfeed-backend.onrender.com';

// API endpoints (Python backend: /api/profiles = object of team -> [players], /api/teams = { teams: [] })
const API_ENDPOINTS = {
    profiles: `${API_BASE_URL}/api/profiles`,
    teams: `${API_BASE_URL}/api/teams`
};
