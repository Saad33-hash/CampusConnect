const User = require('../Model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail, emailTemplates } = require('../services/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { displayName, email, password } = req.body;

    // Validation
    if (!displayName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log('Generated verification token:', emailVerificationToken);

    // Create user
    const user = await User.create({
      displayName,
      email,
      password: hashedPassword,
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified: false
    });

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}`;
    const emailTemplate = emailTemplates.verifyEmail(displayName, verificationUrl);
    await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });

    // Don't return token - user must verify email first
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      user: {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if user has password (OAuth users don't have password)
    if (!user.password) {
      return res.status(401).json({ 
        success: false, 
        message: 'This account uses social login. Please sign in with Google or GitHub.' 
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Please verify your email before logging in. Check your inbox for the verification link.',
        needsVerification: true,
        email: user.email
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      },
      token
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    console.log('Verify email request received, token:', token);

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // First find user by token only
    const user = await User.findOne({ emailVerificationToken: token });

    console.log('User found by token:', user ? 'Yes' : 'No');

    if (!user) {
      // Token not found - could be already verified or invalid
      // Check if any user has this token cleared (already verified)
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token. This link may have already been used or expired. If your email is already verified, you can login directly.'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.json({
        success: true,
        message: 'Your email is already verified. You can login now.'
      });
    }

    // Check if token has expired
    if (user.emailVerificationExpires && new Date(user.emailVerificationExpires) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired. Please request a new one.'
      });
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    console.log('Email verified successfully for:', user.email);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Verify Email Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}`;
    const emailTemplate = emailTemplates.verifyEmail(user.displayName, verificationUrl);
    await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend Verification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending verification email'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent'
      });
    }

    // Check if user uses OAuth
    if (!user.password && (user.googleId || user.githubId)) {
      return res.status(400).json({
        success: false,
        message: 'This account uses social login. Please sign in with Google or GitHub.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const emailTemplate = emailTemplates.resetPassword(user.displayName, resetUrl);
    await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent'
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing request'
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Find user by token
    const user = await User.findOne({ passwordResetToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    // Check if token has expired
    if (user.passwordResetExpires && new Date(user.passwordResetExpires) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired. Please request a new one.'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send confirmation email
    const emailTemplate = emailTemplates.passwordChanged(user.displayName);
    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resetting password'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { displayName, bio, skills, interests, university, department, year, avatar, resumeUrl } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (displayName) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) user.skills = skills;
    if (interests !== undefined) user.interests = interests;
    if (university !== undefined) user.university = university;
    if (department !== undefined) user.department = department;
    if (year !== undefined) user.year = year;
    if (avatar) user.avatar = avatar;
    if (resumeUrl !== undefined) user.resumeUrl = resumeUrl;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        interests: user.interests,
        university: user.university,
        department: user.department,
        year: user.year,
        activeRole: user.activeRole,
        isEmailVerified: user.isEmailVerified,
        resumeUrl: user.resumeUrl
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// @desc    Switch user role (Talent Finder <-> Talent Seeker)
// @route   PUT /api/auth/switch-role
// @access  Private
exports.switchRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['talent-finder', 'talent-seeker'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "talent-finder" or "talent-seeker"'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.activeRole = role;
    await user.save();

    res.json({
      success: true,
      message: `Switched to ${role === 'talent-finder' ? 'Talent Finder' : 'Talent Seeker'} mode`,
      activeRole: user.activeRole
    });
  } catch (error) {
    console.error('Switch Role Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while switching role'
    });
  }
};

// @desc    Upload resume
// @route   PUT /api/auth/resume
// @access  Private
exports.updateResume = async (req, res) => {
  try {
    const { resumeUrl } = req.body;

    if (!resumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Resume URL is required'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.resumeUrl = resumeUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Resume updated successfully',
      resumeUrl: user.resumeUrl
    });
  } catch (error) {
    console.error('Update Resume Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating resume'
    });
  }
};
