import axios from "axios";

const API_URL = "http://localhost:5000/api/admin";

const getToken = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.token;
};

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

const getPendingJobs = async () => {
  const response = await axios.get(
    `${API_URL}/jobs/pending`,
    authHeaders()
  );
  return response.data;
};

const approveJob = async (jobId) => {
  const response = await axios.put(
    `${API_URL}/jobs/${jobId}/approve`,
    {},
    authHeaders()
  );
  return response.data;
};

const rejectJob = async (jobId) => {
  const response = await axios.put(
    `${API_URL}/jobs/${jobId}/reject`,
    {},
    authHeaders()
  );
  return response.data;
};

const adminService = {
  getPendingJobs,
  approveJob,
  rejectJob,
};

export default adminService;