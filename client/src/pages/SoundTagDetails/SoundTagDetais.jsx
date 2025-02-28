import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AudioPlayer from "../../components/common/AudioPlayer";

const SERVER_URL =
  import.meta.env.REACT_APP_SERVER_URL || "http://localhost:5005";

export default function SoundTagDetails() {
  const [tag, setTag] = useState(null);
  const [sounds, setSounds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { tagId } = useParams();

  useEffect(() => {
    const getTagDetails = () => {
      setIsLoading(true);
      axios
        .get(`${SERVER_URL}/api/tags/${tagId}`)
        .then((response) => {
          setTag(response.data);
          // Assuming the API returns sounds with this tag in the response
          if (response.data.sound) {
            console.log("Sounds from API:", response.data.sound);
            setSounds(response.data.sound);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching tag details:", error);
          setIsLoading(false);
        });
    };

    getTagDetails();
  }, [tagId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="SoundTagDetails">
      <h2>{tag ? tag.name : "Tag Details"}</h2>
      {sounds.length > 0 ? (
        sounds.map((sound) => (
          <div key={sound._id} className="sound-item">
            <div className="sound-info">
              <p>TITLE: {sound.title}</p>
              <p>DESCRIPTION: {sound.description}</p>
              <p>{sound.bpm} BPM</p>
            </div>
            <AudioPlayer
              key={`player-${sound._id}`}
              audioUrl={sound.soundURL}
              title={sound.title}
              soundId={sound._id}
              height={90}
              tags={sound.tags}
            />
          </div>
        ))
      ) : (
        <p>No sounds found for this tag.</p>
      )}
    </div>
  );
}
