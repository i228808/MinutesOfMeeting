document.addEventListener('DOMContentLoaded', async () => {
    // --- ELEMENTS ---
    const views = {
        login: document.getElementById('login-view'),
        main: document.getElementById('main-view')
    };

    // Header
    const userDisplay = document.getElementById('user-display');

    // Login
    const loginInputs = {
        email: document.getElementById('email-input'),
        pass: document.getElementById('password-input'),
        btn: document.getElementById('login-btn'),
        error: document.getElementById('login-error')
    };

    // Main
    const containers = {
        setup: document.getElementById('setup-container'),
        recording: document.getElementById('recording-container')
    };

    const mainControls = {
        title: document.getElementById('meeting-title'),
        permWarning: document.getElementById('perm-warning'),
        permBtn: document.getElementById('perm-btn'),
        error: document.getElementById('main-error'),
        startBtn: document.getElementById('start-btn'),
        stopBtn: document.getElementById('stop-btn'),
        logoutBtn: document.getElementById('logout-btn'),
        timer: document.getElementById('timer'),
        activeTitle: document.getElementById('active-title-display'),
        transcriptLog: document.getElementById('transcript-log')
    };

    const SERVER_URL = 'http://localhost:5000';
    let socket = null;
    let timerInterval = null;
    let startTime = null;

    // --- INIT ---
    let { token, userEmail, isRecording, startTime: savedStart, activeTitle } = await getStorage();

    if (token) {
        showMainView(userEmail);
        if (isRecording) {
            restoreRecordingState(activeTitle, savedStart);
            connectSocket(token); // Reconnect if recording
        } else {
            checkPermissions();
        }
    } else {
        showLoginView();
    }

    // --- HANDLERS ---

    // Login
    loginInputs.btn.addEventListener('click', async () => {
        const email = loginInputs.email.value.trim();
        const password = loginInputs.pass.value.trim();

        if (!email || !password) return showInfo(loginInputs.error, 'Please enter credentials', 'error');

        setLoading(loginInputs.btn, true);
        try {
            const res = await fetch(`${SERVER_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');

            // Success
            await setStorage({ token: data.token, userEmail: data.user.email });
            token = data.token;

            showMainView(data.user.email);
            checkPermissions();

        } catch (err) {
            showInfo(loginInputs.error, err.message, 'error');
        } finally {
            setLoading(loginInputs.btn, false);
        }
    });

    // Logout
    mainControls.logoutBtn.addEventListener('click', async () => {
        if (socket) socket.disconnect();
        await chrome.storage.local.clear();
        location.reload();
    });

    // Permissions
    mainControls.permBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'permission.html' });
        window.close();
    });

    // Start
    mainControls.startBtn.addEventListener('click', async () => {
        const title = mainControls.title.value.trim() || `Meeting ${new Date().toLocaleDateString()}`;

        mainControls.startBtn.disabled = true;
        hideInfo(mainControls.error);

        chrome.runtime.sendMessage({
            type: 'START_RECORDING',
            data: { token, serverUrl: SERVER_URL, title }
        }, (response) => {
            mainControls.startBtn.disabled = false;
            if (response && response.success) {
                const now = Date.now();
                setStorage({ isRecording: true, startTime: now, activeTitle: title });

                // Switch UI
                startRecordingUI(title, now);

                // Connect Socket
                connectSocket(token);
            } else {
                showInfo(mainControls.error, response?.error || 'Failed to start', 'error');
            }
        });
    });

    // Stop
    mainControls.stopBtn.addEventListener('click', () => {
        mainControls.stopBtn.disabled = true;

        chrome.runtime.sendMessage({ type: 'STOP_RECORDING' }, (response) => {
            mainControls.stopBtn.disabled = false;

            if (response && response.success) {
                stopRecordingUI();
                setStorage({ isRecording: false, startTime: null, activeTitle: null });
                if (socket) socket.disconnect();

                // User feedback
                mainControls.title.value = '';
                showInfo(mainControls.error, 'Meeting saved. Analyzing...', 'success'); // abusing error box for success msg
                setTimeout(() => hideInfo(mainControls.error), 3000);
            } else {
                showInfo(mainControls.error, response?.error || 'Stop failed', 'error');
            }
        });
    });


    // --- FUNCTIONS ---

    function showLoginView() {
        views.login.classList.add('active');
        views.main.classList.remove('active');
    }

    function showMainView(email) {
        views.login.classList.remove('active');
        views.main.classList.add('active');
        userDisplay.textContent = email || 'User';
        userDisplay.style.color = 'var(--primary)';
        userDisplay.style.background = 'rgba(99, 102, 241, 0.1)';
    }

    function startRecordingUI(title, startTs) {
        containers.setup.style.display = 'none';
        containers.recording.style.display = 'flex'; // flex for column layout
        mainControls.activeTitle.textContent = title;
        mainControls.transcriptLog.innerHTML = ''; // Clear log

        startTime = startTs;
        startTimer();
    }

    function restoreRecordingState(title, startTs) {
        startRecordingUI(title, startTs);
    }

    function stopRecordingUI() {
        containers.recording.style.display = 'none';
        containers.setup.style.display = 'block';
        stopTimer();
    }

    function connectSocket(authToken) {
        if (socket && socket.connected) return;

        // Assumes socket.io.js is loaded
        socket = io(SERVER_URL, {
            auth: { token: authToken },
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('Socket Connected');
            appendLog('System', 'Connected to server', 'info');
        });

        socket.on('connect_error', (err) => {
            console.error('Socket Error:', err);
            // appendLog('System', 'Connection error', 'error');
        });

        socket.on('transcription', (data) => {
            if (data && data.text) {
                appendLog('Transcript', data.text, 'text');
            }
        });

        socket.on('stream_ended', () => {
            appendLog('System', 'Stream ended.', 'info');
        });
    }

    function appendLog(sender, text, type) {
        const div = document.createElement('div');
        div.className = 't-chunk';

        if (type === 'text') {
            div.textContent = text;
        } else if (type === 'info') {
            div.style.color = '#94a3b8';
            div.style.fontSize = '11px';
            div.textContent = `[${text}]`;
        } else if (type === 'error') {
            div.style.color = '#fca5a5';
            div.style.fontSize = '11px';
            div.textContent = `Error: ${text}`;
        }

        mainControls.transcriptLog.appendChild(div);

        // Auto-scroll
        mainControls.transcriptLog.scrollTop = mainControls.transcriptLog.scrollHeight;
    }

    async function checkPermissions() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasLabels = devices.some(d => d.kind === 'audioinput' && d.label !== '');

            if (!hasLabels) {
                mainControls.permWarning.style.display = 'block';
                mainControls.startBtn.style.display = 'none';
            } else {
                mainControls.permWarning.style.display = 'none';
                mainControls.startBtn.style.display = 'flex';
            }
        } catch (e) { console.error(e); }
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (!startTime) return;
            const diff = Math.floor((Date.now() - startTime) / 1000);
            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff % 3600) / 60);
            const s = diff % 60;
            mainControls.timer.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
        }, 1000);
    }

    function stopTimer() { clearInterval(timerInterval); }
    function pad(n) { return n.toString().padStart(2, '0'); }

    function showInfo(el, msg, type = 'error') {
        el.textContent = msg;
        el.style.display = 'block';
        if (type === 'error') {
            el.className = 'info-box info-error';
        } else {
            el.className = 'info-box info-warning'; // greenish if success?
            if (type === 'success') el.style.borderColor = '#4ade80';
            if (type === 'success') el.style.color = '#4ade80';
        }
    }
    function hideInfo(el) { el.style.display = 'none'; }

    function setLoading(btn, isLoading) {
        if (isLoading) {
            btn.disabled = true;
            btn._text = btn.innerHTML;
            btn.textContent = '...';
        } else {
            btn.disabled = false;
            if (btn._text) btn.innerHTML = btn._text;
        }
    }

    function getStorage() {
        return new Promise(r => chrome.storage.local.get(null, r));
    }
    function setStorage(obj) {
        return new Promise(r => chrome.storage.local.set(obj, r));
    }
});
