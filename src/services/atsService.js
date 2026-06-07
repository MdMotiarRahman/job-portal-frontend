import axios from 'axios';

const API_URL = 'http://localhost:5000/api/ats';

const getToken = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token;
};

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  },
});

// ─── Pipeline Stats & Board ──────────────────────────────────────
/**
 * Fetch pipeline statistics (applications per stage, avg time to hire)
 */
const getStats = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/stats`, {
      params: filters,
      ...authHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch stats' };
  }
};

/**
 * Fetch Kanban board data (applications grouped by stage)
 */
const getBoard = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/board`, {
      params: filters,
      ...authHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch board' };
  }
};

/**
 * Fetch employer-specific ATS statistics
 */
const getEmployerStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/employer-stats`, authHeaders());
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch employer stats' };
  }
};

// ─── Application Stage Management ────────────────────────────────
/**
 * Move a single application to a new stage
 * @param {string} applicationId - Application ID
 * @param {object} stageData - Stage change data
 * @param {string} stageData.stage - Target stage
 * @param {string} stageData.notes - Optional notes
 * @param {string} stageData.interviewDate - Optional interview date
 * @param {string} stageData.interviewTime - Optional interview time
 * @param {string} stageData.interviewMode - Optional interview mode
 * @param {string} stageData.interviewLocation - Optional interview location
 * @param {string} stageData.rejectionReason - Optional rejection reason
 * @param {object} stageData.offerDetails - Optional offer details
 */
const moveApplication = async (applicationId, stageData) => {
  try {
    const response = await axios.put(
      `${API_URL}/applications/${applicationId}/move`,
      stageData,
      authHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to move application' };
  }
};

/**
 * Bulk move multiple applications to the same stage
 * @param {string[]} applicationIds - Array of application IDs
 * @param {string} stage - Target stage
 * @param {string} notes - Optional notes for all applications
 */
const bulkMoveApplications = async (applicationIds, stage, notes = '') => {
  try {
    const response = await axios.post(
      `${API_URL}/applications/bulk-move`,
      { applicationIds, stage, notes },
      authHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to bulk move applications' };
  }
};

/**
 * Get full stage transition history for an application
 * @param {string} applicationId - Application ID
 */
const getStageHistory = async (applicationId) => {
  try {
    const response = await axios.get(
      `${API_URL}/applications/${applicationId}/history`,
      authHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch stage history' };
  }
};

// ─── Interview Management ───────────────────────────────────────
/**
 * Schedule an interview for an application
 * @param {object} interviewData - Interview details
 * @param {string} interviewData.applicationId - Application ID
 * @param {string} interviewData.date - Interview date (YYYY-MM-DD)
 * @param {string} interviewData.time - Interview time (HH:mm)
 * @param {string} interviewData.mode - Interview mode (In-Person, Video, Phone, Hybrid)
 * @param {string} interviewData.location - Interview location
 * @param {string[]} interviewData.panelMembers - Panel member IDs/emails
 * @param {string} interviewData.topics - Interview topics/questions
 */
const scheduleInterview = async (interviewData) => {
  try {
    const response = await axios.post(
      `${API_URL}/interviews`,
      interviewData,
      authHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to schedule interview' };
  }
};

/**
 * Update interview details
 * @param {string} interviewId - Interview ID
 * @param {object} updates - Updates to interview
 */
const updateInterview = async (interviewId, updates) => {
  try {
    const response = await axios.put(
      `${API_URL}/interviews/${interviewId}`,
      updates,
      authHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update interview' };
  }
};

/**
 * Cancel/delete an interview
 * @param {string} interviewId - Interview ID
 */
const cancelInterview = async (interviewId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/interviews/${interviewId}`,
      authHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to cancel interview' };
  }
};

/**
 * Get interview details for an application
 * @param {string} applicationId - Application ID
 */
