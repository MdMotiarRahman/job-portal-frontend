import api from './api';

const API_URL = '/ats';

// ─── Pipeline Stats & Board ──────────────────────────────────────
const getStats = async (filters = {}) => {
  try {
    const response = await api.get(`${API_URL}/stats`, { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch stats' };
  }
};

const getBoard = async (filters = {}) => {
  try {
    const response = await api.get(`${API_URL}/board`, { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch board' };
  }
};

const getEmployerStats = async () => {
  try {
    const response = await api.get(`${API_URL}/employer-stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch employer stats' };
  }
};

// ─── Application Stage Management ────────────────────────────────
const moveApplication = async (applicationId, stageData) => {
  try {
    const response = await api.put(`${API_URL}/applications/${applicationId}/move`, stageData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to move application' };
  }
};

const bulkMoveApplications = async (applicationIds, stage, notes = '') => {
  try {
    const response = await api.post(`${API_URL}/applications/bulk-move`, { applicationIds, stage, notes });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to bulk move applications' };
  }
};

const getStageHistory = async (applicationId) => {
  try {
    const response = await api.get(`${API_URL}/applications/${applicationId}/history`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch stage history' };
  }
};

// ─── Interview Management ───────────────────────────────────────
const scheduleInterview = async (interviewData) => {
  try {
    const response = await api.post(`${API_URL}/interviews`, interviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to schedule interview' };
  }
};

const updateInterview = async (interviewId, updates) => {
  try {
    const response = await api.put(`${API_URL}/interviews/${interviewId}`, updates);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update interview' };
  }
};

const cancelInterview = async (interviewId) => {
  try {
    const response = await api.delete(`${API_URL}/interviews/${interviewId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to cancel interview' };
  }
};

const getInterviewDetails = async (applicationId) => {
  try {
    const response = await api.get(`${API_URL}/interviews/${applicationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch interview details' };
  }
};

const sendInterviewNotification = async (interviewId) => {
  try {
    const response = await api.post(`${API_URL}/interviews/${interviewId}/send-notification`, {});
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to send notification' };
  }
};

// ─── Offer Management ────────────────────────────────────────────
const createOffer = async (offerData) => {
  try {
    const response = await api.post(`${API_URL}/offers`, offerData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create offer' };
  }
};

const updateOffer = async (offerId, updates) => {
  try {
    const response = await api.put(`${API_URL}/offers/${offerId}`, updates);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update offer' };
  }
};

const sendOffer = async (offerId) => {
  try {
    const response = await api.post(`${API_URL}/offers/${offerId}/send`, {});
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to send offer' };
  }
};

const updateOfferStatus = async (offerId, status, notes = '') => {
  try {
    const response = await api.put(`${API_URL}/offers/${offerId}/status`, { status, notes });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update offer status' };
  }
};

const getOfferDetails = async (applicationId) => {
  try {
    const response = await api.get(`${API_URL}/offers/${applicationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch offer details' };
  }
};

const revokeOffer = async (offerId) => {
  try {
    const response = await api.delete(`${API_URL}/offers/${offerId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to revoke offer' };
  }
};

// ─── Search & Filters ───────────────────────────────────────────
const searchApplications = async (filters = {}) => {
  try {
    const response = await api.get(`${API_URL}/search`, { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to search applications' };
  }
};

const getSavedViews = async () => {
  try {
    const response = await api.get(`${API_URL}/views`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch saved views' };
  }
};

const saveView = async (viewData) => {
  try {
    const response = await api.post(`${API_URL}/views`, viewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to save view' };
  }
};

// ─── Export & Reports ───────────────────────────────────────────
const exportPipelineCSV = async (filters = {}) => {
  try {
    const response = await api.get(`${API_URL}/export/csv`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to export CSV' };
  }
};

const generateReport = async (reportData = {}) => {
  try {
    const response = await api.post(`${API_URL}/reports/hiring`, reportData, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to generate report' };
  }
};

const atsService = {
  getStats,
  getBoard,
  getEmployerStats,
  moveApplication,
  bulkMoveApplications,
  getStageHistory,
  scheduleInterview,
  updateInterview,
  cancelInterview,
  getInterviewDetails,
  sendInterviewNotification,
  createOffer,
  updateOffer,
  sendOffer,
  updateOfferStatus,
  getOfferDetails,
  revokeOffer,
  searchApplications,
  getSavedViews,
  saveView,
  exportPipelineCSV,
  generateReport,
};

export default atsService;
