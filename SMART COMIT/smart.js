let map;
let buses = [];
let routes = [];
let busMarkers = [];
let selectedBus = null;
let db;

document.addEventListener('DOMContentLoaded', function() {
    initDB();
    initMap();
    loadData();
    setupEventListeners();
    simulateBusMovement();
});

function initDB() {
    const request = indexedDB.open('SmartCommuteDB', 1);
    request.onupgradeneeded = function(event) {
        db = event.target.result;
        if (!db.objectStoreNames.contains('signInHistory')) {
            db.createObjectStore('signInHistory', { keyPath: 'id', autoIncrement: true });
        }
    };
    request.onsuccess = function(event) {
        db = event.target.result;
        console.log('Database initialized');
    };
    request.onerror = function(event) {
        console.error('Database error:', event.target.error);
    };
}

function logSignIn(username) {
    const transaction = db.transaction(['signInHistory'], 'readwrite');
    const store = transaction.objectStore('signInHistory');
    const signInRecord = {
        username: username,
        timestamp: new Date().toISOString()
    };
    store.add(signInRecord);
}

function loadData() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            routes = data.routes;
            buses = data.buses;
            populateRoutes();
            displayBuses();
            displayAdminBuses();
        })
        .catch(error => console.error('Error loading data:', error));
}

function initMap() {
    // Initialize Google Map
    const bangalore = { lat: 12.9716, lng: 77.5946 };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: bangalore,
    });
}

function setupEventListeners() {
    document.getElementById('userView').addEventListener('click', showUserView);
    document.getElementById('adminView').addEventListener('click', showAdminView);
    document.getElementById('signInBtn').addEventListener('click', showSignIn);
    document.getElementById('chatBtn').addEventListener('click', showChat);
    document.getElementById('gamesBtn').addEventListener('click', showGames);
    document.getElementById('voiceBtn').addEventListener('click', showVoice);
    document.getElementById('routeSelect').addEventListener('change', displayRouteDetails);
    document.getElementById('addBusForm').addEventListener('submit', addBus);
    document.getElementById('buses').addEventListener('click', selectBus);
    document.getElementById('signInForm').addEventListener('submit', handleSignIn);
    document.getElementById('signUpForm').addEventListener('submit', handleSignUp);
    document.getElementById('showSignUp').addEventListener('click', showSignUp);
    document.getElementById('showSignIn').addEventListener('click', showSignInFromSignUp);
    document.getElementById('sendChat').addEventListener('click', sendChatMessage);
    document.getElementById('chatInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendChatMessage();
    });
    document.getElementById('ticTacToeBtn').addEventListener('click', startTicTacToe);
    document.getElementById('puzzleBtn').addEventListener('click', startPuzzle);
    document.getElementById('sosBtn').addEventListener('click', triggerSOS);
    document.getElementById('startVoice').addEventListener('click', startVoiceRecognition);
}

function showUserView() {
    document.getElementById('userSection').style.display = 'block';
    document.getElementById('adminSection').style.display = 'none';
}

function showAdminView() {
    document.getElementById('userSection').style.display = 'none';
    document.getElementById('adminSection').style.display = 'block';
}

function populateRoutes() {
    const select = document.getElementById('routeSelect');
    select.innerHTML = '<option value="">Select a route</option>';
    routes.forEach(route => {
        const option = document.createElement('option');
        option.value = route.id;
        option.textContent = route.name;
        select.appendChild(option);
    });
}

function displayRouteDetails() {
    const routeId = parseInt(this.value);
    const route = routes.find(r => r.id === routeId);
    const details = document.getElementById('routeDetails');
    if (route) {
        details.innerHTML = `
            <h3>${route.name}</h3>
            <p>Stops: ${route.stops.map(s => s.name).join(' → ')}</p>
            <p>Schedule: First bus ${route.schedule.first}, Last bus ${route.schedule.last}, Every ${route.schedule.frequency} minutes</p>
        `;
        // Draw route on map using Google Maps
        const path = route.stops.map(stop => ({ lat: stop.lat, lng: stop.lng }));
        const polyline = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#0000FF',
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });
        polyline.setMap(map);
    } else {
        details.innerHTML = '';
    }
}

