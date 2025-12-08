const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Contract routes
router.post('/draft', contractController.draftContract);
router.get('/', contractController.listContracts);
router.get('/:id', contractController.getContract);
router.put('/:id', contractController.updateContract);
router.put('/:id/finalize', contractController.finalizeContract);
router.delete('/:id', contractController.deleteContract);
router.get('/:id/revisions', contractController.getRevisionHistory);

module.exports = router;
