import { useEffect, useState } from "react";
import "./HomePage.css";
import service from "../../services/file-upload.service";
import AudioPlayer from "../../components/common/AudioPlayer";
import Loading from "../../components/Loading/Loading";

function HomePage() {
  const [sounds, setSounds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    service
      .getSounds()
      .then((data) => {
        console.log("All sounds data:", data);
        
        // Filter to only show master sounds
        const masterSounds = data.filter(sound => sound.isMasterSound);
        
        console.log("Master sounds:", masterSounds);
        setSounds(masterSounds);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  }, []);

  console.log("Sounds:", sounds);

  return (
    <div className="HomePage">
      <h2>Sounds</h2>
      {isLoading ? (
        <Loading />
      ) : sounds && sounds.length > 0 ? (
        sounds.map((sound) => (
          <div key={sound._id} className="sound-item">
            <AudioPlayer
              audioUrl={sound.soundURL}
              title={sound.title}
              soundId={sound._id}
              height={60}
              tags={sound.tags}
              creator={sound.creator}
              parentProjectId={sound.projectId}
            />
          </div>
        ))
      ) : (
        <p>No sounds available</p>
      )}
    </div>
  );
}

export default HomePage;