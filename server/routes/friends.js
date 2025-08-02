const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/friends - Get current user's friends and pending requests
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching friends for user:', req.user._id);
    
    const user = await User.findById(req.user._id)
      .populate('friends', 'name email avatar bio')
      .populate('friendRequests.from', 'name email avatar bio');

    console.log('User found:', {
      id: user._id,
      name: user.name,
      friendsCount: user.friends ? user.friends.length : 0,
      requestsCount: user.friendRequests ? user.friendRequests.length : 0
    });

    // Clean up malformed friend requests
    if (user.friendRequests && user.friendRequests.length > 0) {
      const validRequests = user.friendRequests.filter(req => req.from && req.from._id);
      if (validRequests.length !== user.friendRequests.length) {
        user.friendRequests = validRequests;
        await user.save();
        console.log('Cleaned up malformed friend requests');
      }
    }

    const friends = user.friends || [];
    
    // More robust handling of pending requests
    const pendingRequests = [];
    if (user.friendRequests && user.friendRequests.length > 0) {
      for (const request of user.friendRequests) {
        if (request.status === 'pending' && request.from) {
          // Check if the from field is populated (has name property) or is just an ObjectId
          if (request.from.name) {
            // It's already populated
            pendingRequests.push(request.from);
          } else if (request.from._id) {
            // It's an ObjectId, we need to fetch the user
            try {
              const fromUser = await User.findById(request.from._id).select('name email avatar bio');
              if (fromUser) {
                pendingRequests.push(fromUser);
              }
            } catch (error) {
              console.error('Error fetching user for pending request:', error);
            }
          }
        }
      }
    }

    console.log('Raw friend requests count:', user.friendRequests ? user.friendRequests.length : 0);
    console.log('Filtered pending requests count:', pendingRequests.length);
    if (pendingRequests.length > 0) {
      console.log('First pending request details:', {
        id: pendingRequests[0]._id,
        name: pendingRequests[0].name,
        email: pendingRequests[0].email,
        hasBio: !!pendingRequests[0].bio
      });
    }
    
    // Debug: Check if population worked
    if (user.friendRequests && user.friendRequests.length > 0) {
      console.log('Sample friend request:', {
        status: user.friendRequests[0].status,
        fromType: typeof user.friendRequests[0].from,
        fromHasName: user.friendRequests[0].from ? !!user.friendRequests[0].from.name : false,
        fromId: user.friendRequests[0].from ? user.friendRequests[0].from._id : null
      });
    }

    console.log('Returning:', {
      friendsCount: friends.length,
      pendingRequestsCount: pendingRequests.length,
      friendsIds: friends.map(friend => friend._id || friend),
      pendingRequestIds: pendingRequests.map(user => user._id)
    });

    res.json({
      friends,
      pendingRequests
    });
  } catch (error) {
    console.error('Error fetching friends:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error fetching friends',
      error: error.message,
      stack: error.stack
    });
  }
});

// GET /api/friends/discover - Get users to discover (not friends, not pending requests)
router.get('/discover', auth, async (req, res) => {
  try {
    console.log('Fetching discover users for user:', req.user._id);
    
    const currentUser = await User.findById(req.user._id);
    
    // Get IDs of users who are already friends or have pending requests
    const friendIds = (currentUser.friends || []).map(id => id.toString());
    
    // Users who have sent requests to current user
    const requestFromIds = (currentUser.friendRequests || [])
      .filter(req => req.from)
      .map(req => req.from.toString());
    
    // Users to whom current user has sent requests
    const requestToIds = [];
    const usersWithRequestsFromCurrentUser = await User.find({
      'friendRequests.from': req.user._id
    }).select('_id');
    requestToIds.push(...usersWithRequestsFromCurrentUser.map(user => user._id.toString()));
    
    const excludeIds = [...friendIds, ...requestFromIds, ...requestToIds, req.user._id.toString()];
    
    console.log('Excluding IDs:', {
      friendIds,
      requestFromIds,
      requestToIds,
      currentUserId: req.user._id.toString(),
      totalExcluded: excludeIds.length
    });

    const discoverUsers = await User.find({
      _id: { $nin: excludeIds }
    })
    .select('name email avatar bio')
    .limit(10);

    console.log('Found discover users:', discoverUsers.length);
    res.json({ users: discoverUsers });
  } catch (error) {
    console.error('Error fetching discover users:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error fetching discover users',
      error: error.message,
      stack: error.stack
    });
  }
});

