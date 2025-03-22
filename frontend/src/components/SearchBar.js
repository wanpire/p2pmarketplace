import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { searchHostels } from '../services/api';

/**
 * SearchBar component for filtering hostels by location and price
 * 
 * @param {Object} props
 * @param {Function} props.onSearchResults - Callback function to pass search results to parent
 * @param {boolean} props.isLoading - Optional loading state controlled by parent
 * @param {Function} props.setIsLoading - Optional function to update loading state in parent
 */
const SearchBar = ({ onSearchResults, isLoading, setIsLoading }) => {
  // Local state for form inputs
  const [location, setLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [error, setError] = useState('');
  
  // Local loading state if not provided by parent
  const [localLoading, setLocalLoading] = useState(false);
  
  // Determine which loading state to use
  const loading = isLoading !== undefined ? isLoading : localLoading;
  const setLoading = setIsLoading || setLocalLoading;
  
  // Available price ranges for dropdown
  const priceRanges = [
    { label: 'Any Price', value: '' },
    { label: 'Under $25', value: '25' },
    { label: 'Under $50', value: '50' },
    { label: 'Under $75', value: '75' },
    { label: 'Under $100', value: '100' },
    { label: 'Under $150', value: '150' },
    { label: 'Under $200', value: '200' },
  ];
  
  // Handle location input change
  const handleLocationChange = (e) => {
    setLocation(e.target.value);
    if (error) setError('');
  };
  
  // Handle max price selection
  const handleMaxPriceChange = (e) => {
    setMaxPrice(e.target.value);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Set loading state
    setLoading(true);
    
    try {
      // Prepare search parameters
      const searchParams = {};
      
      // Only add parameters if they have values
      if (location.trim()) {
        searchParams.location = location.trim();
      }
      
      if (maxPrice) {
        searchParams.maxPrice = maxPrice;
      }
      
      // Execute search
      const results = await searchHostels(searchParams);
      
      // Pass results to parent component
      onSearchResults(results);
      
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search hostels. Please try again.');
      
      // Pass empty results on error
      onSearchResults({ hostels: [] });
      
    } finally {
      // Clear loading state
      setLoading(false);
    }
  };
  
  // Handle form reset
  const handleReset = () => {
    setLocation('');
    setMaxPrice('');
    setError('');
    // Inform parent of reset (if needed)
    // onSearchResults({ hostels: [] });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Find Your Perfect Hostel</h2>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
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
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Location field */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              id="location"
              value={location}
              onChange={handleLocationChange}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-2 sm:text-sm border-gray-300 rounded-md"
              placeholder="City, country or region"
              disabled={loading}
            />
          </div>
        </div>
        
        {/* Max price field */}
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Max Price per Night
          </label>
          <select
            id="maxPrice"
            value={maxPrice}
            onChange={handleMaxPriceChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            disabled={loading}
          >
            {priceRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-4 pt-2">
          <button
            type="submit"
            className={`flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </div>
            ) : (
              'Search Hostels'
            )}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

SearchBar.propTypes = {
  onSearchResults: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  setIsLoading: PropTypes.func
};

export default SearchBar; 