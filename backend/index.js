/**
 * Main Server (backend/index.js)
 * 
 * This is the entry point for the Hostel Marketplace API server.
 * It sets up the Express server, connects to the database, initializes Socket.io for chat,
 * and mounts all route handlers.
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./models/db');
const { initChat } = require('./chat');

// Import route handlers
const userRoutes = require('./routes/users');
const hostelRoutes = require('./routes/hostels');
const bookingRoutes = require('./routes/bookings');
const messageRoutes = require('./routes/messages');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server (required for Socket.io)
const server = http.createServer(app);

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// If we have a public directory for static files in the future
// app.use(express.static(path.join(__dirname, 'public')));

// Initialize Socket.io for real-time chat
const io = initChat(server);

// Make io accessible to route handlers if needed
app.set('io', io);

// Mount API routes
app.use('/api/users', userRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);

// Basic route for testing API health
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Hostel Marketplace API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      hostels: '/api/hostels',
      bookings: '/api/bookings',
      messages: '/api/messages'
    }
  });
});

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    // Start server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log(`WebSocket server available for chat`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application should continue running despite unhandled promise rejections
});

// Start the server
startServer();

module.exports = { app, server }; // Export for testing purposes
