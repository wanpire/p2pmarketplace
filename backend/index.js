/**
 * Hostel Marketplace API Server
 * Main entry point for the backend application
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./database/init-db');
const { getDbConnection } = require('./database/connection');
const { initializeDatabase } = require('./models/db');
const initChat = require('./chat').initChat;
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize chat functionality with Socket.io
initChat(server);

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://hosty.alonet.co'] 
    : ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:8080'],
  credentials: true,
  optionsSuccessStatus: 200
};

console.log('CORS configuration:', corsOptions);

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// API Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/hostels', require('./routes/hostels'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/messages', require('./routes/messages'));

// Basic route for testing
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Hostel Marketplace API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Initialize database and start server
async function initializeAllDatabases() {
  try {
    // Initialize the main database connection
    try {
      const db = await getDbConnection();
      db.close();
      console.log('Successfully connected to existing database');
    } catch (err) {
      console.error('Database connection error:', err.message);
      console.log('Attempting to initialize database...');
      
      // If connection fails, initialize the database and wait for it to complete
      await initDb();
      console.log('Database initialized successfully');
    }

    // Also initialize the database used by models
    try {
      await initializeDatabase();
      console.log('Model database connection initialized successfully');
    } catch (err) {
      console.error('Failed to initialize model database:', err.message);
      throw err;
    }
  } catch (error) {
    console.error('Failed to initialize database:', error.message);
    throw error;
  }
}

async function startServer() {
  try {
    await initializeAllDatabases();
    
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

// Start the server
startServer();
