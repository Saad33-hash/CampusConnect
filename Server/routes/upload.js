const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload, uploadResume, downloadFile, deleteFile } = require('../Controller/uploadController');

// Upload resume (protected route)
router.post('/resume', protect, upload.single('resume'), uploadResume);

// Download file (public route - uses signed URL internally)
router.get('/download/:publicId', downloadFile);

// Delete file (protected route)
router.delete('/file', protect, deleteFile);

module.exports = router;
