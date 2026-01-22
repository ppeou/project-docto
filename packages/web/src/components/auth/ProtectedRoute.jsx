import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Timeout fallback - if loading takes more than 3 seconds, assume no user
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setTimeoutReached(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Show loading spinner, but with timeout fallback
  if (loading && !timeoutReached) {
    return (
      <div className="flex h-screen items-center justify-center bg-background" role="status" aria-live="polite">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">Loading...</p>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  // If no user (or timeout reached), redirect to login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
