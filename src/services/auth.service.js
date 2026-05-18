import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const register = (name, email, password, role) => {
  return axios.post(`${API_URL}/register`, {
    name,
    email,
    password,
    role,
  });
};

const AUTH_EVENT_LOGIN = 'auth:login';
const AUTH_EVENT_LOGOUT = 'auth:logout';

const login = (email, password) => {
  return axios
    .post(`${API_URL}/login`, {
      email,
      password,
    })
    .then((response) => {
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
        window.dispatchEvent(new Event(AUTH_EVENT_LOGIN));
      }
      return response.data;
    });
};

const logout = () => {
  localStorage.removeItem('user');
  window.dispatchEvent(new Event(AUTH_EVENT_LOGOUT));
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default authService;
