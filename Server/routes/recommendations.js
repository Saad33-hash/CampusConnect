const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const recommendationController = require('../Controller/recommendationController');

// Protected routes - require authentication for personalized recommendations
router.get('/', protect, recommendationController.getRecommendations);
router.get('/category/:category', protect, recommendationController.getCategoryRecommendations);

module.exports = router;
