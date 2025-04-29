/**
 * User Routes
 * 
 * Express routes for user management including registration, login, and profile management
 */

const express = require('express');
const router = express.Router();
const userModel = require('../models/user');
const bcrypt = require('bcrypt');
const messageModel = require('../models/message');
const { query } = require('../database/connection');

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, role, email } = req.body;
    
    // Validate input
    if (!username || !password || !role || !email) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Validate role
    if (role !== 'guest' && role !== 'host' && role !== 'admin') {
      return res.status(400).json({ error: 'Role must be "guest", "host", or "admin"' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Validate password strength (at least 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Create user
    const user = await userModel.createUser(username, password, role, email);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    
    // Handle specific errors
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * @route   POST /api/users/login
 * @desc    Authenticate a user and return user info
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Authenticate user
    const user = await userModel.verifyCredentials(username, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Login successful
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 * @access  Private (should have auth middleware, simplified for now)
 */
router.get('/profile', async (req, res) => {
  try {
    // In a real app, you would get the userId from the authenticated session
    // For simplicity, we're using a query parameter or default to 1
    const userId = req.query.userId || 1;
    
    const user = await userModel.findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user's profile
 * @access  Private (should have auth middleware, simplified for now)
 */
router.put('/profile', async (req, res) => {
  try {
    // In a real app, you would get the userId from the authenticated session
    // For simplicity, we're using req.body.id or default to 1
    const userId = req.body.id || 1;
    
    // Extract the fields to update
    const { username, email, role } = req.body;
    
    // Create updates object with only provided fields
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (role && (role === 'user' || role === 'host')) updates.role = role;
    
    // Update the user
    const updatedUser = await userModel.updateUser(userId, updates);
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    
    // Handle specific errors
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    
    if (error.message.includes('User not found')) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (public profile)
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await userModel.findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return limited information for public profile
    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Sending a message
const newMessage = await messageModel.sendMessage(
  senderId,
  receiverId,
  "Hey, I'm interested in your hostel. Is it available next week?"
);

// Getting chat history
const chatHistory = await messageModel.getMessages(userId, otherUserId);

// Marking messages as read when user opens a chat
const markedCount = await messageModel.markMessagesAsRead(myUserId, senderUserId);

// Getting a list of all conversations for the chat UI
const conversations = await messageModel.getUserConversations(userId);

// GET /api/users - Fetch all users
router.get('/', async (req, res) => {
  try {
    const users = await query('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({
      error: 'Database error',
      message: 'Failed to fetch users from the database'
    });
  }
});

module.exports = router; 