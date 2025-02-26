import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useWavesurfer } from '@wavesurfer/react';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import './AudioPlayer.css'; // You'll need to create this file for styling
import { FaPlay, FaPause, FaStop, FaVolumeMute, FaVolumeUp } from "react-icons/fa";

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const AudioPlayer = ({ 
  audioUrl, 
  title, 
  soundId, 
  onReady, 
  initialVolume = 0.7, 
  showTimeline = true,
  waveColor = 'rgb(200, 0, 200)',
  progressColor = 'rgb(252, 17, 252)',
  height = 80,
  backgroundColor = '#f3f3f3',
  className = ''
}) => {
  const containerRef = useRef(null);
  const [duration, setDuration] = useState(null);
  const [volume, setVolume] = useState(initialVolume);
  const [muted, setMuted] = useState(false);
  
  // Create optional plugins based on props
  const plugins = useMemo(() => {
    const pluginsArray = [];
    if (showTimeline) {
      pluginsArray.push(Timeline.create());
    }
    return pluginsArray;
  }, [showTimeline]);
  
  // Initialize wavesurfer with our configuration
  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    height: height,
    waveColor: waveColor,
    progressColor: progressColor,
    url: audioUrl,
    plugins: plugins,
    normalize: true,
    cursorColor: '#333',
    barWidth: 2,
    barGap: 1,
    backgroundColor: backgroundColor
  });

  // Handle audio ready state
  useEffect(() => {
    if (wavesurfer) {
      const handleReady = () => {
        const audioDuration = wavesurfer.getDuration();
        setDuration(audioDuration);
        
        // Notify parent component if callback provided
        if (onReady && typeof onReady === 'function') {
          onReady(audioDuration);
        }
        
        // Set initial volume
        wavesurfer.setVolume(volume);
      };
      
      wavesurfer.on('ready', handleReady);
      
      return () => {
        wavesurfer.un('ready', handleReady);
      };
    }
  }, [wavesurfer, onReady, volume]);

  // Playback controls
  const onPlayPause = useCallback(() => {
    wavesurfer && wavesurfer.playPause();
  }, [wavesurfer]);

  const onStop = useCallback(() => {
    if (wavesurfer) {
      wavesurfer.stop();
    }
  }, [wavesurfer]);
  
  // Volume controls
  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (wavesurfer) {
      wavesurfer.setVolume(newVolume);
      setMuted(newVolume === 0);
    }
  }, [wavesurfer]);

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

  return (
    <div className={`audio-player ${className}`}>
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

        <div className="control-buttons">
          <button 
            onClick={onPlayPause} 
            className="play-pause-btn"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          
          <button 
            onClick={onStop} 
            className="stop-btn"
            aria-label="Stop"
          >
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
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="volume-slider"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;