import { useRef, useEffect, useState, useCallback } from "react";
import Multitrack from "wavesurfer-multitrack";
import { useWavesurfer } from "@wavesurfer/react";
import {
  FaPlay,
  FaPause,
  FaStop,
  FaVolumeMute,
  FaVolumeUp,
  FaForward,
  FaBackward,
} from "react-icons/fa";
import { Slider } from "@mui/material";
import "./MultitrackPlayer.css";

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const MultitrackPlayer = ({ soundTracks, initialVolume = 0.7 }) => {
  const containerRef = useRef(null);
  const multitrackRef = useRef(null);
  const wavesurferRefs = useRef([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(20);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(initialVolume);
  const [volumeBeforeMute, setVolumeBeforeMute] = useState(initialVolume);
  const [muted, setMuted] = useState(false);
  const [trackVolumes, setTrackVolumes] = useState({});
  const [trackDurations, setTrackDurations] = useState([]);

  // Create a wavesurfer instance for each track to get its duration
  useEffect(() => {
    if (!soundTracks || soundTracks.length === 0) return;

    // Clean up any previous references
    wavesurferRefs.current = [];
    setTrackDurations([]);

    // For each sound track, create a hidden container and wavesurfer instance
    soundTracks.forEach((sound, index) => {
      const hiddenContainerRef = document.createElement("div");
      hiddenContainerRef.style.display = "none";
      document.body.appendChild(hiddenContainerRef);

      const options = {
        container: hiddenContainerRef,
        height: 80,
        waveColor: "rgb(249, 203, 67)",
        progressColor: "rgb(251, 165, 24)",
        url: sound.soundURL,
        normalize: true,
        cursorColor: "#333",
        barWidth: 2,
        barGap: 1,
        backgroundColor: "#424242",
      };

      // Create the wavesurfer instance
      import("wavesurfer.js").then((WaveSurfer) => {
        const wavesurfer = WaveSurfer.default.create(options);

        wavesurfer.on("ready", () => {
          const trackDuration = wavesurfer.getDuration();
          console.log(`Track ${sound._id} duration: ${trackDuration}`);

          setTrackDurations((prev) => {
            const newDurations = [...prev];
            newDurations[index] = trackDuration;

            // Once all tracks have reported durations, set the max duration
            if (
              newDurations.filter((d) => d !== undefined).length ===
              soundTracks.length
            ) {
              const maxDuration = Math.max(
                ...newDurations.filter((d) => !isNaN(d) && d !== undefined)
              );
              console.log("Setting max duration to:", maxDuration);
              setDuration(maxDuration);
            }

            return newDurations;
          });
        });

        wavesurferRefs.current[index] = wavesurfer;
      });

      // Clean up function to remove the hidden container
      return () => {
        if (wavesurferRefs.current[index]) {
          wavesurferRefs.current[index].destroy();
        }
        if (document.body.contains(hiddenContainerRef)) {
          document.body.removeChild(hiddenContainerRef);
        }
      };
    });
  }, [soundTracks]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Convert soundTracks to the format expected by Multitrack
    const tracks =
      soundTracks?.map((sound) => ({
        id: sound._id,
        url: sound.soundURL,
        draggable: true,
        startPosition: 0,
        volume: 0.8,
        options: {
          waveColor: "rgb(249, 203, 67)",
          progressColor: "rgb(251, 165, 24)",
          cursorColor: "#333",
          barWidth: 2,
          barGap: 1,
          backgroundColor: "#424242",
        },
        title: sound.title || "Untitled",
        creator: sound.creator?.name || "Unknown",
      })) || [];
    console.log("these are tracks ::", tracks);
    // Initialize multitrack player
    const multitrack = Multitrack.create(
      tracks.length > 0 ? tracks : [{ id: 0 }],
      {
        container: containerRef.current,
        minPxPerSec: zoom,
        rightButtonDrag: false,
        cursorWidth: 2,
        cursorColor: "#D72F21",
        trackBackground: "#424242",
        trackBorderColor: "#7C7C7C",
        dragBounds: true,
        envelopeOptions: {
          lineColor: "rgba(251, 165, 24, 0.7)",
          lineWidth: 3,
          dragPointSize: window.innerWidth < 600 ? 20 : 10,
          dragPointFill: "rgba(251, 165, 24, 0.8)",
          dragPointStroke: "rgba(255, 255, 255, 0.3)",
        },
      }
    );

    // Time update event for tracking playback position
    const timeUpdateInterval = setInterval(() => {
      if (multitrack && !multitrack.isPlaying()) return;
      setCurrentTime(multitrack.getCurrentTime());
    }, 250);

    // Set up event listeners
    multitrack.on("start-position-change", ({ id, startPosition }) => {
      console.log(`Track ${id} start position updated to ${startPosition}`);
    });

    multitrack.on("volume-change", ({ id, volume }) => {
      console.log(`Track ${id} volume updated to ${volume}`);
      setTrackVolumes((prev) => ({ ...prev, [id]: volume }));
    });

    multitrack.once("canplay", async () => {
      setIsReady(true);

      try {
        await multitrack.setSinkId("default");
      } catch (error) {
        console.error("Error setting audio output device:", error);
      }
    });

    multitrackRef.current = multitrack;

    // Cleanup on unmount
    return () => {
      clearInterval(timeUpdateInterval);
      if (multitrackRef.current) {
        multitrackRef.current.destroy();
      }
    };
  }, [soundTracks]);

  // Update zoom level when the zoom state changes
  useEffect(() => {
    if (multitrackRef.current) {
      multitrackRef.current.zoom(zoom);
    }
  }, [zoom]);

  const handlePlayPause = useCallback(() => {
    if (multitrackRef.current) {
      if (isPlaying) {
        multitrackRef.current.pause();
      } else {
        multitrackRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleStop = useCallback(() => {
    if (multitrackRef.current) {
      multitrackRef.current.stop();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, []);

  const handleForward = useCallback(() => {
    if (multitrackRef.current) {
      multitrackRef.current.setTime(
        multitrackRef.current.getCurrentTime() + 10
      );
    }
  }, []);

  const handleBackward = useCallback(() => {
    if (multitrackRef.current) {
      multitrackRef.current.setTime(
        multitrackRef.current.getCurrentTime() - 10
      );
    }
  }, []);

  const handleVolumeChange = useCallback((event, newValue) => {
    const newVolume = newValue / 100; // Convert from slider's 0-100 to volume's 0-1
    setVolume(newVolume);
    if (multitrackRef.current) {
      multitrackRef.current.setTrackVolume(0, newVolume);
      setMuted(newVolume === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    console.log(multitrackRef);
    if (!muted) {
      setVolumeBeforeMute(volume);
      setVolume(0);
      // multitrackRef.current.setMasterVolume(0);
    } else {
      setVolume(volumeBeforeMute);
      // multitrackRef.current.setMasterVolume(volumeBeforeMute);
    }
    setMuted(!muted);
  }, [muted, volume, volumeBeforeMute]);

  return (
    <div className="multitrack-player">
      <div className="names-and-tracks">
        <div className="track-list">
          {soundTracks?.map((track) => (
            <div key={track._id} className="track-info">
              <div className="track-title">{track.title || "Untitled"}</div>
              <div className="track-creator">
                {track.creator?.name || "Unknown"}
              </div>
              <div className="track-mute">





              
              </div>
            </div>
          ))}
        </div>
        <div className="multitrack-container-wrapper">
          <div
            ref={containerRef}
            className="multitrack-container"
            style={{
              background: "#424242",
              color: "#fff",
              minHeight: "300px",
              width: "100%",
            }}
          ></div>
        </div>
      </div>
      <div className="player-controls">
        <div className="time-and-controls">
          <div className="time-display">
            <span className="current-time">{formatTime(currentTime)}</span>
            <span className="duration"> / {formatTime(duration)}</span>
          </div>

          <div className="transport-controls">
            <button
              onClick={handleBackward}
              className="control-btn"
              aria-label="Backward 10s"
            >
              <FaBackward />
            </button>
            <button
              onClick={handlePlayPause}
              className="play-btn"
              disabled={!isReady}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button onClick={handleStop} className="stop-btn" aria-label="Stop">
              <FaStop />
            </button>
            <button
              onClick={handleForward}
              className="control-btn"
              aria-label="Forward 10s"
            >
              <FaForward />
            </button>
          </div>
        </div>

        <div className="volume-and-zoom">
          <div className="volume-control">
            <button
              onClick={toggleMute}
              className="mute-btn"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <Slider
              aria-label="Volume"
              value={volume * 100}
              onChange={handleVolumeChange}
              sx={{
                width: 100,
                color: "rgb(251, 165, 24)",
                "& .MuiSlider-thumb": {
                  backgroundColor: "rgb(251, 165, 24)",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultitrackPlayer;
