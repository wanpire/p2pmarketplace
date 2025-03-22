import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import { getHostels } from '../services/api';

/**
 * Search page component - displays search results and filter options
 */
const Search = () => {
  // Get any search results passed via navigation
  const location = useLocation();
  const initialResults = location.state?.results;
  const initialSearchParams = location.state?.searchParams;
  
  // State for search results and loading status
  const [hostels, setHostels] = useState(initialResults?.hostels || []);
  const [loading, setLoading] = useState(!initialResults);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState(initialSearchParams || {});
  
  // Fetch initial results if none provided via navigation
  useEffect(() => {
    const fetchInitialHostels = async () => {
      if (initialResults) {
        return; // Skip if we already have results
      }
      
      try {
        setLoading(true);
        const data = await getHostels();
        setHostels(data.hostels || []);
      } catch (err) {
        console.error('Error fetching hostels:', err);
        setError('Failed to load hostels. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialHostels();
  }, [initialResults]);
  
  // Handle search results callback from SearchBar
  const handleSearchResults = (results) => {
    setHostels(results.hostels || []);
    setSearchParams(results.searchParams || {});
    
    // Scroll to results
    const resultsElement = document.getElementById('results');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Render hostel card
  const HostelCard = ({ hostel }) => {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Hostel image */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={hostel.image_url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'} 
            alt={hostel.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 right-0 bg-blue-600 text-white px-2 py-1 m-2 text-sm font-semibold rounded">
            ${hostel.price_per_night}/night
          </div>
        </div>
        
        {/* Hostel details */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800">{hostel.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{hostel.location}</p>
          
          {/* Tags/amenities */}
          <div className="flex flex-wrap gap-1 mb-3">
            {hostel.amenities && hostel.amenities.slice(0, 3).map((amenity, index) => (
              <span key={index} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                {amenity}
              </span>
            ))}
          </div>
          
          {/* Rating */}
          {hostel.rating && (
            <div className="flex items-center mb-3">
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
          
          {/* Short description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {hostel.description || 'A comfortable hostel in a great location with friendly staff and modern amenities.'}
          </p>
          
          {/* View details button */}
          <a 
            href={`/hostels/${hostel.id}`} 
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300"
          >
            View Details
          </a>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <Navbar />
      
      {/* Search section */}
      <div className="bg-blue-600 pt-8 pb-10 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-white mb-4">Find Your Perfect Hostel</h1>
          <SearchBar 
            onSearchResults={handleSearchResults} 
            isLoading={loading} 
            setIsLoading={setLoading}
          />
        </div>
      </div>
      
      {/* Results section */}
      <div id="results" className="container mx-auto px-4 py-8 flex-grow">
        {/* Search summary */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {loading ? (
              'Searching for hostels...'
            ) : hostels.length > 0 ? (
              <>
                {hostels.length} {hostels.length === 1 ? 'hostel' : 'hostels'} found
                {searchParams.location ? ` in ${searchParams.location}` : ''}
                {searchParams.maxPrice ? ` under $${searchParams.maxPrice}/night` : ''}
              </>
            ) : (
              'No hostels found matching your criteria'
            )}
          </h2>
        </div>
        
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
        
        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : hostels.length === 0 ? (
          // No results
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No hostels found</h3>
            <p className="mt-2 text-gray-600">
              Try adjusting your search criteria or browse all available hostels.
            </p>
            <div className="mt-6">
              <button 
                onClick={async () => {
                  setLoading(true);
                  try {
                    const data = await getHostels();
                    setHostels(data.hostels || []);
                    setSearchParams({});
                  } catch (err) {
                    setError('Failed to load hostels.');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Show All Hostels
              </button>
            </div>
          </div>
        ) : (
          // Results grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostels.map((hostel) => (
              <HostelCard key={hostel.id} hostel={hostel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search; 