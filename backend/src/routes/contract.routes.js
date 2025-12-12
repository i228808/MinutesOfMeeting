const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Contracts
 *   description: Contract generation and management
 */

/**
 * @swagger
 * /api/contracts/draft:
 *   post:
 *     summary: Draft a new contract manually
 *     description: Create a new contract from scratch with custom content.
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Service Agreement - Client X"
 *               content:
 *                 type: string
 *                 description: Markdown content of the contract
 *                 example: "# Service Agreement\n\nThis agreement is made between..."
 *               status:
 *                 type: string
 *                 enum: [DRAFT, FINAL]
 *                 default: DRAFT
 *     responses:
 *       201:
 *         description: Contract drafted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 contract:
 *                   type: object
 */
router.post('/draft', contractController.draftContract);

/**
 * @swagger
 * /api/contracts/generate-from-analysis:
 *   post:
 *     summary: Generate contract from meeting analysis
 *     description: Use AI to generate a contract based on a meeting's extracted action items and decisions.
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - meetingId
 *             properties:
 *               meetingId:
 *                 type: string
 *                 description: ID of the processed meeting
 *               template:
 *                 type: string
 *                 description: Type of contract to generate
 *                 enum: [NDA, SERVICE_AGREEMENT, EMPLOYMENT, GENERAL]
 *                 default: GENERAL
 *               region:
 *                 type: string
 *                 description: Legal jurisdiction
 *                 example: "United States"
 *     responses:
 *       200:
 *         description: Contract generated
 */
router.post('/generate-from-analysis', contractController.generateFromAnalysis);

/**
 * @swagger
 * /api/contracts:
 *   get:
 *     summary: List user contracts
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of contracts
 */
router.get('/', contractController.listContracts);

/**
 * @swagger
 * /api/contracts/{id}:
 *   get:
 *     summary: Get contract details
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contract details
 *   put:
 *     summary: Update contract content
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Updated markdown content
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contract updated
 *   delete:
 *     summary: Delete contract
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contract deleted
 */
router.get('/:id', contractController.getContract);
router.put('/:id', contractController.updateContract);
router.delete('/:id', contractController.deleteContract);

/**
 * @swagger
 * /api/contracts/{id}/finalize:
 *   put:
 *     summary: Finalize contract (lock editing)
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contract finalized
 */
router.put('/:id/finalize', contractController.finalizeContract);

/**
 * @swagger
 * /api/contracts/{id}/revisions:
 *   get:
 *     summary: Get contract revision history
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Revision history
 */
router.get('/:id/revisions', contractController.getRevisionHistory);

/**
 * @swagger
 * /api/contracts/{id}/export-docs:
 *   post:
 *     summary: Export contract to Google Docs
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Export successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documentUrl:
 *                   type: string
 */
router.post('/:id/export-docs', contractController.exportToDocs);

module.exports = router;
