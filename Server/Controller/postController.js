const Post = require('../Model/Post');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const postData = {
      ...req.body,
      creator: req.user._id
    };

    const post = new Post(postData);
    await post.save();

    await post.populate('creator', 'displayName avatar university');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create post'
    });
  }
};

// Get all posts with filters
exports.getPosts = async (req, res) => {
  try {
    const {
      type,
      status = 'open',
      skills,
      search,
      locationType,
      compensationType,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = {};

    // Filter by type (can be comma-separated for multiple types)
    if (type) {
      const types = type.split(',').map(t => t.trim());
      if (types.length === 1) {
        query.type = types[0];
      } else {
        query.type = { $in: types };
      }
    }

    // Filter by status (default: open posts only for public view)
    if (status !== 'all') {
      query.status = status;
    }

    // Filter by skills
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.requiredSkills = { $in: skillsArray };
    }

    // Filter by location type (can be comma-separated)
    if (locationType) {
      const locations = locationType.split(',').map(l => l.trim());
      if (locations.length === 1) {
        query.locationType = locations[0];
      } else {
        query.locationType = { $in: locations };
      }
    }

    // Filter by compensation type (can be comma-separated)
    if (compensationType) {
      const compensations = compensationType.split(',').map(c => c.trim());
      if (compensations.length === 1) {
        query.compensationType = compensations[0];
      } else {
        query.compensationType = { $in: compensations };
      }
    }

    // Text search (searches title and description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('creator', 'displayName avatar university')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Post.countDocuments(query)
    ]);

    res.json({
      success: true,
      posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    });
  }
};

// Get posts by current user (my posts)
exports.getMyPosts = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { creator: req.user._id };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Post.countDocuments(query)
    ]);

    res.json({
      success: true,
      posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your posts'
    });
  }
};

// Get single post by ID
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('creator', 'displayName avatar university department bio');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count (only for non-creators)
    if (!req.user || post.creator._id.toString() !== req.user._id.toString()) {
      post.views += 1;
      await post.save();
    }

    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post'
    });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    // Fields that can be updated
    const allowedUpdates = [
      'title', 'description', 'type', 'requiredSkills', 'tags',
      'deadline', 'compensation', 'location', 'duration', 'teamSize',
      'status', 'eventDate', 'venue', 'courseCode', 'professor',
      'companyName', 'website'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        post[field] = req.body[field];
      }
    });

    await post.save();
    await post.populate('creator', 'displayName avatar university');

    res.json({
      success: true,
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update post'
    });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
};

// Publish draft
exports.publishPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to publish this post'
      });
    }

    if (post.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft posts can be published'
      });
    }

    post.status = 'open';
    await post.save();
    await post.populate('creator', 'displayName avatar university');

    res.json({
      success: true,
      message: 'Post published successfully',
      post
    });
  } catch (error) {
    console.error('Publish post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish post'
    });
  }
};

// Close post
exports.closePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to close this post'
      });
    }

    post.status = req.body.filled ? 'filled' : 'closed';
    await post.save();

    res.json({
      success: true,
      message: `Post ${post.status === 'filled' ? 'marked as filled' : 'closed'} successfully`,
      post
    });
  } catch (error) {
    console.error('Close post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close post'
    });
  }
};

// Get post statistics for dashboard
exports.getPostStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalPosts, openPosts, draftPosts, viewsAndApps] = await Promise.all([
      Post.countDocuments({ creator: userId }),
      Post.countDocuments({ creator: userId, status: 'open' }),
      Post.countDocuments({ creator: userId, status: 'draft' }),
      Post.aggregate([
        { $match: { creator: userId } },
        { 
          $group: { 
            _id: null, 
            totalViews: { $sum: '$views' },
            totalApplications: { $sum: '$applicationsCount' }
          } 
        }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalPosts,
        openPosts,
        draftPosts,
        closedPosts: totalPosts - openPosts - draftPosts,
        totalViews: viewsAndApps[0]?.totalViews || 0,
        totalApplications: viewsAndApps[0]?.totalApplications || 0
      }
    });
  } catch (error) {
    console.error('Get post stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post statistics'
    });
  }
};

// Save/Bookmark a post
exports.savePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Add to savedPosts if not already saved
    const User = require('../Model/User');
    const user = await User.findById(userId);
    
    if (user.savedPosts.includes(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Post already saved'
      });
    }

    user.savedPosts.push(postId);
    await user.save();

    res.json({
      success: true,
      message: 'Post saved successfully'
    });
  } catch (error) {
    console.error('Save post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save post'
    });
  }
};

// Unsave/Remove bookmark from a post
exports.unsavePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const User = require('../Model/User');
    const user = await User.findById(userId);

    const index = user.savedPosts.indexOf(postId);
    if (index === -1) {
      return res.status(400).json({
        success: false,
        message: 'Post not in saved list'
      });
    }

    user.savedPosts.splice(index, 1);
    await user.save();

    res.json({
      success: true,
      message: 'Post removed from saved'
    });
  } catch (error) {
    console.error('Unsave post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove post from saved'
    });
  }
};

// Get all saved posts for current user
exports.getSavedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const User = require('../Model/User');

    const user = await User.findById(userId).populate({
      path: 'savedPosts',
      populate: {
        path: 'creator',
        select: 'displayName avatar university'
      }
    });

    // Filter out any null posts (deleted posts)
    const savedPosts = user.savedPosts.filter(post => post !== null);

    res.json({
      success: true,
      posts: savedPosts,
      total: savedPosts.length
    });
  } catch (error) {
    console.error('Get saved posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved posts'
    });
  }
};
