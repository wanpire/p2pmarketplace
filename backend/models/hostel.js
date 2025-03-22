/**
 * Hostel Model
 * 
 * Handles all database operations related to hostels
 */

const { getDatabase } = require('./db');

/**
 * Add a new hostel to the database
 * 
 * @param {string} name - Hostel name
 * @param {string} location - Hostel location
 * @param {number} price - Price per night
 * @param {number} host_id - ID of the host user
 * @param {string} images - JSON string of image URLs
 * @param {string} description - Hostel description (optional)
 * @param {string} amenities - JSON string of amenities (optional)
 * @returns {Promise<object>} - Created hostel object
 */
function addHostel(name, location, price, host_id, images, description = null, amenities = null) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    // Validate required fields
    if (!name || !location || price === undefined || !host_id) {
      return reject(new Error('Missing required fields'));
    }
    
    // Validate price is a number
    if (isNaN(parseFloat(price))) {
      return reject(new Error('Price must be a number'));
    }
    
    const query = `
      INSERT INTO hostels (name, location, price, host_id, images, description, amenities)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Convert image array to JSON string if it's not already a string
    const imagesValue = typeof images === 'string' ? images : JSON.stringify(images || []);
    
    // Convert amenities array to JSON string if it's not already a string
    const amenitiesValue = typeof amenities === 'string' ? amenities : JSON.stringify(amenities || []);
    
    db.run(
      query, 
      [name, location, price, host_id, imagesValue, description, amenitiesValue], 
      function(err) {
        if (err) {
          return reject(err);
        }
        
        // Get the newly created hostel
        getHostelById(this.lastID).then(resolve).catch(reject);
      }
    );
  });
}

/**
 * Get all hostels with optional pagination
 * 
 * @param {number} limit - Maximum number of hostels to return (default: 50)
 * @param {number} offset - Number of hostels to skip (default: 0)
 * @returns {Promise<Array>} - Array of hostel objects
 */
function getHostels(limit = 50, offset = 0) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT h.*, u.username as host_name
      FROM hostels h
      JOIN users u ON h.host_id = u.id
      ORDER BY h.id DESC
      LIMIT ? OFFSET ?
    `;
    
    db.all(query, [limit, offset], (err, rows) => {
      if (err) {
        return reject(err);
      }
      
      // Parse JSON strings to objects
      const hostels = rows.map(hostel => ({
        ...hostel,
        images: parseJsonField(hostel.images),
        amenities: parseJsonField(hostel.amenities)
      }));
      
      resolve(hostels);
    });
  });
}

/**
 * Get a hostel by ID
 * 
 * @param {number} id - Hostel ID
 * @returns {Promise<object|null>} - Hostel object or null if not found
 */
function getHostelById(id) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT h.*, u.username as host_name
      FROM hostels h
      JOIN users u ON h.host_id = u.id
      WHERE h.id = ?
    `;
    
    db.get(query, [id], (err, hostel) => {
      if (err) {
        return reject(err);
      }
      
      if (!hostel) {
        return resolve(null);
      }
      
      // Parse JSON strings to objects
      hostel.images = parseJsonField(hostel.images);
      hostel.amenities = parseJsonField(hostel.amenities);
      
      resolve(hostel);
    });
  });
}

/**
 * Get hostels by host ID
 * 
 * @param {number} hostId - Host user ID
 * @returns {Promise<Array>} - Array of hostel objects
 */
function getHostelsByHostId(hostId) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT h.*, u.username as host_name
      FROM hostels h
      JOIN users u ON h.host_id = u.id
      WHERE h.host_id = ?
      ORDER BY h.id DESC
    `;
    
    db.all(query, [hostId], (err, rows) => {
      if (err) {
        return reject(err);
      }
      
      // Parse JSON strings to objects
      const hostels = rows.map(hostel => ({
        ...hostel,
        images: parseJsonField(hostel.images),
        amenities: parseJsonField(hostel.amenities)
      }));
      
      resolve(hostels);
    });
  });
}

