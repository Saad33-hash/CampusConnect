const Application = require('../Model/Application');
const Post = require('../Model/Post');
const dailyService = require('../services/dailyService');
const { sendEmail } = require('../services/emailService');

/**
 * Schedule an interview for an application
 */
exports.scheduleInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { scheduledAt, notes } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'Interview date and time is required'
      });
    }

    const interviewDate = new Date(scheduledAt);
    if (interviewDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Interview must be scheduled in the future'
      });
    }

    // Find application and verify ownership
    const application = await Application.findById(applicationId)
      .populate('post', 'title creator')
      .populate('applicant', 'displayName email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify the current user is the post creator
    if (application.post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to schedule interview for this application'
      });
    }

    // Create Daily.co room
    const room = await dailyService.createRoom(applicationId);

    // Update application with interview details
    application.interview = {
      scheduledAt: interviewDate,
      meetingUrl: room.meetingUrl,
      roomName: room.roomName,
      status: 'scheduled',
      notes: notes || ''
    };

    // Update status to reviewing if still pending
    if (application.status === 'pending') {
      application.status = 'reviewing';
    }

    await application.save();

    // Send email notification to applicant
    try {
      await sendEmail({
        to: application.applicant.email,
        subject: `Interview Scheduled - ${application.post.title}`,
        html: `
          <h2>Interview Scheduled!</h2>
          <p>Great news! An interview has been scheduled for your application to <strong>${application.post.title}</strong>.</p>
          <p><strong>Date & Time:</strong> ${interviewDate.toLocaleString()}</p>
          <p><strong>Notes:</strong> ${notes || 'No additional notes'}</p>
          <p>You will be able to join the video call from your applications page when the interview time arrives.</p>
          <p>Good luck!</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send interview email:', emailError);
    }

    res.json({
      success: true,
      message: 'Interview scheduled successfully',
      interview: application.interview
    });
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule interview'
    });
  }
};

/**
 * Get meeting token to join interview
 */
exports.joinInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
      .populate('post', 'creator title')
      .populate('applicant', 'displayName');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is either the applicant or post creator
    const isApplicant = application.applicant._id.toString() === req.user._id.toString();
    const isCreator = application.post.creator.toString() === req.user._id.toString();

    if (!isApplicant && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to join this interview'
      });
    }

    // Check if interview exists
    if (!application.interview?.roomName) {
      return res.status(400).json({
        success: false,
        message: 'No interview scheduled for this application'
      });
    }

    // Check if interview is scheduled
    if (application.interview.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: `Interview is ${application.interview.status}`
      });
    }

    // Generate meeting token
    const userName = isCreator ? req.user.displayName : application.applicant.displayName;
    const token = await dailyService.createMeetingToken(
      application.interview.roomName,
      userName,
      isCreator // Post creator is the owner
    );

    res.json({
      success: true,
      meetingUrl: application.interview.meetingUrl,
      token,
      roomName: application.interview.roomName,
      scheduledAt: application.interview.scheduledAt,
      isOwner: isCreator,
      postTitle: application.post.title,
      applicantName: application.applicant.displayName
    });
  } catch (error) {
    console.error('Join interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join interview'
    });
  }
};

/**
 * Cancel a scheduled interview
 */
exports.cancelInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body;

    const application = await Application.findById(applicationId)
      .populate('post', 'creator title')
      .populate('applicant', 'displayName email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify the current user is the post creator
    if (application.post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this interview'
      });
    }

    if (!application.interview?.roomName) {
      return res.status(400).json({
        success: false,
        message: 'No interview scheduled'
      });
    }

    // Delete the Daily.co room
    await dailyService.deleteRoom(application.interview.roomName);

    // Update interview status
    application.interview.status = 'cancelled';
    application.interview.notes = reason || 'Interview cancelled';
    await application.save();

    // Notify applicant
    try {
      await sendEmail({
        to: application.applicant.email,
        subject: `Interview Cancelled - ${application.post.title}`,
        html: `
          <h2>Interview Cancelled</h2>
          <p>Unfortunately, the interview for <strong>${application.post.title}</strong> has been cancelled.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>The recruiter may reach out to schedule a new time.</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }

    res.json({
      success: true,
      message: 'Interview cancelled'
    });
  } catch (error) {
    console.error('Cancel interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel interview'
    });
  }
};

/**
 * Mark interview as completed
 */
exports.completeInterview = async (req, res) => {
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

    // Verify the current user is the post creator
    if (application.post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!application.interview?.roomName) {
      return res.status(400).json({
        success: false,
        message: 'No interview scheduled'
      });
    }

    // Delete the Daily.co room
    await dailyService.deleteRoom(application.interview.roomName);

    // Update interview status
    application.interview.status = 'completed';
    if (notes) {
      application.interview.notes = notes;
    }
    await application.save();

    res.json({
      success: true,
      message: 'Interview marked as completed'
    });
  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete interview'
    });
  }
};

/**
 * Reschedule an interview
 */
exports.rescheduleInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { scheduledAt, notes } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'New interview date and time is required'
      });
    }

    const interviewDate = new Date(scheduledAt);
    if (interviewDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Interview must be scheduled in the future'
      });
    }

    const application = await Application.findById(applicationId)
      .populate('post', 'creator title')
      .populate('applicant', 'displayName email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify the current user is the post creator
    if (application.post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Delete old room if exists
    if (application.interview?.roomName) {
      await dailyService.deleteRoom(application.interview.roomName);
    }

    // Create new room
    const room = await dailyService.createRoom(applicationId);

    // Update interview
    application.interview = {
      scheduledAt: interviewDate,
      meetingUrl: room.meetingUrl,
      roomName: room.roomName,
      status: 'scheduled',
      notes: notes || ''
    };
    await application.save();

    // Notify applicant
    try {
      await sendEmail({
        to: application.applicant.email,
        subject: `Interview Rescheduled - ${application.post.title}`,
        html: `
          <h2>Interview Rescheduled</h2>
          <p>Your interview for <strong>${application.post.title}</strong> has been rescheduled.</p>
          <p><strong>New Date & Time:</strong> ${interviewDate.toLocaleString()}</p>
          <p><strong>Notes:</strong> ${notes || 'No additional notes'}</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send reschedule email:', emailError);
    }

    res.json({
      success: true,
      message: 'Interview rescheduled',
      interview: application.interview
    });
  } catch (error) {
    console.error('Reschedule interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule interview'
    });
  }
};
