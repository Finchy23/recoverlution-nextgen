/**
 * GAME DESIGNER #10 -- 1400. THE ATLAS SEAL (The Century Proof)
 * "You are the player. You are the pieces. You are the board."
 * INTERACTION: Observe -- fractal complexity from simple equation. The 14th century completes.
 * STEALTH KBE: Systemic Mastery -- century seal
 *
 * COMPOSITOR: science_x_soul / Cosmos / night / knowing / observe / 1400
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function GameDesigner_AtlasSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1400,
        isSeal: true,
      }}
      arrivalText="Infinite complexity."
      prompt="You are the player. You are the pieces. You are the board. Play well."
      resonantText="Systemic mastery. The 14th century is complete. From the infinite game to the god mode, from the incentive to the expansion pack, you have seen that every system is a game and every game can be redesigned. The Architect becomes the Sovereign. Specimen 1400. The century proof."
      afterglowCoda="Play well."
      onComplete={onComplete}
    >
      {(verse) => <AtlasSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function AtlasSealInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fractal renderer (simple Julia-like iteration)
  const drawFractal = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, depth: number) => {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    const maxR = Math.min(w, h) * 0.42;

    // Parse the accent color for drawing
    const accentHex = verse.palette.accent || '#8888ff';
    const r = parseInt(accentHex.slice(1, 3), 16) || 128;
    const g = parseInt(accentHex.slice(3, 5), 16) || 128;
    const b = parseInt(accentHex.slice(5, 7), 16) || 128;

    // Recursive branching fractal (simple, elegant)
    const drawBranch = (x: number, y: number, len: number, angle: number, d: number) => {
      if (d <= 0 || len < 2) return;
      const nx = x + Math.cos(angle) * len;
      const ny = y + Math.sin(angle) * len;
      const alpha = (d / depth) * 0.3;
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.lineWidth = d * 0.3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      const spread = 0.45 + (depth - d) * 0.05;
      drawBranch(nx, ny, len * 0.68, angle - spread, d - 1);
      drawBranch(nx, ny, len * 0.68, angle + spread, d - 1);
    };

    // Four cardinal directions from center
    const baseLen = maxR * 0.35;
    [(-Math.PI / 2), Math.PI / 2, 0, Math.PI].forEach((a, i) => {
      setTimeout(() => {
        drawBranch(cx, cy, baseLen, a, depth);
      }, i * 50);
    });

    // Center dot
    ctx.fillStyle = `rgba(${r},${g},${b},0.2)`;
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  }, [verse.palette.accent]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1500),
      setTimeout(() => setPhase(2), 4000),
      setTimeout(() => setPhase(3), 7000),
      setTimeout(() => setPhase(4), 10000),
      setTimeout(() => {
        setPhase(5);
        setTimeout(() => verse.advance(), 3500);
      }, 13000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [verse]);

  // Draw fractal when phase changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const depth = Math.min(phase + 2, 9);
    if (phase >= 1) {
      drawFractal(ctx, canvas.width, canvas.height, depth);
    }
  }, [phase, drawFractal]);

  const W = 260, H = 260;
  const CX = W / 2, CY = H / 2;

  return (
    <div style={navicueStyles.interactionContainer(12)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        {/* Fractal canvas */}
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: W, height: H,
          }}
        />

        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
          style={{ position: 'absolute', top: 0, left: 0 }}>

          {/* Equation label */}
          {phase >= 2 && (
            <motion.text x={CX} y={30} textAnchor="middle"
              fill={verse.palette.textFaint}
              style={{ fontSize: '8px', fontFamily: 'monospace' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}>
              z = z^2 + c
            </motion.text>
          )}

          {/* Seal rings */}
          {phase >= 3 && (
            <motion.circle
              cx={CX} cy={CY} r={100}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.5}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: safeOpacity(0.1), scale: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {phase >= 4 && (
            <motion.circle
              cx={CX} cy={CY} r={118}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.3}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.08) }}
              transition={{ duration: 1.5 }}
            />
          )}

          {/* Century markers */}
          {phase >= 4 && Array.from({ length: 14 }).map((_, i) => {
            const angle = (i / 14) * Math.PI * 2 - Math.PI / 2;
            const r = 108;
            return (
              <motion.g key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.08 }}
              >
                <circle
                  cx={CX + Math.cos(angle) * r}
                  cy={CY + Math.sin(angle) * r}
                  r={2}
                  fill={verse.palette.accent}
                  opacity={safeOpacity(i === 13 ? 0.4 : 0.15)}
                />
                <text
                  x={CX + Math.cos(angle) * (r + 10)}
                  y={CY + Math.sin(angle) * (r + 10) + 3}
                  textAnchor="middle"
                  fill={verse.palette.textFaint}
                  style={{ fontSize: '5px' }}
                  opacity={i === 13 ? 0.35 : 0.1}
                >
                  {(i + 1) * 100}
                </text>
              </motion.g>
            );
          })}

          {/* Status transition */}
          {phase >= 4 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <text x={CX} y={H - 35} textAnchor="middle"
                fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
                the architect
              </text>
              <text x={CX} y={H - 25} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '7px' }} opacity={0.15}>
                {'-->'}
              </text>
              <text x={CX} y={H - 15} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '8px' }} opacity={0.4}>
                the sovereign
              </text>
            </motion.g>
          )}

          {/* Phase text */}
          <motion.text
            x={CX} y={H - 3}
            textAnchor="middle"
            fill={phase >= 5 ? verse.palette.accent : verse.palette.textFaint}
            style={navicueType.hint}
            animate={{ opacity: 0.6 }}
          >
            {phase === 0 && 'infinite complexity'}
            {phase === 1 && 'from a simple equation'}
            {phase === 2 && 'branching. iterating.'}
            {phase === 3 && 'you are the player'}
            {phase === 4 && 'you are the pieces. you are the board.'}
            {phase >= 5 && 'systemic mastery'}
          </motion.text>
        </svg>
      </div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 5 ? 'the 14th century / specimen 1400' : 'observe'}
      </div>
    </div>
  );
}
