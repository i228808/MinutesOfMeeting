const cron = require('node-cron');
const axios = require('axios');
const Contract = require('../models/Contract');
const User = require('../models/User');

/**
 * Weekly RAG Training Job
 * Runs every Sunday at midnight (0 0 * * 0)
 * 
 * 1. Finds users who consented to data usage.
 * 2. Finds contracts created/updated by them in the last 7 days.
 * 3. Sends contracts to Utility Server for chunking & embedding.
 */
const initRagCron = () => {
    console.log('[Cron] Initializing Weekly RAG Training Job (Schedule: Sunday 00:00)');

    cron.schedule('0 0 * * 0', async () => {
        console.log('[Cron] Starting Weekly RAG Training...');

        try {
            // 1. Find consenting users
            const consentingUsers = await User.find({ data_usage_consent: true }).select('_id');
            const userIds = consentingUsers.map(u => u._id);

            if (userIds.length === 0) {
                console.log('[Cron] No users have consented to data usage. Skipping.');
                return;
            }

            // 2. Find recent contracts (Last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const recentContracts = await Contract.find({
                user_id: { $in: userIds },
                updated_at: { $gte: sevenDaysAgo },
                // Prefer finalized, but take drafts if substantial?
                // taking any contract with content
                $or: [
                    { final_text: { $exists: true, $ne: "" } },
                    { draft_text: { $exists: true, $ne: "" } }
                ]
            }).select('title contract_type final_text draft_text _id');

            if (recentContracts.length === 0) {
                console.log('[Cron] No new contracts found from consenting users.');
                return;
            }

            console.log(`[Cron] Found ${recentContracts.length} contracts for training.`);

            // 3. Prepare payload
            const contractsPayload = recentContracts.map(c => ({
                document_id: `user_contract_${c._id.toString()}`,
                contract_type: c.contract_type,
                text: c.final_text || c.draft_text // Prefer final
            }));

            // 4. Send to Utility Server
            console.log('[Cron] Sending batch to Utility Server...');
            const response = await axios.post('http://localhost:5001/process_contracts', {
                contracts: contractsPayload
            });

            if (response.data && response.data.success) {
                console.log(`[Cron] Training Complete! Processed: ${response.data.processed_contracts}, Chunks Inserted: ${response.data.chunks_inserted}`);
            } else {
                console.error('[Cron] Utility Server returned error:', response.data);
            }

        } catch (error) {
            console.error('[Cron] RAG Training Failed:', error.message);
        }
    });
};

module.exports = initRagCron;
