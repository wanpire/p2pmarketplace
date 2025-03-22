import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * HostelCard component for displaying hostel information in a card format
 * 
 * @param {Object} props
 * @param {Object} props.hostel - Hostel data object
 * @param {number} props.hostel.id - Hostel ID
 * @param {string} props.hostel.name - Hostel name
 * @param {string} props.hostel.location - Hostel location
 * @param {number} props.hostel.price - Hostel price per night
 * @param {Array<string>} props.hostel.images - Array of image URLs for the hostel
 * @param {string} [props.hostel.description] - Optional short description
 * @param {Array<string>} [props.hostel.amenities] - Optional array of amenities
 * @param {number} [props.hostel.rating] - Optional rating (1-5)
 */
const HostelCard = ({ hostel }) => {
  const { id, name, location, price, images, description, amenities, rating } = hostel;
  
  // Use first image or fallback
  const imageUrl = images?.length > 0 
    ? images[0] 
    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
  
  // Format price correctly
  const formattedPrice = typeof price === 'number' 
    ? `$${price.toFixed(2)}` 
    : `$${price}`;
    
  // Limit amenities shown
  const displayedAmenities = amenities?.slice(0, 3) || [];
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Card Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={`${name} hostel`} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        
        {/* Price Tag */}
        <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 m-2 rounded-md font-bold">
          {formattedPrice}/night
        </div>
        
        {/* Rating Badge (if available) */}
        {rating && (
          <div className="absolute bottom-0 left-0 bg-yellow-500 text-white px-2 py-1 m-2 rounded-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      
      {/* Card Content */}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-1 truncate">{name}</h3>
        
        <div className="flex items-center text-gray-600 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{location}</span>
        </div>
        
        {/* Description (if available) */}
        {description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {description}
          </p>
        )}
        
        {/* Amenities (if available) */}
        {displayedAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {displayedAmenities.map((amenity, index) => (
              <span 
                key={index} 
                className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md"
              >
                {amenity}
              </span>
            ))}
            {amenities && amenities.length > 3 && (
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                +{amenities.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* View Details Button */}
        <Link 
          to={`/hostels/${id}`} 
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors duration-300 mt-2"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

HostelCard.propTypes = {
  hostel: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    description: PropTypes.string,
    amenities: PropTypes.arrayOf(PropTypes.string),
    rating: PropTypes.number
  }).isRequired
};

export default HostelCard; 