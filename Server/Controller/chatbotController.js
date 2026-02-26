const chatbotService = require('../services/chatbotService');

// Send message to chatbot
exports.sendMessage = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const userId = req.user?._id;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const response = await chatbotService.chat(userId, message, conversationHistory || []);

    res.json({
      success: response.success,
      response: response.message
    });
  } catch (error) {
    console.error('Chatbot controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get response from assistant'
    });
  }
};

// Get suggested questions
exports.getSuggestions = async (req, res) => {
  try {
    const userId = req.user?._id;
    const suggestions = await chatbotService.getSuggestedQuestions(userId);

    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      suggestions: [
        "What opportunities match my skills?",
        "How can I improve my profile?",
        "Tips for writing a great application"
      ]
    });
  }
};
