import { useEffect, useContext, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import getSessionManager from '../utils/sessionManager';
import authService from '../services/auth.service';

const SessionContext = createContext();

/**
 * Hook to use session management
 */
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};

/**
 * Session Provider Component
 * Manages session timeout and activity tracking
 */
export const SessionProvider = ({ children }) => {
  const navigate = useNavigate();
  const sessionManager = getSessionManager();

  useEffect(() => {
    const user = authService.getCurrentUser();

    // Only initialize session tracking if user is logged in
    if (user && user.token) {
      const handleSessionExpiry = () => {
        // Perform logout
        authService.logout();

        // Mark session as expired for redirect handling
        sessionStorage.setItem('sessionExpired', 'true');

        // Redirect to login
        navigate('/login', {
          replace: true,
          state: { message: 'Your session has expired. Please login again.' },
        });
      };

      const handleSessionWarning = () => {
        // Dispatch warning event that components can listen to
        window.dispatchEvent(new Event('sessionWarning'));
      };

      // Initialize session manager
      sessionManager.initialize(handleSessionExpiry, handleSessionWarning);

      return () => {
        sessionManager.logout();
      };
    }
  }, [navigate]);

  return (
    <SessionContext.Provider value={{ sessionManager }}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