function displayBuses() {
    const busList = document.getElementById('buses');
    busList.innerHTML = '';
    buses.forEach(bus => {
        const li = document.createElement('li');
        li.dataset.busId = bus.id;
        li.textContent = `Bus ${bus.id} - Route ${bus.routeId} (${bus.status})`;
        busList.appendChild(li);
    });
    updateBusMarkers();
}

function displayAdminBuses() {
    const adminBusList = document.getElementById('adminBuses');
    adminBusList.innerHTML = '';
    buses.forEach(bus => {
        const li = document.createElement('li');
        li.textContent = `Bus ${bus.id}: Lat ${bus.lat.toFixed(4)}, Lng ${bus.lng.toFixed(4)}, Speed ${bus.speed} km/h`;
        adminBusList.appendChild(li);
    });
}

function updateBusMarkers() {
    busMarkers.forEach(marker => marker.setMap(null));
    busMarkers = [];
    buses.forEach(bus => {
        const marker = new google.maps.Marker({
            position: { lat: bus.lat, lng: bus.lng },
            map: map,
            title: `Bus ${bus.id}`,
        });
        const infoWindow = new google.maps.InfoWindow({
            content: `Bus ${bus.id}<br>Route ${bus.routeId}<br>Status: ${bus.status}`,
        });
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
        busMarkers.push(marker);
    });
}

function selectBus(event) {
    if (event.target.tagName === 'LI') {
        const busId = parseInt(event.target.dataset.busId);
        selectedBus = buses.find(b => b.id === busId);
        if (selectedBus) {
            calculateETA(selectedBus);
        }
    }
}

function calculateETA(bus) {
    const route = routes.find(r => r.id === bus.routeId);
    if (!route) return;

    const currentStopIndex = bus.currentStop - 1;
    const nextStops = route.stops.slice(currentStopIndex);
    let totalTime = 0;
    let distance = 0;

    for (let i = 0; i < nextStops.length - 1; i++) {
        const stop1 = nextStops[i];
        const stop2 = nextStops[i + 1];
        distance += getDistance(stop1.lat, stop1.lng, stop2.lat, stop2.lng);
    }

    totalTime = (distance / bus.speed) * 60; // in minutes

    const eta = new Date(Date.now() + totalTime * 60000);
    document.getElementById('etaInfo').textContent = `ETA for Bus ${bus.id}: ${eta.toLocaleTimeString()}`;
}

function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLng = deg2rad(lng2 - lng1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

function simulateBusMovement() {
    setInterval(() => {
        buses.forEach(bus => {
            if (bus.status === 'moving') {
                const route = routes.find(r => r.id === bus.routeId);
                if (route) {
                    const currentStopIndex = bus.currentStop - 1;
                    if (currentStopIndex < route.stops.length - 1) {
                        const nextStop = route.stops[currentStopIndex + 1];
                        const distance = getDistance(bus.lat, bus.lng, nextStop.lat, nextStop.lng);
                        if (distance < 0.1) { // Close to next stop
                            bus.currentStop++;
                            if (bus.currentStop >= route.stops.length) {
                                bus.currentStop = 1; // Loop back
                            }
                        } else {
                            // Move towards next stop
                            const directionLat = (nextStop.lat - bus.lat) / distance;
                            const directionLng = (nextStop.lng - bus.lng) / distance;
                            bus.lat += directionLat * 0.01; // Small step
                            bus.lng += directionLng * 0.01;
                        }
                    }
                }
            }
        });
        updateBusMarkers();
        displayBuses();
        displayAdminBuses();
        if (selectedBus) {
            calculateETA(selectedBus);
        }
    }, 5000); // Update every 5 seconds
}

function addBus(event) {
    event.preventDefault();
    const busId = parseInt(document.getElementById('busId').value);
    const routeId = parseInt(document.getElementById('routeId').value);
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng').value);

    const newBus = {
        id: busId,
        routeId: routeId,
        currentStop: 1,
        lat: lat,
        lng: lng,
        speed: 40,
        status: 'moving'
    };

    buses.push(newBus);
    displayBuses();
    displayAdminBuses();
    document.getElementById('addBusForm').reset();
}

// New functions for additional features
function showSignIn() {
    hideAllSections();
    document.getElementById('signInSection').style.display = 'block';
}

function showChat() {
    hideAllSections();
    document.getElementById('chatSection').style.display = 'block';
}

function showGames() {
    hideAllSections();
    document.getElementById('gamesSection').style.display = 'block';
}

function hideAllSections() {
    const sections = ['userSection', 'adminSection', 'signInSection', 'signUpSection', 'chatSection', 'gamesSection', 'sosSection', 'voiceSection'];
    sections.forEach(section => {
        document.getElementById(section).style.display = 'none';
    });
}

function handleSignIn(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    // Simple mock authentication
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        localStorage.setItem('currentUser', username);
        logSignIn(username); // Log sign-in to IndexedDB
        document.getElementById('signInMessage').textContent = 'Signed in successfully!';
        document.getElementById('signInBtn').textContent = `Signed in as ${username}`;
        hideAllSections();
        document.getElementById('userSection').style.display = 'block';
    } else {
        document.getElementById('signInMessage').textContent = 'Invalid credentials!';
    }
}

