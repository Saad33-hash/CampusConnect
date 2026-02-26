const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { 
  signup, 
  login, 
  getMe, 
  verifyEmail, 
  resendVerification, 
  forgotPassword, 
  resetPassword,
  updateProfile,
  switchRole,
  updateResume
} = require('../Controller/authController');
const { protect } = require('../middleware/auth');

// Generate JWT Token for OAuth users
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// ==================== LOCAL AUTH ROUTES ====================

// @desc    Register new user
// @route   POST /api/auth/signup
router.post('/signup', signup);

// @desc    Login user
// @route   POST /api/auth/login
router.post('/login', login);

// @desc    Get current user
// @route   GET /api/auth/me
router.get('/me', protect, getMe);

// ==================== EMAIL VERIFICATION ROUTES ====================

// @desc    Verify email
// @route   POST /api/auth/verify-email
router.post('/verify-email', verifyEmail);

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
router.post('/resend-verification', resendVerification);

// ==================== PASSWORD RESET ROUTES ====================

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// @desc    Reset password
// @route   POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

// ==================== GOOGLE AUTH ROUTES ====================

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed` 
  }),
  (req, res) => {
    // Generate JWT token for the authenticated user
    const token = generateToken(req.user._id);
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

// ==================== GITHUB AUTH ROUTES ====================

// @desc    Auth with GitHub
// @route   GET /api/auth/github
router.get('/github', passport.authenticate('github', { 
  scope: ['user:email'] 
}));

// @desc    GitHub auth callback
// @route   GET /api/auth/github/callback
router.get('/github/callback', 
  passport.authenticate('github', { 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=github_auth_failed` 
  }),
  (req, res) => {
    // Generate JWT token for the authenticated user
    const token = generateToken(req.user._id);
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

// ==================== PROFILE ROUTES ====================

// @desc    Update user profile
// @route   PUT /api/auth/profile
router.put('/profile', protect, updateProfile);

// @desc    Switch user role
// @route   PUT /api/auth/switch-role
router.put('/switch-role', protect, switchRole);

// @desc    Update resume URL
// @route   PUT /api/auth/resume
router.put('/resume', protect, updateResume);

// ==================== LOGOUT ROUTE ====================

// @desc    Logout User
// @route   GET /api/auth/logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

module.exports = router;
