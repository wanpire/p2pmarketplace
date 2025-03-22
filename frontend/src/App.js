import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Page components
import Home from './pages/Home';
import Search from './pages/Search';
import HostelDetails from './pages/HostelDetails';
import UserDashboard from './pages/UserDashboard';
import HostDashboard from './pages/HostDashboard';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Navbar from './components/Navbar';

/**
 * Main App component that sets up routing for the application
 * Includes authentication checks for protected routes
 */
const App = () => {
  // State to track if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // State to track if user is a host
  const [isHost, setIsHost] = useState(false);
  
  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token) {
      setIsAuthenticated(true);
      // Check if user has host role
      setIsHost(user.role === 'host');
    }
  }, []);
  
  // Layout component that includes Navbar for all routes
  const Layout = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Outlet />
      </div>
    );
  };
  
  // Protected route component for user dashboard
  const ProtectedUserRoute = () => {
    return isAuthenticated ? <UserDashboard /> : <Navigate to="/login" />;
  };
  
  // Protected route component for host dashboard
  const ProtectedHostRoute = () => {
    return isAuthenticated && isHost ? <HostDashboard /> : <Navigate to="/login" />;
  };
  
  return (
    <Router>
      <Routes>
        {/* Routes with Layout (Navbar) */}
        <Route element={<Layout />}>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/hostels/:id" element={<HostelDetails />} />
          
          {/* Authentication routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          
          {/* Protected routes */}
          <Route path="/dashboard/user" element={<ProtectedUserRoute />} />
          <Route path="/dashboard/host" element={<ProtectedHostRoute />} />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={
            <div className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
              <p className="text-gray-600 mb-8">The page you are looking for doesn't exist or has been moved.</p>
              <button 
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          } />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
