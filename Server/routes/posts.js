const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const postController = require('../Controller/postController');

// Protected user-specific routes (must be before /:id to avoid matching "user" as id)
router.get('/user/my-posts', protect, postController.getMyPosts);
router.get('/user/stats', protect, postController.getPostStats);

// Public routes (with optional auth for view tracking)
router.get('/', optionalAuth, postController.getPosts);
router.get('/:id', optionalAuth, postController.getPost);

// Protected routes for CRUD

// CRUD operations
router.post('/', protect, postController.createPost);
router.put('/:id', protect, postController.updatePost);
router.delete('/:id', protect, postController.deletePost);

// Status changes
router.patch('/:id/publish', protect, postController.publishPost);
router.patch('/:id/close', protect, postController.closePost);

module.exports = router;
