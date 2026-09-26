import api from "./api";

export const sendReport = (projectId, message) =>
  api.post(`/reports/${projectId}`, { message });