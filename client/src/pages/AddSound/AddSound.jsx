import { useState } from "react";
import { useNavigate } from "react-router-dom";
import service from "../../services/file-upload.service";

function AddSound() {
  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState("");

  const [description, setDescription] = useState("");
  const [soundURL, setSoundURL] = useState("");
  const [projectId, setProjectId] = useState("");
  const [formData, setFormData] = useState(null);
  const navigate = useNavigate();

  // ******** this method handles the file upload ********
  const handleFileUpload = (e) => {
    const uploadData = new FormData();
    uploadData.append("soundURL", e.target.files[0]);
    setFormData(uploadData);
  };

  // ********  this method submits the form ********
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const uploadedFile = await service.uploadSound(formData);
      setSoundURL(uploadedFile.fileUrl);
      console.log(" uploaded file :::", uploadedFile)
      const newSound = {
        title,
        bpm,
        description,
        soundURL: uploadedFile.fileUrl,
        duration: uploadedFile.duration,
        // projectId,
      };

      const createdSound = await service.createSound(newSound);

      setTitle("");
      setBpm("");
      setDescription("");
      setSoundURL("");

      navigate("/");
    } catch (error) {
      console.log("Error while uploading the file: ", error);
    }
  };

  return (
    <div>
      <h2>New Sound</h2>
      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>BPM</label>
        <input
          type="number"
          name="bpm"
          value={bpm}
          onChange={(e) => setBpm(e.target.value)}
        />

        <label>Description</label>
        <textarea
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input type="file" onChange={(e) => handleFileUpload(e)} />

        <button type="submit">Save new sound</button>
      </form>
    </div>
  );
}

export default AddSound;
