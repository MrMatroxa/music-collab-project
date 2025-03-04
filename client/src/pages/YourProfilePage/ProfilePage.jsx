import { useContext, useEffect, useState } from "react";
import "./ProfilePage.css";
import service from "../../services/file-upload.service";
import projectService from "../../services/project.service";
import Loading from "../../components/Loading/Loading";
import { AuthContext } from "../../context/auth.context";

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [sounds, setSounds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (user) {
      Promise.all([
        service.getSoundsByUser(user._id),
        projectService.getAllProjectsByUser(user._id),
      ])
        .then(([soundsData, projectsData]) => {
          console.log("Sounds data:", soundsData);
          console.log("Projects data:", projectsData);
          setSounds(soundsData);
          setProjects(projectsData);
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

      <h2>My Sounds:</h2>
      {isLoading ? (
        <Loading />
      ) : (
        sounds &&
        sounds.map((sound) => (
          <div key={sound._id} className="sound-item">
            {sound.title}
          </div>
        ))
      )}

      <h2>My Collabs:</h2>
      {isLoading ? (
        <Loading />
      ) : (
        projects &&
        projects.map((project) => (
          <div key={project._id} className="project-item">
            {project.title}
          </div>
        ))
      )}
    </>
  );
}

export default ProfilePage;