const getInterviewDetails = async (applicationId) => {
  try {
    const response = await axios.get(
      `${API_URL}/interviews/${applicationId}`,
      authHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch interview details' };
  }
};

/**
 * Notify candidate of interview schedule
 * @param {string} interviewId - Interview ID
 */
const sendInterviewNotification = async (interviewId) => {
  try {
    const response = await axios.post(
      `${API_URL}/interviews/${interviewId}/send-notification`,
      {},
      authHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to send notification' };
  }
};

// ─── Offer Management ────────────────────────────────────────────
/**
 * Create a job offer for an application
 * @param {object} offerData - Offer details
 * @param {string} offerData.applicationId - Application ID
 * @param {string} offerData.position - Position title
 * @param {string} offerData.department - Department
 * @param {number} offerData.salary - Annual salary
 * @param {string} offerData.joiningDate - Joining date (YYYY-MM-DD)
 * @param {string} offerData.benefits - Benefits summary
 * @param {string} offerData.terms - Terms and conditions
 * @param {number} offerData.expiryDays - Days until offer expires
 */
const createOffer = async (offerData) => {
  try {
    const response = await axios.post(
      `${API_URL}/offers`,
      offerData,
      authHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create offer' };
  }
};

/**
 * Update offer details (before sending)
 * @param {string} offerId - Offer ID
 * @param {object} updates - Offer updates
 */
const updateOffer = async (offerId, updates) => {
  try {
    const response = await axios.put(
      `${API_URL}/offers/${offerId}`,
      updates,
      authHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update offer' };
  }
};

/**
 * Send offer to candidate
 * @param {string} offerId - Offer ID
 */
const sendOffer = async (offerId) => {
  try {
    const response = await axios.post(
      `${API_URL}/offers/${offerId}/send`,
      {},
      authHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to send offer' };
  }
};

/**
 * Update offer status (accept/reject)
 * @param {string} offerId - Offer ID
 * @param {string} status - New status (accepted, rejected, expired)
 * @param {string} notes - Optional notes from candidate
 */
const updateOfferStatus = async (offerId, status, notes = '') => {
  try {
    const response = await axios.put(
      `${API_URL}/offers/${offerId}/status`,
      { status, notes },
      authHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update offer status' };
  }
};

/**
 * Get offer details
 * @param {string} applicationId - Application ID
 */
const getOfferDetails = async (applicationId) => {
  try {
    const response = await axios.get(
      `${API_URL}/offers/${applicationId}`,
      authHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch offer details' };
  }
};

/**
 * Revoke/delete an offer
 * @param {string} offerId - Offer ID
 */
const revokeOffer = async (offerId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/offers/${offerId}`,
      authHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to revoke offer' };
  }
};

// ─── Search & Filters ───────────────────────────────────────────
/**
 * Search applications with filters
 * @param {object} filters - Search and filter criteria
 * @param {string} filters.search - Search term (name, email, job title)
 * @param {string} filters.stage - Filter by stage
 * @param {string} filters.jobId - Filter by job
 * @param {string} filters.dateFrom - Filter from date
 * @param {string} filters.dateTo - Filter to date
 * @param {number} filters.page - Page number
 * @param {number} filters.limit - Results per page
 */
const searchApplications = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: filters,
      ...authHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to search applications' };
  }
};

/**
 * Get saved filter views
 */
const getSavedViews = async () => {
  try {
    const response = await axios.get(`${API_URL}/views`, authHeaders());
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch saved views' };
  }
};

/**
 * Save a filter view
 * @param {object} viewData - View configuration
 * @param {string} viewData.name - View name
 * @param {object} viewData.filters - Filter criteria
 */
const saveView = async (viewData) => {
  try {
    const response = await axios.post(
      `${API_URL}/views`,
      viewData,
      authHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to save view' };
  }
};

// ─── Export & Reports ───────────────────────────────────────────
/**
 * Export pipeline data as CSV
 * @param {object} filters - Filter criteria
 */
const exportPipelineCSV = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/export/csv`, {
      params: filters,
      ...authHeaders(),
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to export CSV' };
  }
};

/**
 * Generate hiring report as PDF
 * @param {object} reportData - Report criteria
 */
const generateReport = async (reportData = {}) => {
  try {
    const response = await axios.post(
      `${API_URL}/reports/hiring`,
      reportData,
      {
        ...authHeaders(),
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to generate report' };
  }
};

const atsService = {
  // Pipeline
  getStats,
  getBoard,
  getEmployerStats,
  
  // Applications
  moveApplication,
  bulkMoveApplications,
  getStageHistory,
  
  // Interviews
  scheduleInterview,
  updateInterview,
  cancelInterview,
  getInterviewDetails,
  sendInterviewNotification,
  
  // Offers
  createOffer,
  updateOffer,
  sendOffer,
  updateOfferStatus,
  getOfferDetails,
  revokeOffer,
  
  // Search & Filters
  searchApplications,
  getSavedViews,
  saveView,
  
  // Export & Reports
  exportPipelineCSV,
  generateReport,
};

export default atsService;
