import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getCurrentUser } from '../../store/slices/authSlice';
import LoadingSpinner from '../UI/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { isAuthenticated, isLoading, token, user } = useSelector((state: RootState) => state.auth);

  // Check if user is authenticated when token exists but user is not loaded
  useEffect(() => {
    if (token && !user && !isLoading) {
      dispatch(getCurrentUser());
    }
  }, [token, user, isLoading, dispatch]);

  // Show loading while checking authentication
  if (isLoading || (token && !user)) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;