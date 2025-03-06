import axios from "axios";

const API_URL = "http://localhost:5005/api/projects";

// Helper function to get the auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

const createProject = (projectData) => {
  return axios
    .post(API_URL, projectData, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    })
    .then((response) => response.data);
};

const createRelatedProject = (projectData) => {
  const token = getAuthToken();
  // Extract user ID from token - this ensures we always have a creator value
  const tokenPayload = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const currentUserId = tokenPayload ? tokenPayload._id : null;

  // Ensure creator exists by using the provided one or falling back to current user
  const dataWithCreator = {
    ...projectData,
    creator: projectData.creator || currentUserId
  };

  return axios
    .post(`${API_URL}/related`, dataWithCreator, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => response.data);
};

// Get all projects
const getAllProjects = () => {
  return axios
    .get(API_URL, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    })
    .then((response) => response.data);
};

const getAllProjectsByUser = (userId) => {
  return axios
    .get(`${API_URL}/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    })
    .then((response) => response.data);
};

// Get a single project by id
const getProject = (projectId) => {
  return axios
    .get(`${API_URL}/${projectId}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    })
    .then((response) => response.data);
};

// Update a project
const updateProject = (projectId, projectData) => {
  return axios
    .put(`${API_URL}/${projectId}`, projectData, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    })
    .then((response) => response.data);
};

// Delete a project
const deleteProject = (projectId) => {
  return axios
    .delete(`${API_URL}/${projectId}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    })
    .then((response) => response.data);
};

const addSoundToProject = (projectId, soundId, token) => {
  return axios
    .post(
      `${API_URL}/${projectId}/sounds/${soundId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token || getAuthToken()}`,
        },
      }
    )
    .then((response) => response.data);
};

const getRelatedProjects = (masterSoundId) => {
  return axios
    .get(`${API_URL}/related/${masterSoundId}`, {
      // Remove the extra "projects/" in the URL
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    })
    .then((response) => response.data);
};

const downloadProjectSounds = (projectId) => {
  // Return the URL instead of making the request directly
  return `${API_URL}/download-project/${projectId}`;
};

const projectService = {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
  addSoundToProject,
  getAllProjectsByUser,
  getRelatedProjects,
  createRelatedProject,
  downloadProjectSounds,
};

export default projectService;
