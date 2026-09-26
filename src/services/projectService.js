import API from "./api";

export const getProjects = () =>
  API.get("/projects");

export const createProject = (data) =>
  API.post("/projects", data);

export const deleteProject = (id) =>
  API.delete(`/projects/${id}`);