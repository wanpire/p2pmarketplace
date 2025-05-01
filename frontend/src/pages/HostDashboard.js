import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HostelCard from '../components/HostelCard';
import Chat from '../components/Chat';
import { getHostelsByHost, getHostelBookings, updateBookingStatus } from '../services/api';

/**
 * HostDashboard page component - displays host's hostels and their bookings
 * Serves as a central hub for hosts to manage their listings and guest bookings
 */
const HostDashboard = () => {
  // State for hostels, bookings and UI
  const [hostels, setHostels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('hostels');
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [bookingStatus, setBookingStatus] = useState('all');

  // Get host ID from localStorage
  const getHostId = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.error('No user data in localStorage');
        return null;
      }
      
      const user = JSON.parse(userStr);
      if (!user || !user.id) {
        console.error('Invalid user data or missing ID:', user);
        return null;
      }
      
      console.log('Host ID retrieved:', user.id);
      return user.id;
    } catch (error) {
      console.error('Error getting host ID:', error);
      return null;
    }
  };

  // Fetch hostels on component mount
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        setLoading(true);
        const hostId = getHostId();
        
        // Check authentication
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          setError('Authentication required. Please log in again.');
          setLoading(false);
          return;
        }
        
        if (!hostId) {
          setError('User authentication required');
          setLoading(false);
          return;
        }
        
        console.log('Fetching hostels for host ID:', hostId);
        
        try {
          const data = await getHostelsByHost(hostId);
          console.log('Hostels data received:', { count: data?.length || 0 });
          setHostels(data || []);
          
          // If we have hostels, fetch bookings for the first one by default
          if (data && data.length > 0) {
            setSelectedHostel(data[0].id);
            const bookingsData = await getHostelBookings(data[0].id);
            console.log('Bookings data received:', { count: bookingsData?.length || 0 });
            setBookings(bookingsData || []);
          }
        } catch (err) {
          console.error('API call error:', err);
          throw err;
        }
      } catch (err) {
        console.error('Error fetching host data:', err);
        setError('Failed to load host data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHostels();
  }, []);

  // Fetch bookings when selected hostel changes
  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedHostel) return;
      
      try {
        setLoading(true);
        const data = await getHostelBookings(selectedHostel);
        setBookings(data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load booking data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [selectedHostel]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color based on booking status
  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter bookings based on selected status
  const filteredBookings = bookingStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === bookingStatus);

  // Handle booking status update
  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      // Update the local bookings state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus } 
            : booking
        )
      );
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Failed to update booking status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Host Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage your hostels and bookings</p>
        
        {/* Dashboard Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <nav className="flex border-b">
            <button
              onClick={() => setActiveSection('hostels')}
              className={`py-4 px-6 text-sm font-medium ${
                activeSection === 'hostels'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Hostels
            </button>
            <button
              onClick={() => setActiveSection('bookings')}
              className={`py-4 px-6 text-sm font-medium ${
                activeSection === 'bookings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveSection('messages')}
              className={`py-4 px-6 text-sm font-medium ${
                activeSection === 'messages'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Messages
            </button>
          </nav>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Hostels Section */}
            {activeSection === 'hostels' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">My Hostels</h2>
                  <Link
                    to="/hostels/add"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add New Hostel
                  </Link>
                </div>
                
                {hostels.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hostels found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You haven't added any hostels yet.
                    </p>
                    <div className="mt-6">
                      <Link
                        to="/hostels/add"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Add Your First Hostel
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hostels.map((hostel) => (
                      <div key={hostel.id} className="flex flex-col">
                        <HostelCard hostel={hostel} />
                        <div className="mt-3 flex space-x-2">
                          <Link
                            to={`/hostels/edit/${hostel.id}`}
                            className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-800 rounded text-sm text-center hover:bg-gray-300"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedHostel(hostel.id);
                              setActiveSection('bookings');
                            }}
                            className="flex-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded text-sm text-center hover:bg-blue-200"
                          >
                            View Bookings
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Bookings Section */}
            {activeSection === 'bookings' && (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <h2 className="text-xl font-bold text-gray-900">Bookings</h2>
                  <div className="flex flex-col md:flex-row gap-4">
                    {hostels.length > 0 && (
                      <select
                        value={selectedHostel || ''}
                        onChange={(e) => setSelectedHostel(e.target.value)}
                        className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {hostels.map((hostel) => (
                          <option key={hostel.id} value={hostel.id}>
                            {hostel.name}
                          </option>
                        ))}
                      </select>
                    )}
                    <select
                      value={bookingStatus}
                      onChange={(e) => setBookingStatus(e.target.value)}
                      className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                
                {hostels.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500">
                      You need to add a hostel before you can manage bookings.
                    </p>
                    <div className="mt-6">
                      <Link
                        to="/hostels/add"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Add Your First Hostel
                      </Link>
                    </div>
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      There are no bookings for this hostel{bookingStatus !== 'all' ? ` with status "${bookingStatus}"` : ''}.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Guest
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dates
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0 mr-3">
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                    {booking.user?.name?.charAt(0) || 'G'}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {booking.user?.name || 'Guest'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {booking.user?.email || 'No email provided'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {Math.ceil(
                                  (new Date(booking.check_out) - new Date(booking.check_in)) /
                                    (1000 * 60 * 60 * 24)
                                )}{' '}
                                nights
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                  booking.status
                                )}`}
                              >
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${booking.total_price || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                {booking.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                      className="text-green-600 hover:text-green-900"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      Decline
                                    </button>
                                  </>
                                )}
                                {booking.status === 'confirmed' && (
                                  <button
                                    onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    Mark as Completed
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    // This would ideally open a chat with this specific user
                                    setActiveSection('messages');
                                  }}
                                  className="text-blue-600 hover:text-blue-900 ml-3"
                                >
                                  Message Guest
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {/* Messages Section */}
            {activeSection === 'messages' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Messages</h2>
                <Chat isHost={true} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HostDashboard; 