import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5005/api/sounds",
  withCredentials: true
});

const errorHandler = (err) => {
  throw err;
};

const getSounds = () => {
  return api.get("/")
    .then((res) => res.data)
    .catch(errorHandler);
};

const uploadSound = (file, token) => {
  return api.post("/upload", file, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.data)
    .catch(errorHandler);
};

const createSound = (newSound, token) => {
  return api.post("/", newSound, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then(res => res.data)
  .catch(errorHandler);
};

const deleteSound = (id) => {
  return api.delete(`/${id}`)
    .then(res => res.data)
    .catch(errorHandler);
};

const getSoundsByUser = (userId) => {
  return api.get(`/user/${userId}`)
    .then((res) => res.data)
    .catch(errorHandler);
};

const fileUploadService = {
    getSounds,
    uploadSound,
    deleteSound,
    createSound,
    getSoundsByUser
};

export default fileUploadService;