const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');
const { protect, optionalAuth } = require('../middleware/auth');

// Participant routes
router.post('/register', participantController.registerParticipant);
router.get('/', protect, participantController.getParticipants);
router.get('/:id', protect, participantController.getParticipantById);

// Workflow management
router.put('/:id/stage', protect, participantController.updateParticipantStage);
router.post('/bulk-qualify', protect, participantController.bulkQualifyParticipants);

// Engagement
router.put('/:id/engagement', protect, participantController.updateEngagement);

// Duplicate check
router.post('/check-duplicate', participantController.checkDuplicate);

module.exports = router;
