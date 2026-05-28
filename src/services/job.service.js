import axios from "axios";

const API_URL = "http://localhost:5000/api/jobs";

const getApprovedJobs = async () => {
  return axios.get(API_URL);
};

const jobService = {
  getApprovedJobs,
};

export default jobService;