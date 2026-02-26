const cloudinary = require('../Config/cloudinary');
const multer = require('multer');
const { Readable } = require('stream');
const https = require('https');

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow PDF, DOC, DOCX for resumes
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'campusconnect/resumes',
        ...options
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

// Controller: Upload resume
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const publicId = `resume_${req.user._id}_${Date.now()}`;
    const format = req.file.originalname.split('.').pop();

    const result = await uploadToCloudinary(req.file.buffer, {
      public_id: publicId,
      format: format
    });

    console.log('Cloudinary upload result:', {
      secure_url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type
    });

    // Store the public_id and create our download proxy URL
    const downloadUrl = `/api/upload/download/${encodeURIComponent(result.public_id)}?format=${format}&name=${encodeURIComponent(req.file.originalname)}`;

    res.json({
      success: true,
      url: downloadUrl,
      publicId: result.public_id,
      originalName: req.file.originalname
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to upload file' 
    });
  }
};

// Download/proxy file from Cloudinary (no authentication required for this endpoint)
const downloadFile = async (req, res) => {
  try {
    const { publicId } = req.params;
    const { format, name } = req.query;
    
    if (!publicId) {
      return res.status(400).json({ message: 'Public ID required' });
    }

    const decodedPublicId = decodeURIComponent(publicId);
    
    console.log('Fetching resource:', decodedPublicId);
    
    // Get the resource info from Cloudinary to get the actual URL
    const resource = await cloudinary.api.resource(decodedPublicId, {
      resource_type: 'raw'
    });
    
    const fileUrl = resource.secure_url;
    console.log('Downloading from Cloudinary:', fileUrl);

    // Set download headers
    const fileName = name || `resume.${format || 'pdf'}`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (format === 'doc') {
      res.setHeader('Content-Type', 'application/msword');
    } else if (format === 'docx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    } else {
      res.setHeader('Content-Type', 'application/octet-stream');
    }

    // Proxy/stream the file from Cloudinary
    https.get(fileUrl, (cloudinaryRes) => {
      if (cloudinaryRes.statusCode !== 200) {
        console.error('Cloudinary response status:', cloudinaryRes.statusCode);
        return res.status(404).json({ message: 'File not found' });
      }
      cloudinaryRes.pipe(res);
    }).on('error', (err) => {
      console.error('Download stream error:', err);
      res.status(500).json({ message: 'Failed to download file' });
    });
  } catch (error) {
    console.error('Download error:', error.message);
    res.status(500).json({ message: 'Failed to download file: ' + error.message });
  }
};

// Delete file from Cloudinary
const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.body;
    
    if (!publicId) {
      return res.status(400).json({ message: 'Public ID required' });
    }

    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    
    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
};

module.exports = {
  upload,
  uploadResume,
  downloadFile,
  deleteFile
};
