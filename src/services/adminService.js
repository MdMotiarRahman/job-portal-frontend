import api from './api';

const API_URL = '/admin';

export const getDashboardStats = () =>
  api.get(`${API_URL}/dashboard/stats`);

export const getAnalytics = (period = 'month') =>
  api.get(`${API_URL}/analytics`, { params: { period } });

export const getUsers = (params = {}) =>
  api.get(`${API_URL}/users`, { params });

export const updateUser = (userId, payload) =>
  api.put(`${API_URL}/users/${userId}`, payload);

export const updateUserStatus = (userId, action, payload = {}) =>
  api.put(`${API_URL}/users/${userId}/${action}`, payload);

export const verifyUser = (userId) =>
  api.put(`${API_URL}/users/${userId}/verify`, {});

export const deleteUser = (userId) =>
  api.delete(`${API_URL}/users/${userId}`);

export const getJobs = (params = {}) =>
  api.get(`${API_URL}/jobs`, { params });

export const getJobById = (jobId) =>
  api.get(`${API_URL}/jobs/${jobId}`);

export const createJob = (payload) =>
  api.post(`${API_URL}/jobs`, payload);

export const updateJob = (jobId, payload) =>
  api.put(`${API_URL}/jobs/${jobId}`, payload);

export const approveJob = (jobId, notes = '') =>
  api.put(`${API_URL}/jobs/${jobId}/approve`, { notes });

export const rejectJob = (jobId, reason) =>
  api.put(`${API_URL}/jobs/${jobId}/reject`, { reason });

export const closeJob = (jobId) =>
  api.put(`${API_URL}/jobs/${jobId}/close`, {});

export const reopenJob = (jobId) =>
  api.put(`${API_URL}/jobs/${jobId}/reopen`, {});

export const deleteJob = (jobId) =>
  api.delete(`${API_URL}/jobs/${jobId}`);

export const getApplications = (params = {}) =>
  api.get(`${API_URL}/applications`, { params });

export const updateApplicationStatus = (applicationId, status) =>
  api.put(`${API_URL}/applications/${applicationId}/status`, { status });

// ============= EMPLOYER MANAGEMENT =============
export const getAllEmployers = (params = {}) =>
  api.get(`${API_URL}/employers`, { params });

export const getEmployerById = (employerId) =>
  api.get(`${API_URL}/employers/${employerId}`);

export const getPendingEmployers = (params = {}) =>
  api.get(`${API_URL}/employers/pending`, { params });

export const approveEmployer = (employerId, payload = {}) =>
  api.put(`${API_URL}/employers/${employerId}/approve`, payload);

export const rejectEmployer = (employerId, payload = {}) =>
  api.put(`${API_URL}/employers/${employerId}/reject`, payload);
