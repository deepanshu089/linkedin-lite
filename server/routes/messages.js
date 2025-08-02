const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Test endpoint to verify server is working
router.get('/test', (req, res) => {
  console.log('Messages test endpoint hit');
  res.json({ message: 'Messages server is working' });
});

// GET /api/messages/feed-stats - Get simple message statistics for feed
router.get('/feed-stats', async (req, res) => {
  try {
    console.log('Fetching message feed stats...');
    const totalMessages = await Message.countDocuments();
    console.log('Total messages found:', totalMessages);

    res.json({
      totalMessages
    });
  } catch (error) {
    console.error('Error fetching message feed stats:', error);
    res.status(500).json({ message: 'Error fetching message feed stats', error: error.message });
  }
});

// GET /api/messages/conversations - Get all conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    console.log('Fetching conversations for user:', req.user._id);
    
    // Get all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ]
    })
    .populate('sender', 'name email avatar')
    .populate('recipient', 'name email avatar')
    .sort({ createdAt: -1 });

    // Group messages by conversation (other user)
    const conversations = {};
    
    if (messages.length > 0) {
      messages.forEach(message => {
        const otherUserId = message.sender._id.toString() === req.user._id.toString() 
          ? message.recipient._id.toString() 
          : message.sender._id.toString();
        
        if (!conversations[otherUserId]) {
          conversations[otherUserId] = {
            user: message.sender._id.toString() === req.user._id.toString() 
              ? message.recipient 
              : message.sender,
            lastMessage: message,
            unreadCount: 0
          };
        }
        
        // Count unread messages from other user
        if (message.recipient._id.toString() === req.user._id.toString() && !message.read) {
          conversations[otherUserId].unreadCount++;
        }
        
        // Update last message if this one is more recent
        if (!conversations[otherUserId].lastMessage || 
            message.createdAt > conversations[otherUserId].lastMessage.createdAt) {
          conversations[otherUserId].lastMessage = message;
        }
      });
    }

    // Convert to array and sort by last message time
    const conversationsArray = Object.values(conversations)
      .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

    console.log('Found conversations:', conversationsArray.length);
    res.json({ conversations: conversationsArray });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
});

// GET /api/messages/:userId - Get messages with a specific user
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Fetching messages between users:', req.user._id, 'and', userId);
    
    // Verify they are friends
    const currentUser = await User.findById(req.user._id);
    const otherUser = await User.findById(userId);
    
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!currentUser.friends || !currentUser.friends.includes(userId)) {
      return res.status(403).json({ message: 'You can only message your friends' });
    }
    
    // Get messages between these two users
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ]
    })
    .populate('sender', 'name email avatar')
    .populate('recipient', 'name email avatar')
    .sort({ createdAt: 1 });

    // Mark messages from other user as read
    await Message.updateMany(
      { sender: userId, recipient: req.user._id, read: false },
      { read: true }
    );

    console.log('Found messages:', messages.length);
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// POST /api/messages/:userId - Send a message to a user
router.post('/:userId', auth, upload.array('media', 5), async (req, res) => {
  console.log('=== POST ROUTE HIT ===');
  try {
    console.log('=== ROUTE HIT ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('User ID from params:', req.params.userId);
    console.log('Request headers:', req.headers);
    console.log('Content-Type:', req.get('Content-Type'));
    
    const { userId } = req.params;
    const { content } = req.body;
    
    console.log('=== SENDING MESSAGE ===');
    console.log('From:', req.user._id, 'To:', userId);
    console.log('Content:', content);
    console.log('Files:', req.files);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Files length:', req.files ? req.files.length : 0);
    console.log('Content type header:', req.get('Content-Type'));
    
    // Check if we have either content or media
    const hasContent = content && content.trim().length > 0;
    const hasMedia = req.files && req.files.length > 0;
    
    console.log('Validation check:', { hasContent, hasMedia, content: content || 'undefined' });
    console.log('Content type:', typeof content);
    console.log('Content value:', content);
    console.log('Files:', req.files);
    
    if (!hasContent && !hasMedia) {
      return res.status(400).json({ message: 'Message content or media is required' });
    }
    
    // Verify they are friends
    const currentUser = await User.findById(req.user._id);
    const otherUser = await User.findById(userId);
    
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!currentUser.friends || !currentUser.friends.includes(userId)) {
      return res.status(403).json({ message: 'You can only message your friends' });
    }
    
    // Process media files
    let media = [];
    if (hasMedia) {
      req.files.forEach(file => {
        media.push({
          type: file.mediaType,
          url: `/uploads/${file.filename}`,
          filename: file.originalname,
          size: file.size
        });
      });
    }
    
    // Create the message
    const messageData = {
      sender: req.user._id,
      recipient: userId,
      content: hasContent ? content.trim() : '',
      media: media
    };
    
    console.log('Creating message with data:', messageData);
    
    const message = new Message(messageData);
    await message.save();
    
    // Populate sender and recipient for response
    await message.populate('sender', 'name email avatar');
    await message.populate('recipient', 'name email avatar');
    
    console.log('Message sent successfully');
    console.log('Saved message:', message);
    console.log('Message media:', message.media);
    res.status(201).json({ message: message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// PUT /api/messages/:messageId/read - Mark a message as read
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Only recipient can mark message as read
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    message.read = true;
    await message.save();
    
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Error marking message as read' });
  }
});

// GET /api/messages/unread/count - Get unread message count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      read: false
    });
    
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Error getting unread count' });
  }
});

module.exports = router; 