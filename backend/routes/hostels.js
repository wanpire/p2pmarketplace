/**
 * Hostel Routes
 * 
 * Express routes for hostel management including creation, listing, searching, and updating
 */

const express = require('express');
const router = express.Router();
const hostelModel = require('../models/hostel');

/**
 * @route   POST /api/hostels/add
 * @desc    Create a new hostel
 * @access  Private (should have auth middleware, host only)
 */
router.post('/add', async (req, res) => {
  try {
    const { name, location, price, host_id, images, description, amenities } = req.body;
    
    // Validate required fields
    if (!name || !location || !price || !host_id) {
      return res.status(400).json({ error: 'Name, location, price, and host_id are required' });
    }
    
    // Validate price is a number and positive
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
    
    // Create hostel
    const hostel = await hostelModel.addHostel(
      name, 
      location, 
      numPrice, 
      host_id, 
      images || [], 
      description, 
      amenities
    );
    
    res.status(201).json({
      message: 'Hostel created successfully',
      hostel
    });
  } catch (error) {
    console.error('Create hostel error:', error.message);
    res.status(500).json({ error: 'Failed to create hostel' });
  }
});

/**
 * @route   GET /api/hostels
 * @desc    Get all hostels with pagination
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Pagination parameters
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    // Get hostels with pagination
    const hostels = await hostelModel.getHostels(limit, offset);
    
    res.status(200).json({ hostels });
  } catch (error) {
    console.error('Get hostels error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve hostels' });
  }
});

/**
 * @route   GET /api/hostels/search
 * @desc    Search hostels with filters
 * @access  Public
 */
router.get('/search', async (req, res) => {
  try {
    // Extract search parameters
    const { location, maxPrice, amenities } = req.query;
    
    // Pagination parameters
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    // Build filters object
    const filters = {};
    if (location) filters.location = location;
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (amenities) filters.amenities = amenities;
    
    // Search hostels
    const hostels = await hostelModel.searchHostels(filters, limit, offset);
    
    res.status(200).json({ 
      count: hostels.length,
      hostels 
    });
  } catch (error) {
    console.error('Search hostels error:', error.message);
    res.status(500).json({ error: 'Failed to search hostels' });
  }
});

/**
 * @route   GET /api/hostels/host/:hostId
 * @desc    Get all hostels by a specific host
 * @access  Public
 */
router.get('/host/:hostId', async (req, res) => {
  try {
    const hostId = req.params.hostId;
    
    const hostels = await hostelModel.getHostelsByHostId(hostId);
    
    res.status(200).json({ 
      count: hostels.length,
      hostels 
    });
  } catch (error) {
    console.error('Get host hostels error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve host hostels' });
  }
});

/**
 * @route   GET /api/hostels/:id
 * @desc    Get a hostel by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const hostelId = req.params.id;
    
    const hostel = await hostelModel.getHostelById(hostelId);
    
    if (!hostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    
    res.status(200).json({ hostel });
  } catch (error) {
    console.error('Get hostel error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve hostel' });
  }
});

/**
 * @route   PUT /api/hostels/:id
 * @desc    Update a hostel
 * @access  Private (should have auth middleware, host only)
 */
router.put('/:id', async (req, res) => {
  try {
    const hostelId = req.params.id;
    
    // Get the hostel first to verify it exists
    const existingHostel = await hostelModel.getHostelById(hostelId);
    
    if (!existingHostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    
    // In a real app with auth, verify the current user is the hostel's host
    // For now, we're skipping this check for simplicity
    
    // Extract fields to update
    const { name, location, price, images, description, amenities } = req.body;
    
    // Build updates object
    const updates = {};
    if (name) updates.name = name;
    if (location) updates.location = location;
    if (price !== undefined) {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }
      updates.price = numPrice;
    }
    if (images) updates.images = images;
    if (description !== undefined) updates.description = description;
    if (amenities) updates.amenities = amenities;
    
    // Update the hostel
    const updatedHostel = await hostelModel.updateHostel(hostelId, updates);
    
    res.status(200).json({
      message: 'Hostel updated successfully',
      hostel: updatedHostel
    });
  } catch (error) {
    console.error('Update hostel error:', error.message);
    res.status(500).json({ error: 'Failed to update hostel' });
  }
});

/**
 * @route   DELETE /api/hostels/:id
 * @desc    Delete a hostel
 * @access  Private (should have auth middleware, host only)
 */
router.delete('/:id', async (req, res) => {
  try {
    const hostelId = req.params.id;
    
    // Get the hostel first to verify it exists
    const existingHostel = await hostelModel.getHostelById(hostelId);
    
    if (!existingHostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    
    // In a real app with auth, verify the current user is the hostel's host
    // For now, we're skipping this check for simplicity
    
    // Delete the hostel
    const deleted = await hostelModel.deleteHostel(hostelId);
    
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete hostel' });
    }
    
    res.status(200).json({
      message: 'Hostel deleted successfully'
    });
  } catch (error) {
    console.error('Delete hostel error:', error.message);
    res.status(500).json({ error: 'Failed to delete hostel' });
  }
});

module.exports = router;