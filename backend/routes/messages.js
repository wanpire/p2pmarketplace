/**
 * Message Routes
 * 
 * Express routes for message management including sending and retrieving messages
 */

const express = require('express');
const router = express.Router();
const messageModel = require('../models/message');

/**
 * @route   POST /api/messages/send
 * @desc    Send a message from one user to another
 * @access  Private (should have auth middleware)
 */
router.post('/send', async (req, res) => {
  try {
    const { sender_id, receiver_id, content } = req.body;
    
    // Validate required fields
    if (!sender_id || !receiver_id || !content) {
      return res.status(400).json({ error: 'Sender ID, receiver ID, and content are required' });
    }
    
    // Validate content is not empty
    if (content.trim() === '') {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }
    
    // Create message (timestamp will be set automatically)
    const message = await messageModel.sendMessage(sender_id, receiver_id, content);
    
    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * @route   GET /api/messages
 * @desc    Get message history between two users
 * @access  Private (should have auth middleware)
 */
router.get('/', async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.query;
    
    // Validate required query params
    if (!sender_id || !receiver_id) {
      return res.status(400).json({ error: 'Sender ID and receiver ID are required' });
    }
    
    // Parse pagination params
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    // Get message history
    const messages = await messageModel.getMessages(sender_id, receiver_id, limit, offset);
    
    // Mark messages as read if current user is the receiver
    // In a real app with auth, you would use the authenticated user's ID
    // For now, we assume sender_id is the current user
    await messageModel.markMessagesAsRead(sender_id, receiver_id);
    
    res.status(200).json({
      count: messages.length,
      messages
    });
  } catch (error) {
    console.error('Get messages error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

/**
 * @route   GET /api/messages/unread
 * @desc    Get unread message count for a user
 * @access  Private (should have auth middleware)
 */
router.get('/unread', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get unread message count
    const unreadCounts = await messageModel.getUnreadMessageCount(user_id);
    
    res.status(200).json({ unreadCounts });
  } catch (error) {
    console.error('Get unread count error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve unread count' });
  }
});

/**
 * @route   GET /api/messages/conversations
 * @desc    Get all conversations for a user
 * @access  Private (should have auth middleware)
 */
router.get('/conversations', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get conversations
    const conversations = await messageModel.getUserConversations(user_id);
    
    res.status(200).json({
      count: conversations.length,
      conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
});

/**
 * @route   DELETE /api/messages/conversation
 * @desc    Delete conversation between two users
 * @access  Private (should have auth middleware)
 */
router.delete('/conversation', async (req, res) => {
  try {
    const { user1_id, user2_id } = req.query;
    
    if (!user1_id || !user2_id) {
      return res.status(400).json({ error: 'Both user IDs are required' });
    }
    
    // Delete conversation
    const deletedCount = await messageModel.deleteConversation(user1_id, user2_id);
    
    res.status(200).json({
      message: `Deleted ${deletedCount} messages`,
      count: deletedCount
    });
  } catch (error) {
    console.error('Delete conversation error:', error.message);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

/**
 * @route   PUT /api/messages/read
 * @desc    Mark messages as read
 * @access  Private (should have auth middleware)
 */
router.put('/read', async (req, res) => {
  try {
    const { receiver_id, sender_id } = req.body;
    
    if (!receiver_id || !sender_id) {
      return res.status(400).json({ error: 'Receiver ID and sender ID are required' });
    }
    
    // Mark messages as read
    const markedCount = await messageModel.markMessagesAsRead(receiver_id, sender_id);
    
    res.status(200).json({
      message: `Marked ${markedCount} messages as read`,
      count: markedCount
    });
  } catch (error) {
    console.error('Mark messages as read error:', error.message);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

module.exports = router; 