const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');

// Participant routes
router.post('/register', participantController.registerParticipant);
router.get('/', participantController.getParticipants);
router.get('/:id', participantController.getParticipantById);

// Workflow management
router.put('/:id/stage', participantController.updateParticipantStage);
router.post('/bulk-qualify', participantController.bulkQualifyParticipants);

// Engagement
router.put('/:id/engagement', participantController.updateEngagement);

// Duplicate check
router.post('/check-duplicate', participantController.checkDuplicate);

module.exports = router;
