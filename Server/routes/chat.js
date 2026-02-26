const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
  markAsRead
} = require('../Controller/chatController');

// All routes are protected
router.use(protect);

// Get all conversations for current user
router.get('/conversations', getConversations);

// Start or get existing conversation with a user
router.post('/conversations', startConversation);

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', getMessages);

// Send a message to a conversation
router.post('/conversations/:conversationId/messages', sendMessage);

// Mark conversation as read
router.put('/conversations/:conversationId/read', markAsRead);

module.exports = router;
