import axios from "axios";

const serverUrl = import.meta.env.VITE_SERVER_URL;
console.log("API Server URL:", serverUrl);

const api = axios.create({
  baseURL: `${serverUrl}/api/sounds`,
  withCredentials: true,
});

const errorHandler = (err) => {
  throw err;
};

const getSounds = () => {
  return api
    .get("/")
    .then((res) => res.data)
    .catch(errorHandler);
};

// Add this method to get a single sound by ID
const getSound = (soundId) => {
  return api
    .get(`/${soundId}`)
    .then((res) => res.data)
    .catch(errorHandler);
};

const uploadSound = (file, token) => {
  return api
    .post("/upload", file, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data)
    .catch(errorHandler);
};

const createSound = (newSound, token) => {
  console.log("Sending sound creation request:", newSound);
  return api
    .post("/", newSound, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      console.log("Sound creation response:", res.data);
      return res.data;
    })
    .catch((err) => {
      console.error("Sound creation error:", err.response?.data || err.message);
      throw err;
    });
};

const deleteSound = (id) => {
  return api
    .delete(`/${id}`)
    .then((res) => res.data)
    .catch(errorHandler);
};

const getSoundsByUser = (userId) => {
  return api
    .get(`/user/${userId}`)
    .then((res) => res.data)
    .catch(errorHandler);
};

// Get sounds filtered by project
const getSoundsByProject = (projectId) => {
  return api
    .get(`/project/${projectId}`)
    .then((res) => res.data)
    .catch(errorHandler);
};

const fileUploadService = {
  getSounds,
  getSound,
  uploadSound,
  deleteSound,
  createSound,
  getSoundsByUser,
  getSoundsByProject,
};

export default fileUploadService;
