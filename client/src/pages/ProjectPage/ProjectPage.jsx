import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./ProjectPage.css";
import Loading from "../../components/Loading/Loading";
import projectService from "../../services/project.service";
import MultitrackPlayer from "../../components/common/MultitrackPlayer";
import AddSoundModal from "../../components/common/AddSoundModal";
import { Button } from "@mui/material";
import { FaCodeBranch, FaPlus } from "react-icons/fa";
import SoundFamilyTree from "../../components/SoundFamilyTree/SoundFamilyTree";

function ProjectPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Get current user from token
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const userPayload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUser(userPayload);
      } catch (error) {
        console.error("Error parsing auth token:", error);
      }
    }
  }, []);

  const isCreatorOrMember = () => {
    if (!currentUser || !project) return false;

    // Check if the user is the creator
    const isCreator = project.creator?._id === currentUser._id;

    // Check if the user is a member (handling both object and string IDs)
    const isMember = project.members?.some((member) => {
      // Handle when member is an object with _id property
      if (typeof member === "object" && member?._id) {
        return member._id === currentUser._id;
      }
      // Handle when member is just an ID string
      return member === currentUser._id;
    });

    return isCreator || isMember;
  };

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

  const handleCollabClick = async () => {
    try {
      if (!currentUser) {
        // Redirect to login if no user is logged in
        navigate("/login");
        return;
      }

      // Extract sound IDs from the sound objects
      const soundIds = project.soundId?.map((sound) => sound._id) || [];

      // Get the original creator from the project
      const originalCreator = project.creator?._id;

      // Create a set of member IDs to avoid duplicates
      const memberIds = new Set();

      // Add current user as a member
      memberIds.add(currentUser._id);

      // Add existing members if any
      if (project.members && project.members.length > 0) {
        project.members.forEach((member) => {
          if (typeof member === "object" && member?._id) {
            memberIds.add(member._id);
          } else {
            memberIds.add(member);
          }
        });
      }

      // Create the related project - keeping the original creator
      const newProject = await projectService.createRelatedProject({
        title: `My version of ${project.title}`,
        description: `Collaboration on ${project.title}`,
        soundId: soundIds,
        masterSoundId: project.masterSoundId || project.soundId?.[0]?._id,
        creator: originalCreator, // Keep original creator
        isFork: true,
        parentProjectId: projectId,
        members: Array.from(memberIds), // Include current user in members
      });

      // Update the parent project with the child project reference
      try {
        await projectService.updateProject(projectId, {
          childProjectId: newProject._id,
        });
        console.log("Parent project updated with child reference");
      } catch (updateError) {
        console.error("Error updating parent project:", updateError);
      }

      navigate(`/projects/${newProject._id}`);
    } catch (error) {
      console.error("Error creating project:", error);
    }
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

  const handleDownloadAll = () => {
    // Open the download URL in a new tab/window
    window.open(projectService.downloadProjectSounds(projectId));
  };

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
        <div className="project-actions">
          {isCreatorOrMember() && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<FaPlus />}
              onClick={handleAddSound}
              className="add-sound-button"
              sx={{ marginTop: 2, marginRight: 2 }}
            >
              Add Sound ({inheritedBpm} BPM)
            </Button>
          )}

          {currentUser && currentUser._id !== project.creator?._id && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<FaCodeBranch />}
              onClick={handleCollabClick}
              className="collab-button"
              sx={{
                marginTop: 2,
                backgroundColor: "#FFB800",
                "&:hover": {
                  backgroundColor: "#FFA000",
                },
              }}
            >
              Collab
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleDownloadAll}
            sx={{
              marginTop: 2,
              backgroundColor: "#4CAF50",
              "&:hover": {
                backgroundColor: "#45a049",
              },
            }}
          >
            Download All Sounds (ZIP)
          </Button>
        </div>
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
