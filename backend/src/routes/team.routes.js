const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { createTeam, joinTeam, getMyTeams, getTeamDetails } = require('../controllers/team.controller');

router.use(authenticate); // All team routes require authentication

router.post('/', createTeam);
router.post('/join', joinTeam);
router.get('/', getMyTeams);
router.get('/:id', getTeamDetails);

module.exports = router;
