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

    // Campus Specific Info (Useful for your Hackathon project!)
    college: {
        type: String,
        default: ''
    },
    role: {
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