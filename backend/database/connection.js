/**
 * Database Connection Module
 * 
 * This module provides a connection to the SQLite database
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path from .env or default path
// Check both DB_PATH and DATABASE_PATH for compatibility
const dbPath = process.env.DB_PATH || process.env.DATABASE_PATH || path.join(__dirname, 'data', 'hostel.db');

console.log('Database directory path:', __dirname);
console.log('Database file path:', path.resolve(dbPath));

// Create a database connection
const getDbConnection = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error connecting to the database:', err.message);
        reject(err);
        return;
      }
      
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          console.error('Error enabling foreign keys:', err.message);
          reject(err);
          return;
        }
        
        resolve(db);
      });
    });
  });
};

// Helper function to run SQL queries with promises
const query = (sql, params = []) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await getDbConnection();
      
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Error executing query:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
        
        // Close the connection
        db.close((err) => {
          if (err) {
            console.error('Error closing database connection:', err.message);
          }
        });
      });
    } catch (err) {
      reject(err);
    }
  });
};

// Helper function to run insert/update/delete queries
const run = (sql, params = []) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await getDbConnection();
      
      db.run(sql, params, function(err) {
        if (err) {
          console.error('Error executing query:', err.message);
          reject(err);
        } else {
          // Return the lastID and changes properties
          resolve({
            lastID: this.lastID,
            changes: this.changes
          });
        }
        
        // Close the connection
        db.close((err) => {
          if (err) {
            console.error('Error closing database connection:', err.message);
          }
        });
      });
    } catch (err) {
      reject(err);
    }
  });
};

// Export the database functions
module.exports = {
  getDbConnection,
  query,
  run
}; 