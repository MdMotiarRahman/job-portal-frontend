import api from './api';

const messageService = {
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  createConversation: async (participantId, jobId = null) => {
    const response = await api.post('/messages/conversations', { participantId, jobId });
    return response.data;
  },

  getMessages: async (conversationId, page = 1, limit = 50) => {
    const response = await api.get(`/messages/conversations/${conversationId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  sendMessage: async (conversationId, content) => {
    const response = await api.post(`/messages/conversations/${conversationId}/messages`, { content });
    return response.data;
  },

  markAsRead: async (conversationId) => {
    const response = await api.put(`/messages/conversations/${conversationId}/read`, {});
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/messages/unread-count');
    return response.data;
  },
};

export default messageService;
