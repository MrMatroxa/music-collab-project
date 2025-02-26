import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5005/sounds",
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

const uploadSound = (file) => {
  return api.post("/upload", file)
    .then(res => res.data)
    .catch(errorHandler);
};

const createSound = (newSound) => {
    return api.post("/", newSound)
      .then(res => res.data)
      .catch(errorHandler);
  };

const deleteSound = (id) => {
  return api.delete(`/${id}`)
    .then(res => res.data)
    .catch(errorHandler);
};

const fileUploadService = {
    getSounds,
    uploadSound,
    deleteSound,
    createSound
};

export default fileUploadService;