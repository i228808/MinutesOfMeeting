document.getElementById('grant-btn').addEventListener('click', async () => {
    const successMsg = document.getElementById('success-msg');
    const errorMsg = document.getElementById('error-msg');
    const btn = document.getElementById('grant-btn');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop immediately, we just needed the permission grant
        stream.getTracks().forEach(track => track.stop());

        successMsg.style.display = 'block';
        errorMsg.style.display = 'none';
        btn.style.display = 'none';

        // Notify background/popup? Not strictly needed as they verify on load.
        // But we can try to close the tab after a delay?
        setTimeout(() => {
            // window.close(); 
        }, 3000);

    } catch (e) {
        console.error(e);
        errorMsg.style.display = 'block';
        successMsg.style.display = 'none';

        if (e.name === 'NotAllowedError') {
            errorMsg.querySelector('p').textContent = 'Access blocked. Please click the Lock/Settings icon in the address bar and reset permissions.';
        }
    }
});
