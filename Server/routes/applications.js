const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const applicationController = require('../Controller/applicationController');

// All routes require authentication
router.use(protect);

// Applicant routes
router.get('/my-applications', applicationController.getMyApplications);
router.get('/my-stats', applicationController.getApplicationStats);
router.get('/recruiter/recent', applicationController.getRecruiterApplications);
router.post('/posts/:postId/apply', applicationController.applyToPost);
router.get('/posts/:postId/check', applicationController.checkApplicationStatus);

// Application management
router.get('/:applicationId', applicationController.getApplication);
router.put('/:applicationId', applicationController.updateApplication);
router.delete('/:applicationId/withdraw', applicationController.withdrawApplication);

// Post creator routes
router.get('/posts/:postId', applicationController.getPostApplications);
router.patch('/:applicationId/status', applicationController.updateApplicationStatus);
router.patch('/:applicationId/notes', applicationController.addReviewerNotes);

module.exports = router;
