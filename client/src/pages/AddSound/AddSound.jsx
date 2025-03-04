import { useState } from "react";
import { useNavigate } from "react-router-dom";
import service from "../../services/file-upload.service";
import projectService from "../../services/project.service";
import { 
  TextField, Button, Typography, Box, Paper, 
  Container, IconButton, InputAdornment 
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

function AddSound() {
  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState("");
  const [description, setDescription] = useState("");
  const [soundURL, setSoundURL] = useState("");
  const [projectId, setProjectId] = useState("");
  const [tags, setTags] = useState("");
  const [formData, setFormData] = useState(null);
  const [fileName, setFileName] = useState("");
  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    const uploadData = new FormData();
    uploadData.append("soundURL", e.target.files[0]);
    setFormData(uploadData);
    setFileName(e.target.files[0]?.name || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      const uploadedFile = await service.uploadSound(formData, token);
      setSoundURL(uploadedFile.fileUrl);

      const tagsArray = tags.split(",").map((tag) => tag.trim().toLowerCase());
      tagsArray.push(`${bpm} BPM`);

      const newSound = {
        title,
        bpm,
        description,
        soundURL: uploadedFile.fileUrl,
        tags: tagsArray,
      };

      const createdSound = await service.createSound(newSound, token);

      const newProject = {
        title: `Project for ${title}`,
        description: `Project containing the sound ${title}`,
        soundId: [createdSound._id],
      };

      await projectService.createProject(newProject);

      setTitle("");
      setBpm("");
      setDescription("");
      setSoundURL("");
      setTags("");

      navigate("/");
    } catch (error) {
      console.log("Error while uploading the file: ", error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          bgcolor: "background.paper", 
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom sx={{ 
          display: 'flex',
          alignItems: 'center',
          color: 'rgb(251, 165, 24)',
          fontWeight: 'bold',
          mb: 3
        }}>
          <MusicNoteIcon sx={{ mr: 1, color: 'rgb(251, 165, 24)' }} /> New Sound
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ bgcolor: 'background.paper' }}
          />
          
          <TextField
            label="BPM"
            variant="outlined"
            type="number"
            fullWidth
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            required
            InputProps={{
              endAdornment: <InputAdornment position="end">BPM</InputAdornment>,
            }}
            sx={{ bgcolor: 'background.paper' }}
          />
          
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ bgcolor: 'background.paper' }}
          />
          
          <TextField
            label="Tags (separated by commas)"
            variant="outlined"
            fullWidth
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            sx={{ bgcolor: 'background.paper' }}
            placeholder="e.g. drums, bass, synth"
          />
          
          <Box sx={{ mt: 2 }}>
            <input
              accept="audio/*"
              style={{ display: 'none' }}
              id="upload-audio-file"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="upload-audio-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                sx={{ 
                  mb: 2,
                  color: 'rgb(251, 165, 24)',
                  borderColor: 'rgb(251, 165, 24)',
                  '&:hover': {
                    color: 'rgb(249, 203, 67)',
                    borderColor: 'rgb(249, 203, 67)',
                  }
                }}
              >
                Upload Sound File
              </Button>
            </label>
            {fileName && (
              <Typography variant="body2" sx={{ ml: 1, display: 'inline' }}>
                {fileName}
              </Typography>
            )}
          </Box>
          
          <Button 
            type="submit" 
            variant="contained" 
            size="large"
            sx={{ 
              mt: 2,
              py: 1.5,
              fontWeight: 'bold',
              bgcolor: 'rgb(251, 165, 24)',
              boxShadow: '0 4px 12px rgba(251, 165, 24, 0.3)',
              '&:hover': {
                bgcolor: 'rgb(249, 203, 67)',
                boxShadow: '0 6px 16px rgba(249, 203, 67, 0.45)',
              }
            }}
          >
            Save New Sound
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default AddSound;