/**
 * Jitsi Meet Video Service
 * Handles creating video rooms for interviews - NO API KEY REQUIRED
 */

/**
 * Create a new Jitsi room for an interview
 */
const createRoom = async (applicationId, expiryMinutes = 120) => {
  try {
    // Generate unique room name
    const roomName = `campusconnect-interview-${applicationId}-${Date.now()}`;
    
    // Jitsi Meet public server - no API key needed
    const meetingUrl = `https://meet.jit.si/${roomName}`;
    
    return {
      success: true,
      roomName: roomName,
      meetingUrl: meetingUrl,
      expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000)
    };
  } catch (error) {
    console.error('Create room error:', error);
    throw error;
  }
};

/**
 * Create a meeting token - not needed for Jitsi public rooms
 * Returns empty string for compatibility
 */
const createMeetingToken = async (roomName, userName, isOwner = false) => {
  // Jitsi public rooms don't need tokens
  return '';
};

/**
 * Delete a room - Jitsi rooms auto-expire when empty
 */
const deleteRoom = async (roomName) => {
  // Jitsi rooms automatically close when all participants leave
  return { success: true };
};

/**
 * Get room info - not available for Jitsi public rooms
 */
const getRoomInfo = async (roomName) => {
  return null;
};

module.exports = {
  createRoom,
  createMeetingToken,
  deleteRoom,
  getRoomInfo
};
