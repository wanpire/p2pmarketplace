/**
 * Database connection module
 * 
 * This module establishes a connection to the SQLite database and exports
 * a single database instance that can be reused throughout the application.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname, '../database');
console.log('Database directory path:', dbDir);
if (!fs.existsSync(dbDir)) {
  console.log('Creating database directory:', dbDir);
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dbDir, 'data', 'hostel.db');
console.log('Database file path:', dbPath);

// Create data directory if it doesn't exist
const dataDir = path.join(dbDir, 'data');
if (!fs.existsSync(dataDir)) {
  console.log('Creating data directory:', dataDir);
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database connection
let db = null;

/**
 * Initialize the database connection
 * @returns {Promise} Resolves when database is ready
 */
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    // Check if database exists
    const dbExists = fs.existsSync(dbPath);
    
    // Create database connection
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error connecting to SQLite database:', err.message);
        return reject(err);
      }
      console.log('Connected to the SQLite database.');
      
      // If database didn't exist, initialize it with schema
      if (!dbExists) {
        const sqlInit = fs.readFileSync(path.join(dbDir, 'init.sql'), 'utf8');
        db.exec(sqlInit, (err) => {
          if (err) {
            console.error('Error initializing database schema:', err.message);
            return reject(err);
          }
          console.log('Database schema initialized successfully.');
          resolve(db);
        });
      } else {
        resolve(db);
      }
    });
  });
}

/**
 * Get database instance
 * @returns {Object} SQLite database instance
 */
function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 * @returns {Promise} Resolves when connection is closed
 */
function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database connection:', err.message);
          return reject(err);
        }
        console.log('Database connection closed.');
        db = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

// Export functions and initialized database promise
module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase
}; 