// POST /api/friends/request/:userId - Send friend request
router.post('/request/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Sending friend request:', {
      from: req.user._id,
      to: userId
    });
    
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clean up malformed friend requests for target user FIRST
    if (targetUser.friendRequests && targetUser.friendRequests.length > 0) {
      const validRequests = targetUser.friendRequests.filter(req => {
        try {
          return req && req.from && req.from._id && typeof req.from.toString === 'function';
        } catch (error) {
          console.log('Filtering out malformed request:', error);
          return false;
        }
      });
      if (validRequests.length !== targetUser.friendRequests.length) {
        targetUser.friendRequests = validRequests;
        await targetUser.save();
        console.log('Cleaned up malformed friend requests for target user');
      }
    }

    console.log('Target user found:', {
      id: targetUser._id,
      name: targetUser.name,
      hasFriends: !!targetUser.friends,
      hasRequests: !!targetUser.friendRequests,
      friendsCount: targetUser.friends ? targetUser.friends.length : 0,
      requestsCount: targetUser.friendRequests ? targetUser.friendRequests.length : 0
    });

    // Check if already friends
    if (targetUser.friends && targetUser.friends.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    // Check if request already exists (with extra safety checks)
    const existingRequest = targetUser.friendRequests && targetUser.friendRequests.find(
      req => {
        try {
          return req && req.from && req.from._id && req.from.toString() === req.user._id.toString();
        } catch (error) {
          console.log('Error checking existing request:', error);
          return false;
        }
      }
    );
    
    console.log('Checking for existing request:', {
      hasExistingRequest: !!existingRequest,
      currentUserId: req.user._id.toString(),
      targetUserRequestsCount: targetUser.friendRequests ? targetUser.friendRequests.length : 0
    });
    
    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Initialize arrays if they don't exist
    if (!targetUser.friendRequests) {
      targetUser.friendRequests = [];
    }
    if (!targetUser.friends) {
      targetUser.friends = [];
    }

    console.log('Before adding request:', {
      requestsCount: targetUser.friendRequests.length,
      newRequest: {
        from: req.user._id,
        status: 'pending'
      }
    });

    // Add friend request
    targetUser.friendRequests.push({
      from: req.user._id,
      status: 'pending'
    });

    console.log('After adding request:', {
      requestsCount: targetUser.friendRequests.length
    });

    await targetUser.save();

    console.log('Friend request sent successfully');
    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error sending friend request',
      error: error.message,
      stack: error.stack
    });
  }
});

// POST /api/friends/accept/:userId - Accept friend request
router.post('/accept/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const currentUser = await User.findById(req.user._id);
    console.log('Accepting friend request:', {
      currentUserId: req.user._id,
      targetUserId: userId,
      currentUserFriendRequests: currentUser.friendRequests ? currentUser.friendRequests.length : 0
    });
    
    const request = (currentUser.friendRequests || []).find(
      req => req.from && req.from.toString() === userId && req.status === 'pending'
    );

    console.log('Found request:', {
      hasRequest: !!request,
      requestDetails: request ? {
        from: request.from,
        status: request.status,
        fromType: typeof request.from
      } : null
    });

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Initialize arrays if they don't exist
    if (!currentUser.friends) {
      currentUser.friends = [];
    }
    if (!currentUser.friendRequests) {
      currentUser.friendRequests = [];
    }

    // Add to friends list for both users
    currentUser.friends.push(userId);
    const otherUser = await User.findById(userId);
    
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!otherUser.friends) {
      otherUser.friends = [];
    }
    if (!otherUser.friendRequests) {
      otherUser.friendRequests = [];
    }
    otherUser.friends.push(req.user._id);

    // Remove the friend request from both users since they're now friends
    // Use pull to properly remove the friend request documents
    currentUser.friendRequests = currentUser.friendRequests.filter(
      friendReq => {
        // Skip if friendReq is null/undefined or friendReq.from is null/undefined
        if (!friendReq || !friendReq.from) return true;
        return friendReq.from.toString() !== userId;
      }
    );
    otherUser.friendRequests = otherUser.friendRequests.filter(
      friendReq => {
        // Skip if friendReq is null/undefined or friendReq.from is null/undefined
        if (!friendReq || !friendReq.from) return true;
        return friendReq.from.toString() !== req.user._id.toString();
      }
    );

    // Also remove any pending requests from the other user to current user
    // This ensures no orphaned requests remain
    if (otherUser.friendRequests) {
      otherUser.friendRequests = otherUser.friendRequests.filter(
        friendReq => {
          // Skip if friendReq is null/undefined or friendReq.from is null/undefined
          if (!friendReq || !friendReq.from) return true;
          return friendReq.from.toString() !== req.user._id.toString();
        }
      );
    }

    try {
      await currentUser.save();
      await otherUser.save();
    } catch (saveError) {
      console.error('Error saving users after accepting friend request:', saveError);
      return res.status(500).json({ message: 'Error saving friend relationship' });
    }

    console.log('Friend request accepted and requests cleaned up', {
      currentUserId: req.user._id,
      acceptedUserId: userId,
      currentUserFriendsCount: currentUser.friends.length,
      otherUserFriendsCount: otherUser.friends.length,
      currentUserFriends: currentUser.friends.filter(id => id).map(id => id.toString()),
      otherUserFriends: otherUser.friends.filter(id => id).map(id => id.toString())
    });
    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error accepting friend request',
      error: error.message,
      stack: error.stack
    });
  }
});

