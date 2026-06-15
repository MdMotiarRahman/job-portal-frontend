import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellOff, Loader2 } from 'lucide-react';
import '../styles/reminderWidget.css';
import reminderService from '../services/reminderService';
import { formatReminderType, getReminderColor } from '../utils/reminderFormatters';

const ReminderWidget = ({ filterType = null, title = 'Recent Reminders', limit = 3 }) => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
    const interval = setInterval(fetchReminders, 60000);
    return () => clearInterval(interval);
  }, [filterType, limit]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
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

  return (
    <div className="reminder-widget">
      <div className="widget-header">
        <h4>{title}</h4>
        {!loading && reminders.length > 0 && (
          <span className="badge">{reminders.length}</span>
        )}
      </div>

      {loading ? (
        <div className="widget-loading">
          <Loader2 size={18} className="widget-spinner" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="widget-empty">
          <BellOff size={20} strokeWidth={1.5} />
          <p>No reminders</p>
        </div>
      ) : (
        <div className="widget-list">
          {reminders.map((reminder) => (
            <div
              key={reminder._id}
              className={`widget-item ${reminder.isViewed ? 'viewed' : 'unviewed'}`}
            >
              <div className="item-dot" style={{ background: getReminderColor(reminder.type) }} />
              <div className="item-content">
                <div className="item-title">{reminder.templateData?.title || 'Reminder'}</div>
                <div className="item-meta">
                  <span className="item-type" style={{ color: getReminderColor(reminder.type) }}>
                    {formatReminderType(reminder.type)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
