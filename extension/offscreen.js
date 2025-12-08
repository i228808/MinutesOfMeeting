let recorder = null;
let data = null;
let sessionId = null;
let audioContext = null;
let mediaStream = null;
let intervalId = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.target !== 'offscreen') return;

    if (message.type === 'START_RECORDING_OFFSCREEN') {
        startRecording(message.data).then(result => sendResponse(result));
        return true;
    } else if (message.type === 'STOP_RECORDING_OFFSCREEN') {
        stopRecording().then(result => sendResponse(result));
        return true;
    }
});

async function startRecording(params) {
    try {
        data = params; // Store for stopRecording
        const { streamId, token, meetingUrl, platform, serverUrl, title } = params;
        const systemStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    chromeMediaSourceId: streamId
                }
            },
            video: false // Audio only
        });

        // Also get Mic stream
        // Note: Mic permission must be granted to extension
        let micStream;
        try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e) {
            console.warn('Mic access failed or denied:', e);
        }

        // 2. Mix Audio
        audioContext = new AudioContext();
        const destination = audioContext.createMediaStreamDestination();

        // Connect System Audio
        if (systemStream) {
            const source1 = audioContext.createMediaStreamSource(systemStream);
            source1.connect(destination);
            // Play system audio back through speakers so user can still hear it
            source1.connect(audioContext.destination);
        }

        // Connect Mic Audio
        if (micStream) {
            const source2 = audioContext.createMediaStreamSource(micStream);
            source2.connect(destination);
        }

        mediaStream = destination.stream;

        // 3. Start Session with Backend
        // Route: /api/realtime/stream/start
        const startRes = await fetch(`${serverUrl}/api/realtime/stream/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                meeting_url: meetingUrl,
                platform: platform
            })
        });

        if (!startRes.ok) {
            throw new Error('Failed to start session on backend');
        }
        const startData = await startRes.json();
        sessionId = startData.session_id;

        // 4. Start MediaRecorder
        recorder = new MediaRecorder(mediaStream, { mimeType: 'audio/webm;codecs=opus' });

        recorder.ondataavailable = async (event) => {
            if (event.data.size > 0 && recorder.state === 'recording') {
                console.log(`Offscreen: Captured chunk size: ${event.data.size} bytes`);
                uploadChunk(event.data, token, serverUrl);
            }
        };

        // Slice every 1 second
        recorder.start(1000);

        return { success: true };

    } catch (err) {
        console.error('Offscreen Start Error:', err);
        return { success: false, error: err.message };
    }
}

async function stopRecording() {
    if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
    }

    // Stop tracks
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
    }
    if (audioContext) {
        audioContext.close();
    }

    // End Session on Backend
    if (sessionId && data) {
        try {
            await fetch(`${data.serverUrl}/api/realtime/stream/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${data.token}`
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    title: data.title || 'Recorded Meeting'
                })
            });
        } catch (err) {
            console.error('Failed to end session:', err);
        }
    }

    // Clear state
    recorder = null;
    sessionId = null;
    data = null;

    return { success: true };
}

async function uploadChunk(blob, token, serverUrl) {
    if (!sessionId) return;

    try {
        const formData = new FormData();
        formData.append('audio', blob);
        formData.append('session_id', sessionId);

        await fetch(`${serverUrl}/api/realtime/stream/chunk`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
    } catch (err) {
        console.error('Chunk upload failed:', err);
    }
}
