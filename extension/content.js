// content.js
// Runs on http://localhost:5173/*

function syncToken() {
    const token = localStorage.getItem('token');
    if (token) {
        // Send to background
        chrome.runtime.sendMessage({
            type: 'TOKEN_UPDATE',
            token: token
        }, (response) => {
            if (chrome.runtime.lastError) {
                // Ignore error if popup is not open or bg not listening
            }
        });
    }
}

// Sync on load
syncToken();

// Sync on storage change (login/logout)
window.addEventListener('storage', (event) => {
    if (event.key === 'token') {
        syncToken();
    }
});

// Also listen for manual trigger
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'GET_TOKEN') {
        const token = localStorage.getItem('token');
        sendResponse({ token });
    }
});
