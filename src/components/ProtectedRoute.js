import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/auth.service';

const roleRedirectMap = {
  admin: '/admin',
  employer: '/employer',
  seeker: '/seeker',
};

const ProtectedRoute = ({ allowedRoles, children }) => {
  const location = useLocation();
  const currentUser = authService.getCurrentUser();
  const userRole = authService.getCurrentUserRole();

  if (!currentUser || !currentUser.token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to={roleRedirectMap[userRole] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
