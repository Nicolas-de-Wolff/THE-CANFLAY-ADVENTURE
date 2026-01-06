import React from 'react';
import GameLoop from './components/GameLoop';
import MusicController from './components/MusicController';
import DebugMenu from './components/DebugMenu';
import { GameConfigProvider, useGameConfig } from './context/GameConfigContext';

// Composant interne pour utiliser le hook useGameConfig (car App est à l'extérieur du Provider)
const GameContainer: React.FC = () => {
  const { assets } = useGameConfig();

  return (
    <div className="game-container relative w-full h-full max-w-[440px] max-h-[956px] bg-bg-primary">
        
        {/* Background Image (Static) */}
        <img 
          src={assets.background} 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Global UI Elements */}
        <MusicController />
        
        {/* Debug Menu (Overlay) */}
        <DebugMenu />
        
        {/* Game Engine */}
        <GameLoop />
      
      </div>
  );
}

const App: React.FC = () => {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-neutral-900 overflow-hidden">
      {/* Provider enveloppant tout le jeu */}
      <GameConfigProvider>
        <GameContainer />
      </GameConfigProvider>
    </div>
  );
};

export default App;