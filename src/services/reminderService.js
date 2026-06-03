import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const reminderService = {
  // Get all reminders for the current user (paginated)
  getReminders: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reminders`, {
        params: { page, limit },
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching reminders:', error);
      throw error;
    }
  },

  // Get a single reminder by ID
  getReminder: async (reminderId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reminders/${reminderId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching reminder:', error);
      throw error;
    }
  },

  // Mark a reminder as viewed
  markAsViewed: async (reminderId) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/reminders/${reminderId}/mark-viewed`,
        {},
        {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking reminder as viewed:', error);
      throw error;
    }
  },

  // Mark all reminders as viewed
  markAllAsViewed: async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/reminders/mark-all-viewed`,
        {},
        {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking all reminders as viewed:', error);
      throw error;
    }
  },

  // Snooze a reminder (user chooses to be reminded later)
  snoozeReminder: async (reminderId, snoozeMinutes = 60) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/reminders/${reminderId}/snooze`,
        { snoozeMinutes },
        {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error snoozing reminder:', error);
      throw error;
    }
  },

  // Dismiss a reminder
  dismissReminder: async (reminderId) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/reminders/${reminderId}/dismiss`,
        {},
        {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error dismissing reminder:', error);
      throw error;
    }
  },

  // Delete/remove a reminder
  deleteReminder: async (reminderId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/reminders/${reminderId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  },

  // Get reminder statistics (counts by type, status, etc.)
  getReminderStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reminders/stats`, {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching reminder stats:', error);
      throw error;
    }
  },

  // Admin: Create a manual reminder
  createReminder: async (reminderData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/reminders`, reminderData, {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  },

  // Admin: Manually send pending reminders
  sendPendingReminders: async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/reminders/send-pending`,
        {},
        {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending pending reminders:', error);
      throw error;
    }
  },

  // Admin: Cleanup old reminders
  cleanupReminders: async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/reminders/cleanup`,
        {},
        {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error cleaning up reminders:', error);
      throw error;
    }
  },
};

export default reminderService;
