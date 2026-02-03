const FileType = require('file-type');
const fs = require('fs');

/**
 * Middleware to validate uploaded file type using magic numbers
 */
const validateAudioFile = async (req, res, next) => {
    if (!req.file) {
        return next(); // Multer might have failed or no file, let controller handle
    }

    try {
        const fileType = await FileType.fromFile(req.file.path);

        if (!fileType) {
            // Remove the potentially dangerous file
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Could not determine file type' });
        }

        const allowedMimes = [
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm',
            'audio/ogg', 'audio/flac', 'audio/mp4', 'audio/m4a',
            'video/webm', 'video/mp4'
        ];

        if (!allowedMimes.includes(fileType.mime)) {
            // Remove the dangerous file
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                error: `Invalid file type detected: ${fileType.mime}. Only audio/video files are allowed.`
            });
        }

        // Pass validation
        next();
    } catch (error) {
        console.error('File validation error:', error);
        // Clean up on error just in case
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ error: 'File validation failed' });
    }
};

module.exports = { validateAudioFile };
