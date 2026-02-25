/**
 * HYDRODYNAMICIST #3 -- 1133. The Path of Least Resistance
 * "Water does not fight the obstacle. It hugs it and moves on."
 * INTERACTION: Draw a path around obstacles on a mountainside
 * STEALTH KBE: Adaptability -- non-confrontational strategy (K)
 *
 * COMPOSITOR: poetic_precision / Tide / work / knowing / draw / 1133
 */
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const OBSTACLES = [
  { x: 65, y: 40, r: 14, label: 'rock' },
  { x: 120, y: 70, r: 12, label: 'tree' },
  { x: 80, y: 100, r: 10, label: 'wall' },
];

export default function Hydrodynamicist_PathOfLeastResistance({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Tide',
        chrono: 'work',
        kbe: 'k',
        hook: 'draw',
        specimenSeed: 1133,
        isSeal: false,
      }}
      arrivalText="Water flowing down. Obstacles ahead."
      prompt="Water does not fight the obstacle. It hugs it and moves on. Do not argue with the rock. Go around."
      resonantText="Adaptability. You drew the path that water would choose. Around, not through. Under, not over. Non-confrontational strategy is the wisdom of the river."
      afterglowCoda="Flowed around."
      onComplete={onComplete}
    >
      {(verse) => <PathInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PathInteraction({ verse }: { verse: any }) {
  const [pathPoints, setPathPoints] = useState<{ x: number; y: number }[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [done, setDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getRelativePos = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const startDraw = useCallback((e: React.PointerEvent) => {
    if (done) return;
    setDrawing(true);
    setPathPoints([getRelativePos(e)]);
  }, [done, getRelativePos]);

  const moveDraw = useCallback((e: React.PointerEvent) => {
    if (!drawing || done) return;
    setPathPoints(prev => [...prev, getRelativePos(e)]);
  }, [drawing, done, getRelativePos]);

  const endDraw = useCallback(() => {
    if (!drawing || done) return;
    setDrawing(false);
    // Check if path reached bottom area and went around obstacles
    const reachedBottom = pathPoints.some(p => p.y > 120);
    const startedTop = pathPoints.some(p => p.y < 25);
    const hitObstacle = pathPoints.some(p =>
      OBSTACLES.some(o => {
        const dx = p.x - o.x;
        const dy = p.y - o.y;
        return Math.sqrt(dx * dx + dy * dy) < o.r;
      })
    );

    if (reachedBottom && startedTop && !hitObstacle) {
      setDone(true);
      setTimeout(() => verse.advance(), 2200);
    } else {
      // Reset for retry
      setTimeout(() => setPathPoints([]), 800);
    }
  }, [drawing, done, pathPoints, verse]);

  const pathD = pathPoints.length > 1
    ? `M ${pathPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`
    : '';

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Mountain scene */}
      <div
        ref={containerRef}
        onPointerDown={startDraw}
        onPointerMove={moveDraw}
        onPointerUp={endDraw}
        onPointerLeave={endDraw}
        style={{
          ...navicueStyles.heroCssScene(verse.palette, 180 / 140),
          cursor: done ? 'default' : 'crosshair',
          touchAction: 'none',
        }}
      >
        {/* Start zone */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 20,
          background: 'hsla(200, 30%, 50%, 0.05)',
          borderBottom: `1px dashed ${verse.palette.primaryGlow}`,
          opacity: 0.3,
        }} />
        <span style={{
          position: 'absolute', top: 3, left: 8,
          ...navicueStyles.annotation(verse.palette, 0.3),
        }}>source</span>

        {/* End zone */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 15,
          background: 'hsla(200, 30%, 50%, 0.05)',
          borderTop: `1px dashed ${verse.palette.primaryGlow}`,
          opacity: 0.3,
        }} />
        <span style={{
          position: 'absolute', bottom: 2, right: 8,
          ...navicueStyles.annotation(verse.palette, 0.3),
        }}>valley</span>

        {/* Obstacles */}
        {OBSTACLES.map((o, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: o.x - o.r, top: o.y - o.r,
            width: o.r * 2, height: o.r * 2,
            borderRadius: '50%',
            background: 'hsla(30, 20%, 35%, 0.2)',
            border: `1px solid ${verse.palette.primaryGlow}`,
            opacity: 0.4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.5 }}>
              {o.label}
            </span>
          </div>
        ))}

        {/* Drawn path */}
        {pathPoints.length > 1 && (
          <svg width={180} height={140} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            <path
              d={pathD}
              fill="none"
              stroke={done ? verse.palette.accent : 'hsla(200, 40%, 55%, 0.4)'}
              strokeWidth={done ? 2.5 : 2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Status */}
      {done ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          flowed around
        </motion.div>
      ) : (
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
          draw a path around the obstacles
        </span>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'adaptability' : 'find the path'}
      </div>
    </div>
  );
}