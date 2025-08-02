const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// GET /api/posts/feed-stats - Get simple post statistics for feed
router.get('/feed-stats', async (req, res) => {
  try {
    console.log('Fetching post feed stats...');
    const totalPosts = await Post.countDocuments();
    console.log('Total posts found:', totalPosts);

    res.json({
      totalPosts
    });
  } catch (error) {
    console.error('Error fetching post feed stats:', error);
    res.status(500).json({ message: 'Error fetching post feed stats', error: error.message });
  }
});

// GET /api/posts - Get all posts except current user's posts (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get the current user's ID from the Authorization header if present
    let currentUserId = null;
    const authHeader = req.header('Authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.userId;
      } catch (error) {
        // Token is invalid, but we'll still show all posts
        console.log('Invalid token, showing all posts');
      }
    }

    // Build query to exclude current user's posts
    const query = currentUserId ? { author: { $ne: currentUserId } } : {};

    const posts = await Post.find(query)
      .populate('author', 'name email avatar')
      .populate('likes', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: skip + posts.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// POST /api/posts - Create a new post (protected)
router.post('/', auth, upload.array('media', 5), [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Post content must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { content } = req.body;
    const media = [];

    // Process uploaded files
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        media.push({
          type: file.mediaType,
          url: `/uploads/${file.filename}`,
          filename: file.originalname,
          size: file.size
        });
      });
    }

    const post = new Post({
      content,
      media,
      author: req.user._id
    });

    await post.save();
    await post.populate('author', 'name email avatar');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// GET /api/posts/:id - Get a specific post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email avatar')
      .populate('likes', 'name avatar')
      .populate('comments.user', 'name avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Error fetching post' });
  }
});

// GET /api/posts/:id - Get a single post (public)
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email avatar')
      .populate('likes', 'name avatar')
      .populate('comments.user', 'name avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Error fetching post' });
  }
});

// GET /api/posts/user/:userId - Get posts by a specific user (public)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: userId })
      .populate('author', 'name email avatar')
      .populate('likes', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Post.countDocuments({ author: userId });

    res.json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: skip + posts.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Error fetching user posts' });
  }
});

// POST /api/posts/:id/like - Like/unlike a post (protected)
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(id => !id.equals(userId));
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();
    await post.populate('likes', 'name avatar');

    res.json({
      message: isLiked ? 'Post unliked' : 'Post liked',
      post
    });
  } catch (error) {
    console.error('Error liking/unliking post:', error);
    res.status(500).json({ message: 'Error updating like' });
  }
});

// POST /api/posts/:id/comment - Add comment to post (protected)
router.post('/:id/comment', auth, [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { content } = req.body;
    post.comments.push({
      user: req.user._id,
      content
    });

    await post.save();
    await post.populate('comments.user', 'name avatar');

    res.json({
      message: 'Comment added successfully',
      post
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// DELETE /api/posts/:id - Delete a post (protected, author only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

module.exports = router; 