import axios from 'axios';

const API_URL = 'http://localhost:5000/api/seeker';

const authHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.token) {
    return {
      Authorization: `Bearer ${user.token}`,
    };
  }

  return {};
};

export const getMyProfile = () => {
  return axios.get(`${API_URL}/profile`, {
    headers: authHeader(),
  });
};

export const updateMyProfile = (data) => {
  return axios.put(`${API_URL}/profile`, data, {
    headers: authHeader(),
  });
};

export const getMyApplications = () => {
  return axios.get(`${API_URL}/applications`, {
    headers: authHeader(),
  });
};

export const applyJob = (formData) => {
  return axios.post(
    `${API_URL}/apply`,
    formData,
    {
      headers: {
        ...authHeader(),
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};
