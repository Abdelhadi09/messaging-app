import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import pause from '../images/pause.png';
import play from '../images/play.png';

export default function VoiceMessage({ url }) {
  const containerRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState('0:00');

  useEffect(() => {
    // Init wavesurfer
    wavesurferRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#ffffff',
      progressColor:  '#f8b3e0',
      height: 40,
      barWidth: 4,
      responsive: true,
      cursorWidth: 0
    });

    wavesurferRef.current.load(url);

    wavesurferRef.current.on('ready', () => {
      const dur = wavesurferRef.current.getDuration();
      setDuration(formatTime(dur));
    });

    wavesurferRef.current.on('finish', () => setIsPlaying(false));

    return () => {
      try {
        wavesurferRef.current.destroy();
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
        // Ignore AbortError
      }
    };
  }, [url]);

  const togglePlay = () => {
    wavesurferRef.current.playPause();
    setIsPlaying(prev => !prev);
  };

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <div className="voice-msg">
      <button className="play-btn" onClick={togglePlay}>
        {isPlaying ? <img className='voice-icon' src={pause} /> : <img className='voice-icon' src={play} />}
      </button>
      <div ref={containerRef} className="waveform" />
      <span className="duration">{duration}</span>
    </div>
  );
}