function handleSignUp(event) {
    event.preventDefault();
    const username = document.getElementById('newUsername').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('newPassword').value;
    // Simple mock registration
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.username === username)) {
        document.getElementById('signUpMessage').textContent = 'Username already exists!';
    } else {
        users.push({ username, email, password });
        localStorage.setItem('users', JSON.stringify(users));
        document.getElementById('signUpMessage').textContent = 'Signed up successfully! Please sign in.';
        showSignIn();
    }
}

function showSignUp() {
    hideAllSections();
    document.getElementById('signUpSection').style.display = 'block';
}

function showSignInFromSignUp() {
    hideAllSections();
    document.getElementById('signInSection').style.display = 'block';
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (message) {
        addChatMessage('You', message);
        input.value = '';
        // Improved AI response based on message content
        setTimeout(() => {
            let response = "I'm here to help with your commuting needs!";
            if (message.toLowerCase().includes('bus') || message.toLowerCase().includes('route')) {
                response = "I can provide information about bus routes, schedules, and real-time tracking. Which route are you interested in?";
            } else if (message.toLowerCase().includes('eta') || message.toLowerCase().includes('time')) {
                response = "For estimated arrival times, please select a bus from the list on the map.";
            } else if (message.toLowerCase().includes('delay') || message.toLowerCase().includes('late')) {
                response = "If you're experiencing delays, check the real-time map for updates or contact BMTC support.";
            } else if (message.toLowerCase().includes('help') || message.toLowerCase().includes('assist')) {
                response = "I can help with route information, bus tracking, ETA calculations, and general commuting advice.";
            } else if (message.toLowerCase().includes('bmtc')) {
                response = "BMTC (Bangalore Metropolitan Transport Corporation) operates the bus services in Bangalore. You can track buses using their official app or this SmartCommute platform.";
            }
            addChatMessage('AI Assistant', response);
        }, 1000);
    }
}

function addChatMessage(sender, message) {
    const messages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

function startTicTacToe() {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = '<div class="tic-tac-toe-board" id="ticTacToeBoard"></div>';
    const board = document.getElementById('ticTacToeBoard');
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'tic-tac-toe-cell';
        cell.dataset.index = i;
        cell.addEventListener('click', playTicTacToe);
        board.appendChild(cell);
    }
    gameArea.insertAdjacentHTML('beforeend', '<button onclick="resetTicTacToe()">Reset Game</button>');
}

let ticTacToeBoard = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';

function playTicTacToe(event) {
    const index = event.target.dataset.index;
    if (ticTacToeBoard[index] === '') {
        ticTacToeBoard[index] = currentPlayer;
        event.target.textContent = currentPlayer;
        if (checkWinner()) {
            alert(`${currentPlayer} wins!`);
            resetTicTacToe();
        } else if (ticTacToeBoard.every(cell => cell !== '')) {
            alert('It\'s a draw!');
            resetTicTacToe();
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        }
    }
}

