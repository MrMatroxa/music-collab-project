import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./ProjectPage.css";
import Loading from "../../components/Loading/Loading";
import projectService from "../../services/project.service";
import MultitrackPlayer from "../../components/common/MultitrackPlayer";

function ProjectPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch project data
    const fetchProject = async () => {
      try {
        const data = await projectService.getProject(projectId);
        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (isLoading) return <div><Loading /></div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="project-page">
      <h1>{project.title}</h1>
      <div className="project-details">
        <p>{project.description}</p>
        {/* Add more project information as needed */}
        <div className="project-creator">
          <h3>Creator</h3>
          <p>{project.creator?.username || "Unknown"}</p>
        </div>
        
        {project.members?.length > 0 && (
          <div className="project-members">
            <h3>Project Members</h3>
            <ul>
              {project.members.map(member => (
                <li key={member._id}>{member.username}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <MultitrackPlayer soundTracks={project.soundId} />
    </div>
  );
}

export default ProjectPage;