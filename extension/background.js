let offscreenCreating = null;
// isRecording removed, using storage state

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_RECORDING') {
        startRecording(message.data).then(res => sendResponse(res));
        return true; // Keep channel open
    } else if (message.type === 'STOP_RECORDING') {
        stopRecording().then(res => sendResponse(res));
        return true;
    }
});

// Helper to manage state
const state = {
    async get() {
        // Use storage.session (in-memory, persists while browser valid)
        // Fallback to local if session not available (rare in MV3)
        const s = await chrome.storage.session.get(['isRecording']);
        return s.isRecording || false;
    },
    async set(val) {
        await chrome.storage.session.set({ isRecording: val });
    }
};

async function startRecording(data) {
    const recording = await state.get();
    if (recording) return { success: false, error: 'Already recording' };

    try {
        // 1. Ensure offscreen document exists
        await setupOffscreenDocument('offscreen.html');

        // 2. Get the active tab's stream ID
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) throw new Error('No active tab found');

        const streamId = await chrome.tabCapture.getMediaStreamId({
            targetTabId: tab.id
        });

        // 3. Send START command to offscreen
        const response = await chrome.runtime.sendMessage({
            type: 'START_RECORDING_OFFSCREEN',
            target: 'offscreen',
            data: {
                streamId: streamId,
                token: data.token,
                meetingUrl: tab.url,
                platform: identifyPlatform(tab.url),
                serverUrl: data.serverUrl,
                title: data.title
            }
        });

        if (response && response.success) {
            await state.set(true);
            return { success: true };
        } else {
            throw new Error(response?.error || 'Failed to start offscreen recording');
        }
    } catch (err) {
        console.error('Start recording error:', err);
        return { success: false, error: err.message };
    }
}

async function stopRecording() {
    // Check state from storage, not local variable
    const recording = await state.get();

    // Even if storage says false, we should try to close offscreen to be safe
    // preventing "stuck" recordings.

    try {
        // Send STOP command to offscreen
        // (Might fail if offscreen doesn't exist, we catch generic error)
        let response = { success: true };
        try {
            response = await chrome.runtime.sendMessage({
                type: 'STOP_RECORDING_OFFSCREEN',
                target: 'offscreen'
            });
        } catch (e) {
            console.log('Offscreen not listening or closed:', e);
        }

        await state.set(false);

        // Close offscreen document to release resources
        await closeOffscreenDocument();

        return response || { success: true };
    } catch (err) {
        console.error('Stop recording error:', err);
        return { success: false, error: err.message };
    }
}

// Helper: Create offscreen document
async function setupOffscreenDocument(path) {
    if (await hasOffscreenDocument()) return;

    if (offscreenCreating) {
        await offscreenCreating;
    } else {
        offscreenCreating = chrome.offscreen.createDocument({
            url: path,
            reasons: ['AUDIO_PLAYBACK', 'USER_MEDIA'],
            justification: 'Recording meeting audio for transcription'
        });
        await offscreenCreating;
        offscreenCreating = null;
    }
}

async function closeOffscreenDocument() {
    if (await hasOffscreenDocument()) {
        chrome.offscreen.closeDocument();
    }
}

async function hasOffscreenDocument() {
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT']
    });
    return existingContexts.length > 0;
}

function identifyPlatform(url) {
    if (url.includes('google.com')) return 'GOOGLE_MEET';
    if (url.includes('zoom.us')) return 'ZOOM';
    if (url.includes('teams.microsoft.com')) return 'TEAMS';
    return 'OTHER';
}
