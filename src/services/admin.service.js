import api from './api';

const API_URL = '/admin';

const getPendingJobs = async () => {
  const response = await api.get(`${API_URL}/jobs/pending`);
  return response.data;
};

const approveJob = async (jobId) => {
  const response = await api.put(`${API_URL}/jobs/${jobId}/approve`, {});
  return response.data;
};

const rejectJob = async (jobId) => {
  const response = await api.put(`${API_URL}/jobs/${jobId}/reject`, {});
  return response.data;
};

const adminService = {
  getPendingJobs,
  approveJob,
  rejectJob,
};

export default adminService;
