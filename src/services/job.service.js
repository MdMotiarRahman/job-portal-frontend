import api from './api';

const getApprovedJobs = async () => {
  return api.get('/jobs');
};

const jobService = {
  getApprovedJobs,
};

export default jobService;
