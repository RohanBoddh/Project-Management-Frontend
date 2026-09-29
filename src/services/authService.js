import API from "./api";

// ================= REGISTER =================
export const registerUser = (data) => {
  return API.post("/auth/register", data);
};

// ================= LOGIN =================
export const loginUser = (data) => {
  return API.post("/auth/login", data);
};

// ================= GET CURRENT USER =================
export const getMe = () => {
  return API.get("/auth/me");
};