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

  const handleDurationReady = (soundId, duration) => {
    // Only update in the database if needed
    service.updateSound(soundId, { duration })
      .then((updatedSound) => {
        console.log("Updated sound with duration:", updatedSound);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="HomePage">
      <h2>Sounds</h2>
      {sounds &&
        sounds.map((sound) => (
          <div key={sound._id} className="sound-item">
            <div className="sound-info">
              <p>TITLE {sound.title}</p>
              <p>DESCRIPTION {sound.description}</p>
              <p>{sound.bpm} BPM</p>
            </div>
            
            <AudioPlayer 
              audioUrl={sound.soundURL} 
              title={sound.title}
              soundId={sound._id}
              onReady={(duration) => handleDurationReady(sound._id, duration)}
              // Optional customization props
              waveColor="#6495ED"
              progressColor="#4169E1"
              height={90}
            />
          </div>
        ))}
    </div>
  );
}

export default HomePage;