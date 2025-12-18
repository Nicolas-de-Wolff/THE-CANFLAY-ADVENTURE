import React, { useState } from 'react';
import { useGameConfig } from '../context/GameConfigContext';

const DebugMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { uiConfig, updateConfig, assets, updateAsset, resetToDefaults } = useGameConfig();

  // Gestionnaire pour l'upload d'images et audio
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof assets) => {
    if (e.target.files && e.target.files[0]) {
      updateAsset(key, e.target.files[0]);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded shadow-lg opacity-50 hover:opacity-100 text-xs font-mono"
      >
        ⚙️ DEBUG
      </button>
    );
  }

  return (
    <div className="absolute top-0 left-0 h-full w-full sm:w-80 bg-black/90 text-white z-50 p-4 overflow-y-auto font-mono text-xs shadow-2xl border-r border-pink-500">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
        <h2 className="text-xl font-bold text-pink-500">🛠 MOD MENU</h2>
        <button onClick={() => setIsOpen(false)} className="text-red-400 font-bold text-lg">✕</button>
      </div>

      {/* 1. SECTION GAMEPLAY */}
      <div className="mb-6">
        <h3 className="text-pink-300 font-bold mb-3 uppercase border-b border-gray-700 pb-1">⚡️ Gameplay</h3>
        
        {/* GRAVITY */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">Gravité: <span className="text-white">{uiConfig.gravity.toFixed(3)}</span></label>
          <input 
            type="range" min="0.05" max="0.5" step="0.01"
            value={uiConfig.gravity}
            onChange={(e) => updateConfig('gravity', parseFloat(e.target.value))}
            className="w-full accent-pink-500"
          />
        </div>

        {/* LIFT (JUMP FORCE) */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">Force Saut: <span className="text-white">{uiConfig.lift.toFixed(1)}</span></label>
          <input 
            type="range" min="-10" max="-1" step="0.1"
            value={uiConfig.lift}
            onChange={(e) => updateConfig('lift', parseFloat(e.target.value))}
            className="w-full accent-pink-500"
          />
        </div>

        {/* PIPE SPEED */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">Vitesse Défilement: <span className="text-white">{uiConfig.pipeSpeed.toFixed(1)}</span></label>
          <input 
            type="range" min="1" max="10" step="0.5"
            value={uiConfig.pipeSpeed}
            onChange={(e) => updateConfig('pipeSpeed', parseFloat(e.target.value))}
            className="w-full accent-pink-500"
          />
        </div>

        {/* PIPE GAP (VERTICAL) */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">Écart Vertical (Gap): <span className="text-white">{uiConfig.pipeGap}</span></label>
          <input 
            type="range" min="100" max="400" step="10"
            value={uiConfig.pipeGap}
            onChange={(e) => updateConfig('pipeGap', parseInt(e.target.value))}
            className="w-full accent-pink-500"
          />
        </div>

        {/* PIPE SPAWN RATE (HORIZONTAL SPACE) */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">Écart Horizontal: <span className="text-white">{uiConfig.pipeSpawnRate} frames</span></label>
          <input 
            type="range" min="60" max="400" step="10"
            value={uiConfig.pipeSpawnRate}
            onChange={(e) => updateConfig('pipeSpawnRate', parseInt(e.target.value))}
            className="w-full accent-pink-500"
          />
          <span className="text-[10px] text-gray-500 italic mt-1 block">Plus la valeur est grande, plus l'espace horizontal est grand.</span>
        </div>
      </div>

      {/* 2. SECTION DESIGN & FONTS */}
      <div className="mb-6">
        <h3 className="text-pink-300 font-bold mb-3 uppercase border-b border-gray-700 pb-1">🎨 Design & Fonts</h3>

        {/* FONT FAMILY */}
        <div className="mb-4">
            <label className="block mb-1 text-gray-400">Font Family</label>
            <input 
                type="text" 
                value={uiConfig.fontFamily}
                onChange={(e) => updateConfig('fontFamily', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
                placeholder="Ex: Arial, 'Courier New'..."
            />
            <div className="flex gap-2 mt-2">
                <button onClick={() => updateConfig('fontFamily', 'TWKBurns, sans-serif')} className="bg-pink-900 px-2 py-1 rounded hover:bg-pink-700">TWK</button>
                <button onClick={() => updateConfig('fontFamily', 'Arial, sans-serif')} className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600">Arial</button>
                <button onClick={() => updateConfig('fontFamily', 'Courier New, monospace')} className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600">Mono</button>
            </div>
        </div>

        {/* FONT WEIGHT */}
        <div className="mb-4">
            <label className="block mb-1 text-gray-400">Font Weight: <span className="text-white">{uiConfig.fontWeight}</span></label>
            <input 
                type="range" min="100" max="900" step="100"
                value={parseInt(uiConfig.fontWeight)}
                onChange={(e) => updateConfig('fontWeight', e.target.value)}
                className="w-full accent-pink-500"
            />
        </div>

        {/* FONT SIZES */}
        <div className="grid grid-cols-2 gap-2 mb-4">
             <div>
                <label className="block mb-1 text-gray-400">Taille Score</label>
                <input 
                    type="number" 
                    value={uiConfig.scoreFontSize}
                    onChange={(e) => updateConfig('scoreFontSize', parseInt(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1"
                />
             </div>
             <div>
                <label className="block mb-1 text-gray-400">Taille UI</label>
                <input 
                    type="number" 
                    value={uiConfig.uiFontSize}
                    onChange={(e) => updateConfig('uiFontSize', parseInt(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1"
                />
             </div>
        </div>
      </div>

      {/* 3. SECTION AUDIO */}
      <div className="mb-6">
        <h3 className="text-pink-300 font-bold mb-3 uppercase border-b border-gray-700 pb-1">🎵 Audio</h3>

        {/* MUSIC ENABLED */}
        <div className="mb-4 flex items-center justify-between">
            <label className="text-gray-400">Musique Active</label>
            <input 
                type="checkbox"
                checked={uiConfig.musicEnabled}
                onChange={(e) => updateConfig('musicEnabled', e.target.checked)}
                className="accent-pink-500 h-4 w-4"
            />
        </div>

        {/* VOLUME */}
        <div className="mb-4">
            <label className="block mb-1 text-gray-400">Volume: <span className="text-white">{Math.round(uiConfig.musicVolume * 100)}%</span></label>
            <input 
                type="range" min="0" max="1" step="0.05"
                value={uiConfig.musicVolume}
                onChange={(e) => updateConfig('musicVolume', parseFloat(e.target.value))}
                className="w-full accent-pink-500"
            />
        </div>

        {/* AUDIO FILE */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">Fichier Audio (.mp3, .wav)</label>
          <input 
            type="file" accept="audio/mpeg, audio/wav, audio/mp3"
            onChange={(e) => handleFileChange(e, 'music')}
            className="block w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-pink-900 file:text-pink-300 hover:file:bg-pink-800"
          />
        </div>
      </div>

      {/* 4. SECTION ASSETS */}
      <div className="mb-6">
        <h3 className="text-pink-300 font-bold mb-3 uppercase border-b border-gray-700 pb-1">📦 Images</h3>
        
        {/* PLAYER IMAGE */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">Joueur (Canette)</label>
          <input 
            type="file" accept="image/png, image/jpeg"
            onChange={(e) => handleFileChange(e, 'player')}
            className="block w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-pink-900 file:text-pink-300 hover:file:bg-pink-800"
          />
          {assets.player && <img src={assets.player} className="h-8 mt-2 border border-gray-600 rounded" alt="preview"/>}
        </div>

        {/* PIPE IMAGE */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">Obstacle (Tuyau)</label>
          <input 
            type="file" accept="image/png, image/jpeg"
            onChange={(e) => handleFileChange(e, 'pipe')}
            className="block w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-pink-900 file:text-pink-300 hover:file:bg-pink-800"
          />
          {assets.pipe && <img src={assets.pipe} className="h-8 mt-2 border border-gray-600 rounded" alt="preview"/>}
        </div>

        {/* BACKGROUND IMAGE */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">Arrière-plan</label>
          <input 
            type="file" accept="image/png, image/jpeg"
            onChange={(e) => handleFileChange(e, 'background')}
            className="block w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-pink-900 file:text-pink-300 hover:file:bg-pink-800"
          />
          {assets.background && <img src={assets.background} className="h-8 mt-2 border border-gray-600 rounded" alt="preview"/>}
        </div>

        {/* BOX IMAGE */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">Colis (Écran Gagné)</label>
          <input 
            type="file" accept="image/png, image/jpeg"
            onChange={(e) => handleFileChange(e, 'box')}
            className="block w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-pink-900 file:text-pink-300 hover:file:bg-pink-800"
          />
          {assets.box && <img src={assets.box} className="h-8 mt-2 border border-gray-600 rounded" alt="preview"/>}
        </div>
      </div>

      {/* 5. RESET */}
      <div className="pt-4 border-t border-gray-700 pb-16">
        <button 
          onClick={resetToDefaults}
          className="w-full bg-red-900/50 hover:bg-red-700 text-red-200 py-2 rounded text-xs font-bold uppercase transition-colors"
        >
          ♻️ Réinitialiser tout
        </button>
        <div className="text-center text-gray-600 mt-2 text-[10px]">
          Sauvegarde auto
        </div>
      </div>
    </div>
  );
};

export default DebugMenu;