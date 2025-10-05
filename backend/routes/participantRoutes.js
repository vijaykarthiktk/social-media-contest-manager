const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Participant routes
router.post('/register', participantController.registerParticipant);
router.get('/', protect, authorize('admin', 'moderator'), participantController.getParticipants);
router.get('/:id', protect, authorize('admin', 'moderator'), participantController.getParticipantById);

// Workflow management (admin and moderator only)
router.put('/:id/stage', protect, authorize('admin', 'moderator'), participantController.updateParticipantStage);
router.post('/bulk-qualify', protect, authorize('admin'), participantController.bulkQualifyParticipants);

// Engagement (admin and moderator only)
router.put('/:id/engagement', protect, authorize('admin', 'moderator'), participantController.updateEngagement);

// Duplicate check
router.post('/check-duplicate', participantController.checkDuplicate);

module.exports = router;
