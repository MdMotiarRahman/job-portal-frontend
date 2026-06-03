import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertCircle } from 'lucide-react';
import getSessionManager from '../utils/sessionManager';
import './SessionWarningModal.css';

/**
 * Session Warning Modal
 * Shows warning to user before session expires
 */
const SessionWarningModal = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60); // 1 minute remaining
  const navigate = useNavigate();
  const sessionManager = getSessionManager();

  useEffect(() => {
    const handleSessionWarning = () => {
      setShowWarning(true);
      setRemainingTime(60); // Reset to 1 minute
    };

    window.addEventListener('sessionWarning', handleSessionWarning);

    return () => {
      window.removeEventListener('sessionWarning', handleSessionWarning);
    };
  }, []);

  // Count down the remaining time
  useEffect(() => {
    if (!showWarning) return;

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowWarning(false);
          // Auto logout
          navigate('/login', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarning, navigate]);

  const handleStayLoggedIn = () => {
    sessionManager.extendSession();
    setShowWarning(false);
  };

  const handleLogout = () => {
    setShowWarning(false);
    navigate('/login', { replace: true });
  };

  if (!showWarning) return null;

  return (
    <div className="session-warning-overlay">
      <div className="session-warning-modal">
        <div className="warning-header">
          <AlertCircle size={28} className="warning-icon" />
          <h2>Session Expiring Soon</h2>
        </div>

        <div className="warning-content">
          <p>Your session is about to expire due to inactivity.</p>

          <div className="remaining-time">
            <Clock size={20} />
            <span>Time remaining: {remainingTime} seconds</span>
          </div>

          <p className="warning-message">
            Click "Stay Logged In" to continue working, or you will be automatically logged out.
          </p>
        </div>

        <div className="warning-actions">
          <button className="btn-logout" onClick={handleLogout}>
            Logout Now
          </button>
          <button className="btn-stay-logged-in" onClick={handleStayLoggedIn}>
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionWarningModal;
