import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import getSessionManager from '../utils/sessionManager';

const roleRedirectMap = {
  admin: '/admin',
  employer: '/employer',
  seeker: '/seeker',
};

const ProtectedRoute = ({ allowedRoles, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const userRole = authService.getCurrentUserRole();
  const sessionManager = getSessionManager();

  useEffect(() => {
    // Check if session has expired
    if (sessionManager.isSessionExpired() && currentUser) {
      // Session expired - logout and redirect
      authService.logout();
      sessionStorage.setItem('sessionExpired', 'true');
      navigate('/login', {
        replace: true,
        state: { message: 'Your session has expired. Please login again.' },
      });
    }
  }, [currentUser, navigate, sessionManager]);

  if (!currentUser || !currentUser.token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to={roleRedirectMap[userRole] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
