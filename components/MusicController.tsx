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
      // Check if assets.music is a relative path or a data URL
      audio.src = assets.music;
      
      // If enabled, try to play immediately after source change
      if (uiConfig.musicEnabled) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.log("Autoplay blocked on source change, waiting for interaction.");
            });
        }
      }
    }
  }, [assets.music, uiConfig.musicEnabled]);

  // Gestion du Volume et Play/Pause
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = uiConfig.musicVolume;

        if (uiConfig.musicEnabled) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Autoplay blocked, we can't force it.
                    // But we keep state as enabled.
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
      className="absolute top-4 right-4 z-50 p-2 rounded-full bg-pink-primary text-white border-2 border-white/20 shadow-lg font-twk text-sm hover:scale-105 active:scale-95 transition-all w-12 h-12 flex items-center justify-center"
      aria-label="Toggle Music"
    >
      {uiConfig.musicEnabled ? 'ON' : 'OFF'}
    </button>
  );
};

export default MusicController;