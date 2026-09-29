// Centralized API configuration supporting both local development and Vercel production
export const BASE_URL = import.meta.env.VITE_API_URL || "https://project-management-backend-alpha.vercel.app";
export const API_URL = `${BASE_URL}/api`;
