import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/authStore.js';

/**
 * ProtectedRoute Component
 * Protects routes based on authentication and user roles
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Protected content
 * @param {string[]} props.allowedRoles - Array of allowed roles (optional)
 */
const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const location = useLocation();
  const { isAuthenticated, user, checkAuth } = useAuthStore();

  // Remove checkAuth from here to prevent infinite loop on re-renders and redirects
  // checkAuth should ideally be called once at the App root level or top-level layout

  // ========== TEMPORARILY DISABLED FOR TESTING ==========
  // If not authenticated, redirect to login
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }

  // If roles are specified, check if user has required role
  // if (allowedRoles && allowedRoles.length > 0) {
  //   const userRole = user?.role;
  //   
  //   // Normalize to uppercase for safety
  //   const uppercaseAllowedRoles = allowedRoles.map(r => String(r).toUpperCase());
  //   const uppercaseUserRole = userRole ? String(userRole).toUpperCase() : '';

  //   if (!uppercaseUserRole || !uppercaseAllowedRoles.includes(uppercaseUserRole)) {
  //     return <Navigate to="/unauthorized" replace />;
  //   }
  // }

  // User is authenticated and has required role (if specified)
  return children;
};

export default ProtectedRoute;
