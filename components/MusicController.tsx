
import React, { useEffect, useRef } from 'react';
import { useGameConfig } from '../context/GameConfigContext';

const MusicController: React.FC = () => {
  const { uiConfig, updateConfig, assets } = useGameConfig();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialisation et gestion de la source audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }

    const audio = audioRef.current;

    // Si la source a changé
    if (audio.src !== assets.music && assets.music) {
      audio.src = assets.music;
      
      // If enabled, try to play immediately after source change
      if (uiConfig.musicEnabled) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                console.log("Autoplay blocked on source change, waiting for interaction.");
            });
        }
      }
    }
  }, [assets.music, uiConfig.musicEnabled]);

  // Handle first interaction to trigger "autoplay" since browsers block audio without a gesture
  useEffect(() => {
    const startAudio = () => {
      if (audioRef.current && uiConfig.musicEnabled && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
      // Remove listeners once we've had one interaction
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
      window.removeEventListener('mousedown', startAudio);
      window.removeEventListener('keydown', startAudio);
    };

    window.addEventListener('click', startAudio);
    window.addEventListener('touchstart', startAudio);
    window.addEventListener('mousedown', startAudio);
    window.addEventListener('keydown', startAudio);

    return cleanup;
  }, [uiConfig.musicEnabled]);

  // Gestion du Volume et Play/Pause
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = uiConfig.musicVolume;

        if (uiConfig.musicEnabled) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Autoplay blocked, handled by the interaction listener
                });
            }
        } else {
            audioRef.current.pause();
        }
    }
  }, [uiConfig.musicVolume, uiConfig.musicEnabled]);

  const toggleMusic = () => {
    updateConfig('musicEnabled', !uiConfig.musicEnabled);
  };

  return (
    <button 
      onClick={toggleMusic}
      className="absolute top-4 right-4 z-50 px-4 h-12 rounded-none bg-pink-primary text-white border-2 border-white/20 shadow-lg font-twk text-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
      aria-label="Toggle Music"
    >
      {/* Sound Icon SVG */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {uiConfig.musicEnabled ? (
          <>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </>
        ) : (
          <>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </>
        )}
      </svg>
      <span>{uiConfig.musicEnabled ? 'ON' : 'OFF'}</span>
    </button>
  );
};

export default MusicController;
