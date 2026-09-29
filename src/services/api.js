import axios from "axios";

const API = axios.create({
  baseURL: "https://project-management-backend-alpha.vercel.app/api",
  withCredentials: true,
});

API.interceptors.request.use((req) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;