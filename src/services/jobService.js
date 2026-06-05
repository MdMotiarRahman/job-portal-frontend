import axios from 'axios';

const API_URL = 'http://localhost:5000/api/jobs';

export const getPublicJobs = (params = {}) =>
  axios.get(API_URL, { params });

export const getPublicJobSnapshot = () =>
  axios.get(`${API_URL}/snapshot`);

export const getPublicJobById = (jobId) =>
  axios.get(`${API_URL}/${jobId}`);
