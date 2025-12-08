const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

/**
 * AudioService - Calls the local Flask STT service for transcription
 * 
 * Make sure the Flask STT server is running:
 * cd STT && python app.py
 */

class AudioService {
    constructor() {
        // URL to the Flask STT service
        this.sttServiceUrl = process.env.STT_SERVICE_URL || 'http://localhost:5000';
    }

    /**
     * Transcribe an audio file using the Flask STT service
     * @param {string} filePath - Path to the audio file
     * @param {string} language - Optional language code (auto-detected by Whisper)
     * @returns {Promise<{text: string, language: string, duration: number}>}
     */
    async transcribeAudio(filePath, language = null) {
        // Verify file exists
        if (!fs.existsSync(filePath)) {
            throw new Error(`Audio file not found: ${filePath}`);
        }

        try {
            // Create form data with the audio file
            const FormData = (await import('form-data')).default;
            const form = new FormData();
            form.append('audio', fs.createReadStream(filePath));

            // Call the Flask STT endpoint
            const response = await fetch(`${this.sttServiceUrl}/transcribe`, {
                method: 'POST',
                body: form,
                headers: form.getHeaders()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `STT service error: ${response.status}`);
            }

            const result = await response.json();

            // Estimate duration from file size
            const stats = fs.statSync(filePath);
            const estimatedDuration = this.getAudioDuration(filePath);

            return {
                text: result.text,
                language: result.language || 'auto',
                duration: estimatedDuration
            };
        } catch (error) {
            console.error('Transcription Error:', error);

            if (error.code === 'ECONNREFUSED') {
                throw new Error('STT service not running. Start it with: cd STT && python app.py');
            }

            throw new Error(`Failed to transcribe audio: ${error.message}`);
        }
    }

    /**
     * Transcribe audio from a buffer
     * @param {Buffer} audioBuffer - Audio data buffer
     * @param {string} format - Audio format (webm, mp3, wav, etc.)
     * @returns {Promise<{text: string, language: string}>}
     */
    async transcribeBuffer(audioBuffer, format = 'webm') {
        try {
            // Create a temporary file from buffer
            const tempDir = path.join(__dirname, '../../uploads/temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            const tempFilePath = path.join(tempDir, `temp_${Date.now()}.${format}`);
            fs.writeFileSync(tempFilePath, audioBuffer);

            const result = await this.transcribeAudio(tempFilePath);

            // Clean up temp file
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }

            return result;
        } catch (error) {
            console.error('Buffer Transcription Error:', error);
            throw new Error(`Failed to transcribe audio buffer: ${error.message}`);
        }
    }

    /**
     * Process real-time audio chunks for streaming transcription
     * Accumulates chunks and transcribes when enough data is collected
     */
    createStreamProcessor() {
        const chunks = [];
        let totalSize = 0;
        const CHUNK_THRESHOLD = 100000; // ~100KB before processing
        const self = this;

        return {
            addChunk: (chunk) => {
                chunks.push(chunk);
                totalSize += chunk.length;
                return totalSize >= CHUNK_THRESHOLD;
            },

            process: async function () {
                if (chunks.length === 0) return null;

                const combinedBuffer = Buffer.concat(chunks);
                chunks.length = 0;
                totalSize = 0;

                try {
                    return await self.transcribeBuffer(combinedBuffer, 'webm');
                } catch (error) {
                    console.error('Stream Processing Error:', error);
                    return null;
                }
            },

            flush: async function () {
                if (chunks.length === 0) return null;
                return await this.process();
            },

            clear: () => {
                chunks.length = 0;
                totalSize = 0;
            }
        };
    }

    /**
     * Get audio file duration in minutes (rough estimate)
     */
    getAudioDuration(filePath) {
        const stats = fs.statSync(filePath);
        const fileSizeInBytes = stats.size;
        // Rough estimate: ~16KB per second for typical audio
        const estimatedSeconds = fileSizeInBytes / 16000;
        return estimatedSeconds / 60; // Return minutes
    }

    /**
     * Validate audio file format
     */
    isValidAudioFormat(filename) {
        const validFormats = [
            '.mp3', '.mp4', '.mpeg', '.mpga', '.m4a',
            '.wav', '.webm', '.ogg', '.flac'
        ];

        const ext = path.extname(filename).toLowerCase();
        return validFormats.includes(ext);
    }

    /**
     * Clean up old temporary audio files
     */
    async cleanupTempFiles(maxAgeHours = 24) {
        const tempDir = path.join(__dirname, '../../uploads/temp');

        if (!fs.existsSync(tempDir)) return;

        const files = fs.readdirSync(tempDir);
        const now = Date.now();
        const maxAge = maxAgeHours * 60 * 60 * 1000;

        for (const file of files) {
            if (file === '.gitkeep') continue;

            const filePath = path.join(tempDir, file);
            const stats = fs.statSync(filePath);

            if (now - stats.mtimeMs > maxAge) {
                fs.unlinkSync(filePath);
            }
        }
    }

    /**
     * Check if STT service is available
     */
    async checkServiceHealth() {
        try {
            const response = await fetch(`${this.sttServiceUrl}/`);
            return response.ok;
        } catch {
            return false;
        }
    }
}

module.exports = new AudioService();
