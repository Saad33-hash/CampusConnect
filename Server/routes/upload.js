const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload, uploadImage, uploadResume, uploadAvatar, downloadFile, deleteFile } = require('../Controller/uploadController');

// Upload resume (protected route)
router.post('/resume', protect, upload.single('resume'), uploadResume);

// Upload avatar (protected route)
router.post('/avatar', protect, uploadImage.single('avatar'), uploadAvatar);

// Download file (public route - uses signed URL internally)
router.get('/download/:publicId', downloadFile);

// Delete file (protected route)
router.delete('/file', protect, deleteFile);

module.exports = router;
