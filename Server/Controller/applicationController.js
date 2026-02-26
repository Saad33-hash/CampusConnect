const Application = require('../Model/Application');
const Post = require('../Model/Post');
const User = require('../Model/User');
const { notifyNewApplication, notifyStatusChange } = require('../services/notificationService');

// Apply to a post
exports.applyToPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { coverLetter, resumeUrl, portfolioUrl, highlightedSkills, answers } = req.body;

    // Check if post exists and is open
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This post is no longer accepting applications'
      });
    }

    // Check if user is not the post creator
    if (post.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot apply to your own post'
      });
    }

    // Check for existing application
    const existingApplication = await Application.findOne({
      post: postId,
      applicant: req.user._id
    });

    if (existingApplication) {
      if (existingApplication.isWithdrawn) {
        // Allow reapplication if previously withdrawn
        existingApplication.isWithdrawn = false;
        existingApplication.status = 'pending';
        existingApplication.coverLetter = coverLetter;
        existingApplication.resumeUrl = resumeUrl;
        existingApplication.portfolioUrl = portfolioUrl;
        existingApplication.highlightedSkills = highlightedSkills || [];
        existingApplication.answers = answers || [];
        existingApplication.appliedAt = new Date();
        existingApplication.statusHistory = [{ status: 'pending', changedAt: new Date() }];
        
        await existingApplication.save();
        
        // Increment application count
        await Post.findByIdAndUpdate(postId, { $inc: { applicationsCount: 1 } });
        
        return res.status(200).json({
          success: true,
          message: 'Application resubmitted successfully',
          application: existingApplication
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this post'
      });
    }

    // Create new application
    const application = await Application.create({
      post: postId,
      applicant: req.user._id,
      coverLetter: coverLetter || '',
      resumeUrl: resumeUrl || '',
      portfolioUrl: portfolioUrl || '',
      highlightedSkills: highlightedSkills || [],
      answers: answers || [],
      statusHistory: [{ status: 'pending', changedAt: new Date() }]
    });

    // Increment application count on post
    await Post.findByIdAndUpdate(postId, { $inc: { applicationsCount: 1 } });

    // Send notification to recruiter
    const applicant = await User.findById(req.user._id).select('name');
    notifyNewApplication(application, post, applicant);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Apply to post error:', error.message, error.stack);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this post'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit application'
    });
  }
};

// Get my applications (as applicant)
exports.getMyApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { 
      applicant: req.user._id,
      isWithdrawn: false
    };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate({
          path: 'post',
          select: 'title type status creator deadline compensation location',
          populate: {
            path: 'creator',
            select: 'displayName avatar'
          }
        })
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Application.countDocuments(query)
    ]);

    res.json({
      success: true,
      applications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
};

// Get applications for a post (as post creator)
exports.getPostApplications = async (req, res) => {
  try {
    const { postId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    // Verify ownership
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view applications for your own posts'
      });
    }

    const query = { 
      post: postId,
      isWithdrawn: false
    };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total, statusCounts] = await Promise.all([
      Application.find(query)
        .populate('applicant', 'displayName avatar email university department skills bio')
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Application.countDocuments(query),
      Application.getStatusCountsForPost(postId)
    ]);

    // Format status counts
    const counts = {
      all: 0,
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0
    };
    
    statusCounts.forEach(({ _id, count }) => {
      counts[_id] = count;
      counts.all += count;
    });

    res.json({
      success: true,
      applications,
      counts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get post applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
};

// Get single application
exports.getApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
      .populate('applicant', 'displayName avatar email university department skills interests bio portfolioUrl resumeUrl')
      .populate({
        path: 'post',
        select: 'title type status creator requiredSkills',
        populate: {
          path: 'creator',
          select: 'displayName avatar'
        }
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check authorization (applicant or post creator)
    const isApplicant = application.applicant._id.toString() === req.user._id.toString();
    const isPostCreator = application.post.creator._id.toString() === req.user._id.toString();

    if (!isApplicant && !isPostCreator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    // Don't expose reviewer notes to applicant
    if (isApplicant && !isPostCreator) {
      application.reviewerNotes = undefined;
    }

    res.json({
      success: true,
      application,
      isApplicant,
      isPostCreator
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application'
    });
  }
};

// Update application status (as post creator)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['pending', 'reviewing', 'shortlisted', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const application = await Application.findById(applicationId)
      .populate('post', 'creator');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify post ownership
    if (application.post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    // Can't update withdrawn applications
    if (application.isWithdrawn) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update withdrawn application'
      });
    }

    application.status = status;
    if (note) {
      application.statusHistory[application.statusHistory.length - 1].note = note;
    }
    
    await application.save();

    // Send notification to applicant about status change
    const postDetails = await Post.findById(application.post._id).select('title');
    notifyStatusChange(application, postDetails, status);

    res.json({
      success: true,
      message: `Application ${status}`,
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application'
    });
  }
};

// Add reviewer notes (as post creator)
exports.addReviewerNotes = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { notes } = req.body;

    const application = await Application.findById(applicationId)
      .populate('post', 'creator');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    application.reviewerNotes = notes;
    await application.save();

    res.json({
      success: true,
      message: 'Notes saved',
      application
    });
  } catch (error) {
    console.error('Add reviewer notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save notes'
    });
  }
};

// Withdraw application (as applicant)
exports.withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application'
      });
    }

    if (application.isWithdrawn) {
      return res.status(400).json({
        success: false,
        message: 'Application already withdrawn'
      });
    }

    // Can't withdraw accepted applications
    if (application.status === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot withdraw an accepted application'
      });
    }

    application.status = 'withdrawn';
    application.isWithdrawn = true;
    await application.save();

    // Decrement application count on post
    await Post.findByIdAndUpdate(application.post, { $inc: { applicationsCount: -1 } });

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw application'
    });
  }
};

// Update application (as applicant, before review)
exports.updateApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { coverLetter, resumeUrl, portfolioUrl, highlightedSkills } = req.body;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!application.canBeModified()) {
      return res.status(400).json({
        success: false,
        message: 'Application cannot be modified after it has been reviewed'
      });
    }

    if (coverLetter !== undefined) application.coverLetter = coverLetter;
    if (resumeUrl !== undefined) application.resumeUrl = resumeUrl;
    if (portfolioUrl !== undefined) application.portfolioUrl = portfolioUrl;
    if (highlightedSkills !== undefined) application.highlightedSkills = highlightedSkills;

    await application.save();

    res.json({
      success: true,
      message: 'Application updated',
      application
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application'
    });
  }
};

// Get application stats for user
exports.getApplicationStats = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      { $match: { applicant: req.user._id, isWithdrawn: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0
    };

    stats.forEach(({ _id, count }) => {
      formattedStats[_id] = count;
      formattedStats.total += count;
    });

    res.json({
      success: true,
      stats: formattedStats
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats'
    });
  }
};

// Check if user has applied to a post
exports.checkApplicationStatus = async (req, res) => {
  try {
    const { postId } = req.params;

    const application = await Application.findOne({
      post: postId,
      applicant: req.user._id,
      isWithdrawn: false
    }).select('status appliedAt');

    res.json({
      success: true,
      hasApplied: !!application,
      application: application || null
    });
  } catch (error) {
    console.error('Check application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check application status'
    });
  }
};
