import axios from "axios";

const API_URL =
  "http://localhost:5000/api/employer";

const getToken = () => {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  return user?.token;

};


// ============================
// CREATE JOB
// ============================

const createJob = async (jobData) => {

  const response = await axios.post(
    `${API_URL}/jobs`,
    jobData,
    {
      headers: {
        Authorization:
          `Bearer ${getToken()}`
      }
    }
  );

  return response.data;

};


// ============================
// GET MY JOBS
// ============================

const getMyJobs = async () => {

  const response = await axios.get(
    `${API_URL}/jobs`,
    {
      headers: {
        Authorization:
          `Bearer ${getToken()}`
      }
    }
  );

  return response.data;

};


// ============================
// GET JOB APPLICANTS
// ============================

const getApplicants = async (jobId) => {

  const response = await axios.get(
    `${API_URL}/applications/${jobId}`,
    {
      headers: {
        Authorization:
          `Bearer ${getToken()}`
      }
    }
  );

  return response.data;

};


// ============================
// UPDATE APPLICATION STATUS
// ============================

const updateApplicationStatus =
  async (applicationId, data) => {

  const response = await axios.put(
    `${API_URL}/applications/${applicationId}`,
    data,
    {
      headers: {
        Authorization:
          `Bearer ${getToken()}`
      }
    }
  );

  return response.data;

};


// ============================
// UPDATE APPLICATION DETAILS
// ============================

const updateApplicationDetails =
  async (applicationId, data) => {

  const response = await axios.put(
    `${API_URL}/applications/${applicationId}`,
    data,
    {
      headers: {
        Authorization:
          `Bearer ${getToken()}`
      }
    }
  );

  return response.data;

};


const employerService = {

  createJob,
  getMyJobs,
  getApplicants,
  updateApplicationStatus,
  updateApplicationDetails,

};

export default employerService;