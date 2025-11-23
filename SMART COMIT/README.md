# SmartCommute - Real-Time Bus Tracking System

A comprehensive web-based bus tracking application for Bangalore Metropolitan Transport Corporation (BMTC) with real-time GPS tracking, AI chat assistant, voice commands, and entertainment features.

## Features

### Core Features
- **Real-Time Bus Tracking**: Track BMTC buses on Google Maps with live GPS updates
- **Route Information**: View detailed route information including stops and schedules
- **ETA Calculation**: Get estimated arrival times for buses at specific stops
- **Admin Dashboard**: Manage bus fleet, add new buses, and monitor operations

### Additional Features
- **User Authentication**: Sign up and sign in with localStorage-based session management
- **IndexedDB Integration**: Store sign-in history for analytics
- **AI Chat Assistant**: Get help with commuting queries and route information
- **Voice Assistant**: Control the app using voice commands (Chrome/Edge browsers)
- **SOS Emergency**: Quick access to emergency services
- **Time Pass Games**: Tic-Tac-Toe and Puzzle games for entertainment during commute

## Setup Instructions

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, or Safari)
- A Google Maps API key (free tier available)
- A local web server (optional, but recommended)

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Maps JavaScript API"
   - Click "Enable"
4. Create an API key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key
5. (Optional) Restrict your API key:
   - Click on your API key to edit
   - Under "Application restrictions", select "HTTP referrers"
   - Add your website URL or `localhost` for testing

### Step 2: Configure the Application

1. Open `smart.html` in a text editor
2. Find this line (around line 16):
   ```html
   <script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap"></script>
   ```
3. Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key:
   ```html
   <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyABC123...&callback=initMap"></script>
   ```
4. Save the file

### Step 3: Run the Application

#### Option 1: Using a Local Web Server (Recommended)

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Using Node.js (http-server):**
```bash
npx http-server -p 8000
```

**Using PHP:**
```bash
php -S localhost:8000
```

Then open your browser and navigate to: `http://localhost:8000/smart.html`

#### Option 2: Direct File Access

Simply double-click `smart.html` to open it in your default browser. Note: Some features may not work properly due to CORS restrictions.

## Usage Guide

### User View
1. Click **"User View"** to see the main tracking interface
2. View active buses on the map
3. Click on a bus marker to see details
4. Select a bus from the list to see ETA
5. Use the route selector to view route information

### Admin Dashboard
1. Click **"Admin Dashboard"** to access admin features
2. Add new buses by filling in the form:
   - Bus ID (e.g., KA01F1234)
   - Route ID (1 or 2)
   - Latitude and Longitude coordinates
3. Monitor the fleet in real-time

### Sign In/Sign Up
1. Click **"Sign In"** button
2. For new users, click "Sign Up" and create an account
3. Sign in with your credentials
4. Your session is stored locally

### AI Chat Assistant
1. Click **"AI Chat"** button
2. Ask questions about:
   - Bus routes and schedules
   - ETA information
   - BMTC services
   - General commuting advice

### Voice Assistant
1. Click **"Voice Assistant"** button
2. Click **"Start Voice Command"**
3. Say commands like:
   - "Show user view"
   - "Show admin view"
   - "Show chat"
   - "Show games"
   - "SOS" or "Emergency"

**Note:** Voice recognition works best in Chrome and Edge browsers.

### Games
1. Click **"Games"** button
2. Choose between:
   - **Tic-Tac-Toe**: Classic two-player game
   - **Puzzle**: Number sliding puzzle

### Emergency SOS
1. Access from any section
2. Click the red **"SOS - Call Emergency"** button
3. Emergency services will be notified (mock implementation)

## File Structure

```
SmartCommute/
├── smart.html          # Main HTML file
├── smart.css           # Styling and responsive design
├── smart.js            # Application logic and functionality
├── data.json           # Bus routes and data
├── TODO.md             # Development progress tracker
└── README.md           # This file
```

## Browser Compatibility

- **Chrome/Edge**: Full support (including voice recognition)
- **Firefox**: Full support (except voice recognition)
- **Safari**: Full support (except voice recognition)
- **Mobile Browsers**: Responsive design supported

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Mapping**: Google Maps JavaScript API
- **Storage**: localStorage, IndexedDB
- **APIs**: Web Speech API (for voice recognition)

## Data Structure

### Routes (data.json)
```json
{
  "id": 1,
  "name": "Route Name",
  "stops": [
    {"id": 1, "name": "Stop Name", "lat": 12.9758, "lng": 77.6033}
  ],
  "schedule": {"first": "06:00", "last": "22:00", "frequency": 30}
}
```

### Buses (data.json)
```json
{
  "id": 1,
  "routeId": 1,
  "currentStop": 1,
  "lat": 12.9758,
  "lng": 77.6033,
  "speed": 40,
  "status": "moving"
}
```

## Troubleshooting

### Map Not Loading
- Verify your Google Maps API key is correct
- Check if Maps JavaScript API is enabled in Google Cloud Console
- Check browser console for error messages
- Ensure you're not exceeding API quota limits

### Voice Recognition Not Working
- Use Chrome or Edge browser
- Allow microphone permissions when prompted
- Check if your browser supports Web Speech API
- Ensure you have a working microphone

### Data Not Loading
- Check if `data.json` is in the same directory as `smart.html`
- Open browser console to check for errors
- Verify JSON syntax is correct

### Buses Not Moving
- The simulation updates every 5 seconds
- Check browser console for JavaScript errors
- Ensure the page has fully loaded

## Future Enhancements

- [ ] Expand data.json with more BMTC bus routes
- [ ] Enhance GPS bus tracking simulation
- [ ] Add real-time traffic integration
- [ ] Implement push notifications for bus arrivals
- [ ] Add fare calculator
- [ ] Integrate with actual BMTC API (when available)
- [ ] Add multi-language support
- [ ] Implement user preferences and favorites

## Contributing

Feel free to fork this project and submit pull requests for any improvements.

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, please check the browser console for error messages and ensure all setup steps have been completed correctly.

---

**Note**: This is a demonstration application. For production use, implement proper backend services, authentication, and real-time data integration with actual BMTC systems.
