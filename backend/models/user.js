/**
 * User Model
 * 
 * Handles all database operations related to users
 */

const bcrypt = require('bcrypt');
const { getDatabase } = require('./db');

/**
 * Create a new user in the database
 * 
 * @param {string} username - Unique username
 * @param {string} password - User password (will be hashed)
 * @param {string} role - User role ('guest', 'host', or 'admin')
 * @param {string} email - User email
 * @returns {Promise<object>} - Created user object
 */
async function createUser(username, password, role, email) {
  const db = getDatabase();
  
  // Hash password before storing
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  return new Promise((resolve, reject) => {
    // Validate role
    if (role !== 'guest' && role !== 'host' && role !== 'admin') {
      return reject(new Error('Invalid role. Must be "guest", "host", or "admin"'));
    }
    
    const query = `
      INSERT INTO users (username, password, role, email)
      VALUES (?, ?, ?, ?)
    `;
    
    db.run(query, [username, hashedPassword, role, email], function(err) {
      if (err) {
        // Check for unique constraint violation
        if (err.message.includes('UNIQUE constraint failed')) {
          if (err.message.includes('username')) {
            return reject(new Error('Username already exists'));
          }
          if (err.message.includes('email')) {
            return reject(new Error('Email already exists'));
          }
        }
        return reject(err);
      }
      
      // Return the created user (without password)
      resolve({
        id: this.lastID,
        username,
        role,
        email
      });
    });
  });
}

/**
 * Find a user by their username
 * 
 * @param {string} username - Username to search for
 * @returns {Promise<object|null>} - User object or null if not found
 */
function findUserByUsername(username) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE username = ?';
    
    db.get(query, [username], (err, row) => {
      if (err) {
        return reject(err);
      }
      
      if (!row) {
        return resolve(null);
      }
      
      // Never expose password hash
      const { password, ...userWithoutPassword } = row;
      resolve(userWithoutPassword);
    });
  });
}

/**
 * Find a user by their ID
 * 
 * @param {number} id - User ID to search for
 * @returns {Promise<object|null>} - User object or null if not found
 */
function findUserById(id) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    
    db.get(query, [id], (err, row) => {
      if (err) {
        return reject(err);
      }
      
      if (!row) {
        return resolve(null);
      }
      
      // Never expose password hash
      const { password, ...userWithoutPassword } = row;
      resolve(userWithoutPassword);
    });
  });
}

/**
 * Update a user's details
 * 
 * @param {number} id - User ID to update
 * @param {object} updates - Object containing fields to update
 * @returns {Promise<object>} - Updated user object
 */
function updateUser(id, updates) {
  const db = getDatabase();
  const allowedUpdates = ['username', 'email', 'role'];
  const updateFields = [];
  const updateValues = [];
  
  // Filter updates to only allowed fields
  for (const [key, value] of Object.entries(updates)) {
    if (allowedUpdates.includes(key) && value !== undefined) {
      updateFields.push(`${key} = ?`);
      updateValues.push(value);
    }
  }
  
  if (updateFields.length === 0) {
    return Promise.reject(new Error('No valid update fields provided'));
  }
  
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;
    
    updateValues.push(id);
    
    db.run(query, updateValues, function(err) {
      if (err) {
        // Check for unique constraint violation
        if (err.message.includes('UNIQUE constraint failed')) {
          if (err.message.includes('username')) {
            return reject(new Error('Username already exists'));
          }
          if (err.message.includes('email')) {
            return reject(new Error('Email already exists'));
          }
        }
        return reject(err);
      }
      
      if (this.changes === 0) {
        return reject(new Error('User not found'));
      }
      
      // Return the updated user
      findUserById(id).then(resolve).catch(reject);
    });
  });
}

/**
 * Verify user credentials
 * 
 * @param {string} username - Username
 * @param {string} password - Password to verify
 * @returns {Promise<object|null>} - User object if credentials are valid, null otherwise
 */
async function verifyCredentials(username, password) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE username = ?';
    
    db.get(query, [username], async (err, user) => {
      if (err) {
        return reject(err);
      }
      
      if (!user) {
        return resolve(null);
      }
      
      try {
        // Verify password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return resolve(null);
        }
        
        // Never expose password hash
        const { password, ...userWithoutPassword } = user;
        resolve(userWithoutPassword);
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Delete a user by ID
 * 
 * @param {number} id - User ID to delete
 * @returns {Promise<boolean>} - True if deleted, false if not found
 */
function deleteUser(id) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM users WHERE id = ?';
    
    db.run(query, [id], function(err) {
      if (err) {
        return reject(err);
      }
      
      resolve(this.changes > 0);
    });
  });
}

module.exports = {
  createUser,
  findUserByUsername,
  findUserById,
  updateUser,
  verifyCredentials,
  deleteUser
}; 