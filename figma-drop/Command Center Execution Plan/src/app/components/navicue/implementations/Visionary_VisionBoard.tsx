/**
 * VISIONARY #8 — The Vision Board
 * "Build it in your mind first."
 * INTERACTION: An empty canvas. Tap to place elements of your
 * desired future — each one a glowing node that connects to form
 * a constellation of intention.
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sensory_cinema', 'Behavioral Activation', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ELEMENTS = [
  { label: 'safety', x: 25, y: 25 },
  { label: 'joy', x: 70, y: 20 },
  { label: 'connection', x: 20, y: 60 },
  { label: 'growth', x: 75, y: 55 },
  { label: 'freedom', x: 50, y: 40 },
  { label: 'meaning', x: 45, y: 75 },
];

export default function Visionary_VisionBoard({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [placed, setPlaced] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handlePlace = () => {
    if (stage !== 'active') return;
    const next = placed.length;
    if (next < ELEMENTS.length) {
      setPlaced([...placed, next]);
      if (next + 1 >= ELEMENTS.length) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
      }
    }
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Behavioral Activation" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A blank canvas.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Build it in your mind first.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to place each element</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handlePlace}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <svg width="280" height="240" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
              {/* Connection lines */}
              {placed.length > 1 && placed.map((pi, idx) => {
                if (idx === 0) return null;
                const prev = ELEMENTS[placed[idx - 1]];
                const curr = ELEMENTS[pi];
                return (
                  <motion.g key={`l${idx}`} initial={{ opacity: 0 }} animate={{ opacity: 0.15 }}>
                    <line x1={prev.x} y1={prev.y} x2={curr.x} y2={curr.y} stroke={palette.accent} strokeWidth="0.4" />
                  </motion.g>
                );
              })}
              {/* Element nodes */}
              {ELEMENTS.map((e, i) => {
                const isPlaced = placed.includes(i);
                return isPlaced ? (
                  <g key={i}>
                    <motion.circle initial={{ opacity: 0, r: 0 }} animate={{ opacity: 0.6, r: 3 }}
                      cx={e.x} cy={e.y} fill={palette.accent}
                      style={{ filter: `drop-shadow(0 0 4px ${palette.accentGlow})` }} />
                    <motion.text initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                      x={e.x} y={e.y + 6} textAnchor="middle" fill={palette.textFaint} fontSize="11">{e.label}</motion.text>
                  </g>
                ) : null;
              })}
            </svg>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{placed.length} of {ELEMENTS.length} placed</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You can see it now.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>What you can imagine, you can move toward.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The mind builds first.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}