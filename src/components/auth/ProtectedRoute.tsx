import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const token = localStorage.getItem('accessToken');

  // If loading and we have a token, we might be fetching the user, so show a loading state
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // If no token, redirect to login page
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we have a token, allow rendering the child routes
  // The API interceptor will handle invalid tokens by redirecting to login on 401 errors
  return <Outlet />;
};
