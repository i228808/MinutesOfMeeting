const Team = require('../models/Team');
const User = require('../models/User');
const MeetingTranscript = require('../models/MeetingTranscript');
const { asyncHandler } = require('../middleware/error.middleware');

// Helper to generate 9-char random alphanumeric string
const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 9; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Create a new team
 * POST /api/teams
 */
const createTeam = asyncHandler(async (req, res) => {
    const { name, projects } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Team name is required' });
    }

    // Generate unique invite code
    let invite_code = generateInviteCode();
    let isUnique = false;
    while (!isUnique) {
        const existing = await Team.findOne({ invite_code });
        if (!existing) isUnique = true;
        else invite_code = generateInviteCode();
    }

    const team = await Team.create({
        name,
        owner_id: req.user._id,
        members: [req.user._id], // Creator is first member
        invite_code,
        projects: projects || []
    });

    // Add to user's teams
    await User.findByIdAndUpdate(req.user._id, {
        $push: { teams: team._id }
    });

    res.status(201).json({
        success: true,
        team
    });
});

/**
 * Join a team via invite code
 * POST /api/teams/join
 */
const joinTeam = asyncHandler(async (req, res) => {
    const { invite_code } = req.body;

    if (!invite_code) {
        return res.status(400).json({ error: 'Invite code is required' });
    }

    const team = await Team.findOne({ invite_code });

    if (!team) {
        return res.status(404).json({ error: 'Invalid invite code' });
    }

    // Check if already a member
    if (team.members.includes(req.user._id)) {
        return res.status(400).json({ error: 'You are already a member of this team' });
    }

    // Add user to team members
    team.members.push(req.user._id);
    await team.save();

    // Add team to user's teams list
    await User.findByIdAndUpdate(req.user._id, {
        $push: { teams: team._id }
    });

    res.json({
        success: true,
        message: `Joined team ${team.name} successfully`,
        team
    });
});

/**
 * Get all teams for the current user
 * GET /api/teams
 */
const getMyTeams = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('teams');

    res.json({
        success: true,
        teams: user.teams || []
    });
});

/**
 * Get details of a specific team
 * GET /api/teams/:id
 */
const getTeamDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const team = await Team.findById(id)
        .populate('members', 'name email profile_image') // Get member details
        .populate('owner_id', 'name email');

    if (!team) {
        return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is a member
    const isMember = team.members.some(member => member._id.toString() === req.user._id.toString());
    if (!isMember) {
        return res.status(403).json({ error: 'Not authorized to view this team' });
    }

    // Get recent meetings for this team
    const meetings = await MeetingTranscript.find({ team_id: id })
        .sort({ created_at: -1 })
        .limit(10)
        .select('title status created_at audio_duration_minutes processed_deadlines');

    res.json({
        success: true,
        team,
        meetings
    });
});

module.exports = {
    createTeam,
    joinTeam,
    getMyTeams,
    getTeamDetails
};
