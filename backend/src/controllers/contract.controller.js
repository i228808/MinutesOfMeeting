const Contract = require('../models/Contract');
const MeetingTranscript = require('../models/MeetingTranscript');
const { asyncHandler } = require('../middleware/error.middleware');
const { llmService, LimitService, googleService } = require('../services');
const { paginate, paginateResponse } = require('../utils/helpers');

/**
 * Draft a new contract (optionally from a meeting)
 */
const draftContract = asyncHandler(async (req, res) => {
    const {
        title,
        meeting_id,
        contract_type = 'GENERAL',
        parties = [],
        custom_instructions
    } = req.body;

    // Check contract limit
    const canCreate = await LimitService.canPerformAction(req.user._id, 'contract');
    if (!canCreate.allowed) {
        return res.status(429).json({
            error: 'Contract limit exceeded',
            message: canCreate.reason,
            upgrade_prompt: canCreate.upgrade_prompt
        });
    }

    let meetingData = {
        summary: '',
        actors: parties,
        responsibilities: [],
        deadlines: [],
        key_decisions: []
    };

    // If based on a meeting, get the meeting data
    if (meeting_id) {
        const meeting = await MeetingTranscript.findOne({
            _id: meeting_id,
            user_id: req.user._id
        });

        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        if (meeting.status !== 'COMPLETED') {
            return res.status(400).json({ error: 'Meeting must be processed before generating contract' });
        }

        meetingData = {
            summary: meeting.summary,
            actors: meeting.processed_actors,
            responsibilities: meeting.processed_responsibilities,
            deadlines: meeting.processed_deadlines,
            key_decisions: meeting.key_decisions
        };
    }

    // --- RAG Retrieval from Utility Server ---
    // --- RAG Retrieval from Utility Server ---
    let ragContext = "";
    try {
        // Use custom instructions, OR meeting summary, OR generic type
        let query = custom_instructions;
        if (!query && meetingData && meetingData.summary) {
            query = `${contract_type} clauses regarding: ${meetingData.summary}`;
        }
        if (!query) {
            query = `Standard clauses for ${contract_type} agreement`;
        }

        console.log(`[RAG] Attempting to query Utility Server at http://localhost:5001/query...`);
        console.log(`[RAG] Query: "${query}"`);

        // Use axios instead of fetch for reliability
        const axios = require('axios');
        const ragRes = await axios.post('http://localhost:5001/query', {
            query: query,
            limit: 3
        });

        if (ragRes.data && ragRes.data.results) {
            const results = ragRes.data.results;
            if (results.length > 0) {
                console.log(`[RAG] Success! Retrieved ${results.length} relevant clauses.`);
                ragContext = results.map((r, i) =>
                    `[Reference Clause ${i + 1} - ${r.contract_type || 'Doc'} (${r.section || 'N/A'})]:\n${r.text}`
                ).join('\n\n');
            } else {
                console.log(`[RAG] Success, but no results found.`);
            }
        }
    } catch (err) {
        console.error("[RAG] ERROR: Failed to query Utility Server:", err.message);
        if (err.code === 'ECONNREFUSED') {
            console.error("[RAG] Is the utility server running on port 5001?");
        }
    }

    // Generate contract draft with LLM
    let draftText;
    if (custom_instructions) {
        // Use custom instructions + RAG Context
        const enrichedInstructions = custom_instructions +
            (ragContext ? `\n\nRELEVANT LEGAL CLAUSES/CONTEXT:\n${ragContext}` : '') +
            '\n\nMeeting Data:\n' + JSON.stringify(meetingData);

        draftText = await llmService.improveContract(
            '', // No existing text
            enrichedInstructions
        );
    } else {
        // Pass Meeting Data + RAG Context
        draftText = await llmService.generateContract(meetingData, contract_type, ragContext);
    }

    // Create contract record
    const contract = await Contract.create({
        user_id: req.user._id,
        meeting_id: meeting_id || null,
        title: title || `${contract_type} Contract - ${new Date().toLocaleDateString()}`,
        contract_type,
        parties: parties.length > 0 ? parties : meetingData.actors.map(a => ({
            name: a.name,
            email: a.email,
            role: 'Party'
        })),
        draft_text: draftText,
        status: 'DRAFTED',
        revision_history: [{
            version: 1,
            content: draftText,
            changed_by: 'AI',
            changed_at: new Date(),
            notes: 'Initial draft generated'
        }]
    });

    // Increment usage
    await LimitService.incrementUsage(req.user._id, 'contract');

    res.status(201).json({
        success: true,
        contract: {
            id: contract._id,
            title: contract.title,
            contract_type: contract.contract_type,
            status: contract.status,
            draft_text: contract.draft_text,
            created_at: contract.created_at
        }
    });
});

