import { useState } from "react";
import "./AddSoundModal.css";
import fileUploadService from "../../services/file-upload.service";
import projectService from "../../services/project.service";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";

function AddSoundModal({ open, handleClose, projectId, inheritedBpm, onSoundAdded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [soundURL, setSoundURL] = useState("");
  const [tags, setTags] = useState("");
  const [formData, setFormData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileUpload = (e) => {
    const uploadData = new FormData();
    uploadData.append("soundURL", e.target.files[0]);
    setFormData(uploadData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setErrorMessage("");
    
    try {
      console.log("Starting sound upload process");
      // 1. Upload the audio file
      const token = localStorage.getItem("authToken");
      console.log("Uploading audio file...");
      const uploadedFile = await fileUploadService.uploadSound(formData, token);
      console.log("File uploaded successfully:", uploadedFile);
      
      // 2. Create the sound with BPM inherited from project
      const tagsArray = tags.split(",")
        .filter(tag => tag.trim()) // Filter out empty tags
        .map((tag) => tag.trim().toLowerCase());
      tagsArray.push(`${inheritedBpm} BPM`);
      
      const newSound = {
        title,
        bpm: inheritedBpm, // Use the inherited BPM
        description,
        soundURL: uploadedFile.fileUrl,
        tags: tagsArray,
      };
      
      console.log("Creating sound with data:", newSound);
      // 3. Save the sound to database
      const createdSound = await fileUploadService.createSound(newSound, token);
      console.log("Sound created successfully:", createdSound);
      
      if (!createdSound || !createdSound._id) {
        throw new Error("Sound creation failed - received invalid response");
      }
      
      // 4. Add the sound to the project
      console.log(`Adding sound ${createdSound._id} to project ${projectId}`);
      await projectService.addSoundToProject(projectId, createdSound._id, token);
      console.log("Sound added to project successfully");
      
      // 5. Notify parent component that sound was added
      onSoundAdded();
      
      // 6. Reset form and close modal
      setTitle("");
      setDescription("");
      setTags("");
      setSoundURL("");
      setFormData(null);
      handleClose();
      console.log("Modal closed successfully");
      
    } catch (error) {
      console.error("Error adding sound to project:", error);
      setErrorMessage(`Error: ${error.message || "Unknown error occurred"}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Sound to Project (BPM: {inheritedBpm})</DialogTitle>
      <DialogContent>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form onSubmit={handleSubmit} className="add-sound-form">
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
          <TextField
            label="Tags (separated by commas)"
            fullWidth
            margin="normal"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          
          <div className="file-upload-container">
            <input
              type="file"
              onChange={handleFileUpload}
              accept="audio/*"
              required
              id="sound-file-upload"
            />
            <label htmlFor="sound-file-upload">Choose an audio file</label>
          </div>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained" 
          disabled={isUploading || !formData}
        >
          {isUploading ? "Uploading..." : "Add Sound"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddSoundModal;