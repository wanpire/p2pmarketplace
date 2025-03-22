/**
 * Database Initialization Script
 * 
 * This script initializes the SQLite database with the schema defined in schema.sql
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'data', 'hostel_marketplace.sqlite');

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
  console.log('Initializing database...');
  
  // Create a new database or open existing one
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      process.exit(1);
    }
    console.log('Connected to the SQLite database');
    
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON', (err) => {
      if (err) {
        console.error('Error enabling foreign keys:', err.message);
      }
      
      // Execute the schema
      db.exec(schema, (err) => {
        if (err) {
          console.error('Error initializing database schema:', err.message);
          process.exit(1);
        }
        console.log('Database schema initialized successfully');
        
        // Close the database connection
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          }
          console.log('Database connection closed');
        });
      });
    });
  });
}

// Run the initialization
initDb();

module.exports = { initDb }; 