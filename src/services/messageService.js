import axios from 'axios';
import authService from './auth.service';

const API_URL = 'http://localhost:5000/api/messages';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${authService.getAuthToken()}`,
});

const messageService = {
  getConversations: async () => {
    const response = await axios.get(`${API_URL}/conversations`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  createConversation: async (participantId, jobId = null) => {
    const response = await axios.post(
      `${API_URL}/conversations`,
      { participantId, jobId },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  getMessages: async (conversationId, page = 1, limit = 50) => {
    const response = await axios.get(
      `${API_URL}/conversations/${conversationId}`,
      {
        params: { page, limit },
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  },

  sendMessage: async (conversationId, content) => {
    const response = await axios.post(
      `${API_URL}/conversations/${conversationId}/messages`,
      { content },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  markAsRead: async (conversationId) => {
    const response = await axios.put(
      `${API_URL}/conversations/${conversationId}/read`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axios.get(`${API_URL}/unread-count`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

export default messageService;
