import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';


// ============================
// REGISTER
// ============================

const register = (
  name,
  email,
  password,
  role
) => {

  return axios.post(
    `${API_URL}/register`,
    {
      name,
      email,
      password,
      role,
    }
  );

};


// ============================
// EVENTS
// ============================

const AUTH_EVENT_LOGIN =
  'auth:login';

const AUTH_EVENT_LOGOUT =
  'auth:logout';


// ============================
// DECODE TOKEN
// ============================

const decodeTokenPayload = (
  token
) => {

  if (!token) {
    return null;
  }

  try {

    const payload =
      token.split('.')[1];

    const base64 =
      payload
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(payload.length / 4) * 4, '=');

    const decoded =
      atob(base64);

    return JSON.parse(decoded);

  } catch (error) {

    return null;

  }

};


// ============================
// LOGIN
// ============================

const login = (
  email,
  password
) => {

  return axios
    .post(
      `${API_URL}/login`,
      {
        email,
        password,
      }
    )
    .then((response) => {

      if (response.data.token) {

        localStorage.setItem(
          'user',
          JSON.stringify(response.data)
        );

        window.dispatchEvent(
          new Event(
            AUTH_EVENT_LOGIN
          )
        );

      }

      return response.data;

    });

};


// ============================
// LOGOUT
// ============================

const logout = () => {

  localStorage.removeItem(
    'user'
  );

  window.dispatchEvent(
    new Event(
      AUTH_EVENT_LOGOUT
    )
  );

};


// ============================
// GET CURRENT USER
// ============================

const getCurrentUser = () => {

  return JSON.parse(
    localStorage.getItem('user')
  );

};


// ============================
// GET CURRENT ROLE
// ============================

const getCurrentUserRole =
  () => {

  const currentUser =
    getCurrentUser();

  const token =
    currentUser?.token;

  const decoded =
    decodeTokenPayload(token);

  return (
    decoded?.role
    || decoded?.user?.role
    || currentUser?.user?.role
    || currentUser?.role
    || null
  );

};


// ============================
// GET TOKEN
// ============================

const getAuthToken = () => {

  const currentUser =
    getCurrentUser();

  return currentUser?.token
    || null;

};


// ============================
// EXPORT
// ============================

const authService = {

  register,

  login,

  logout,

  getCurrentUser,

  getCurrentUserRole,

  getAuthToken,

};

export default authService;
