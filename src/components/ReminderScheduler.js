import React, { useState } from 'react';
import { Clock, X } from 'lucide-react';
import '../styles/reminderScheduler.css';

const ReminderScheduler = ({ onSchedule, onClose }) => {
  const [scheduleType, setScheduleType] = useState('once');
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [repeatType, setRepeatType] = useState('daily');

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
        <div className="scheduler-header">
          <h3>
            <Clock size={20} />
            Schedule Reminder
          </h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="scheduler-body">
          {/* Schedule Type Selection */}
          <div className="form-group">
            <label>Reminder Type</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="once"
                  checked={scheduleType === 'once'}
                  onChange={(e) => setScheduleType(e.target.value)}
                />
                Remind Me Once
              </label>
              <label>
                <input
                  type="radio"
                  value="recurring"
                  checked={scheduleType === 'recurring'}
                  onChange={(e) => setScheduleType(e.target.value)}
                />
                Recurring Reminder
              </label>
            </div>
          </div>

          {/* Date & Time */}
          <div className="form-group">
            <label>Date & Time</label>
            <div className="date-time-inputs">
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
          </div>

          {/* Repeat Type (if recurring) */}
          {scheduleType === 'recurring' && (
            <div className="form-group">
              <label>Repeat</label>
              <select value={repeatType} onChange={(e) => setRepeatType(e.target.value)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>

        <div className="scheduler-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-schedule" onClick={handleSchedule}>
            Schedule Reminder
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderScheduler;