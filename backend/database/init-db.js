/**
 * Database Initialization Script
 * 
 * This script initializes the SQLite database with the schema defined in schema.sql
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Check environment variables for database path
const dbPath = process.env.DB_PATH || process.env.DATABASE_PATH || path.join(__dirname, 'data', 'hostel.db');

console.log('Initializing database...');
console.log('Database directory path:', __dirname);
console.log('Database file path:', path.resolve(dbPath));

// Create the data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// SQL schema file path
const schemaPath = path.join(__dirname, 'schema.sql');

// Read the schema file
const schema = fs.readFileSync(schemaPath, 'utf8');

// Initialize the database
function initDb() {
  return new Promise((resolve, reject) => {
    console.log('Initializing database...');
    
    // Create a new database or open existing one
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        reject(err);
        return;
      }
      console.log('Connected to the SQLite database');
      
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          console.error('Error enabling foreign keys:', err.message);
          reject(err);
          return;
        }
        
        // Execute the schema
        db.exec(schema, (err) => {
          if (err) {
            console.error('Error initializing database schema:', err.message);
            reject(err);
            return;
          }
          console.log('Database schema initialized successfully');
          
          // Close the database connection
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err.message);
              // Don't reject here, we still completed the initialization
            }
            console.log('Database connection closed');
            resolve();
          });
        });
      });
    });
  });
}

// Only run if called directly (not when required by another module)
if (require.main === module) {
  initDb().catch(err => {
    console.error('Database initialization failed:', err);
    process.exit(1);
  });
}

module.exports = { initDb }; 