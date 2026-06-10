import api from './api';

const API_URL = '/employer';

const getSummary = async () => {
  const response = await api.get(`${API_URL}/summary`);
  return response.data;
};

const getProfile = async () => {
  const response = await api.get(`${API_URL}/profile`);
  return response.data;
};

const updateProfile = async (profileData) => {
  const response = await api.put(`${API_URL}/profile`, profileData);
  return response.data;
};

const getMyJobs = async () => {
  const response = await api.get(`${API_URL}/jobs`);
  return response.data.jobs || [];
};

const createJob = async (jobData) => {
  const response = await api.post(`${API_URL}/jobs`, jobData);
  return response.data;
};

const updateJob = async (jobId, jobData) => {
  const response = await api.put(`${API_URL}/jobs/${jobId}`, jobData);
  return response.data;
};

const deleteJob = async (jobId) => {
  const response = await api.delete(`${API_URL}/jobs/${jobId}`);
  return response.data;
};

const closeJob = async (jobId) => {
  const response = await api.put(`${API_URL}/jobs/${jobId}/close`, {});
  return response.data;
};

const reopenJob = async (jobId) => {
  const response = await api.put(`${API_URL}/jobs/${jobId}/reopen`, {});
  return response.data;
};

const getApplications = async (params = {}) => {
  const response = await api.get(`${API_URL}/applications`, { params });
  return response.data.applications || [];
};

const getApplicants = async (jobId) => {
  const response = await api.get(`${API_URL}/applications/${jobId}`);
  return response.data.applications || [];
};

const updateApplication = async (applicationId, data) => {
  const response = await api.put(`${API_URL}/applications/${applicationId}`, data);
  return response.data;
};

const employerService = {
  closeJob,
  createJob,
  deleteJob,
  getApplicants,
  getApplications,
  getMyJobs,
  getProfile,
  getSummary,
  reopenJob,
  updateApplication,
  updateApplicationDetails: updateApplication,
  updateApplicationStatus: updateApplication,
  updateJob,
  updateProfile,
};

export default employerService;
