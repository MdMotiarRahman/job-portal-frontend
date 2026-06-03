/**
 * Session Manager
 * Handles user activity tracking and auto-logout functionality
 * Auto-logout after 15 minutes (900 seconds) of inactivity
 */

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
const SESSION_WARNING_TIME = 14 * 60 * 1000; // 14 minutes - warning before logout
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
const STORAGE_KEY = 'sessionLastActivity';
const SESSION_EXPIRED_FLAG = 'sessionExpired';

class SessionManager {
  constructor() {
    this.timeoutId = null;
    this.warningTimeoutId = null;
    this.sessionExpiryCallback = null;
    this.sessionWarningCallback = null;
    this.lastActivityTime = this.getLastActivityTime();
  }

  /**
   * Initialize session manager
   * @param {Function} onSessionExpiry - Callback when session expires
   * @param {Function} onSessionWarning - Callback when warning should show
   */
  initialize(onSessionExpiry, onSessionWarning) {
    this.sessionExpiryCallback = onSessionExpiry;
    this.sessionWarningCallback = onSessionWarning;

    // Set initial activity time
    this.updateActivityTime();

    // Add activity event listeners
    this.attachActivityListeners();

    // Start the session timer
    this.startSessionTimer();
  }

  /**
   * Attach event listeners for user activity
   */
  attachActivityListeners() {
    ACTIVITY_EVENTS.forEach((event) => {
      document.addEventListener(event, this.handleActivity.bind(this), true);
    });
  }

  /**
   * Remove event listeners for user activity
   */
  detachActivityListeners() {
    ACTIVITY_EVENTS.forEach((event) => {
      document.removeEventListener(event, this.handleActivity.bind(this), true);
    });
  }

  /**
   * Handle user activity - reset timers
   */
  handleActivity() {
    // Ignore activity if session has expired
    if (this.isSessionExpired()) {
      return;
    }

    this.updateActivityTime();
    this.resetSessionTimer();
  }

  /**
   * Update last activity time in memory and localStorage
   */
  updateActivityTime() {
    this.lastActivityTime = Date.now();
    localStorage.setItem(STORAGE_KEY, this.lastActivityTime);
    localStorage.removeItem(SESSION_EXPIRED_FLAG);
  }

  /**
   * Get last activity time from storage
   */
  getLastActivityTime() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : Date.now();
  }

  /**
   * Check if session has expired
   */
  isSessionExpired() {
    const now = Date.now();
    const lastActivity = this.getLastActivityTime();
    const elapsedTime = now - lastActivity;
    return elapsedTime > SESSION_TIMEOUT;
  }

  /**
   * Check if session warning time reached
   */
  isWarningTime() {
    const now = Date.now();
    const lastActivity = this.getLastActivityTime();
    const elapsedTime = now - lastActivity;
    return elapsedTime > SESSION_WARNING_TIME && elapsedTime <= SESSION_TIMEOUT;
  }

  /**
   * Start the session timer
   */
  startSessionTimer() {
    this.resetSessionTimer();
  }

  /**
   * Reset session timer
   */
  resetSessionTimer() {
    // Clear existing timers
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
    }

    // Set warning timeout (at 14 minutes)
    this.warningTimeoutId = setTimeout(() => {
      if (this.sessionWarningCallback && this.isWarningTime()) {
        this.sessionWarningCallback();
      }
    }, SESSION_WARNING_TIME);

    // Set expiry timeout (at 15 minutes)
    this.timeoutId = setTimeout(() => {
      this.expireSession();
    }, SESSION_TIMEOUT);
  }

  /**
   * Expire the session and call callback
   */
  expireSession() {
    localStorage.setItem(SESSION_EXPIRED_FLAG, 'true');
    this.detachActivityListeners();
    
    if (this.sessionExpiryCallback) {
      this.sessionExpiryCallback();
    }
  }

  /**
   * Manually logout and clean up
   */
  logout() {
    this.detachActivityListeners();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_EXPIRED_FLAG);
  }

  /**
   * Extend session (called on user confirmation in warning)
   */
  extendSession() {
    localStorage.removeItem(SESSION_EXPIRED_FLAG);
    this.updateActivityTime();
    this.resetSessionTimer();
  }
}

// Singleton instance
let sessionManager = null;

export const getSessionManager = () => {
  if (!sessionManager) {
    sessionManager = new SessionManager();
  }
  return sessionManager;
};

export default getSessionManager;
