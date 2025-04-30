/**
 * Booking Routes
 * 
 * Express routes for booking management including creating and retrieving bookings
 */

// Required dependencies
const express = require('express');
const router = express.Router();
const bookingModel = require('../models/booking');

// Do not import './routes/messages' here - this causes MODULE_NOT_FOUND errors

/**
 * @route   POST /api/bookings/add
 * @desc    Create a new booking
 * @access  Private (should have auth middleware)
 */
router.post('/add', async (req, res) => {
  try {
    const { user_id, hostel_id, check_in_date, check_out_date, total_price, status } = req.body;
    
    // Validate required fields
    if (!user_id || !hostel_id || !check_in_date || !check_out_date || total_price === undefined) {
      return res.status(400).json({ error: 'User ID, hostel ID, check-in date, check-out date, and total price are required' });
    }
    
    // Validate dates
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD format' });
    }
    
    if (checkIn >= checkOut) {
      return res.status(400).json({ error: 'Check-in date must be before check-out date' });
    }
    
    // Validate status if provided
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be pending, confirmed, cancelled, or completed' });
    }
    
    // Create booking
    const booking = await bookingModel.createBooking(
      user_id,
      hostel_id,
      check_in_date,
      check_out_date,
      total_price,
      status || 'pending'
    );
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error.message);
    
    // Handle specific errors
    if (error.message.includes('overlap')) {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

/**
 * @route   GET /api/bookings/user
 * @desc    Get bookings by user ID
 * @access  Private (should have auth middleware)
 */
router.get('/user', async (req, res) => {
  try {
    const { user_id, status } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Validate status if provided
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status filter' });
    }
    
    // Get bookings by user
    const bookings = await bookingModel.getBookingsByUser(user_id, status);
    
    res.status(200).json({
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Get user bookings error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve bookings' });
  }
});

/**
 * @route   GET /api/bookings/hostel
 * @desc    Get bookings by hostel ID
 * @access  Private (should have auth middleware, hostel owner only)
 */
router.get('/hostel', async (req, res) => {
  try {
    const { hostel_id, status } = req.query;
    
    if (!hostel_id) {
      return res.status(400).json({ error: 'Hostel ID is required' });
    }
    
    // Validate status if provided
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status filter' });
    }
    
    // Get bookings by hostel
    const bookings = await bookingModel.getBookingsByHostel(hostel_id, status);
    
    res.status(200).json({
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Get hostel bookings error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve bookings' });
  }
});

/**
 * @route   GET /api/bookings/upcoming
 * @desc    Get upcoming bookings for a user
 * @access  Private (should have auth middleware)
 */
router.get('/upcoming', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get upcoming bookings
    const bookings = await bookingModel.getUpcomingBookings(user_id);
    
    res.status(200).json({
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Get upcoming bookings error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve bookings' });
  }
});

/**
 * @route   GET /api/bookings/past
 * @desc    Get past bookings for a user
 * @access  Private (should have auth middleware)
 */
router.get('/past', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get past bookings
    const bookings = await bookingModel.getPastBookings(user_id);
    
    res.status(200).json({
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Get past bookings error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve bookings' });
  }
});

/**
 * @route   PUT /api/bookings/:id/status
 * @desc    Update a booking's status
 * @access  Private (should have auth middleware)
 */
router.put('/:id/status', async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }
    
    // Update booking status
    const updatedBooking = await bookingModel.updateBookingStatus(bookingId, status);
    
    res.status(200).json({
      message: `Booking status updated to ${status}`,
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Update booking status error:', error.message);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

/**
 * @route   GET /api/bookings/:id
 * @desc    Get a booking by ID
 * @access  Private (should have auth middleware)
 */
router.get('/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    const booking = await bookingModel.getBookingById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.status(200).json({ booking });
  } catch (error) {
    console.error('Get booking error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve booking' });
  }
});

module.exports = router; 