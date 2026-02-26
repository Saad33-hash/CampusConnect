const pusher = require('../Config/pusher');

/**
 * Notification types
 */
const NotificationType = {
  APPLICATION_RECEIVED: 'application_received',
  APPLICATION_STATUS_CHANGED: 'application_status_changed',
  NEW_POST: 'new_post'
};

/**
 * Send notification to a specific user
 * @param {string} userId - The user ID to send notification to
 * @param {Object} notification - The notification data
 */
const sendToUser = async (userId, notification) => {
  try {
    await pusher.trigger(`user-${userId}`, 'notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
    console.log(`Notification sent to user ${userId}:`, notification.type);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

/**
 * Notify recruiter when they receive a new application
 * @param {Object} application - The application document
 * @param {Object} post - The post document
 * @param {Object} applicant - The applicant user document
 */
const notifyNewApplication = async (application, post, applicant) => {
  const notification = {
    type: NotificationType.APPLICATION_RECEIVED,
    title: 'New Application Received',
    message: `${applicant.name} applied for "${post.title}"`,
    data: {
      applicationId: application._id,
      postId: post._id,
      applicantName: applicant.name,
      postTitle: post.title
    }
  };
  
  await sendToUser(post.creator.toString(), notification);
};

/**
 * Notify applicant when their application status changes
 * @param {Object} application - The application document
 * @param {Object} post - The post document
 * @param {string} newStatus - The new status
 */
const notifyStatusChange = async (application, post, newStatus) => {
  const statusMessages = {
    reviewing: 'Your application is being reviewed',
    shortlisted: 'Congratulations! You have been shortlisted',
    accepted: 'Congratulations! Your application has been accepted',
    rejected: 'Your application status has been updated'
  };
  
  const notification = {
    type: NotificationType.APPLICATION_STATUS_CHANGED,
    title: 'Application Status Update',
    message: `${statusMessages[newStatus] || 'Status updated'} for "${post.title}"`,
    data: {
      applicationId: application._id,
      postId: post._id,
      postTitle: post.title,
      status: newStatus
    }
  };
  
  await sendToUser(application.applicant.toString(), notification);
};

module.exports = {
  NotificationType,
  sendToUser,
  notifyNewApplication,
  notifyStatusChange
};
