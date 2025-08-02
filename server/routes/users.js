const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/users/feed-stats - Get simple feed statistics
router.get('/feed-stats', async (req, res) => {
  try {
    console.log('Fetching user feed stats...');
    const totalUsers = await User.countDocuments();
    console.log('Total users found:', totalUsers);

    res.json({
      totalUsers
    });
  } catch (error) {
    console.error('Error fetching feed stats:', error);
    res.status(500).json({ message: 'Error fetching feed stats', error: error.message });
  }
});

// GET /api/users - Get all users (for future features)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').limit(50);
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// GET /api/users/:id - Get user profile and posts
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ author: req.params.id })
      .populate('author', 'name email avatar')
      .populate('likes', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      user,
      posts
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// PUT /api/users/profile - Update user profile (protected)
router.put('/profile', auth, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
  body('avatar')
    .optional()
    .custom((value) => {
      if (!value) return true; // Allow empty values
      // Allow both URLs and base64 data URLs
      if (value.startsWith('data:image/') || value.startsWith('http://') || value.startsWith('https://')) {
        return true;
      }
      throw new Error('Avatar must be a valid URL or image data');
    })
    .withMessage('Avatar must be a valid URL or image data')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, bio, avatar } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

module.exports = router; 