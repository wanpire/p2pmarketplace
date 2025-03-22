import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createBooking } from '../services/api';

/**
 * BookingForm component for creating new hostel bookings
 * 
 * @param {Object} props
 * @param {number|string} props.hostelId - ID of the hostel to book
 * @param {number} props.price - Price per night of the hostel
 * @param {string} props.hostelName - Name of the hostel (for display purposes)
 */
const BookingForm = ({ hostelId, price, hostelName }) => {
  // Form state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Get current user from localStorage (hardcoded user_id as requested)
  const [userId, setUserId] = useState(1); // Hardcoded for now
  
  // Calculate minimum dates for check-in and check-out
  const today = new Date().toISOString().split('T')[0];
  const minCheckOut = checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0] : today;
  
  // Calculate total price when dates change
  useEffect(() => {
    if (checkIn && checkOut && price) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const nights = Math.round((end - start) / (1000 * 60 * 60 * 24));
      setTotalPrice(nights * price * guests);
    } else {
      setTotalPrice(0);
    }
  }, [checkIn, checkOut, guests, price]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setSuccess(false);
    setIsSubmitting(true);
    
    try {
      // Prepare booking data
      const bookingData = {
        hostel_id: hostelId,
        user_id: userId,
        check_in_date: checkIn,
        check_out_date: checkOut,
        guests: guests,
        total_price: totalPrice,
        status: 'pending' // Initial status
      };
      
      // Create booking
      const response = await createBooking(bookingData);
      
      // Show success message
      setSuccess(true);
      
      // Reset form
      setCheckIn('');
      setCheckOut('');
      setGuests(1);
      
      console.log('Booking created:', response);
      
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Book Your Stay</h2>
      
      {/* Success message */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">Booking created successfully! Check your bookings page for details.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Booking information */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-500">You're booking</h3>
        <p className="text-lg font-semibold text-gray-900">{hostelName}</p>
        <p className="text-sm text-gray-600">${price} per night</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Check-in date */}
        <div>
          <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">
            Check-in Date
          </label>
          <input
            type="date"
            id="checkIn"
            min={today}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            required
            disabled={isSubmitting || success}
          />
        </div>
        
        {/* Check-out date */}
        <div>
          <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">
            Check-out Date
          </label>
          <input
            type="date"
            id="checkOut"
            min={minCheckOut}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            required
            disabled={!checkIn || isSubmitting || success}
          />
        </div>
        
        {/* Number of guests */}
        <div>
          <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Guests
          </label>
          <select
            id="guests"
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value, 10))}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            disabled={isSubmitting || success}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Guest' : 'Guests'}
              </option>
            ))}
          </select>
        </div>
        
        {/* Total price */}
        {totalPrice > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="text-base font-medium text-gray-900">Total</span>
              <span className="text-base font-medium text-gray-900">${totalPrice}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {checkIn && checkOut ? (
                <>
                  {Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))} nights
                  {guests > 1 ? `, ${guests} guests` : ''}
                </>
              ) : 'Select dates to see total price'}
            </p>
          </div>
        )}
        
        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              (isSubmitting || success) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={!checkIn || !checkOut || isSubmitting || success}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : success ? (
              <div className="flex items-center justify-center">
                <svg className="h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Booked Successfully
              </div>
            ) : (
              'Book Now'
            )}
          </button>
        </div>
        
        {/* Disclaimer */}
        <p className="text-xs text-gray-500 mt-2">
          You won't be charged yet. Your booking will be reviewed by the host.
        </p>
      </form>
    </div>
  );
};

BookingForm.propTypes = {
  hostelId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  price: PropTypes.number.isRequired,
  hostelName: PropTypes.string.isRequired
};

export default BookingForm; 