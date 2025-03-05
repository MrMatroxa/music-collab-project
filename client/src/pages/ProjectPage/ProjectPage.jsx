import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./ProjectPage.css";
import Loading from "../../components/Loading/Loading";
import projectService from "../../services/project.service";
import MultitrackPlayer from "../../components/common/MultitrackPlayer";
import AddSoundModal from "../../components/common/AddSoundModal";
import { Button } from "@mui/material";
import { FaPlus } from "react-icons/fa";
import SoundFamilyTree from "../../components/SoundFamilyTree/SoundFamilyTree";

function ProjectPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [relatedProjects, setRelatedProjects] = useState([]);

  // Keep this as a backup simple fetch function
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

  // Move this function outside the useEffect
  const fetchProjectFamily = async () => {
    setIsLoading(true);
    try {
      // Get the current project
      const projectData = await projectService.getProject(projectId);
      setProject(projectData);

      // Find the master sound ID - either directly on this project or from its related info
      const masterSoundId =
        projectData.masterSoundId || projectData.soundId?.[0]?._id;

      if (masterSoundId) {
        try {
          console.log(
            "Fetching related projects for masterSoundId:",
            masterSoundId
          );
          const related = await projectService.getRelatedProjects(
            masterSoundId
          );
          console.log("Related projects response:", related);

          // Filter out the current project from related projects
          const filteredRelated = related.filter((p) => p._id !== projectId);
          console.log("Filtered related projects:", filteredRelated);

          setRelatedProjects(filteredRelated);
        } catch (relatedError) {
          console.error("Error fetching related projects:", relatedError);
          setRelatedProjects([]);
        }
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectFamily();
  }, [projectId]);

  const handleAddSound = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSoundAdded = () => {
    // Now fetchProjectFamily is in scope
    fetchProjectFamily();
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

      {/* Show family tree if there are related projects */}
      {relatedProjects && relatedProjects.length > 0 && (
        <SoundFamilyTree
          originalProject={project}
          relatedProjects={relatedProjects}
        />
      )}

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
