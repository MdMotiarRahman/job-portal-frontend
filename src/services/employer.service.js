import axios from 'axios';

const API_URL = 'http://localhost:5000/api/employer';

const getToken = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token;
};

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

const getSummary = async () => {
  const response = await axios.get(`${API_URL}/summary`, authConfig());
  return response.data;
};

const getMyJobs = async () => {
  const response = await axios.get(`${API_URL}/jobs`, authConfig());
  return response.data.jobs || [];
};

const createJob = async (jobData) => {
  const response = await axios.post(`${API_URL}/jobs`, jobData, authConfig());
  return response.data;
};

const updateJob = async (jobId, jobData) => {
  const response = await axios.put(`${API_URL}/jobs/${jobId}`, jobData, authConfig());
  return response.data;
};

const deleteJob = async (jobId) => {
  const response = await axios.delete(`${API_URL}/jobs/${jobId}`, authConfig());
  return response.data;
};

const closeJob = async (jobId) => {
  const response = await axios.put(`${API_URL}/jobs/${jobId}/close`, {}, authConfig());
  return response.data;
};

const reopenJob = async (jobId) => {
  const response = await axios.put(`${API_URL}/jobs/${jobId}/reopen`, {}, authConfig());
  return response.data;
};

const getApplications = async (params = {}) => {
  const response = await axios.get(`${API_URL}/applications`, {
    ...authConfig(),
    params,
  });
  return response.data.applications || [];
};

const getApplicants = async (jobId) => {
  const response = await axios.get(`${API_URL}/applications/${jobId}`, authConfig());
  return response.data.applications || [];
};

const updateApplication = async (applicationId, data) => {
  const response = await axios.put(`${API_URL}/applications/${applicationId}`, data, authConfig());
  return response.data;
};

const employerService = {
  closeJob,
  createJob,
  deleteJob,
  getApplicants,
  getApplications,
  getMyJobs,
  getSummary,
  reopenJob,
  updateApplication,
  updateApplicationDetails: updateApplication,
  updateApplicationStatus: updateApplication,
  updateJob,
};

export default employerService;
