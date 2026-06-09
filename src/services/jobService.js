import api from './api';

const API_URL = '/jobs';

export const getPublicJobs = (params = {}) =>
  api.get(API_URL, { params });

export const getPublicJobSnapshot = () =>
  api.get(`${API_URL}/snapshot`);

export const getPublicJobById = (jobId) =>
  api.get(`${API_URL}/${jobId}`);
