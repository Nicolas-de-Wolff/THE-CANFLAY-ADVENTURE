import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, PipeData } from '../types';
import { INITIAL_VELOCITY, WIN_SCORE, PIPE_WIDTH } from '../constants';
import { useGameConfig } from '../context/GameConfigContext';

// Images refs to hold loaded HTMLImageElements
interface GameImages {
  player: HTMLImageElement | null;
  pipe: HTMLImageElement | null;
}

const GameLoop: React.FC = () => {
  // 1. Récupération de la configuration dynamique
  const { configRef, assets, uiConfig } = useGameConfig();

  // UI State
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState<number>(0);
  const [email, setEmail] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Game Physics State (Refs for performance/mutability in loop)
  const birdY = useRef<number>(300);
  const velocity = useRef<number>(INITIAL_VELOCITY);
  const pipes = useRef<PipeData[]>([]);
  const frameCount = useRef<number>(0);
  
  // Asset Refs
  const images = useRef<GameImages>({ player: null, pipe: null });

  // Helper to check if an image is actually ready for canvas drawing
  const isImageReady = (img: HTMLImageElement | null): img is HTMLImageElement => {
    return !!(img && img.complete && img.naturalWidth > 0);
  };

  // Load Assets - Listen to context changes for dynamic updates (Mod Menu)
  useEffect(() => {
    // Player Image
    const playerImg = new Image();
    playerImg.src = assets.player; 
    playerImg.onerror = () => { 
        console.warn("Player image failed to load, using placeholder.");
        playerImg.src = 'https://picsum.photos/40/60'; 
    };
    
    // Pipe Image
    const pipeImg = new Image();
    pipeImg.src = assets.pipe; 
    pipeImg.onerror = () => {
        console.warn("Pipe image failed to load.");
    };

    images.current = { player: playerImg, pipe: pipeImg };
    
  }, [assets]);

  // Controls
  const jump = useCallback(() => {
    if (gameState === GameState.PLAYING) {
      velocity.current = configRef.current.lift; 
    } else if (gameState === GameState.START || gameState === GameState.GAME_OVER || gameState === GameState.WON) {
      resetGame();
      setGameState(GameState.PLAYING);
      velocity.current = configRef.current.lift;
    }
  }, [gameState, configRef]);

  // Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); 
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  // Game Reset
  const resetGame = () => {
    birdY.current = window.innerHeight / 3; 
    velocity.current = INITIAL_VELOCITY;
    pipes.current = [];
    frameCount.current = 0;
    setScore(0);
    setSubmitted(false);
    setEmail('');
  };

  /**
   * RENDERING HELPER: Fixed Aspect Ratio Pipe
   */
  const drawPipeObstacle = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    if (!isImageReady(img)) {
      ctx.fillStyle = 'rgba(255, 111, 143, 0.5)';
      ctx.fillRect(x, y, w, h);
      return;
    }

    const horizontalScale = w / img.width;
    const sourceHeightNeeded = h / horizontalScale;

    ctx.drawImage(
      img,
      0, 0,
      img.width, sourceHeightNeeded,
      x, y,
      w, h
    );
  };

  // Main Loop
  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions
    const width = canvas.width;
    const height = canvas.height;
    
    // Shortcut for physics config
    const cfg = configRef.current; 

    // Player horizontal position
    const birdX = width / 4;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (gameState === GameState.PLAYING) {
      // 1. Physics
      velocity.current += cfg.gravity; 
      birdY.current += velocity.current;

      // 2. Pipe Spawning
      frameCount.current++;
      if (frameCount.current % cfg.pipeSpawnRate === 0) { 
        const minPipeHeight = 100;
        const maxPipeHeight = height - cfg.pipeGap - minPipeHeight; 
        const randomHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1) + minPipeHeight);
        
        pipes.current.push({
          x: width,
          topHeight: randomHeight,
          passed: false
        });
      }

      // 3. Pipe Movement & Collision
      pipes.current.forEach(pipe => {
        pipe.x -= cfg.pipeSpeed; 

        // Collision Logic
        const birdHitWidth = 34; 
        const birdHitHeight = 52; 
        const birdLeft = birdX - birdHitWidth / 2;
        const birdRight = birdX + birdHitWidth / 2;
        const birdTop = birdY.current - birdHitHeight / 2;
        const birdBottom = birdY.current + birdHitHeight / 2;

        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + PIPE_WIDTH;

        // Check X overlap
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Check Y overlap
            if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + cfg.pipeGap) {
                setGameState(GameState.GAME_OVER);
            }
        }

        // Score Update
        if (!pipe.passed && birdLeft > pipeRight) {
          pipe.passed = true;
          setScore(prev => {
            const newScore = prev + 1;
            if (newScore >= WIN_SCORE) {
               setGameState(GameState.WON);
            }
            return newScore;
          });
        }
      });

      // Cleanup off-screen pipes
      pipes.current = pipes.current.filter(pipe => pipe.x + PIPE_WIDTH > -10);

      // Ground/Ceiling Collision
      if (birdY.current + 26 > height || birdY.current - 26 < 0) {
        setGameState(GameState.GAME_OVER);
      }
    } else {
        // Idle animation
        if (gameState === GameState.START) {
            birdY.current = height / 2 + Math.sin(Date.now() / 300) * 10;
        }
    }

    // 4. Drawing Pipes
    const pipeImg = images.current.pipe;
    const playerImg = images.current.player;
    
    pipes.current.forEach(pipe => {
      // Top Pipe
      ctx.save();
      ctx.translate(0, pipe.topHeight);
      ctx.scale(1, -1);
      drawPipeObstacle(ctx, pipeImg!, pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      ctx.restore();
      
      // Bottom Pipe
      drawPipeObstacle(ctx, pipeImg!, pipe.x, pipe.topHeight + cfg.pipeGap, PIPE_WIDTH, height - (pipe.topHeight + cfg.pipeGap));
    });

    // Draw Player (Can)
    if (isImageReady(playerImg)) {
      const pWidth = 40; 
      const pHeight = 58; 
      ctx.save();
      ctx.translate(birdX, birdY.current);
      // Rotation based on velocity
      const rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (velocity.current * 0.1)));
      ctx.rotate(rotation);
      ctx.drawImage(playerImg, -pWidth / 2, -pHeight / 2, pWidth, pHeight);
      ctx.restore();
    } else {
        // Fallback drawing
        ctx.fillStyle = '#FF476C';
        ctx.fillRect(birdX - 17, birdY.current - 26, 34, 52);
    }

    requestRef.current = requestAnimationFrame(loop);
  }, [gameState, configRef, isImageReady]); 

  // Init Loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [loop]);

  // Resize handler
  useEffect(() => {
     const resize = () => {
         if (canvasRef.current) {
             canvasRef.current.width = canvasRef.current.offsetWidth;
             canvasRef.current.height = canvasRef.current.offsetHeight;
             
             if (gameState === GameState.START) {
                 birdY.current = canvasRef.current.height / 2;
             }
         }
     };
     window.addEventListener('resize', resize);
     resize();
     return () => window.removeEventListener('resize', resize);
  }, [gameState]);

  // Dynamic Styles helpers
  const scoreStyle = {
    fontFamily: uiConfig.fontFamily,
    fontWeight: uiConfig.fontWeight,
    fontSize: `${uiConfig.scoreFontSize}px`
  };
  
  const uiStyle = {
    fontFamily: uiConfig.fontFamily,
    fontWeight: uiConfig.fontWeight,
    fontSize: `${uiConfig.uiFontSize}px`
  };

  const titleStyle = {
    fontFamily: uiConfig.fontFamily,
    fontWeight: uiConfig.fontWeight,
    fontSize: `${uiConfig.uiFontSize * 2}px`
  };

  const handleContestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      console.log("Contest submission:", email);
    }
  };

  return (
    <>
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full cursor-pointer touch-manipulation z-10 relative"
        onClick={jump}
        onTouchStart={jump}
      />
      
      {(gameState === GameState.PLAYING || gameState === GameState.GAME_OVER || gameState === GameState.WON) && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none text-center">
             <span className="text-bg-secondary drop-shadow-md" style={scoreStyle}>
                {score} / {WIN_SCORE}
             </span>
        </div>
      )}

      {gameState === GameState.START && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 pointer-events-none">
          <h1 className="text-bg-secondary mb-8 drop-shadow-lg uppercase" style={titleStyle}>VOLE</h1>
          <button 
             onClick={jump}
             className="pointer-events-auto btn-primary px-8 py-4 rounded-xl shadow-xl active:scale-95"
             style={uiStyle}
          >
            JOUER
          </button>
        </div>
      )}

      {gameState === GameState.GAME_OVER && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 pointer-events-auto">
          <div className="bg-bg-secondary p-8 rounded-2xl text-center shadow-2xl flex flex-col items-center">
             <h2 className="text-bg-primary mb-4 uppercase" style={titleStyle}>Perdu !</h2>
             <p className="text-bg-primary mb-6" style={uiStyle}>Score: {score} / {WIN_SCORE}</p>
             <button 
               onClick={jump} 
               className="btn-primary px-8 py-4 rounded-xl shadow-lg active:scale-95"
               style={uiStyle}
             >
                Rejouer
             </button>
          </div>
        </div>
      )}

      {gameState === GameState.WON && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-start bg-bg-secondary p-6 animate-fade-in text-center overflow-y-auto pt-12">
          <h2 className="text-bg-primary mb-2 uppercase" style={titleStyle}>Gagné !</h2>
          
          <img 
            src={assets.box} 
            alt="Box" 
            className="w-24 h-24 object-contain mb-4 animate-bounce shrink-0"
            onError={(e) => (e.currentTarget.src = 'https://picsum.photos/150/150')}
          />
          
          <p className="text-bg-primary mb-6 max-w-[80%] leading-relaxed" style={uiStyle}>
            La cannette est bien emballée
          </p>

          {/* CONCOURS SECTION */}
          <div className="w-full max-w-sm bg-white/50 border-2 border-pink-primary rounded-3xl p-6 mb-8 shadow-sm">
            <h3 className="text-pink-primary mb-2 uppercase tracking-tighter" style={{...titleStyle, fontSize: '32px'}}>CONCOURS</h3>
            <p className="text-bg-primary mb-4 leading-tight text-sm px-2" style={uiStyle}>
              Participe au tirage au sort pour gagner la gamme entière !
            </p>
            
            {!submitted ? (
              <form onSubmit={handleContestSubmit} className="flex flex-col gap-3">
                <input 
                  type="email" 
                  placeholder="Ton email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-bg-primary focus:outline-none focus:ring-2 focus:ring-pink-primary transition-all text-sm font-twk"
                />
                <button 
                  type="submit"
                  className="btn-primary w-full py-3 rounded-xl shadow-md active:scale-95 transition-all text-sm"
                >
                  ENVOYER
                </button>
              </form>
            ) : (
              <div className="py-4 animate-bounce">
                <p className="text-pink-primary font-bold uppercase" style={uiStyle}>Email envoyé !</p>
                <p className="text-xs text-bg-primary mt-1">Bonne chance !</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={jump} 
            className="btn-primary px-8 py-3 rounded-xl shadow-lg active:scale-95 transition-all opacity-80 shrink-0 mb-8"
            style={{...uiStyle, fontSize: '18px'}}
          >
            JOUER ENCORE
          </button>
        </div>
      )}
    </>
  );
};

export default GameLoop;