/**
 * Update contract draft
 */
const updateContract = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { draft_text, instructions, parties, title } = req.body;

    const contract = await Contract.findOne({
        _id: id,
        user_id: req.user._id
    });

    if (!contract) {
        return res.status(404).json({ error: 'Contract not found' });
    }

    if (contract.status === 'FINALIZED' || contract.status === 'SIGNED') {
        return res.status(400).json({ error: 'Cannot modify finalized or signed contracts' });
    }

    // If instructions provided, use LLM to improve
    if (instructions) {
        const improvedText = await llmService.improveContract(
            contract.draft_text,
            instructions
        );
        contract.draft_text = improvedText;
    } else if (draft_text) {
        contract.draft_text = draft_text;
    }

    if (parties) {
        contract.parties = parties;
    }

    if (title) {
        contract.title = title;
    }

    contract.status = 'EDITED';

    // Add to revision history
    contract.revision_history.push({
        version: contract.revision_history.length + 1,
        content: contract.draft_text,
        changed_by: instructions ? 'AI' : req.user.name,
        changed_at: new Date(),
        notes: instructions || 'Manual edit'
    });

    await contract.save();

    res.json({
        success: true,
        contract: {
            id: contract._id,
            title: contract.title,
            status: contract.status,
            draft_text: contract.draft_text,
            revision_count: contract.revision_history.length
        }
    });
});

/**
 * Finalize a contract
 */
const finalizeContract = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const contract = await Contract.findOne({
        _id: id,
        user_id: req.user._id
    });

    if (!contract) {
        return res.status(404).json({ error: 'Contract not found' });
    }

    if (contract.status === 'FINALIZED' || contract.status === 'SIGNED') {
        return res.status(400).json({ error: 'Contract is already finalized' });
    }

    contract.final_text = contract.draft_text;
    contract.status = 'FINALIZED';

    contract.revision_history.push({
        version: contract.revision_history.length + 1,
        content: contract.final_text,
        changed_by: req.user.name,
        changed_at: new Date(),
        notes: 'Contract finalized'
    });

    await contract.save();

    res.json({
        success: true,
        contract: {
            id: contract._id,
            title: contract.title,
            status: contract.status,
            final_text: contract.final_text
        }
    });
});

/**
 * Get single contract
 */
const getContract = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const contract = await Contract.findOne({
        _id: id,
        user_id: req.user._id
    }).populate('meeting_id', 'title summary');

    if (!contract) {
        return res.status(404).json({ error: 'Contract not found' });
    }

    res.json({ contract });
});

/**
 * List all contracts
 */
const listContracts = asyncHandler(async (req, res) => {
    const { page, limit, status, type, search } = req.query;
    const { skip, limit: limitNum, page: pageNum } = paginate(page, limit);

    const query = { user_id: req.user._id };

    if (status) {
        query.status = status.toUpperCase();
    }

    if (type) {
        query.contract_type = type.toUpperCase();
    }

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { draft_text: { $regex: search, $options: 'i' } }
        ];
    }

    const [contracts, total] = await Promise.all([
        Contract.find(query)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limitNum)
            .select('-draft_text -final_text -revision_history'), // Exclude large fields
        Contract.countDocuments(query)
    ]);

    res.json(paginateResponse(contracts, total, pageNum, limitNum));
});

/**
 * Delete a contract
 */
const deleteContract = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const contract = await Contract.findOne({
        _id: id,
        user_id: req.user._id
    });

    if (!contract) {
        return res.status(404).json({ error: 'Contract not found' });
    }

    if (contract.status === 'SIGNED') {
        return res.status(400).json({ error: 'Cannot delete signed contracts' });
    }

    await contract.deleteOne();

    res.json({ success: true, message: 'Contract deleted' });
});

/**
 * Get contract revision history
 */
const getRevisionHistory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const contract = await Contract.findOne({
        _id: id,
        user_id: req.user._id
    }).select('revision_history title');

    if (!contract) {
        return res.status(404).json({ error: 'Contract not found' });
    }

    res.json({
        title: contract.title,
        revisions: contract.revision_history
    });
});

