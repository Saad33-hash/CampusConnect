const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  // Track unread count per participant
  unreadCount: {
    type: Map,
    of: Number,
    default: () => new Map()
  }
}, {
  timestamps: true
});

// Index for efficient participant queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// Static method to find or create conversation between two users
conversationSchema.statics.findOrCreateConversation = async function(userId1, userId2) {
  // Sort IDs to ensure consistent lookup
  const participants = [userId1, userId2].sort();
  
  let conversation = await this.findOne({
    participants: { $all: participants, $size: 2 }
  });
  
  if (!conversation) {
    conversation = await this.create({
      participants,
      unreadCount: new Map([[userId1.toString(), 0], [userId2.toString(), 0]])
    });
  }
  
  return conversation;
};

module.exports = mongoose.model('Conversation', conversationSchema);
