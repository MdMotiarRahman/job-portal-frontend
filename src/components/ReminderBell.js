import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/reminderBell.css';
import reminderService from '../services/reminderService';

const ReminderBell = () => {
  const [reminders, setReminders] = useState([]);
  const [unviewedCount, setUnviewedCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReminders();
    // Poll for new reminders every 30 seconds
    const interval = setInterval(fetchReminders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await reminderService.getReminders(1, 5);
      setReminders(response.reminders || []);

      // Count unviewed reminders
      const unviewed = response.reminders?.filter((r) => !r.isViewed).length || 0;
      setUnviewedCount(unviewed);
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsViewed = async (reminderId) => {
    try {
      await reminderService.markAsViewed(reminderId);
      // Update local state
      setReminders((prev) =>
        prev.map((r) => (r._id === reminderId ? { ...r, isViewed: true } : r))
      );
      setUnviewedCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark reminder as viewed:', error);
    }
  };

  const handleViewAll = () => {
    navigate('/reminders');
    setShowDropdown(false);
  };

  const handleDismiss = async (reminderId) => {
    try {
      await reminderService.deleteReminder(reminderId);
      setReminders((prev) => prev.filter((r) => r._id !== reminderId));
      setUnviewedCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to dismiss reminder:', error);
    }
  };

  const getReminderIcon = (type) => {
    const colors = {
      'new-application': '#3b82f6',
      'interview': '#8b5cf6',
      'application-status': '#10b981',
      'job-deadline': '#f59e0b',
      'job-expiring': '#ef4444',
      'verification-pending': '#f97316',
    };
    return colors[type] || '#94a3b8';
  };

  return (
    <div className="reminder-bell-container" ref={dropdownRef}>
      <button
        className={`bell-button ${unviewedCount > 0 ? 'has-notifications' : ''}`}
        onClick={() => setShowDropdown(!showDropdown)}
        title="View reminders"
      >
        <Bell size={22} />
        {unviewedCount > 0 && (
          <span className="notification-badge">{unviewedCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="reminder-dropdown">
          <div className="dropdown-header">
            <h4>Reminders</h4>
            {unviewedCount > 0 && (
              <span className="unviewed-count">{unviewedCount} New</span>
            )}
          </div>

          {reminders.length === 0 ? (
            <div className="empty-reminders">
              <p>No reminders yet</p>
            </div>
          ) : (
            <div className="reminders-list">
              {reminders.map((reminder) => (
                <div
                  key={reminder._id}
                  className={`reminder-item ${reminder.isViewed ? 'viewed' : 'unviewed'}`}
                >
                  <div className="reminder-icon">
                    <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: getReminderIcon(reminder.type) }} />
                  </div>
                  <div className="reminder-content">
                    <h5>{reminder.templateData?.title || 'Reminder'}</h5>
                    <p className="reminder-message">
                      {reminder.templateData?.message || reminder.content}
                    </p>
                    <span className="reminder-type">{reminder.type}</span>
                  </div>
                  <div className="reminder-actions">
                    {!reminder.isViewed && (
                      <button
                        className="action-btn mark-read"
                        onClick={() => handleMarkAsViewed(reminder._id)}
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      className="action-btn dismiss"
                      onClick={() => handleDismiss(reminder._id)}
                      title="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="dropdown-footer">
            <button className="view-all-btn" onClick={handleViewAll}>
              View All Reminders →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderBell;