/**
 * Generate contract from meeting analysis with regional laws
 */
const generateFromAnalysis = asyncHandler(async (req, res) => {
    const {
        transcript,
        contract_elements,
        region,
        contract_type,
        title,
        custom_instructions,
        meeting_id
    } = req.body;

    if (!transcript) {
        return res.status(400).json({ error: 'Transcript is required' });
    }

    // Check contract limit
    const canCreate = await LimitService.canPerformAction(req.user._id, 'contract');
    if (!canCreate.allowed) {
        return res.status(429).json({
            error: 'Contract limit exceeded',
            message: canCreate.reason,
            upgrade_prompt: canCreate.upgrade_prompt
        });
    }

    // --- RAG Retrieval from Utility Server ---
    let ragContext = "";
    try {
        const query = custom_instructions || `${contract_type} clauses for ${region} region`;

        console.log(`[RAG] Attempting to query Utility Server at http://localhost:5001/query...`);
        console.log(`[RAG] Query: "${query}"`);

        // Use axios instead of fetch for reliability
        const axios = require('axios');
        const ragRes = await axios.post('http://localhost:5001/query', {
            query: query,
            limit: 3
        });

        if (ragRes.data && ragRes.data.results) {
            const results = ragRes.data.results;
            if (results.length > 0) {
                console.log(`[RAG] Success! Retrieved ${results.length} relevant clauses.`);
                ragContext = results.map((r, i) =>
                    `[Reference Clause ${i + 1} - ${r.contract_type || 'Doc'} (${r.section || 'N/A'})]:\n${r.text}`
                ).join('\n\n');
            } else {
                console.log(`[RAG] Success, but no results found.`);
            }
        }
    } catch (err) {
        console.error("[RAG] ERROR: Failed to query Utility Server:", err.message);
        if (err.code === 'ECONNREFUSED') {
            console.error("[RAG] Is the utility server running on port 5001?");
        }
    }

    // Generate contract with LLM
    const draftText = await llmService.generateContractFromTranscript({
        transcript,
        contract_elements,
        region: region || 'General',
        contract_type: contract_type || 'SERVICE_AGREEMENT',
        title,
        custom_instructions,
        context: ragContext // Pass RAG context here
    });

    // Extract parties from contract elements
    const parties = (contract_elements?.parties_identified || []).map(name => ({
        name,
        role: 'Party'
    }));

    // Create contract record
    const contract = await Contract.create({
        user_id: req.user._id,
        meeting_id: meeting_id || null,
        title: title || `${contract_type || 'Service'} Agreement - ${new Date().toLocaleDateString()}`,
        contract_type: contract_type || 'SERVICE_AGREEMENT',
        parties,
        draft_text: draftText,
        status: 'DRAFTED',
        revision_history: [{
            version: 1,
            content: draftText,
            changed_by: 'AI',
            changed_at: new Date(),
            notes: `Generated from transcript with ${region} jurisdiction`
        }]
    });

    // Increment usage
    await LimitService.incrementUsage(req.user._id, 'contract');

    res.status(201).json({
        success: true,
        contract: {
            id: contract._id,
            title: contract.title,
            contract_type: contract.contract_type,
            status: contract.status,
            draft_text: contract.draft_text,
            created_at: contract.created_at
        }
    });
});

/**
 * Export contract to Google Docs
 */
const exportToDocs = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const contract = await Contract.findOne({
        _id: id,
        user_id: req.user._id
    });

    if (!contract) {
        return res.status(404).json({ error: 'Contract not found' });
    }

    // Idempotency: Return existing doc if already exported
    if (contract.google_doc_id) {
        return res.json({
            success: true,
            doc: {
                id: contract.google_doc_id,
                url: contract.google_doc_url,
                already_existed: true
            }
        });
    }

    // Create new doc
    const docData = await googleService.createDoc(
        req.user,
        contract.title,
        contract.draft_text // Content to insert
    );

    // Save ID and URL
    contract.google_doc_id = docData.documentId;
    contract.google_doc_url = docData.documentUrl;
    await contract.save();

    res.json({
        success: true,
        doc: {
            id: contract.google_doc_id,
            url: contract.google_doc_url,
            already_existed: false
        }
    });
});

module.exports = {
    draftContract,
    updateContract,
    finalizeContract,
    getContract,
    listContracts,
    deleteContract,
    getRevisionHistory,
    generateFromAnalysis,
    exportToDocs
};
