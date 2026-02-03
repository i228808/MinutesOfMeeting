const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const FILE_AGE_LIMIT_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Cleanup job: Runs every day at midnight
 */
const startCleanupJob = () => {
    // Schedule task to run at 00:00 every day
    cron.schedule('0 0 * * *', () => {
        console.log('[Cron] Starting Scheduled Disk Cleanup...');

        if (!fs.existsSync(UPLOADS_DIR)) {
            console.log('[Cron] Uploads directory does not exist, skipping.');
            return;
        }

        fs.readdir(UPLOADS_DIR, (err, files) => {
            if (err) {
                console.error('[Cron] Failed to read uploads directory:', err);
                return;
            }

            const now = Date.now();
            let deletedCount = 0;

            files.forEach(file => {
                const filePath = path.join(UPLOADS_DIR, file);

                // Skip .gitkeep or other system files if needed, mostly safe to check stat
                fs.stat(filePath, (err, stats) => {
                    if (err) return;

                    if (now - stats.mtimeMs > FILE_AGE_LIMIT_MS) {
                        fs.unlink(filePath, (err) => {
                            if (err) console.error(`[Cron] Failed to delete ${file}:`, err);
                            else {
                                deletedCount++;
                            }
                        });
                    }
                });
            });

            // Note: deletedCount in the log here might be 0 because unlink is async, 
            // but for a simple cron log, starting is enough.
            console.log(`[Cron] Disk cleanup scan initiated for ${files.length} files.`);
        });
    });

    console.log('[System] Disk Cleanup Cron Job initialized (Runs daily at 00:00)');
};

module.exports = startCleanupJob;
