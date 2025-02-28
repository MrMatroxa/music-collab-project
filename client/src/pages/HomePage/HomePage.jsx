import { useEffect, useState } from "react";
import "./HomePage.css";
import service from "../../services/file-upload.service";
import AudioPlayer from "../../components/common/AudioPlayer";

function HomePage() {
  const [sounds, setSounds] = useState([]);

  useEffect(() => {
    service
      .getSounds()
      .then((data) => {
        console.log("dataaaa:::::", data);
        setSounds(data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="HomePage">
      <h2>Sounds</h2>
      {sounds &&
        sounds.map((sound) => (
          <div key={sound._id} className="sound-item">
            
            <AudioPlayer 
              audioUrl={sound.soundURL} 
              title={sound.title}
              soundId={sound._id}
              height={60}
              tags={sound.tags}
            />
          </div>
        ))}
    </div>
  );
}

export default HomePage;