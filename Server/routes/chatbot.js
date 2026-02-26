const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const chatbotController = require('../Controller/chatbotController');

// Chat endpoint - optional auth for personalized responses
router.post('/message', optionalAuth, chatbotController.sendMessage);

// Get suggested questions
router.get('/suggestions', optionalAuth, chatbotController.getSuggestions);

module.exports = router;
