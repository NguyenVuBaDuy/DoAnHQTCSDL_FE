import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const PublicRoute: React.FC = () => {
  const token = localStorage.getItem('accessToken');

  // If token exists, redirect to dashboard (or previous page)
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  // If no token, allow rendering the login page
  return <Outlet />;
};
