const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  type: {
    type: String,
    required: [true, 'Post type is required'],
    enum: ['academic-project', 'startup-gig', 'part-time-job', 'hackathon']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  deadline: {
    type: Date
  },
  compensation: {
    type: {
      type: String,
      enum: ['paid', 'unpaid', 'equity', 'negotiable'],
      default: 'negotiable'
    },
    amount: {
      type: String,
      trim: true
    }
  },
  location: {
    type: String,
    enum: ['remote', 'on-campus', 'hybrid', 'flexible'],
    default: 'flexible'
  },
  duration: {
    type: String,
    trim: true
  },
  teamSize: {
    type: Number,
    min: 1
  },
  status: {
    type: String,
    enum: ['draft', 'open', 'closed', 'filled'],
    default: 'draft'
  },
  views: {
    type: Number,
    default: 0
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  // For hackathons
  eventDate: {
    type: Date
  },
  venue: {
    type: String,
    trim: true
  },
  // For academic projects
  courseCode: {
    type: String,
    trim: true
  },
  professor: {
    type: String,
    trim: true
  },
  // For startups
  companyName: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for search functionality
postSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Index for filtering
postSchema.index({ type: 1, status: 1 });
postSchema.index({ creator: 1 });
postSchema.index({ requiredSkills: 1 });

// Virtual for checking if deadline has passed
postSchema.virtual('isExpired').get(function() {
  if (!this.deadline) return false;
  return new Date() > this.deadline;
});

// Ensure virtuals are included in JSON
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);
