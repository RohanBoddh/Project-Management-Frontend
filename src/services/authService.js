import axios from "axios";

const API = "http://localhost:5000/api/auth";

// REGISTER
export const registerUser = (data) => axios.post(`${API}/register`, data);

// LOGIN
export const loginUser = (data) => axios.post(`${API}/login`, data);

export const getMe = () =>
  axios.get(`${API}/me`, {
    headers: {
      // FIX: Changed sessionStorage to sessionStorage
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });