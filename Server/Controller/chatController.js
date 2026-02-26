const Conversation = require('../Model/Conversation');
const Message = require('../Model/Message');
const User = require('../Model/User');
const pusher = require('../Config/pusher');

/**
 * Get all conversations for the current user
 */
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'displayName email avatar')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    // Format conversations with other participant info
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== req.user._id.toString()
      );
      const unreadCount = conv.unreadCount?.get(req.user._id.toString()) || 0;

      return {
        _id: conv._id,
        otherUser: otherParticipant,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
};

/**
 * Get messages for a specific conversation
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'displayName avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      },
      { $addToSet: { readBy: req.user._id } }
    );

    // Reset unread count for this user
    if (!conversation.unreadCount) {
      conversation.unreadCount = new Map();
    }
    conversation.unreadCount.set(req.user._id.toString(), 0);
    await conversation.save();

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

/**
 * Send a message
 */
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      content: content.trim(),
      readBy: [req.user._id]
    });

    // Populate sender info
    await message.populate('sender', 'displayName avatar');

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();

    // Increment unread count for other participant
    const otherParticipant = conversation.participants.find(
      p => p.toString() !== req.user._id.toString()
    );
    
    // Initialize unreadCount Map if it doesn't exist
    if (!conversation.unreadCount) {
      conversation.unreadCount = new Map();
    }
    
    const currentUnread = conversation.unreadCount.get(otherParticipant.toString()) || 0;
    conversation.unreadCount.set(otherParticipant.toString(), currentUnread + 1);

    await conversation.save();

    // Send real-time notification via Pusher
    console.log('Triggering Pusher for chat channel:', `chat-${conversationId}`);
    try {
      await pusher.trigger(`chat-${conversationId}`, 'new-message', {
        message
      });
      console.log('Pusher trigger successful for chat channel');
    } catch (pusherError) {
      console.error('Pusher trigger error:', pusherError);
    }

    // Send notification to the other user
    console.log('Triggering Pusher notification for user:', `user-${otherParticipant}`);
    try {
      // Get sender's display name for notification
      const senderName = req.user.displayName || 'Someone';
      
      await pusher.trigger(`user-${otherParticipant}`, 'notification', {
        type: 'new_message',
        title: `New message from ${senderName}`,
        message: content.trim().length > 50 ? content.trim().substring(0, 50) + '...' : content.trim(),
        timestamp: new Date().toISOString(),
        data: {
          conversationId,
          senderId: req.user._id,
          senderName
        }
      });
      console.log('Pusher notification successful for user');
    } catch (pusherError) {
      console.error('Pusher notification error:', pusherError);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

/**
 * Start or get existing conversation with a user
 */
const startConversation = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot start conversation with yourself' });
    }

    // Verify the other user exists
    const otherUser = await User.findById(userId).select('displayName email avatar');
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find or create conversation
    const conversation = await Conversation.findOrCreateConversation(
      req.user._id,
      userId
    );

    await conversation.populate('participants', 'displayName email avatar');
    await conversation.populate('lastMessage');

    res.json({
      _id: conversation._id,
      otherUser,
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount: conversation.unreadCount?.get(req.user._id.toString()) || 0
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ message: 'Failed to start conversation' });
  }
};

/**
 * Mark conversation as read
 */
const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Mark all messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      },
      { $addToSet: { readBy: req.user._id } }
    );

    // Reset unread count
    if (!conversation.unreadCount) {
      conversation.unreadCount = new Map();
    }
    conversation.unreadCount.set(req.user._id.toString(), 0);
    await conversation.save();

    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Failed to mark as read' });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
  markAsRead
};
