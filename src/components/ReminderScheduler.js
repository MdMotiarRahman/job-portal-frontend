import React, { useState, useMemo } from 'react';
import { X, Calendar, Clock, Repeat, ChevronDown } from 'lucide-react';
import '../styles/reminderScheduler.css';

const ReminderScheduler = ({ onSchedule, onClose }) => {
  const [scheduleType, setScheduleType] = useState('once');
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [repeatType, setRepeatType] = useState('daily');

  const previewText = useMemo(() => {
    const date = new Date(`${scheduleDate}T${scheduleTime}`);
    const formatted = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    if (scheduleType === 'recurring') {
      return `${formatted} — repeats ${repeatType}`;
    }
    return formatted;
  }, [scheduleDate, scheduleTime, scheduleType, repeatType]);

  const handleSchedule = () => {
    const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`);
    onSchedule({
      type: scheduleType,
      scheduledFor,
      repeatType: scheduleType === 'recurring' ? repeatType : null,
    });
  };

  return (
    <div className="reminder-scheduler-modal">
      <div className="scheduler-backdrop" onClick={onClose} />

      <div className="scheduler-content">
        {/* Header */}
        <div className="scheduler-header">
          <div className="scheduler-header-left">
            <h3>Schedule Reminder</h3>
            <p className="scheduler-header-sub">Choose when you'd like to be reminded</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="scheduler-body">
          {/* Type Selector */}
          <div className="sch-field">
            <div className="sch-segmented">
              <button
                className={`sch-segmented-btn ${scheduleType === 'once' ? 'active' : ''}`}
                onClick={() => setScheduleType('once')}
              >
                <Clock size={14} />
                Once
              </button>
              <button
                className={`sch-segmented-btn ${scheduleType === 'recurring' ? 'active' : ''}`}
                onClick={() => setScheduleType('recurring')}
              >
                <Repeat size={14} />
                Recurring
              </button>
            </div>
          </div>

          {/* Date & Time */}
          <div className="sch-field">
            <span className="sch-field-label">Date & Time</span>
            <div className="sch-input-row">
              <div className="sch-input-wrap">
                <Calendar size={15} />
                <input
                  type="date"
                  className="sch-input"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="sch-input-wrap">
                <Clock size={15} />
                <input
                  type="time"
                  className="sch-input"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Repeat (conditional) */}
          {scheduleType === 'recurring' && (
            <div className="sch-repeat-wrap">
              <div className="sch-field">
                <span className="sch-field-label">Repeat Every</span>
                <div className="sch-input-wrap">
                  <Repeat size={15} />
                  <select
                    className="sch-select"
                    value={repeatType}
                    onChange={(e) => setRepeatType(e.target.value)}
                  >
                    <option value="daily">Day</option>
                    <option value="weekly">Week</option>
                    <option value="monthly">Month</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="sch-preview">
            <div className="sch-preview-icon">
              <Clock size={16} />
            </div>
            <div className="sch-preview-text">
              <span className="sch-preview-label">Reminder set for</span>
              <span className="sch-preview-value">{previewText}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="scheduler-footer">
          <button className="sch-btn sch-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="sch-btn sch-btn-confirm" onClick={handleSchedule}>
            <Clock size={14} />
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderScheduler;
