const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const interviewController = require('../Controller/interviewController');

// All routes require authentication
router.use(protect);

// Schedule interview for an application
router.post('/:applicationId/schedule', interviewController.scheduleInterview);

// Join interview (get meeting token)
router.get('/:applicationId/join', interviewController.joinInterview);

// Cancel interview
router.post('/:applicationId/cancel', interviewController.cancelInterview);

// Complete interview
router.post('/:applicationId/complete', interviewController.completeInterview);

// Reschedule interview
router.post('/:applicationId/reschedule', interviewController.rescheduleInterview);

module.exports = router;
