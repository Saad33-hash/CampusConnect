const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  resumeUrl: {
    type: String,
    trim: true
  },
  portfolioUrl: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  // Applicant's relevant skills for this position
  highlightedSkills: [{
    type: String,
    trim: true
  }],
  // Additional questions/answers (if post has them)
  answers: [{
    question: String,
    answer: String
  }],
  // Notes from the post creator (private)
  reviewerNotes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  // When the status changed
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'shortlisted', 'accepted', 'rejected', 'withdrawn']
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  // Timestamps
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  // Soft delete
  isWithdrawn: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate applications
applicationSchema.index({ post: 1, applicant: 1 }, { unique: true });

// Index for efficient queries
applicationSchema.index({ post: 1, status: 1 });
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ appliedAt: -1 });

// Virtual for time since application
applicationSchema.virtual('timeSinceApplied').get(function() {
  const now = new Date();
  const diff = now - this.appliedAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
});

// Pre-save hook to track status changes
applicationSchema.pre('save', async function() {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date()
    });
    
    if (this.status !== 'pending') {
      this.reviewedAt = new Date();
    }
  }
});

// Static method to get application counts by status for a post
applicationSchema.statics.getStatusCountsForPost = async function(postId) {
  return this.aggregate([
    { $match: { post: new mongoose.Types.ObjectId(postId), isWithdrawn: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
};

// Instance method to check if application can be modified
applicationSchema.methods.canBeModified = function() {
  return ['pending', 'reviewing'].includes(this.status);
};

module.exports = mongoose.model('Application', applicationSchema);
