/**
 * Booking Model
 * 
 * Handles all database operations related to bookings
 */

const { getDatabase } = require('./db');

/**
 * Create a new booking
 * 
 * @param {number} user_id - ID of the user making the booking
 * @param {number} hostel_id - ID of the hostel being booked
 * @param {string} check_in_date - Check-in date (YYYY-MM-DD format)
 * @param {string} check_out_date - Check-out date (YYYY-MM-DD format)
 * @param {number} total_price - Total price for the booking
 * @param {string} status - Booking status (pending, confirmed, cancelled, completed)
 * @returns {Promise<object>} - Created booking object
 */
function createBooking(user_id, hostel_id, check_in_date, check_out_date, total_price, status = 'pending') {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    // Validate required fields
    if (!user_id || !hostel_id || !check_in_date || !check_out_date || total_price === undefined) {
      return reject(new Error('Missing required fields'));
    }
    
    // Validate dates
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return reject(new Error('Invalid date format'));
    }
    
    if (checkIn >= checkOut) {
      return reject(new Error('Check-in date must be before check-out date'));
    }
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return reject(new Error('Invalid booking status'));
    }
    
    // Check for overlapping bookings
    const checkOverlapQuery = `
      SELECT COUNT(*) as count
      FROM bookings
      WHERE hostel_id = ?
      AND status != 'cancelled'
      AND (
        (check_in_date <= ? AND check_out_date > ?) OR
        (check_in_date < ? AND check_out_date >= ?) OR
        (check_in_date >= ? AND check_out_date <= ?)
      )
    `;
    
    db.get(checkOverlapQuery, [
      hostel_id,
      check_out_date, check_in_date,
      check_out_date, check_in_date,
      check_in_date, check_out_date
    ], (err, result) => {
      if (err) {
        return reject(err);
      }
      
      if (result.count > 0) {
        return reject(new Error('Dates overlap with existing booking'));
      }
      
      // Create the booking
      const query = `
        INSERT INTO bookings (
          user_id, hostel_id, check_in_date, check_out_date,
          total_price, status
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [
        user_id, hostel_id, check_in_date, check_out_date,
        total_price, status
      ], function(err) {
        if (err) {
          return reject(err);
        }
        
        // Get the newly created booking with related data
        getBookingById(this.lastID).then(resolve).catch(reject);
      });
    });
  });
}

/**
 * Get a booking by ID
 * 
 * @param {number} id - Booking ID
 * @returns {Promise<object|null>} - Booking object or null if not found
 */
function getBookingById(id) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT b.*, 
             u.username as user_name,
             h.name as hostel_name,
             h.location as hostel_location
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN hostels h ON b.hostel_id = h.id
      WHERE b.id = ?
    `;
    
    db.get(query, [id], (err, booking) => {
      if (err) {
        return reject(err);
      }
      
      resolve(booking);
    });
  });
}

/**
 * Get all bookings for a user
 * 
 * @param {number} user_id - User ID
 * @param {string} status - Optional status filter
 * @returns {Promise<Array>} - Array of booking objects
 */
function getBookingsByUser(user_id, status = null) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    let query = `
      SELECT b.*, 
             u.username as user_name,
             h.name as hostel_name,
             h.location as hostel_location
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN hostels h ON b.hostel_id = h.id
      WHERE b.user_id = ?
    `;
    
    const params = [user_id];
    
    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY b.check_in_date DESC';
    
    db.all(query, params, (err, bookings) => {
      if (err) {
        return reject(err);
      }
      
      resolve(bookings);
    });
  });
}

/**
 * Get all bookings for a hostel
 * 
 * @param {number} hostel_id - Hostel ID
 * @param {string} status - Optional status filter
 * @returns {Promise<Array>} - Array of booking objects
 */
function getBookingsByHostel(hostel_id, status = null) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    let query = `
      SELECT b.*, 
             u.username as user_name,
             h.name as hostel_name,
             h.location as hostel_location
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN hostels h ON b.hostel_id = h.id
      WHERE b.hostel_id = ?
    `;
    
    const params = [hostel_id];
    
    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY b.check_in_date DESC';
    
    db.all(query, params, (err, bookings) => {
      if (err) {
        return reject(err);
      }
      
      resolve(bookings);
    });
  });
}

/**
 * Update booking status
 * 
 * @param {number} id - Booking ID
 * @param {string} status - New status (pending, confirmed, cancelled, completed)
 * @returns {Promise<object>} - Updated booking object
 */
function updateBookingStatus(id, status) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return reject(new Error('Invalid booking status'));
    }
    
    const query = `
      UPDATE bookings
      SET status = ?
      WHERE id = ?
    `;
    
    db.run(query, [status, id], function(err) {
      if (err) {
        return reject(err);
      }
      
      if (this.changes === 0) {
        return reject(new Error('Booking not found'));
      }
      
      // Return the updated booking
      getBookingById(id).then(resolve).catch(reject);
    });
  });
}

/**
 * Get upcoming bookings for a user
 * 
 * @param {number} user_id - User ID
 * @returns {Promise<Array>} - Array of upcoming booking objects
 */
function getUpcomingBookings(user_id) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT b.*, 
             u.username as user_name,
             h.name as hostel_name,
             h.location as hostel_location
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN hostels h ON b.hostel_id = h.id
      WHERE b.user_id = ?
      AND b.check_in_date >= date('now')
      AND b.status = 'confirmed'
      ORDER BY b.check_in_date ASC
    `;
    
    db.all(query, [user_id], (err, bookings) => {
      if (err) {
        return reject(err);
      }
      
      resolve(bookings);
    });
  });
}

/**
 * Get past bookings for a user
 * 
 * @param {number} user_id - User ID
 * @returns {Promise<Array>} - Array of past booking objects
 */
function getPastBookings(user_id) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT b.*, 
             u.username as user_name,
             h.name as hostel_name,
             h.location as hostel_location
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN hostels h ON b.hostel_id = h.id
      WHERE b.user_id = ?
      AND b.check_out_date < date('now')
      ORDER BY b.check_out_date DESC
    `;
    
    db.all(query, [user_id], (err, bookings) => {
      if (err) {
        return reject(err);
      }
      
      resolve(bookings);
    });
  });
}

module.exports = {
  createBooking,
  getBookingById,
  getBookingsByUser,
  getBookingsByHostel,
  updateBookingStatus,
  getUpcomingBookings,
  getPastBookings
}; 