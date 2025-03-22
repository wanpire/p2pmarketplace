import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';

/**
 * Profile Component
 * 
 * Displays user profile information and provides a form to update it.
 * Fetches profile data on mount and updates it when the form is submitted.
 */
const Profile = () => {
  // State for profile data
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    phone: ''
  });
  
  // Fetch profile data on mount
  useEffect(() => {
    fetchProfile();
  }, []);
  
  // Fetch profile data from API
  const fetchProfile = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await getProfile();
      setProfile(data);
      
      // Initialize form data with profile data
      setFormData({
        username: data.username || '',
        email: data.email || '',
        bio: data.bio || '',
        phone: data.phone || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Toggle edit mode
  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data if canceling edit
      setFormData({
        username: profile.username || '',
        email: profile.email || '',
        bio: profile.bio || '',
        phone: profile.phone || ''
      });
    }
    setIsEditing(!isEditing);
    setSuccessMessage('');
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const updatedData = await updateProfile(formData);
      setProfile(updatedData);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error && !profile) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button 
              onClick={fetchProfile} 
              className="text-sm text-red-700 underline mt-1"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Profile Header */}
      <div className="bg-blue-600 text-white px-6 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">My Profile</h2>
          <button
            onClick={handleEditToggle}
            className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-colors ${
              isEditing 
                ? 'bg-gray-100 text-blue-600 hover:bg-gray-200' 
                : 'bg-white text-blue-600 hover:bg-gray-100'
            }`}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>
      
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mx-6 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-4">
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
      
      <div className="p-6">
        {isEditing ? (
          /* Edit Form */
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSaving}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSaving}
                />
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself"
                  disabled={isSaving}
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (123) 456-7890"
                  disabled={isSaving}
                />
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors ${
                    isSaving ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving Changes...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Profile Display */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Username</h3>
                <p className="mt-1 text-sm text-gray-900">{profile.username}</p>
              </div>
              <div className="mt-2 sm:mt-0 flex items-center">
                <div className={`${profile.is_host ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'} px-2 py-1 text-xs font-medium rounded-full`}>
                  {profile.is_host ? 'Host' : 'User'}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</h3>
              <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
            </div>
            
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bio</h3>
              <p className="mt-1 text-sm text-gray-900">
                {profile.bio || <span className="text-gray-500 italic">No bio provided</span>}
              </p>
            </div>
            
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</h3>
              <p className="mt-1 text-sm text-gray-900">
                {profile.phone || <span className="text-gray-500 italic">No phone number provided</span>}
              </p>
            </div>
            
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Account Created</h3>
              <p className="mt-1 text-sm text-gray-900">
                {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 