function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    return winPatterns.some(pattern => {
        return pattern.every(index => ticTacToeBoard[index] === currentPlayer);
    });
}

function resetTicTacToe() {
    ticTacToeBoard = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    document.querySelectorAll('.tic-tac-toe-cell').forEach(cell => cell.textContent = '');
}

function startPuzzle() {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = '<div class="puzzle-board" id="puzzleBoard"></div>';
    const board = document.getElementById('puzzleBoard');
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, '', 9, 10, 11, 12, 13, 14, 15];
    numbers.forEach(num => {
        const cell = document.createElement('div');
        cell.className = 'puzzle-cell' + (num === '' ? ' empty' : '');
        cell.textContent = num;
        cell.dataset.value = num;
        if (num !== '') {
            cell.addEventListener('click', movePuzzlePiece);
        }
        board.appendChild(cell);
    });
    gameArea.insertAdjacentHTML('beforeend', '<button onclick="shufflePuzzle()">Shuffle</button>');
}

function movePuzzlePiece(event) {
    const clickedCell = event.target;
    const emptyCell = document.querySelector('.puzzle-cell.empty');
    const clickedIndex = Array.from(clickedCell.parentNode.children).indexOf(clickedCell);
    const emptyIndex = Array.from(emptyCell.parentNode.children).indexOf(emptyCell);

    if (Math.abs(clickedIndex - emptyIndex) === 1 || Math.abs(clickedIndex - emptyIndex) === 4) {
        [clickedCell.textContent, emptyCell.textContent] = [emptyCell.textContent, clickedCell.textContent];
        [clickedCell.className, emptyCell.className] = [emptyCell.className, clickedCell.className];
        clickedCell.removeEventListener('click', movePuzzlePiece);
        emptyCell.addEventListener('click', movePuzzlePiece);
    }
}

function shufflePuzzle() {
    for (let i = 0; i < 100; i++) {
        const cells = document.querySelectorAll('.puzzle-cell:not(.empty)');
        const randomCell = cells[Math.floor(Math.random() * cells.length)];
        randomCell.click();
    }
}

function triggerSOS() {
    const message = document.getElementById('sosMessage');
    message.textContent = 'Emergency services contacted! Help is on the way.';
    // In a real app, this would trigger actual emergency services
    alert('SOS Activated! Emergency services have been notified.');
}

function showVoice() {
    hideAllSections();
    document.getElementById('voiceSection').style.display = 'block';
}

function startVoiceRecognition() {
    const status = document.getElementById('voiceStatus');
    const response = document.getElementById('voiceResponse');

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        status.textContent = 'Speech recognition not supported in this browser.';
        return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = function() {
        status.textContent = 'Listening...';
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript.toLowerCase();
        status.textContent = 'Processing...';
        response.textContent = `You said: "${transcript}"`;

        // Process voice commands
        if (transcript.includes('show user view') || transcript.includes('user view')) {
            showUserView();
            response.textContent += '\nSwitched to User View.';
        } else if (transcript.includes('show admin view') || transcript.includes('admin view')) {
            showAdminView();
            response.textContent += '\nSwitched to Admin Dashboard.';
        } else if (transcript.includes('show chat') || transcript.includes('chat')) {
            showChat();
            response.textContent += '\nOpened AI Chat Assistant.';
        } else if (transcript.includes('show games') || transcript.includes('games')) {
            showGames();
            response.textContent += '\nOpened Games Section.';
        } else if (transcript.includes('sign in')) {
            showSignIn();
            response.textContent += '\nOpened Sign In Section.';
        } else if (transcript.includes('sos') || transcript.includes('emergency')) {
            triggerSOS();
            response.textContent += '\nSOS Activated!';
        } else {
            response.textContent += '\nCommand not recognized. Try saying "show user view", "show admin view", "show chat", "show games", "sign in", or "sos".';
        }
    };

    recognition.onerror = function(event) {
        status.textContent = 'Error occurred in recognition: ' + event.error;
    };

    recognition.onend = function() {
        status.textContent = 'Click to start voice recognition';
    };

    recognition.start();
}
