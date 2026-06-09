import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user?.token || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const reminderService = {
  getReminders: async (page = 1, limit = 10) => {
    const response = await axios.get(`${API_BASE_URL}/reminders`, {
      params: { page, limit },
      headers: getAuthHeader(),
    });
    const payload = response.data;
    if (payload.success && payload.data) {
      return { reminders: payload.data.reminders || [], ...payload.data };
    }
    return { reminders: payload.reminders || [] };
  },

  getReminder: async (reminderId) => {
    const response = await axios.get(`${API_BASE_URL}/reminders/${reminderId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  markAsViewed: async (reminderId) => {
    const response = await axios.put(
      `${API_BASE_URL}/reminders/${reminderId}/view`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  markAllAsViewed: async () => {
    const response = await axios.put(
      `${API_BASE_URL}/reminders/mark-all/viewed`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  snoozeReminder: async (reminderId, snoozeMinutes = 60) => {
    const response = await axios.put(
      `${API_BASE_URL}/reminders/${reminderId}/snooze`,
      { snoozeMinutes },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  dismissReminder: async (reminderId) => {
    const response = await axios.delete(`${API_BASE_URL}/reminders/${reminderId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  deleteReminder: async (reminderId) => {
    const response = await axios.delete(`${API_BASE_URL}/reminders/${reminderId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getReminderStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/reminders/stats`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  createReminder: async (reminderData) => {
    const response = await axios.post(`${API_BASE_URL}/admin/reminders`, reminderData, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  sendPendingReminders: async () => {
    const response = await axios.post(
      `${API_BASE_URL}/admin/reminders/send-pending`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  cleanupReminders: async () => {
    const response = await axios.post(
      `${API_BASE_URL}/admin/reminders/cleanup`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};

export default reminderService;
