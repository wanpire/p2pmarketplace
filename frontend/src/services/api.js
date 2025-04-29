/**
 * API Service
 * 
 * This module provides an interface to communicate with the backend API
 * using axios HTTP client. It handles authentication, requests, and responses.
 */

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if needed
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// AUTH SERVICES

/**
 * Register a new user
 * @param {Object} data - User registration data
 * @returns {Promise<Object>} - Response from the API
 */
export const registerUser = async (data) => {
  const response = await api.post('/users/register', data);
  return response.data;
};

/**
 * Login user
 * @param {Object} data - User login credentials
 * @returns {Promise<Object>} - Response from the API
 */
export const loginUser = async (data) => {
  const response = await api.post('/users/login', data);
  // Store token if it's returned
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

/**
 * Logout user (client-side)
 */
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Get current user profile
 * @returns {Promise<Object>} - User profile data
 */
export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

/**
 * Update user profile
 * @param {Object} data - Updated profile data
 * @returns {Promise<Object>} - Updated user data
 */
export const updateProfile = async (data) => {
  const response = await api.put('/users/profile', data);
  return response.data;
};

// HOSTEL SERVICES

/**
 * Add a new hostel
 * @param {Object} data - Hostel data
 * @returns {Promise<Object>} - Created hostel data
 */
export const addHostel = async (data) => {
  const response = await api.post('/hostels/add', data);
  return response.data;
};

/**
 * Get all hostels with pagination
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} - Paginated list of hostels
 */
export const getHostels = async (page = 1, limit = 10) => {
  const response = await api.get('/hostels', { params: { page, limit } });
  return response.data;
};

/**
 * Search hostels with filters
 * @param {Object} params - Search parameters (location, maxPrice, amenities)
 * @returns {Promise<Object>} - Filtered list of hostels
 */
export const searchHostels = async (params) => {
  const response = await api.get('/hostels/search', { params });
  return response.data;
};

/**
 * Get a specific hostel by ID
 * @param {number} id - Hostel ID
 * @returns {Promise<Object>} - Hostel details
 */
export const getHostel = async (id) => {
  const response = await api.get(`/hostels/${id}`);
  return response.data;
};

/**
 * Get all hostels for a specific host
 * @param {number} hostId - Host user ID
 * @returns {Promise<Object>} - List of host's hostels
 */
export const getHostelsByHost = async (hostId) => {
  const response = await api.get(`/hostels/host/${hostId}`);
  return response.data;
};

/**
 * Update a hostel
 * @param {number} id - Hostel ID
 * @param {Object} data - Updated hostel data
 * @returns {Promise<Object>} - Updated hostel
 */
export const updateHostel = async (id, data) => {
  const response = await api.put(`/hostels/${id}`, data);
  return response.data;
};

/**
 * Delete a hostel
 * @param {number} id - Hostel ID
 * @returns {Promise<Object>} - Deletion confirmation
 */
export const deleteHostel = async (id) => {
  const response = await api.delete(`/hostels/${id}`);
  return response.data;
};

// BOOKING SERVICES

/**
 * Create a new booking
 * @param {Object} data - Booking data
 * @returns {Promise<Object>} - Created booking data
 */
export const createBooking = async (data) => {
  const response = await api.post('/bookings/add', data);
  return response.data;
};

/**
 * Get all bookings for the current user
 * @param {string} status - Optional status filter
 * @returns {Promise<Object>} - User's bookings
 */
export const getUserBookings = async (status = null) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) throw new Error('User not logged in');
  
  const params = { user_id: user.id };
  if (status) params.status = status;
  
  const response = await api.get('/bookings/user', { params });
  return response.data;
};

/**
 * Get all bookings for a specific hostel
 * @param {number} hostelId - Hostel ID
 * @param {string} status - Optional status filter
 * @returns {Promise<Object>} - Hostel's bookings
 */
export const getHostelBookings = async (hostelId, status = null) => {
  const params = { hostel_id: hostelId };
  if (status) params.status = status;
  
  const response = await api.get('/bookings/hostel', { params });
  return response.data;
};

/**
 * Get upcoming bookings for the current user
 * @returns {Promise<Object>} - Upcoming bookings
 */
export const getUpcomingBookings = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) throw new Error('User not logged in');
  
  const response = await api.get('/bookings/upcoming', { params: { user_id: user.id } });
  return response.data;
};

/**
 * Get past bookings for the current user
 * @returns {Promise<Object>} - Past bookings
 */
export const getPastBookings = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) throw new Error('User not logged in');
  
  const response = await api.get('/bookings/past', { params: { user_id: user.id } });
  return response.data;
};

/**
 * Update booking status
 * @param {number} id - Booking ID
 * @param {string} status - New status
 * @returns {Promise<Object>} - Updated booking
 */
export const updateBookingStatus = async (id, status) => {
  const response = await api.put(`/bookings/${id}/status`, { status });
  return response.data;
};

// MESSAGE SERVICES

/**
 * Send a message to another user
 * @param {number} receiverId - Receiver user ID
 * @param {string} content - Message content
 * @returns {Promise<Object>} - Sent message data
 */
export const sendMessage = async (receiverId, content) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) throw new Error('User not logged in');
  
  const response = await api.post('/messages/send', {
    sender_id: user.id,
    receiver_id: receiverId,
    content
  });
  return response.data;
};

/**
 * Get messages between current user and another user
 * @param {number} otherUserId - Other user ID
 * @returns {Promise<Object>} - Conversation messages
 */
export const getMessages = async (otherUserId) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) throw new Error('User not logged in');
  
  const response = await api.get('/messages', {
    params: {
      sender_id: user.id,
      receiver_id: otherUserId
    }
  });
  return response.data;
};

/**
 * Get all conversations for the current user
 * @returns {Promise<Object>} - User's conversations
 */
export const getConversations = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) throw new Error('User not logged in');
  
  const response = await api.get('/messages/conversations', {
    params: { user_id: user.id }
  });
  return response.data;
};

/**
 * Mark messages from a sender as read
 * @param {number} senderId - Sender user ID
 * @returns {Promise<Object>} - Read confirmation
 */
export const markMessagesAsRead = async (senderId) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) throw new Error('User not logged in');
  
  const response = await api.put('/messages/read', {
    receiver_id: user.id,
    sender_id: senderId
  });
  return response.data;
};

export default {
  // Auth
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  
  // Hostels
  addHostel,
  getHostels,
  searchHostels,
  getHostel,
  getHostelsByHost,
  updateHostel,
  deleteHostel,
  
  // Bookings
  createBooking,
  getUserBookings,
  getHostelBookings,
  getUpcomingBookings,
  getPastBookings,
  updateBookingStatus,
  
  // Messages
  sendMessage,
  getMessages,
  getConversations,
  markMessagesAsRead
}; 