/**
 * Search hostels with filters
 * 
 * @param {object} filters - Filter criteria
 * @param {string} filters.location - Location filter (optional)
 * @param {number} filters.maxPrice - Maximum price filter (optional)
 * @param {string} filters.amenities - Comma-separated list of required amenities (optional)
 * @param {number} limit - Maximum number of hostels to return (default: 50)
 * @param {number} offset - Number of hostels to skip (default: 0)
 * @returns {Promise<Array>} - Array of filtered hostel objects
 */
function searchHostels(filters = {}, limit = 50, offset = 0) {
  const db = getDatabase();
  const { location, maxPrice, amenities } = filters;
  
  // Build query conditions
  const conditions = [];
  const params = [];
  
  if (location) {
    conditions.push("h.location LIKE ?");
    params.push(`%${location}%`);
  }
  
  if (maxPrice !== undefined && !isNaN(parseFloat(maxPrice))) {
    conditions.push("h.price <= ?");
    params.push(parseFloat(maxPrice));
  }
  
  // Base query
  let query = `
    SELECT h.*, u.username as host_name
    FROM hostels h
    JOIN users u ON h.host_id = u.id
  `;
  
  // Add WHERE clause if there are conditions
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }
  
  // Add ORDER and LIMIT
  query += `
    ORDER BY h.id DESC
    LIMIT ? OFFSET ?
  `;
  
  // Add limit and offset to params
  params.push(limit, offset);
  
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        return reject(err);
      }
      
      // Parse JSON strings to objects and filter by amenities if needed
      let hostels = rows.map(hostel => ({
        ...hostel,
        images: parseJsonField(hostel.images),
        amenities: parseJsonField(hostel.amenities)
      }));
      
      // Filter by amenities if specified
      if (amenities) {
        const requiredAmenities = amenities.split(',').map(a => a.trim());
        
        hostels = hostels.filter(hostel => {
          // If hostel has no amenities, it doesn't match
          if (!hostel.amenities || !Array.isArray(hostel.amenities)) {
            return false;
          }
          
          // Check if hostel has all required amenities
          return requiredAmenities.every(required => 
            hostel.amenities.some(a => a.toLowerCase() === required.toLowerCase())
          );
        });
      }
      
      resolve(hostels);
    });
  });
}

/**
 * Update a hostel's details
 * 
 * @param {number} id - Hostel ID to update
 * @param {object} updates - Object containing fields to update
 * @returns {Promise<object>} - Updated hostel object
 */
function updateHostel(id, updates) {
  const db = getDatabase();
  const allowedUpdates = ['name', 'location', 'price', 'images', 'description', 'amenities'];
  const updateFields = [];
  const updateValues = [];
  
  // Process updates
  for (const [key, value] of Object.entries(updates)) {
    if (allowedUpdates.includes(key) && value !== undefined) {
      // Handle JSON fields (images and amenities)
      if ((key === 'images' || key === 'amenities') && typeof value !== 'string') {
        updateFields.push(`${key} = ?`);
        updateValues.push(JSON.stringify(value));
      } else {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }
  }
  
  if (updateFields.length === 0) {
    return Promise.reject(new Error('No valid update fields provided'));
  }
  
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE hostels
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;
    
    updateValues.push(id);
    
    db.run(query, updateValues, function(err) {
      if (err) {
        return reject(err);
      }
      
      if (this.changes === 0) {
        return reject(new Error('Hostel not found'));
      }
      
      // Return the updated hostel
      getHostelById(id).then(resolve).catch(reject);
    });
  });
}

/**
 * Delete a hostel by ID
 * 
 * @param {number} id - Hostel ID to delete
 * @returns {Promise<boolean>} - True if deleted, false if not found
 */
function deleteHostel(id) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM hostels WHERE id = ?';
    
    db.run(query, [id], function(err) {
      if (err) {
        return reject(err);
      }
      
      resolve(this.changes > 0);
    });
  });
}

/**
 * Helper function to safely parse JSON fields
 * 
 * @param {string} jsonString - JSON string to parse
 * @returns {Array|Object|null} - Parsed JSON or empty array if invalid
 */
function parseJsonField(jsonString) {
  if (!jsonString) return [];
  
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return [];
  }
}

module.exports = {
  addHostel,
  getHostels,
  getHostelById,
  getHostelsByHostId,
  searchHostels,
  updateHostel,
  deleteHostel
}; 