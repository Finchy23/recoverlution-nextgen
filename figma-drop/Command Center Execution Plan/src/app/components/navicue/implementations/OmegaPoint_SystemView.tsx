/**
 * OMEGA POINT #5 — The System View
 * "Stop fixing the part. Fix the interaction between the parts."
 * INTERACTION: Start zoomed into a single tree. Each tap zooms out —
 * tree → forest → biosphere → interconnected system. Lines emerge
 * between all elements showing circular causality.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ZOOM_LEVELS = [
  { label: 'A tree.', scale: 4 },
  { label: 'A grove.', scale: 2.8 },
  { label: 'A forest.', scale: 1.8 },
  { label: 'The biosphere.', scale: 1.1 },
  { label: 'The system.', scale: 1 },
];

export default function OmegaPoint_SystemView({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [zoom, setZoom] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const pullBack = () => {
    if (stage !== 'active' || zoom >= ZOOM_LEVELS.length - 1) return;
    const next = zoom + 1;
    setZoom(next);
    if (next >= ZOOM_LEVELS.length - 1) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const t = zoom / (ZOOM_LEVELS.length - 1);
  const currentScale = ZOOM_LEVELS[zoom].scale;
  const treesVisible = Math.min(Math.floor(1 + zoom * 3), 12);

  // Tree positions in a "biosphere" layout
  const TREE_POSITIONS = [
    { x: 100, y: 80 }, // central tree
    { x: 60, y: 95 }, { x: 140, y: 90 },
    { x: 35, y: 75 }, { x: 165, y: 78 },
    { x: 80, y: 55 }, { x: 120, y: 60 },
    { x: 50, y: 110 }, { x: 150, y: 115 },
    { x: 25, y: 95 }, { x: 175, y: 100 },
    { x: 100, y: 120 },
  ];

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Focus narrows...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Stop fixing the part. Fix the interaction between the parts.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to pull back</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={pullBack}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: zoom >= ZOOM_LEVELS.length - 1 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '150px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(200, 10%, 7%, 0.25)' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 150" style={{ position: 'absolute', inset: 0 }}>
                <motion.g
                  animate={{ scale: 1 / currentScale }}
                  style={{ transformOrigin: '100px 85px' }}
                  transition={{ type: 'spring', stiffness: 60, damping: 15 }}>
                  {/* Connection lines — appear at forest level */}
                  {t > 0.4 && TREE_POSITIONS.slice(0, treesVisible).map((pos, i) =>
                    TREE_POSITIONS.slice(0, treesVisible).map((pos2, j) => {
                      if (j <= i) return null;
                      const dist = Math.hypot(pos.x - pos2.x, pos.y - pos2.y);
                      if (dist > 70) return null;
                      return (
                        <motion.line key={`c${i}-${j}`}
                          x1={pos.x} y1={pos.y} x2={pos2.x} y2={pos2.y}
                          stroke={`hsla(120, 25%, 40%, ${(t - 0.4) * 0.12})`}
                          strokeWidth="0.5" strokeDasharray="2 4"
                          initial={{ opacity: 0 }} animate={{ opacity: (t - 0.4) * 0.15 }}
                        />
                      );
                    })
                  )}
                  {/* Circular causality arrows — appear at system view */}
                  {t >= 1 && (
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ duration: 1.5 }}>
                      <ellipse cx="100" cy="85" rx="70" ry="35" fill="none"
                        stroke="hsla(120, 30%, 45%, 0.1)" strokeWidth="0.8" strokeDasharray="4 8"
                        markerEnd="url(#arrowGreen)" />
                    </motion.g>
                  )}
                  {/* Trees */}
                  {TREE_POSITIONS.slice(0, treesVisible).map((pos, i) => (
                    <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: i * 0.05, duration: 0.5 }}>
                      {/* Trunk */}
                      <rect x={pos.x - 1.5} y={pos.y - 2} width="3" height={10 + (i === 0 ? 4 : 0)} rx="1"
                        fill={`hsla(25, 20%, ${25 + i * 2}%, 0.3)`} />
                      {/* Canopy */}
                      <circle cx={pos.x} cy={pos.y - 8} r={5 + (i === 0 ? 3 : Math.random() * 2)}
                        fill={`hsla(120, ${25 + i * 3}%, ${30 + i * 2}%, ${0.2 + (i === 0 ? 0.15 : 0.05)})`} />
                    </motion.g>
                  ))}
                  {/* Biosphere envelope */}
                  {t > 0.6 && (
                    <motion.ellipse cx="100" cy="85" rx="85" ry="50"
                      fill="none" stroke={`hsla(200, 20%, 40%, ${(t - 0.6) * 0.12})`}
                      strokeWidth="0.5" strokeDasharray="3 8"
                      initial={{ opacity: 0 }} animate={{ opacity: (t - 0.6) * 0.15 }}
                    />
                  )}
                </motion.g>
                {/* Zoom level indicator */}
                <text x="190" y="142" textAnchor="end" fontSize="11" fontFamily="monospace"
                  fill={`hsla(200, 15%, 45%, ${0.2 + t * 0.1})`}>
                  ×{(1 / currentScale).toFixed(1)}
                </text>
              </svg>
            </div>
            <motion.div key={zoom} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {ZOOM_LEVELS[zoom].label}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {ZOOM_LEVELS.map((_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i <= zoom ? 'hsla(120, 30%, 45%, 0.5)' : palette.primaryFaint, opacity: i <= zoom ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The tree was never alone. It was always the forest. The forest was always the biosphere. See the system.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Systems thinking. Circular causality. A and B define each other. Fix the interaction.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Part. Whole. System.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}