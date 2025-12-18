// ⚙️ PHYSICS (USE EXACT VALUES)
export const GRAVITY = 1.2;    // Updated from 0.12 to 1.2 as requested
export const LIFT = -4.0;       // soft jump impulse
export const INITIAL_VELOCITY = 0;

// Game Rules
export const WIN_SCORE = 6;
export const PIPE_SPEED = 3.5; 
export const PIPE_SPAWN_RATE = 90; // Frames between pipes - Updated to 90 as requested
export const PIPE_GAP = 220; // Gap between top and bottom pipe
export const PIPE_WIDTH = 60;

// Assets Paths
// 🛠 MODDER NOTE: All assets below can be replaced in the Debug Menu at runtime.
// The URLs provided are the default high-quality assets for the GP Explorer theme.
export const ASSETS = {
  fonts: {
    // Remote Fonts - TWKBurns ExtraBold
    woff2: 'https://raw.githubusercontent.com/Nicolas-de-Wolff/canfly-assets/main/Fonts/twkburns-extrabold-webfont.woff2',
    woff: 'https://raw.githubusercontent.com/Nicolas-de-Wolff/canfly-assets/main/Fonts/twkburns-extrabold-webfont.woff',
  },
  images: {
    // The main character/player (Pink Can) - Editable in Mod Menu
    player: 'https://raw.githubusercontent.com/Nicolas-de-Wolff/canfly-assets/main/images/Canette_Rose.png',
    
    // The winning screen icon (Package) - Editable in Mod Menu
    box: 'https://raw.githubusercontent.com/Nicolas-de-Wolff/canfly-assets/main/images/package_2.png',
    
    // The static background - Editable in Mod Menu
    background: 'https://raw.githubusercontent.com/Nicolas-de-Wolff/canfly-assets/main/images/fond.png',
    
    // The obstacle (Pipe) - Editable in Mod Menu
    pipe: 'https://raw.githubusercontent.com/Nicolas-de-Wolff/canfly-assets/main/images/pipe.png', 
  },
  music: {
    // Background music loop (KronoMuzik GP Explorer) - Editable in Mod Menu
    bg: 'https://raw.githubusercontent.com/Nicolas-de-Wolff/canfly-assets/main/music/Musique%20comple%CC%80te%20GP%20Explorer%20-%20By%20%40KronoMuzik.mp3',
  }
};