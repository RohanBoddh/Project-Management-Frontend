import axios from "axios";

// Create axios instance with base URL and default headers
const API = axios.create({
  baseURL: "https://project-management-backend-alpha.vercel.app/api",
});

// Add token to requests if available
API.interceptors.request.use((req) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// ==================== TASK SERVICES ====================

// Get all tasks for current user (member)
export const getMyTasks = async () => {
  try {
    const response = await API.get("/member/my-tasks");
    return response.data;
  } catch (error) {
    console.error("Error fetching my tasks:", error);
    throw error;
  }
};

// Get tasks by project ID
export const getTasksByProject = async (projectId) => {
  try {
    const response = await API.get(`/member/tasks/${projectId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks by project:", error);
    throw error;
  }
};

// Update task status
export const updateTaskStatus = async (taskId, status) => {
  try {
    const response = await API.put(`/member/tasks/${taskId}`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
};

// Get single task details
export const getTaskDetails = async (taskId) => {
  try {
    const response = await API.get(`/member/task/${taskId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching task details:", error);
    throw error;
  }
};

// Add new task (for manager/admin)
export const createTask = async (taskData) => {
  try {
    const response = await API.post("/tasks", taskData);
    return response.data;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

// Update task (for manager/admin)
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await API.put(`/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

// Delete task (for manager/admin)
export const deleteTask = async (taskId) => {
  try {
    const response = await API.delete(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

// Get all tasks (admin/manager)
export const getAllTasks = async () => {
  try {
    const response = await API.get("/tasks");
    return response.data;
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    throw error;
  }
};

export default {
  getMyTasks,
  getTasksByProject,
  updateTaskStatus,
  getTaskDetails,
  createTask,
  updateTask,
  deleteTask,
  getAllTasks,
};