// POST /api/friends/reject/:userId - Reject friend request
router.post('/reject/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const currentUser = await User.findById(req.user._id);
    const request = (currentUser.friendRequests || []).find(
      req => req.from && req.from.toString() === userId && req.status === 'pending'
    );

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Remove the friend request completely from the database
    currentUser.friendRequests = currentUser.friendRequests.filter(
      friendReq => {
        // Skip if friendReq is null/undefined or friendReq.from is null/undefined
        if (!friendReq || !friendReq.from) return true;
        return friendReq.from.toString() !== userId;
      }
    );

    await currentUser.save();

    console.log('Friend request rejected and removed from database');
    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ message: 'Error rejecting friend request' });
  }
});

// DELETE /api/friends/remove/:userId - Remove friend
router.delete('/remove/:userId', auth, async (req, res) => {
  console.log('DELETE /api/friends/remove/:userId route hit');
  console.log('Request params:', req.params);
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  try {
    const { userId } = req.params;
    
    // Test database connection
    console.log('Testing database connection...');
    const mongoose = require('mongoose');
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: 'Database not connected' });
    }
    
    console.log('Removing friend:', {
      currentUserId: req.user._id,
      targetUserId: userId
    });
    
    console.log('Looking up current user with ID:', req.user._id);
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      console.log('Current user not found');
      return res.status(404).json({ message: 'Current user not found' });
    }
    console.log('Current user found:', currentUser.name);
    
    console.log('Looking up other user with ID:', userId);
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      console.log('Other user not found');
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('Other user found:', otherUser.name);

    console.log('Before removal:', {
      currentUserFriendsCount: currentUser.friends ? currentUser.friends.length : 0,
      otherUserFriendsCount: otherUser.friends ? otherUser.friends.length : 0,
      currentUserHasTargetAsFriend: currentUser.friends ? currentUser.friends.some(id => id.toString() === userId) : false,
      otherUserHasCurrentAsFriend: otherUser.friends ? otherUser.friends.some(id => id.toString() === req.user._id.toString()) : false
    });

    // Initialize arrays if they don't exist
    if (!currentUser.friends) {
      currentUser.friends = [];
    }
    if (!otherUser.friends) {
      otherUser.friends = [];
    }
    if (!currentUser.friendRequests) {
      currentUser.friendRequests = [];
    }
    if (!otherUser.friendRequests) {
      otherUser.friendRequests = [];
    }

    console.log('Arrays initialized:', {
      currentUserFriendsLength: currentUser.friends.length,
      otherUserFriendsLength: otherUser.friends.length,
      currentUserRequestsLength: currentUser.friendRequests.length,
      otherUserRequestsLength: otherUser.friendRequests.length
    });

    // Simple friend removal without validation
    console.log('Removing friend:', {
      currentUserId: req.user._id.toString(),
      targetUserId: userId,
      currentUserFriendsCount: currentUser.friends ? currentUser.friends.length : 0,
      otherUserFriendsCount: otherUser.friends ? otherUser.friends.length : 0
    });

    // Remove from friends list for both users
    if (currentUser.friends) {
      currentUser.friends = currentUser.friends.filter(id => id.toString() !== userId);
    }
    if (otherUser.friends) {
      otherUser.friends = otherUser.friends.filter(id => id.toString() !== req.user._id.toString());
    }

    // Remove any friend requests between these users
    if (currentUser.friendRequests) {
      currentUser.friendRequests = currentUser.friendRequests.filter(
        friendReq => {
          // Skip if friendReq is null/undefined or friendReq.from is null/undefined
          if (!friendReq || !friendReq.from) return false;
          return friendReq.from.toString() !== userId;
        }
      );
    }
    if (otherUser.friendRequests) {
      otherUser.friendRequests = otherUser.friendRequests.filter(
        friendReq => {
          // Skip if friendReq is null/undefined or friendReq.from is null/undefined
          if (!friendReq || !friendReq.from) return false;
          return friendReq.from.toString() !== req.user._id.toString();
        }
      );
    }

    try {
      console.log('Saving current user...');
      await currentUser.save();
      console.log('Current user saved successfully');
      
      console.log('Saving other user...');
      await otherUser.save();
      console.log('Other user saved successfully');
    } catch (saveError) {
      console.error('Error saving users after removing friend:', saveError);
      console.error('Save error stack:', saveError.stack);
      return res.status(500).json({ 
        message: 'Error saving friend removal',
        error: saveError.message,
        stack: saveError.stack
      });
    }

    console.log('After removal:', {
      currentUserFriendsCount: currentUser.friends.length,
      otherUserFriendsCount: otherUser.friends.length,
      currentUserFriends: currentUser.friends.filter(id => id).map(id => id.toString()),
      otherUserFriends: otherUser.friends.filter(id => id).map(id => id.toString())
    });
    
    console.log('Friend removed and all requests cleaned up');
    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error removing friend',
      error: error.message,
      stack: error.stack
    });
  }
});

// Test route to check if DELETE routes work
router.delete('/test', auth, async (req, res) => {
  console.log('DELETE /api/friends/test route hit');
  res.json({ message: 'DELETE test route works' });
});

module.exports = router; 