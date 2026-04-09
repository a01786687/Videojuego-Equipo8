/*
api.js
connects the game to the anura server RF-49
replaces the mock versions in auth.js and playScene.js
server runs on http://127.0.0.1:8080

 */


// WSL IP -> each teammate needs to run 'hostname -I' on their terminal, and update this
const API_URL = 'http://172.26.83.88:8080';
            // http:// YOUR hostname -I : 8080

// REGISTER
async function apiRegister(username, email, password) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });
    return response.json();
}

// LOGIN
async function apiLogin(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    return response.json();
}

// START RUN
async function apiStartRun(sessionId) {
    const response = await fetch(`${API_URL}/runs/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
    });
    return response.json();
}

// GET LAST RUN
async function apiGetRun(userId) {
    const response = await fetch(`${API_URL}/runs/${userId}`);
    return response.json();
}

// UPDATE RUN
async function apiUpdateRun(runId, mosquitoes_collected, bosses_defeated, run_time, victory) {
    const response = await fetch(`${API_URL}/runs/${runId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mosquitoes_collected, bosses_defeated, run_time, victory })
    });
    return response.json();
}