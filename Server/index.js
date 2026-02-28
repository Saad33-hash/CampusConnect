const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Log environment variables (without secrets)
console.log('🔧 Environment Config:');
console.log('   CLIENT_URL:', process.env.CLIENT_URL);
console.log('   GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);
console.log('   GITHUB_CALLBACK_URL:', process.env.GITHUB_CALLBACK_URL);
console.log('   NODE_ENV:', process.env.NODE_ENV);

// Passport Config
require('./Config/passport')(passport);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Middleware (Required for Passport OAuth)
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/interviews', require('./routes/interviews'));

// Health Check Route
app.get('/', (req, res) => {
  res.json({ message: 'Auth API is running!' });
});

// Debug route to check environment
app.get('/api/debug/config', (req, res) => {
  res.json({
    clientUrl: process.env.CLIENT_URL,
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
    githubCallbackUrl: process.env.GITHUB_CALLBACK_URL,
    nodeEnv: process.env.NODE_ENV,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGithubClientId: !!process.env.GITHUB_CLIENT_ID
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
