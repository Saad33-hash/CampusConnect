const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // General Information
    displayName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    avatar: {
        type: String,
        default: 'https://via.placeholder.com/150' // Default profile pic
    },

    // Password field (Only required for traditional Sign-up)
    password: {
        type: String,
        required: function() {
            // Only require password if neither Google nor GitHub ID exists
            return !this.googleId && !this.githubId;
        }
    },

    // OAuth Provider IDs
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values for non-Google users
    },
    githubId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values for non-GitHub users
    },

    // Campus Specific Info
    university: {
        type: String,
        default: ''
    },
    department: {
        type: String,
        default: ''
    },
    year: {
        type: String,
        enum: ['', '1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Post-Graduate'],
        default: ''
    },

    // Profile Information
    bio: {
        type: String,
        maxlength: 500,
        default: ''
    },
    skills: [{
        type: String,
        trim: true
    }],
    interests: [{
        type: String,
        trim: true
    }],
    resumeUrl: {
        type: String,
        default: ''
    },

    // Role System (Talent Finder / Talent Seeker)
    activeRole: {
        type: String,
        enum: ['talent-finder', 'talent-seeker'],
        default: 'talent-seeker'
    },

    // User Type (for admin purposes)
    userType: {
        type: String,
        enum: ['student', 'admin', 'faculty'],
        default: 'student'
    },

    // Email Verification
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationExpires: {
        type: Date
    },

    // Password Reset
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);