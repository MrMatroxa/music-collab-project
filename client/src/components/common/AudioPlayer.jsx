import { useState, useCallback, useRef, useEffect } from "react";
import { useWavesurfer } from "@wavesurfer/react";
import "./AudioPlayer.css"; // You'll need to create this file for styling
import {
  FaPlay,
  FaPause,
  FaStop,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import { Slider } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import service from "../../services/file-upload.service";
import projectService from "../../services/project.service";

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const AudioPlayer = ({
  audioUrl,
  title,
  soundId,
  initialVolume = 0.7,
  height = 80,
  className = "",
  tags = [],
  creator,
}) => {
  const containerRef = useRef(null);
  const [duration, setDuration] = useState(null);
  const [volume, setVolume] = useState(initialVolume);
  const [muted, setMuted] = useState(false);
  const playerRef = useRef(null); // Add this ref for the entire player component
  const [isFocused, setIsFocused] = useState(false);
  const [durationReported, setDurationReported] = useState(false);
  const navigate = useNavigate();

  // Initialize wavesurfer with our configuration
  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    height: height,
    waveColor: "rgb(249, 203, 67)",
    progressColor: "rgb(251, 165, 24)",
    url: audioUrl,
    normalize: true,
    cursorColor: "#333",
    barWidth: 2,
    barGap: 1,
    backgroundColor: "#424242",
  });

  // Function to handle project creation and navigation
  const handleCollabClick = async () => {
    try {
      const newProject = await projectService.createProject({
        title: `Collab Project for ${title}`,
        soundId: [soundId],
        creator: creator._id,
      });
      navigate(`/projects/${newProject._id}`);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // Handle duration updates
  const handleDurationReady = useCallback(
    (soundId, duration) => {
      if (!durationReported && duration > 0) {
        service
          .updateSound(soundId, { duration })
          .then((updatedSound) => {
            console.log("Updated sound with duration:", updatedSound);
            setDurationReported(true);
          })
          .catch((err) => console.log(err));
      }
    },
    [durationReported]
  );

  // Handle audio ready state
  useEffect(() => {
    if (wavesurfer) {
      const handleReady = () => {
        const audioDuration = wavesurfer.getDuration();
        setDuration(audioDuration);

        // Update duration in database
        if (audioDuration > 0) {
          handleDurationReady(soundId, audioDuration);
        }

        // Set initial volume
        wavesurfer.setVolume(volume);
      };

      wavesurfer.on("ready", handleReady);

      // If wavesurfer is already ready when this effect runs
      if (wavesurfer.isReady) {
        handleReady();
      }

      return () => {
        wavesurfer.un("ready", handleReady);
      };
    }
  }, [wavesurfer, volume, soundId, handleDurationReady]);

  // Playback controls
  const onPlayPause = useCallback(() => {
    wavesurfer && wavesurfer.playPause();
  }, [wavesurfer]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle space bar if this player is focused
      if (e.code === "Space" && isFocused) {
        e.preventDefault(); // Prevent page scrolling
        onPlayPause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onPlayPause, isFocused]);

  const onStop = useCallback(() => {
    if (wavesurfer) {
      wavesurfer.stop();
    }
  }, [wavesurfer]);

  // Volume controls
  const handleVolumeChange = useCallback(
    (event, newValue) => {
      const newVolume = newValue / 100; // Convert from slider's 0-100 to volume's 0-1
      setVolume(newVolume);
      if (wavesurfer) {
        wavesurfer.setVolume(newVolume);
        setMuted(newVolume === 0);
      }
    },
    [wavesurfer]
  );

  const toggleMute = useCallback(() => {
    if (wavesurfer) {
      if (muted) {
        wavesurfer.setVolume(volume || 0.7);
      } else {
        wavesurfer.setVolume(0);
      }
      setMuted(!muted);
    }
  }, [wavesurfer, muted, volume]);

  useEffect(() => {
    const handleResize = () => {
      if (playerRef.current) {
        if (playerRef.current.offsetWidth < 768) {
          playerRef.current.classList.add("small-width");
        } else {
          playerRef.current.classList.remove("small-width");
        }
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className={`audio-player ${className}`}
      ref={playerRef}
      tabIndex={0} // Make the div focusable
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
   
     
      <div className="waveform-container">
        <div ref={containerRef} id={`waveform-${soundId}`} />
      </div>
      

      <div className="audio-controls">
        <div className="audio-info">
          {title && <h4 className="track-title">{title}</h4>}
          <div className="time-display">
            <span className="current-time">{formatTime(currentTime)}</span>
            <span className="duration"> / {formatTime(duration)}</span>
          </div>
        </div>

        <div className="buttons-and-slider">
          <div className="control-buttons">
            <button
              onClick={onPlayPause}
              className="play-pause-btn"
              aria-label={isPlaying ? "Pause" : "Play"}
              >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button onClick={onStop} className="stop-btn" aria-label="Stop">
              <FaStop />
            </button>
            <div className="volume-control">
              <button
                onClick={toggleMute}
                className="mute-btn"
                aria-label={muted ? "Unmute" : "Mute"}
                >
                {muted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
            </div>
          </div>
          <div className="volume-slider">
            <Slider
              aria-label="Volume"
              value={volume * 100}
              onChange={handleVolumeChange}
              sx={(t) => ({
                color: "rgba(0,0,0,0.87)",
                "& .MuiSlider-track": {
                  border: "none",
                },
                "& .MuiSlider-thumb": {
                  width: 15,
                  height: 15,
                  backgroundColor: "rgb(251, 165, 24)",
                  "&::before": {
                    boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
                  },
                  "&:hover, &.Mui-focusVisible, &.Mui-active": {
                    boxShadow: "none",
                  },
                },
                ...t.applyStyles("light", {
                  color: "rgb(251, 165, 24)",
                }),
              })}
              />
          </div>
        </div>
      </div>
      <div className="tags-container flex flex-wrap gap-2">
              {creator && <div className="creator-info">Created by: {creator.name}</div>} 
        {console.log("Rendering tags for", title, ":", tags)}
        {tags &&
          tags.length > 0 &&
          tags.map((tag) => (
            <Link
              key={tag._id}
              to={`/sounds/tags/${tag._id}`}
              className="tag-link bg-yellow-500 text-white text-center px-1.5 py-0.2 rounded-xs hover:bg-yellow-600 transition-colors duration-300"
            >
              {tag.name}
            </Link>
          ))}
      </div>
      <button className="collab" onClick={handleCollabClick}>Collab</button>
    </div>
  );
};

export default AudioPlayer;
