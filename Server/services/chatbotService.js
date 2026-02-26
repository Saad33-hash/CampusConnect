const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../Model/User');
const Post = require('../Model/Post');
const Application = require('../Model/Application');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompt that gives the AI context about CampusConnect
const getSystemPrompt = () => `You are CampusConnect Assistant, an AI helper for CampusConnect - The University Talent Finder App.

ABOUT CAMPUSCONNECT:
CampusConnect is a platform that connects university students for collaboration on:
- Academic Projects: Course-related team projects, research, assignments
- Startup Gigs: Join or recruit for startup ventures
- Part-time Jobs: Campus or remote work opportunities
- Hackathons: Find teammates for competitions

KEY FEATURES:
1. Role System: Users can switch between "Talent Seeker" (looking for opportunities) and "Talent Finder" (posting opportunities)
2. Profile System: Users have profiles with skills, interests, bio, university, department, year, and optional resume
3. Match Score: Shows how well a user's profile matches a job posting (based on skills, interests, profile completeness)
4. Applications: Users can apply to posts with cover letters
5. Real-time Chat: Direct messaging between users
6. Bookmarks: Save posts for later
7. Notifications: Real-time updates on applications

YOUR ROLE:
- Help users navigate the app
- Provide job/opportunity guidance and tips
- Help optimize profiles for better matches
- Suggest how to write better applications
- Answer questions about features
- Be friendly, helpful, and concise

GUIDELINES:
- Keep responses concise and actionable
- Use emojis sparingly for friendliness
- If asked about something outside the app, politely redirect
- Never share or ask for personal information
- Encourage users to complete their profiles for better matches`;

// Build user context for personalized responses
const buildUserContext = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password -emailVerificationToken -passwordResetToken');
    if (!user) return '';

    const savedPosts = await Post.find({ _id: { $in: user.savedPosts || [] } }).select('title type').limit(5);
    const applications = await Application.find({ applicant: userId })
      .populate('post', 'title type status')
      .sort({ createdAt: -1 })
      .limit(5);

    let context = `\n\nCURRENT USER CONTEXT:
- Name: ${user.displayName}
- Role: ${user.activeRole === 'talent-finder' ? 'Talent Finder (posting opportunities)' : 'Talent Seeker (looking for opportunities)'}
- University: ${user.university || 'Not specified'}
- Department: ${user.department || 'Not specified'}
- Year: ${user.year || 'Not specified'}
- Skills: ${user.skills?.length ? user.skills.join(', ') : 'None added'}
- Interests: ${user.interests?.length ? user.interests.join(', ') : 'None added'}
- Has Resume: ${user.resumeUrl ? 'Yes' : 'No'}
- Profile Bio: ${user.bio ? 'Added' : 'Not added'}`;

    if (savedPosts.length > 0) {
      context += `\n- Saved Posts: ${savedPosts.map(p => `${p.title} (${p.type})`).join(', ')}`;
    }

    if (applications.length > 0) {
      context += `\n- Recent Applications: ${applications.map(a => 
        `${a.post?.title || 'Unknown'} - ${a.status}`
      ).join(', ')}`;
    }

    return context;
  } catch (error) {
    console.error('Error building user context:', error);
    return '';
  }
};

// Build app context with recent/relevant posts
const buildAppContext = async (userSkills = [], userInterests = []) => {
  try {
    let query = { status: 'open' };
    
    const recentPosts = await Post.find(query)
      .select('title type requiredSkills tags compensation.type location')
      .sort({ createdAt: -1 })
      .limit(10);

    if (recentPosts.length === 0) return '';

    let context = `\n\nRECENT OPEN OPPORTUNITIES:`;
    recentPosts.forEach((post, i) => {
      context += `\n${i + 1}. ${post.title} (${post.type}) - Skills: ${post.requiredSkills?.slice(0, 3).join(', ') || 'Any'}, Location: ${post.location}`;
    });

    return context;
  } catch (error) {
    console.error('Error building app context:', error);
    return '';
  }
};

// Chat with Gemini
const chat = async (userId, message, conversationHistory = []) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build context
    const userContext = userId ? await buildUserContext(userId) : '';
    const appContext = await buildAppContext();

    // Create the full system prompt with context
    const fullSystemPrompt = getSystemPrompt() + userContext + appContext;

    // Build the chat history for Gemini
    const history = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Start chat with history
    const chatSession = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'System context: ' + fullSystemPrompt }]
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I am CampusConnect Assistant, ready to help users with the University Talent Finder App. How can I help you today?' }]
        },
        ...history
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Send the message
    const result = await chatSession.sendMessage(message);
    const response = result.response.text();

    return {
      success: true,
      message: response
    };
  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Handle rate limiting
    if (error.status === 429) {
      return {
        success: false,
        message: 'I\'m getting a lot of questions right now! Please wait about 30-60 seconds and try again. This is a free tier limit.',
        isRateLimited: true
      };
    }
    
    return {
      success: false,
      message: 'Sorry, I encountered an error. Please try again in a moment.',
      error: error.message
    };
  }
};

// Get suggested questions based on user context
const getSuggestedQuestions = async (userId) => {
  const suggestions = [
    "What opportunities match my skills?",
    "How can I improve my profile?",
    "Tips for writing a great application",
    "How does the match score work?",
    "What types of opportunities are available?"
  ];

  if (userId) {
    try {
      const user = await User.findById(userId);
      if (user) {
        if (!user.skills?.length) {
          suggestions.unshift("How do I add skills to my profile?");
        }
        if (!user.resumeUrl) {
          suggestions.unshift("Should I upload a resume?");
        }
        if (user.activeRole === 'talent-finder') {
          suggestions.unshift("How do I create an effective post?");
        }
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  }

  return suggestions.slice(0, 5);
};

module.exports = {
  chat,
  getSuggestedQuestions
};
