import React, { useState, useEffect } from 'react';
import { Trash2, Eye, Clock, Filter, ChevronLeft, ChevronRight, BellOff, Loader2 } from 'lucide-react';
import '../styles/reminderCenter.css';
import reminderService from '../services/reminderService';
import { formatReminderType, formatReminderStatus, getReminderColor } from '../utils/reminderFormatters';

const ReminderCenter = () => {
  const [reminders, setReminders] = useState([]);
  const [filteredReminders, setFilteredReminders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReminders();
    fetchStats();
  }, [currentPage, selectedFilter, sortBy]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await reminderService.getReminders(currentPage, itemsPerPage);
      setReminders(response.reminders || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await reminderService.getReminderStats();
      setStats(response.stats || {});
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Filter reminders based on selected filter
  useEffect(() => {
    let filtered = [...reminders];

    if (selectedFilter === 'unviewed') {
      filtered = filtered.filter((r) => !r.isViewed);
    } else if (selectedFilter === 'viewed') {
      filtered = filtered.filter((r) => r.isViewed);
    } else if (selectedFilter === 'urgent') {
      filtered = filtered.filter(r => r.templateData?.urgencyLevel === 'critical' || r.templateData?.urgencyLevel === 'high');
    } else if (selectedFilter === 'follow-up') {
      filtered = filtered.filter(r => r.templateData?.tags?.includes('follow-up'));
    } else if (selectedFilter === 'info-only') {
      filtered = filtered.filter(r => r.templateData?.tags?.includes('info-only'));
    } else if (selectedFilter === 'action-required') {
      filtered = filtered.filter(r => r.templateData?.tags?.includes('action-required'));
    } else if (selectedFilter !== 'all') {
      filtered = filtered.filter((r) => r.type === selectedFilter);
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'dueSoon') {
      filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    setFilteredReminders(filtered);
  }, [reminders, selectedFilter, sortBy]);

  const handleMarkAsViewed = async (reminderId, isCurrentlyViewed) => {
    try {
      await reminderService.markAsViewed(reminderId);
      setReminders((prev) =>
        prev.map((r) => (r._id === reminderId ? { ...r, isViewed: true } : r))
      );
      fetchStats();
    } catch (error) {
      console.error('Failed to mark as viewed:', error);
    }
  };

  const handleMarkAllAsViewed = async () => {
    if (window.confirm('Mark all reminders as viewed?')) {
      try {
        await reminderService.markAllAsViewed();
        setReminders((prev) => prev.map((r) => ({ ...r, isViewed: true })));
        fetchStats();
      } catch (error) {
        console.error('Failed to mark all as viewed:', error);
      }
    }
  };

  const handleDelete = async (reminderId) => {
    if (window.confirm('Delete this reminder?')) {
      try {
        await reminderService.deleteReminder(reminderId);
        setReminders((prev) => prev.filter((r) => r._id !== reminderId));
        fetchStats();
      } catch (error) {
        console.error('Failed to delete reminder:', error);
      }
    }
  };

  const handleSnooze = async (reminderId) => {
    try {
      await reminderService.snoozeReminder(reminderId, 60);
      setReminders((prev) =>
        prev.map((r) =>
          r._id === reminderId
            ? { ...r, status: 'snoozed', dueDate: new Date(Date.now() + 60 * 60 * 1000) }
            : r
        )
      );
    } catch (error) {
      console.error('Failed to snooze reminder:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filterOptions = [
    { value: 'all', label: 'All Reminders' },
    { value: 'unviewed', label: 'Unread' },
    { value: 'viewed', label: 'Read' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'info-only', label: 'Info Only' },
    { value: 'action-required', label: 'Action Required' },
    { value: 'new-application', label: 'New Applications' },
    { value: 'interview', label: 'Interviews' },
    { value: 'application-status', label: 'Application Status' },
    { value: 'job-deadline', label: 'Job Deadlines' },
    { value: 'job-expiring', label: 'Job Expiring' },
    { value: 'verification-pending', label: 'Verification' },
  ];

  return (
    <div className="reminder-center-container">
      {/* Stats Cards */}
      {stats.totalReminders !== undefined && (
        <div className="reminder-stats-row">
          <div className="reminder-stat-card">
            <span className="reminder-stat-label">Total</span>
            <span className="reminder-stat-value">{stats.totalReminders || 0}</span>
          </div>
          <div className="reminder-stat-card">
            <span className="reminder-stat-label">Unread</span>
            <span className="reminder-stat-value unread">{stats.unviewedCount || 0}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="reminder-controls">
        {/* Filters */}
        <div className="filter-section">
          <label className="filter-label">
            <Filter size={18} />
            Filter by:
          </label>
          <select
            className="filter-select"
            value={selectedFilter}
            onChange={(e) => {
              setSelectedFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="sort-section">
          <label className="sort-label">Sort:</label>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="dueSoon">Due Soon</option>
          </select>
        </div>

        {/* Actions */}
        <div className="actions-section">
          {stats.unviewedCount > 0 && (
            <button
              className="action-button mark-all-read"
              onClick={handleMarkAllAsViewed}
              title="Mark all as read"
            >
              <Eye size={16} />
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Reminders List */}
      <div className="reminders-content">
        {loading ? (
          <div className="loading-state">
            <Loader2 size={32} className="spinner" />
            <p>Loading reminders...</p>
          </div>
        ) : filteredReminders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <BellOff size={28} strokeWidth={1.5} />
              </div>
              <h3>No reminders found</h3>
              <p>You don't have any reminders matching this filter.</p>
            </div>
        ) : (
          <>
            <div className="reminders-table">
              <div className="table-header">
                <div className="col-type">Type</div>
                <div className="col-message">Message</div>
                <div className="col-date">Date</div>
                <div className="col-status">Status</div>
                <div className="col-actions">Actions</div>
              </div>

              {filteredReminders.map((reminder) => (
                <div
                  key={reminder._id}
                  className={`table-row ${reminder.isViewed ? 'viewed' : 'unviewed'}`}
                >
                  <div className="col-type">
                    <span className="type-badge" style={{ background: getReminderColor(reminder.type) + '18', color: getReminderColor(reminder.type) }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: getReminderColor(reminder.type), flexShrink: 0 }} />
                      <span className="type-text">
                        {formatReminderType(reminder.type)}
                      </span>
                    </span>
                  </div>

                  <div className="col-message">
                    <div className="message-title">
                      {reminder.templateData?.title || 'Reminder'}
                    </div>
                    <div className="message-content">
                      {reminder.templateData?.message || reminder.content}
                    </div>
                  </div>

                  <div className="col-date">
                    <small>{formatDate(reminder.createdAt)}</small>
                  </div>

                  <div className="col-status">
                    <span
                      className={`status-badge status-${reminder.status}`}
                    >
                      {formatReminderStatus(reminder.status)}
                    </span>
                  </div>

                  <div className="col-actions">
                    {!reminder.isViewed && (
                      <button
                        className="action-icon mark-read"
                        onClick={() =>
                          handleMarkAsViewed(reminder._id, reminder.isViewed)
                        }
                        title="Mark as read"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    {reminder.status === 'pending' && (
                      <button
                        className="action-icon snooze"
                        onClick={() => handleSnooze(reminder._id)}
                        title="Snooze for 1 hour"
                      >
                        <Clock size={16} />
                      </button>
                    )}
                    <button
                      className="action-icon delete"
                      onClick={() => handleDelete(reminder._id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <div className="pagination-info">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  className="pagination-button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReminderCenter;
