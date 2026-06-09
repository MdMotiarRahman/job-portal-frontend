import api from './api';

const API_URL = '/seeker';

export const getMyProfile = () => {
  return api.get(`${API_URL}/profile`);
};

export const updateMyProfile = (data) => {
  return api.put(`${API_URL}/profile`, data);
};

export const getMyApplications = () => {
  return api.get(`${API_URL}/applications`);
};

export const applyJob = (formData) => {
  return api.post(`${API_URL}/apply`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
