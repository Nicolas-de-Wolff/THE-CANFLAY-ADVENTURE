import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { GameConfig, GameAssets } from '../types';
import { GRAVITY, LIFT, PIPE_SPEED, PIPE_SPAWN_RATE, PIPE_GAP, ASSETS } from '../constants';

// Définition du contexte
interface GameConfigContextType {
  configRef: React.MutableRefObject<GameConfig>; // Référence mutable pour la boucle de jeu (haute performance)
  assets: GameAssets; // État React pour les assets (déclenche le re-rendu)
  updateConfig: (key: keyof GameConfig, value: number | string | boolean) => void;
  updateAsset: (key: keyof GameAssets, file: File) => void;
  resetToDefaults: () => void;
  // Pour l'interface utilisateur du debug
  uiConfig: GameConfig; 
}

const GameConfigContext = createContext<GameConfigContextType | undefined>(undefined);

export const useGameConfig = () => {
  const context = useContext(GameConfigContext);
  if (!context) {
    throw new Error('useGameConfig must be used within a GameConfigProvider');
  }
  return context;
};

// Valeurs par défaut
const DEFAULT_CONFIG: GameConfig = {
  gravity: GRAVITY,
  lift: LIFT,
  pipeSpeed: PIPE_SPEED,
  pipeSpawnRate: PIPE_SPAWN_RATE,
  pipeGap: PIPE_GAP,
  // Font Defaults
  fontFamily: 'TWKBurns, sans-serif',
  fontWeight: '700',
  scoreFontSize: 60,
  uiFontSize: 24,
  // Audio Defaults
  musicVolume: 1.0, // Updated to 100% (1.0) as requested
  musicEnabled: true,
};

const DEFAULT_ASSETS: GameAssets = {
  player: ASSETS.images.player,
  pipe: ASSETS.images.pipe,
  background: ASSETS.images.background,
  box: ASSETS.images.box,
  music: ASSETS.music.bg,
};

export const GameConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Configuration Physique (Mutable Ref pour accès instantané dans la boucle)
  const configRef = useRef<GameConfig>({ ...DEFAULT_CONFIG });
  
  // État miroir pour l'UI React (Sliders)
  const [uiConfig, setUiConfig] = useState<GameConfig>({ ...DEFAULT_CONFIG });

  // 2. Assets (State car nécessite un rechargement d'image)
  const [assets, setAssets] = useState<GameAssets>({ ...DEFAULT_ASSETS });

  // Chargement depuis localStorage au montage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('canfly_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        const merged = { ...DEFAULT_CONFIG, ...parsed };
        configRef.current = merged;
        setUiConfig(merged);
      }

      const savedAssets = localStorage.getItem('canfly_assets');
      if (savedAssets) {
        const parsed = JSON.parse(savedAssets);
        setAssets({ ...DEFAULT_ASSETS, ...parsed });
      }
    } catch (e) {
      console.error("Erreur chargement sauvegarde:", e);
    }
  }, []);

  // Mise à jour de la configuration
  const updateConfig = (key: keyof GameConfig, value: number | string | boolean) => {
    // @ts-ignore - Dynamic key assignment
    configRef.current[key] = value;
    setUiConfig(prev => {
      const newConfig = { ...prev, [key]: value };
      localStorage.setItem('canfly_config', JSON.stringify(newConfig));
      return newConfig;
    });
  };

  // Mise à jour des assets (Upload)
  const updateAsset = (key: keyof GameAssets, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setAssets(prev => {
          const newAssets = { ...prev, [key]: result };
          // Sauvegarde locale (Attention à la taille limite 5MB)
          try {
            localStorage.setItem('canfly_assets', JSON.stringify(newAssets));
          } catch (err) {
            console.warn("Impossible de sauvegarder l'asset (trop lourd ?)", err);
          }
          return newAssets;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Réinitialisation
  const resetToDefaults = () => {
    configRef.current = { ...DEFAULT_CONFIG };
    setUiConfig({ ...DEFAULT_CONFIG });
    setAssets({ ...DEFAULT_ASSETS });
    localStorage.removeItem('canfly_config');
    localStorage.removeItem('canfly_assets');
  };

  return (
    <GameConfigContext.Provider value={{ configRef, assets, updateConfig, updateAsset, resetToDefaults, uiConfig }}>
      {children}
    </GameConfigContext.Provider>
  );
};