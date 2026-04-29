import React, { useEffect, useRef } from 'react';
import { Game } from '../game/Game';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use a fixed logical size to maintain aspect ratio
    const width = 800;
    const height = 600;
    canvas.width = width;
    canvas.height = height;

    const game = new Game();

    let lastTime = 0;
    let animationFrameId: number;

    const gameLoop = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      
      // Calculate delta time in seconds, cap at 0.1s to prevent huge jumps on lag
      let dt = (timestamp - lastTime) / 1000;
      if (dt > 0.1) dt = 0.1; 
      lastTime = timestamp;

      // Update game state
      game.update(dt);

      // Clear and draw
      ctx.clearRect(0, 0, width, height);
      game.draw(ctx);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#0a0a0c] text-[#e0e0e0] font-mono flex flex-col md:flex-row overflow-hidden lg:border-4 lg:border-[#1a1a1f] box-border">
      {/* Sidebar matching the design aesthetic */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#2d2d35] bg-[#0f0f12] flex flex-col p-6">
        <div className="mb-8">
          <h1 className="text-xs uppercase tracking-[0.2em] text-[#636370] mb-2">The First Mission of</h1>
          <div className="text-xl font-bold text-cyan-500 italic uppercase">Agent P</div>
        </div>
        
        <div className="mt-auto pt-6 border-t border-[#2d2d35] text-[9px] sm:text-[10px] text-[#555561] leading-relaxed">
          <p>MOVEMENT: [WASD] or [ARROWS]</p>
          <p>ENGAGE: [SPACEBAR]</p>
          <p className="mt-2 text-cyan-500/50">ALPHA BUILD - SIMULATION ACTIVE</p>
        </div>
      </div>

      {/* Main Content Area matching the design aesthetic */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#050507] p-4 sm:p-8 relative">
        <div className="relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <canvas
            ref={canvasRef}
            className="bg-[#0d0d12] border border-[#2d2d35] block max-w-full h-auto"
            style={{ width: '800px', height: '600px', imageRendering: 'pixelated' }}
            width={800}
            height={600}
          />
          {/* Corner decorations from design */}
          <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-500/30"></div>
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-500/30"></div>
        </div>
      </div>
    </div>
  );
}
