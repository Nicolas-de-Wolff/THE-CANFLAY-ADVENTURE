export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  WON = 'WON'
}

export interface PipeData {
  x: number;
  topHeight: number;
  passed: boolean;
}

export interface GamePhysics {
  gravity: number;
  lift: number;
  velocity: number;
}

// Interfaces pour le mode Debug / Mod
export interface GameConfig {
  gravity: number;
  lift: number;
  pipeSpeed: number;
  pipeSpawnRate: number;
  pipeGap: number;
  // Design / Fonts
  fontFamily: string;
  fontWeight: string;
  scoreFontSize: number;
  uiFontSize: number;
  // Audio
  musicVolume: number;
  musicEnabled: boolean;
}

export interface GameAssets {
  player: string;
  pipe: string;
  background: string;
  box: string;
  music: string;
}