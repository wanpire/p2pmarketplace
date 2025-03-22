/**
 * Message Model
 * 
 * Handles all database operations related to chat messages
 */

const { initializeDatabase, getDatabase } = require('./db');

/**
 * Send a message from one user to another
 * 
 * @param {number} sender_id - ID of the user sending the message
 * @param {number} receiver_id - ID of the user receiving the message
 * @param {string} content - Message content
 * @param {string} timestamp - Optional timestamp (defaults to current time)
 * @returns {Promise<object>} - Created message object
 */
async function sendMessage(sender_id, receiver_id, content, timestamp = null) {
  const db = getDatabase();
  
  await initializeDatabase();
  
  return new Promise((resolve, reject) => {
    // Validate required fields
    if (!sender_id || !receiver_id || !content) {
      return reject(new Error('Missing required fields'));
    }
    
    // Use provided timestamp or current time
    const messageTimestamp = timestamp || new Date().toISOString();
    
    const query = `
      INSERT INTO messages (sender_id, receiver_id, content, timestamp)
      VALUES (?, ?, ?, ?)
    `;
    
    db.run(query, [sender_id, receiver_id, content, messageTimestamp], function(err) {
      if (err) {
        return reject(err);
      }
      
      // Return the created message
      getMessageById(this.lastID).then(resolve).catch(reject);
    });
  });
}

/**
 * Get a message by ID
 * 
 * @param {number} id - Message ID
 * @returns {Promise<object|null>} - Message object or null if not found
 */
function getMessageById(id) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT m.*,
             s.username as sender_name,
             r.username as receiver_name
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE m.id = ?
    `;
    
    db.get(query, [id], (err, message) => {
      if (err) {
        return reject(err);
      }
      
      resolve(message);
    });
  });
}

/**
 * Get messages between two users
 * 
 * @param {number} user1_id - First user ID
 * @param {number} user2_id - Second user ID
 * @param {number} limit - Maximum number of messages to return (default: 50)
 * @param {number} offset - Number of messages to skip (default: 0)
 * @returns {Promise<Array>} - Array of message objects
 */
function getMessages(user1_id, user2_id, limit = 50, offset = 0) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT m.*,
             s.username as sender_name,
             r.username as receiver_name
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?)
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.timestamp ASC
      LIMIT ? OFFSET ?
    `;
    
    db.all(
      query,
      [user1_id, user2_id, user2_id, user1_id, limit, offset],
      (err, messages) => {
        if (err) {
          return reject(err);
        }
        
        resolve(messages);
      }
    );
  });
}

/**
 * Mark messages as read
 * 
 * @param {number} receiver_id - ID of the user who received the messages
 * @param {number} sender_id - ID of the user who sent the messages
 * @returns {Promise<number>} - Number of messages marked as read
 */
function markMessagesAsRead(receiver_id, sender_id) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE messages
      SET is_read = 1
      WHERE receiver_id = ? AND sender_id = ? AND is_read = 0
    `;
    
    db.run(query, [receiver_id, sender_id], function(err) {
      if (err) {
        return reject(err);
      }
      
      resolve(this.changes);
    });
  });
}

/**
 * Get unread message count for a user
 * 
 * @param {number} user_id - User ID to check unread messages for
 * @returns {Promise<object>} - Object with sender_id keys and count values
 */
function getUnreadMessageCount(user_id) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT sender_id, COUNT(*) as count
      FROM messages
      WHERE receiver_id = ? AND is_read = 0
      GROUP BY sender_id
    `;
    
    db.all(query, [user_id], (err, rows) => {
      if (err) {
        return reject(err);
      }
      
      // Convert to object with sender_id as keys
      const unreadCounts = {};
      rows.forEach(row => {
        unreadCounts[row.sender_id] = row.count;
      });
      
      resolve(unreadCounts);
    });
  });
}

/**
 * Get all conversations for a user
 * 
 * @param {number} user_id - User ID
 * @returns {Promise<Array>} - Array of conversation objects with latest message
 */
function getUserConversations(user_id) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    // This query gets the most recent message for each conversation
    const query = `
      SELECT 
        m.*,
        u.username as other_user_name,
        u.id as other_user_id,
        (SELECT COUNT(*) FROM messages 
         WHERE ((sender_id = m.sender_id AND receiver_id = m.receiver_id) OR
                (sender_id = m.receiver_id AND receiver_id = m.sender_id)) AND
               is_read = 0 AND receiver_id = ?) as unread_count
      FROM messages m
      JOIN users u ON (
        CASE 
          WHEN m.sender_id = ? THEN m.receiver_id = u.id
          WHEN m.receiver_id = ? THEN m.sender_id = u.id
        END
      )
      WHERE m.id IN (
        SELECT MAX(id) FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY 
          CASE 
            WHEN sender_id = ? THEN receiver_id
            ELSE sender_id
          END
      )
      ORDER BY m.timestamp DESC
    `;
    
    db.all(
      query,
      [user_id, user_id, user_id, user_id, user_id, user_id],
      (err, conversations) => {
        if (err) {
          return reject(err);
        }
        
        resolve(conversations);
      }
    );
  });
}

/**
 * Delete messages between two users
 * 
 * @param {number} user1_id - First user ID
 * @param {number} user2_id - Second user ID
 * @returns {Promise<number>} - Number of messages deleted
 */
function deleteConversation(user1_id, user2_id) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = `
      DELETE FROM messages
      WHERE (sender_id = ? AND receiver_id = ?)
         OR (sender_id = ? AND receiver_id = ?)
    `;
    
    db.run(
      query,
      [user1_id, user2_id, user2_id, user1_id],
      function(err) {
        if (err) {
          return reject(err);
        }
        
        resolve(this.changes);
      }
    );
  });
}

module.exports = {
  sendMessage,
  getMessageById,
  getMessages,
  markMessagesAsRead,
  getUnreadMessageCount,
  getUserConversations,
  deleteConversation
}; 