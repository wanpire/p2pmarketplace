/**
 * HostelDetails Component
 * 
 * This component displays detailed information about a specific hostel,
 * including images, amenities, pricing, and booking options.
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getHostel } from '../services/api';
import BookingForm from './BookingForm';

const HostelDetails = () => {
  const { id } = useParams();
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHostelDetails = async () => {
      try {
        setLoading(true);
        const data = await getHostel(id);
        setHostel(data);
      } catch (err) {
        console.error('Error fetching hostel details:', err);
        setError('Failed to load hostel details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHostelDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500 text-center">
          <p className="text-xl font-semibold mb-2">Hostel Not Found</p>
          <p>The hostel you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hostel Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{hostel.name}</h1>
        <p className="text-gray-600">{hostel.location}</p>
      </div>

      {/* Image Gallery */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hostel.images.map((image, index) => (
            <div key={index} className="relative h-64 rounded-lg overflow-hidden">
              <img
                src={image}
                alt={`${hostel.name} - Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Hostel Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">About</h2>
            <p className="text-gray-700">{hostel.description}</p>
          </div>

          {/* Amenities */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {hostel.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* House Rules */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">House Rules</h2>
            <ul className="list-disc list-inside text-gray-700">
              {hostel.house_rules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Price Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              ${hostel.price_per_night}
              <span className="text-sm font-normal text-gray-600">/night</span>
            </div>
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <span className="text-yellow-400">★</span>
                <span className="ml-2">{hostel.rating}</span>
                <span className="ml-2 text-gray-600">
                  ({hostel.review_count} reviews)
                </span>
              </div>
            </div>
            <BookingForm hostelId={id} price={hostel.price_per_night} />
          </div>

          {/* Host Info */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Host Information</h3>
            <div className="flex items-center space-x-4">
              <img
                src={hostel.host.avatar || '/default-avatar.png'}
                alt={hostel.host.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-semibold">{hostel.host.name}</p>
                <p className="text-gray-600">Member since {new Date(hostel.host.created_at).getFullYear()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostelDetails; 