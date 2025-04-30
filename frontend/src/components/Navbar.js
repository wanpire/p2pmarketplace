import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/api';

/**
 * Navbar component that provides navigation links and user authentication state
 * Responsive design with mobile menu toggle
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    console.log("Navbar: Checking authentication status");
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Navbar: User authenticated:", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log("Navbar: No authenticated user found");
      setUser(null);
    }
  }, [location.pathname]); // Re-check when route changes

  // Handle logout
  const handleLogout = () => {
    console.log("Navbar: Logging out user");
    logoutUser();
    setUser(null);
    setIsOpen(false);
    navigate('/');
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close mobile menu when clicking a link
  const closeMenu = () => {
    if (isOpen) setIsOpen(false);
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center" onClick={closeMenu}>
              <span className="text-white font-bold text-xl">Hostel Marketplace</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link 
              to="/"
              className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link 
              to="/search"
              className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              onClick={closeMenu}
            >
              Search
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/dashboard/user"
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                  onClick={closeMenu}
                >
                  My Bookings
                </Link>
                
                {user.is_host && (
                  <Link 
                    to="/dashboard/host"
                    className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                    onClick={closeMenu}
                  >
                    Host Dashboard
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="text-white bg-blue-800 hover:bg-blue-900 px-3 py-2 rounded-md text-sm font-medium ml-2"
                >
                  Logout
                </button>
                
                <Link 
                  to="/messages"
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                  onClick={closeMenu}
                >
                  Messages
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="text-white bg-blue-800 hover:bg-blue-900 px-3 py-2 rounded-md text-sm font-medium"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
            onClick={closeMenu}
          >
            Home
          </Link>
          <Link
            to="/search"
            className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
            onClick={closeMenu}
          >
            Search
          </Link>
          
          {user ? (
            <>
              <Link
                to="/dashboard/user"
                className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMenu}
              >
                My Bookings
              </Link>
              
              {user.is_host && (
                <Link
                  to="/dashboard/host"
                  className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={closeMenu}
                >
                  Host Dashboard
                </Link>
              )}
              
              <Link
                to="/messages"
                className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMenu}
              >
                Messages
              </Link>
              
              <button
                onClick={handleLogout}
                className="text-white bg-blue-800 hover:bg-blue-900 w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMenu}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 