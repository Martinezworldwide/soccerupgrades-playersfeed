# Soccer Player Instagram Feed - Frontend

Frontend application for browsing Instagram content from professional soccer players.

## Features

- Responsive grid layout
- Player search functionality
- Filter by team
- Sort by name, team, or post count
- Player profile modal with Instagram posts
- Mobile-friendly design

## Technologies

- Vanilla JavaScript (no framework dependencies)
- CSS Grid and Flexbox
- Fetch API for backend communication
- Modern ES6+ syntax

## Configuration

Edit `js/config.js` to set your backend API URL:

```javascript
const API_BASE_URL = 'http://localhost:3000'; // For local development
// const API_BASE_URL = 'https://your-app.onrender.com'; // For production
```

## Local Development

Serve the frontend using any static file server:

### Option 1: Python
```bash
python -m http.server 8080
```

### Option 2: Node.js http-server
```bash
npx http-server -p 8080
```

### Option 3: VS Code Live Server
Install the Live Server extension and click "Go Live"

Then open `http://localhost:8080` in your browser.

## Deployment to GitHub Pages

1. Create a public GitHub repository
2. Update `js/config.js` with your production backend URL
3. Push the frontend folder to the repository
4. Enable GitHub Pages in repository settings
5. Set source to main branch
6. Your site will be live at `https://yourusername.github.io/repo-name`

## File Structure

```
frontend/
├── index.html              # Main HTML page
├── css/
│   └── styles.css          # All styles
├── js/
│   ├── config.js           # API configuration
│   └── app.js              # Application logic
└── README.md
```

## Features Detail

### Search
Type in the search box to filter players by name, username, or team in real-time.

### Team Filter
Select a team from the dropdown to view only players from that team.

### Sort Options
- Name (A-Z): Alphabetical by player name
- Team: Grouped by team name
- Most Posts: Players with the most cached posts first

### Player Modal
Click on any player card to open a modal showing:
- Profile picture
- Name and team
- Link to Instagram profile
- Grid of recent posts with captions and engagement

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Lazy loading for images
- Debounced search input
- Efficient DOM manipulation
- Minimal dependencies

## Security

- XSS prevention with HTML escaping
- No sensitive data in frontend
- CORS handled by backend

## Customization

### Colors
Edit CSS variables in `css/styles.css`:
```css
:root {
    --primary-color: #00a86b;
    --secondary-color: #0066cc;
    /* ... more colors */
}
```

### Layout
Adjust grid columns in `css/styles.css`:
```css
.players-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}
```

## License

ISC
