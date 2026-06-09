import api from './api';

const reminderService = {
  getReminders: async (page = 1, limit = 10) => {
    const response = await api.get('/reminders', { params: { page, limit } });
    const payload = response.data;
    if (payload.success && payload.data) {
      return { reminders: payload.data.reminders || [], ...payload.data };
    }
    return { reminders: payload.reminders || [] };
  },

  getReminder: async (reminderId) => {
    const response = await api.get(`/reminders/${reminderId}`);
    return response.data;
  },

  markAsViewed: async (reminderId) => {
    const response = await api.put(`/reminders/${reminderId}/view`, {});
    return response.data;
  },

  markAllAsViewed: async () => {
    const response = await api.put('/reminders/mark-all/viewed', {});
    return response.data;
  },

  snoozeReminder: async (reminderId, snoozeMinutes = 60) => {
    const response = await api.put(`/reminders/${reminderId}/snooze`, { snoozeMinutes });
    return response.data;
  },

  dismissReminder: async (reminderId) => {
    const response = await api.delete(`/reminders/${reminderId}`);
    return response.data;
  },

  deleteReminder: async (reminderId) => {
    const response = await api.delete(`/reminders/${reminderId}`);
    return response.data;
  },

  getReminderStats: async () => {
    const response = await api.get('/reminders/stats');
    return response.data;
  },

  createReminder: async (reminderData) => {
    const response = await api.post('/admin/reminders', reminderData);
    return response.data;
  },

  sendPendingReminders: async () => {
    const response = await api.post('/admin/reminders/send-pending', {});
    return response.data;
  },

  cleanupReminders: async () => {
    const response = await api.post('/admin/reminders/cleanup', {});
    return response.data;
  },
};

export default reminderService;
