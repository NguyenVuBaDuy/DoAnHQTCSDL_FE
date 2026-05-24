import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const PublicRoute: React.FC = () => {
  const token = localStorage.getItem('accessToken');

  // If token exists, redirect to home / (which handles dynamic role redirection)
  if (token) {
    return <Navigate to="/" replace />;
  }

  // If no token, allow rendering the login page
  return <Outlet />;
};
