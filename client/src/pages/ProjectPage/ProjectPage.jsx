import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./ProjectPage.css";
import Loading from "../../components/Loading/Loading";
import projectService from "../../services/project.service";
import MultitrackPlayer from "../../components/common/MultitrackPlayer";
import AddSoundModal from "../../components/common/AddSoundModal";
import { Button } from "@mui/material";
import { FaPlus } from "react-icons/fa";

function ProjectPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchProject = async () => {
    try {
      const data = await projectService.getProject(projectId);
      setProject(data);
    } catch (error) {
      console.error("Error fetching project:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleAddSound = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSoundAdded = () => {
    // Refresh project data to get the new sound
    fetchProject();
  };

  if (isLoading)
    return (
      <div>
        <Loading />
      </div>
    );
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!project) return <div>Project not found</div>;

  // Get the BPM from the first sound (if it exists)
  const inheritedBpm = project.soundId?.[0]?.bpm || 120;

  return (
    <div className="project-page">
      <h1>{project.title}</h1>
      <div className="project-details">
        <p>{project.description}</p>
        <div className="project-creator">
          <p>Creator: {project.creator?.name || "Unknown"}</p>
          <p>Project BPM: {inheritedBpm}</p>
        </div>

        {project.members?.length > 0 && (
          <div className="project-members">
            <h3>Project Members</h3>
            <ul>
              {project.members.map((member) => (
                <li key={member._id}>{member.name}</li>
              ))}
            </ul>
          </div>
        )}
        <Button
          variant="contained"
          color="primary"
          startIcon={<FaPlus />}
          onClick={handleAddSound}
          className="add-sound-button"
          sx={{ marginTop: 2 }}
        >
          Add Sound ({inheritedBpm} BPM)
        </Button>
      </div>
      <div className="player-section">
        <MultitrackPlayer soundTracks={project.soundId} />

      </div>

      <AddSoundModal
        open={modalOpen}
        handleClose={handleCloseModal}
        projectId={projectId}
        inheritedBpm={inheritedBpm}
        onSoundAdded={handleSoundAdded}
      />
    </div>
  );
}

export default ProjectPage;
