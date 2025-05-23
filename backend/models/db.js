/**
 * Database connection module
 * 
 * This module establishes a connection to the SQLite database and exports
 * a single database instance that can be reused throughout the application.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Database file path from .env or default path
let dbPath;
if (process.env.DB_PATH && (process.env.DB_PATH.startsWith('/') || process.env.DB_PATH.includes(':'))) {
  // If it's an absolute path, use it directly
  dbPath = process.env.DB_PATH;
} else if (process.env.DB_PATH) {
  // If it's a relative path, resolve it from the current directory
  dbPath = path.resolve(process.cwd(), process.env.DB_PATH);
} else if (process.env.DATABASE_PATH && (process.env.DATABASE_PATH.startsWith('/') || process.env.DATABASE_PATH.includes(':'))) {
  // Same for DATABASE_PATH
  dbPath = process.env.DATABASE_PATH;
} else if (process.env.DATABASE_PATH) {
  dbPath = path.resolve(process.cwd(), process.env.DATABASE_PATH);
} else {
  // Default path
  dbPath = path.join(__dirname, '../database/data/hostel.db');
}

// Path to schema.sql
const schemaPath = path.join(__dirname, '../database/schema.sql');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
console.log('Model Database directory path:', dbDir);
console.log('Model Database file path:', dbPath);

if (!fs.existsSync(dbDir)) {
  console.log('Creating database directory:', dbDir);
  fs.mkdirSync(dbDir, { recursive: true });
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
      console.log('Connected to the SQLite database for models.');
      
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          console.error('Error enabling foreign keys:', err.message);
          reject(err);
          return;
        }
        
        // Check for users table existence
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
          if (err) {
            console.error('Error checking for users table:', err.message);
            reject(err);
            return;
          }
          
          // If users table doesn't exist, execute schema.sql
          if (!row) {
            console.log('Users table not found. Initializing database schema...');
            
            // Check if schema.sql exists
            if (!fs.existsSync(schemaPath)) {
              console.error('Schema file not found:', schemaPath);
              reject(new Error('Schema file not found'));
              return;
            }
            
            // Read and execute schema.sql
            const schema = fs.readFileSync(schemaPath, 'utf8');
            db.exec(schema, (err) => {
              if (err) {
                console.error('Error initializing schema:', err.message);
                reject(err);
                return;
              }
              console.log('Database schema initialized successfully');
              resolve(db);
            });
          } else {
            console.log('Database schema already exists');
            resolve(db);
          }
        });
      });
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