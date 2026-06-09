import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/reminderWidget.css';
import reminderService from '../services/reminderService';

const ReminderWidget = ({ filterType = null, title = 'Recent Reminders', limit = 3 }) => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReminders();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchReminders, 60000);
    return () => clearInterval(interval);
  }, [filterType]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reminderService.getReminders(1, limit);
      
      let filtered = response.reminders || [];
      if (filterType) {
        filtered = filtered.filter(r => r.type === filterType);
      }
      
      setReminders(filtered.slice(0, limit));
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
      setReminders([]);
    } finally {
      setLoading(false);
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

  if (loading) {
    return null;
  }

  if (error || reminders.length === 0) {
    return null;
  }

  return (
    <div className="reminder-widget">
      <div className="widget-header">
        <h4>{title}</h4>
        <span className="badge">{reminders.length}</span>
      </div>

      <div className="widget-list">
        {reminders.map((reminder) => (
          <div
            key={reminder._id}
            className={`widget-item ${reminder.isViewed ? 'viewed' : 'unviewed'}`}
          >
            <div className="item-icon">
              <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: getReminderIcon(reminder.type) }} />
            </div>
            <div className="item-content">
              <div className="item-title">{reminder.templateData?.title}</div>
              <div className="item-preview">
                {reminder.templateData?.message?.substring(0, 50)}...
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="widget-footer-btn"
        onClick={() => navigate('/reminders')}
      >
        View All →
      </button>
    </div>
  );
};

export default ReminderWidget;