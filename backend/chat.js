/**
 * Chat Socket Module
 * 
 * Sets up Socket.io for real-time chat functionality, integrating with the message model
 */

const socketIo = require('socket.io');
const messageModel = require('./models/message');

// Store active user connections
const activeUsers = new Map();

/**
 * Initialize Socket.io with the HTTP server
 * @param {Object} server - HTTP server instance from Express
 * @returns {Object} - Socket.io instance
 */
function initChat(server) {
  const io = socketIo(server, {
    cors: {
      origin: "*", // In production, restrict this to your domain
      methods: ["GET", "POST"]
    }
  });
  
  // Middleware to handle authentication (simplified for now)
  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      return next(new Error("User ID is required"));
    }
    
    // Attach user ID to socket
    socket.userId = userId;
    next();
  });
  
  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`User connected: ${userId}`);
    
    // Add user to active users
    activeUsers.set(userId, socket.id);
    
    // Join a personal room for direct messages
    socket.join(`user_${userId}`);
    
    // Send active status to friends/contacts
    io.emit('user_status', { userId, status: 'online' });
    
    /**
     * Handle new message
     * Stores the message in the database and broadcasts to recipients
     */
    socket.on('send_message', async (data) => {
      try {
        const { receiver_id, content } = data;
        const sender_id = userId; // Use the authenticated user ID
        
        // Validate data
        if (!receiver_id || !content || content.trim() === '') {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }
        
        // Save message to database using the same model used by REST API
        const message = await messageModel.sendMessage(sender_id, receiver_id, content);
        
        // Create a unique room name for the conversation (sorted IDs to ensure consistency)
        const roomName = [sender_id, receiver_id].sort().join('_');
        
        // Emit the message to the room
        io.to(roomName).emit('new_message', message);
        
        // Also send to the personal rooms of both users
        io.to(`user_${sender_id}`).emit('new_message', message);
        io.to(`user_${receiver_id}`).emit('new_message', message);
        
        // Send notification if receiver is not in the current conversation
        if (activeUsers.has(receiver_id)) {
          const receiverSocketId = activeUsers.get(receiver_id);
          const receiverSocket = io.sockets.sockets.get(receiverSocketId);
          
          if (receiverSocket && receiverSocket.currentChat !== roomName) {
            io.to(`user_${receiver_id}`).emit('message_notification', {
              message,
              sender: {
                id: sender_id,
                name: message.sender_name
              }
            });
          }
        }
      } catch (error) {
        console.error('Socket message error:', error.message);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    /**
     * Join a conversation room
     */
    socket.on('join_conversation', (data) => {
      const { other_user_id } = data;
      
      if (!other_user_id) {
        socket.emit('error', { message: 'Other user ID is required' });
        return;
      }
      
      // Create a unique room name (sorted IDs to ensure consistency)
      const roomName = [userId, other_user_id].sort().join('_');
      
      // Join the room
      socket.join(roomName);
      
      // Remember current chat
      socket.currentChat = roomName;
      
      console.log(`User ${userId} joined conversation with ${other_user_id}`);
    });
    
    /**
     * Leave a conversation room
     */
    socket.on('leave_conversation', (data) => {
      const { other_user_id } = data;
      
      if (!other_user_id) {
        socket.emit('error', { message: 'Other user ID is required' });
        return;
      }
      
      // Create room name
      const roomName = [userId, other_user_id].sort().join('_');
      
      // Leave the room
      socket.leave(roomName);
      
      // Clear current chat
      socket.currentChat = null;
      
      console.log(`User ${userId} left conversation with ${other_user_id}`);
    });
    
    /**
     * Mark messages as read
     */
    socket.on('mark_read', async (data) => {
      try {
        const { sender_id } = data;
        const receiver_id = userId; // Current user is the receiver
        
        if (!sender_id) {
          socket.emit('error', { message: 'Sender ID is required' });
          return;
        }
        
        // Mark messages as read in database
        const count = await messageModel.markMessagesAsRead(receiver_id, sender_id);
        
        // Create room name
        const roomName = [userId, sender_id].sort().join('_');
        
        // Emit read status update to the room
        io.to(roomName).emit('messages_read', {
          sender_id,
          receiver_id,
          count
        });
        
        console.log(`User ${userId} marked ${count} messages from ${sender_id} as read`);
      } catch (error) {
        console.error('Socket mark read error:', error.message);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });
    
    /**
     * User is typing indicator
     */
    socket.on('typing', (data) => {
      const { receiver_id } = data;
      
      if (!receiver_id) {
        return;
      }
      
      // Create room name
      const roomName = [userId, receiver_id].sort().join('_');
      
      // Emit typing event to the room
      socket.to(roomName).emit('user_typing', {
        user_id: userId
      });
    });
    
    /**
     * User stopped typing indicator
     */
    socket.on('stop_typing', (data) => {
      const { receiver_id } = data;
      
      if (!receiver_id) {
        return;
      }
      
      // Create room name
      const roomName = [userId, receiver_id].sort().join('_');
      
      // Emit stop typing event to the room
      socket.to(roomName).emit('user_stop_typing', {
        user_id: userId
      });
    });
    
    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      
      // Remove user from active users
      activeUsers.delete(userId);
      
      // Send offline status to friends/contacts
      io.emit('user_status', { userId, status: 'offline' });
    });
  });
  
  console.log('Socket.io initialized for chat');
  return io;
}

module.exports = { initChat }; 