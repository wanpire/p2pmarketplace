import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Page components
import Home from './pages/Home';
import Search from './pages/Search';
import HostelDetails from './pages/HostelDetails';
import UserDashboard from './pages/UserDashboard';
import HostDashboard from './pages/HostDashboard';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Navbar from './components/Navbar';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but there was an error loading this page.</p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-4 p-4 bg-gray-100 rounded text-left overflow-auto max-h-60 text-sm">
                <p className="font-bold">Error: {this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <pre className="mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
            <button
              onClick={() => {
                // Clear any potential auth issues
                if (window.location.pathname.includes('/dashboard')) {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/login';
                } else {
                  window.location.reload();
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {window.location.pathname.includes('/dashboard') ? 'Go to Login' : 'Reload Page'}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Main App component that sets up routing for the application
 * Includes authentication checks for protected routes
 */
const App = () => {
  // State to track if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // State to track if user is a host
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');
        
        if (token && userString) {
          try {
            const user = JSON.parse(userString);
            setIsAuthenticated(true);
            
            // Check if user has host role
            // Support both role === 'host' and is_host flag
            setIsHost(user.role === 'host' || user.is_host === true);
            
            console.log('User authenticated:', { 
              isHost: user.role === 'host' || user.is_host === true,
              role: user.role 
            });
          } catch (e) {
            console.error('Error parsing user data:', e);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setIsHost(false);
          }
        } else {
          setIsAuthenticated(false);
          setIsHost(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setIsHost(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for storage events to sync auth state across tabs
    window.addEventListener('storage', checkAuth);
    
    // Cleanup event listener
    return () => window.removeEventListener('storage', checkAuth);
  }, []);
  
  // Layout component that includes Navbar for all routes
  const Layout = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar isAuthenticated={isAuthenticated} isHost={isHost} />
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
    );
  };
  
  // Authentication layout without Navbar
  const AuthLayout = () => {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
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
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <Routes>
        {/* Authentication routes without Navbar */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
        </Route>
        
        {/* Routes with Layout (Navbar) */}
        <Route element={<Layout />}>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/hostels/:id" element={<HostelDetails />} />
          
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
    </ErrorBoundary>
  );
};

export default App;
