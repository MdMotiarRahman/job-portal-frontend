import axios from 'axios';
import authService from './auth.service';

const API_URL = 'http://localhost:5000/api/admin';

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${authService.getAuthToken()}`,
  },
});

export const getDashboardStats = () =>
  axios.get(`${API_URL}/dashboard/stats`, authHeader());

export const getAnalytics = (period = 'month') =>
  axios.get(`${API_URL}/analytics?period=${period}`, authHeader());

export const getUsers = (params = {}) =>
  axios.get(`${API_URL}/users`, { ...authHeader(), params });

export const updateUserStatus = (userId, action, payload = {}) =>
  axios.put(`${API_URL}/users/${userId}/${action}`, payload, authHeader());

export const verifyUser = (userId) =>
  axios.put(`${API_URL}/users/${userId}/verify`, {}, authHeader());

export const deleteUser = (userId) =>
  axios.delete(`${API_URL}/users/${userId}`, authHeader());

export const getJobs = (params = {}) =>
  axios.get(`${API_URL}/jobs`, { ...authHeader(), params });

export const getJobById = (jobId) =>
  axios.get(`${API_URL}/jobs/${jobId}`, authHeader());

export const createJob = (payload) =>
  axios.post(`${API_URL}/jobs`, payload, authHeader());

export const updateJob = (jobId, payload) =>
  axios.put(`${API_URL}/jobs/${jobId}`, payload, authHeader());

export const approveJob = (jobId, notes = '') =>
  axios.put(`${API_URL}/jobs/${jobId}/approve`, { notes }, authHeader());

export const rejectJob = (jobId, reason) =>
  axios.put(`${API_URL}/jobs/${jobId}/reject`, { reason }, authHeader());

export const closeJob = (jobId) =>
  axios.put(`${API_URL}/jobs/${jobId}/close`, {}, authHeader());

export const reopenJob = (jobId) =>
  axios.put(`${API_URL}/jobs/${jobId}/reopen`, {}, authHeader());

export const deleteJob = (jobId) =>
  axios.delete(`${API_URL}/jobs/${jobId}`, authHeader());

export const getApplications = (params = {}) =>
  axios.get(`${API_URL}/applications`, { ...authHeader(), params });

export const updateApplicationStatus = (applicationId, status) =>
  axios.put(
    `${API_URL}/applications/${applicationId}/status`,
    { status },
    authHeader()
  );
