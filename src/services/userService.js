// userApi.js
import axios from "axios";

const API_URL =
  "https://project-management-backend-alpha.vercel.app/api/users";

export const getAllUsers = async () => {
  const token = sessionStorage.getItem("token");

  return axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};