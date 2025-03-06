import { useContext, useEffect, useState } from "react";
import "./ProfilePage.css";
import projectService from "../../services/project.service";
import Loading from "../../components/Loading/Loading";
import { AuthContext } from "../../context/auth.context";
import { Link } from "react-router-dom";

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [myProjects, setMyProjects] = useState([]);
  const [collaboratingProjects, setCollaboratingProjects] = useState([]);

  useEffect(() => {
    if (user) {
      // Fetch all projects related to the user
      projectService
        .getAllProjectsByUser(user._id)
        .then((projectsData) => {
          console.log("Projects data:", projectsData);

          // Projects created by the user that are NOT forks
          const originalProjects = projectsData.filter(
            (project) => project.creator._id === user._id && !project.isFork
          );

          // Projects created by the user that ARE forks (collaborations they initiated)
          const userForks = projectsData.filter(
            (project) => project.creator._id === user._id && project.isFork
          );

          // Projects where the user is a member (collaborations they've been added to)
          const memberProjects = projectsData.filter((project) =>
            project.members.some((member) => member._id === user._id)
          );

          // Combine forks and member projects as "collaborations"
          const allCollaborations = [...userForks, ...memberProjects];

          setMyProjects(originalProjects);
          setCollaboratingProjects(allCollaborations);
          setIsLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setIsLoading(false);
        });
    }
  }, [user]);

  return (
    <>
      <div>
        <h1>Profile page</h1>
      </div>

      <h2>My Original Projects:</h2>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="projects-grid">
          {myProjects && myProjects.length > 0 ? (
            myProjects.map((project) => (
              <Link
                to={`/projects/${project._id}`}
                key={project._id}
                className="project-item"
              >
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.soundId?.length || 0} sounds</p>
                </div>
              </Link>
            ))
          ) : (
            <p>No original projects found</p>
          )}
        </div>
      )}

      <h2>My Collaborations:</h2>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="projects-grid">
          {collaboratingProjects && collaboratingProjects.length > 0 ? (
            collaboratingProjects.map((project) => (
              <Link
                to={`/projects/${project._id}`}
                key={project._id}
                className="project-item"
              >
                <div>
                  <h3>{project.title}</h3>
                  <p>
                    {project.isFork
                      ? "My version"
                      : `Collaboration with ${project.creator?.name}`}
                  </p>
                  <p>{project.soundId?.length || 0} sounds</p>
                </div>
              </Link>
            ))
          ) : (
            <p>No collaborations found</p>
          )}
        </div>
      )}
    </>
  );
}

export default ProfilePage;
