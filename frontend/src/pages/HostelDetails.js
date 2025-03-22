import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BookingForm from '../components/BookingForm';
import { getHostelById } from '../services/api';

/**
 * HostelDetails page component - displays detailed information about a specific hostel
 * and provides booking functionality
 */
const HostelDetails = () => {
  // Get hostel ID from URL parameters
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State for hostel data and loading status
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Fetch hostel data on component mount
  useEffect(() => {
    const fetchHostelDetails = async () => {
      try {
        setLoading(true);
        const data = await getHostelById(id);
        setHostel(data);
      } catch (err) {
        console.error('Error fetching hostel details:', err);
        setError('Failed to load hostel details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHostelDetails();
  }, [id]);
  
  // Placeholder images if hostel doesn't have any
  const placeholderImages = [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1626265774643-f1943311a86b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  ];
  
  // Get hostel images or use placeholders
  const images = hostel?.images?.length > 0 
    ? hostel.images 
    : hostel?.image_url 
      ? [hostel.image_url, ...placeholderImages.slice(0, 2)] 
      : placeholderImages;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  if (error || !hostel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">{error || 'Hostel not found'}</h3>
            <p className="mt-2 text-gray-600">
              We couldn't find the hostel you're looking for. It may have been removed or the ID is incorrect.
            </p>
            <div className="mt-6">
              <button 
                onClick={() => navigate('/search')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Search
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex text-sm">
            <li className="text-gray-500 hover:text-gray-700">
              <a href="/">Home</a>
            </li>
            <li className="mx-2 text-gray-500">/</li>
            <li className="text-gray-500 hover:text-gray-700">
              <a href="/search">Search</a>
            </li>
            <li className="mx-2 text-gray-500">/</li>
            <li className="text-blue-600 font-medium truncate">{hostel.name}</li>
          </ol>
        </nav>
        
        {/* Hostel title and location */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{hostel.name}</h1>
          <div className="flex items-center text-gray-600">
            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{hostel.location}</span>
            
            {hostel.rating && (
              <div className="flex items-center ml-4">
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(hostel.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-sm text-gray-600">{hostel.rating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-gray-500 ml-2">({hostel.review_count || 0} reviews)</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Hostel images gallery */}
        <div className="mb-8">
          <div className="relative h-96 rounded-lg overflow-hidden mb-2">
            <img 
              src={images[activeImageIndex]} 
              alt={`${hostel.name} - View ${activeImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Image navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full shadow hover:bg-opacity-100 transition-all"
                >
                  <svg className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full shadow hover:bg-opacity-100 transition-all"
                >
                  <svg className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnail navigation */}
          {images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                    index === activeImageIndex ? 'border-blue-600' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hostel details (left side) */}
          <div className="lg:col-span-2">
            {/* Price and highlights */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-2xl font-bold text-gray-900">${hostel.price_per_night}</span>
                  <span className="text-gray-600"> / night</span>
                </div>
                
                {hostel.availability === 'available' && (
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                    Available
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Instant Booking</h3>
                    <p className="text-sm text-gray-500">Confirm your stay instantly</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Verified Host</h3>
                    <p className="text-sm text-gray-500">Identity verified by our team</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Hostel</h2>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700">
                  {hostel.description || 
                   'This cozy hostel offers everything you need for a comfortable stay. Located in a prime location, you\'ll have easy access to the city\'s top attractions, restaurants, and nightlife.'}
                </p>
              </div>
            </div>
            
            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hostel.amenities && hostel.amenities.length > 0 ? (
                  hostel.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-3">Amenities information not available</p>
                )}
              </div>
            </div>
            
            {/* House rules */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">House Rules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">Check-in: After 2:00 PM</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">Check-out: Before 11:00 AM</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span className="text-gray-700">No smoking</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span className="text-gray-700">No parties or events</span>
                </div>
              </div>
            </div>
            
            {/* Location section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
              <div className="h-64 bg-gray-200 rounded-lg mb-4">
                {/* Placeholder for map integration */}
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <svg className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="mt-2 text-gray-600 text-sm">
                      {hostel.location}
                    </p>
                    <p className="text-blue-600 text-sm mt-2">
                      Google Maps integration will be available soon
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-gray-700">
                Located in a vibrant area with easy access to public transportation, restaurants, and attractions.
              </p>
            </div>
          </div>
          
          {/* Booking form (right side) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <BookingForm 
                hostelId={hostel.id} 
                price={hostel.price_per_night} 
                hostelName={hostel.name}
              />
              
              {/* Host information */}
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">About the Host</h3>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-300 mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-800">{hostel.host_name || 'Host Name'}</p>
                    <p className="text-sm text-gray-500">Host since {hostel.host_since || '2021'}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  {hostel.host_description || 'A friendly host committed to providing guests with a comfortable and memorable stay.'}
                </p>
                <button className="w-full border border-blue-600 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 transition">
                  Contact Host
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HostelDetails; 