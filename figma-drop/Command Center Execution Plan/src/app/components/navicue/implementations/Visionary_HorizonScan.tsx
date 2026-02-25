/**
 * VISIONARY #1 — The Horizon Scan
 * "What can you see that doesn't exist yet?"
 * INTERACTION: A blank horizon line. Tap to place imagined landmarks
 * — each a possibility you can name. The horizon fills with futures.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, safeOpacity } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Mirror');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LANDMARKS = [
  { label: 'a home that feels like you', x: 15 },
  { label: 'work that matters', x: 35 },
  { label: 'love without fear', x: 55 },
  { label: 'a version of you at peace', x: 75 },
  { label: 'something you can\'t name yet', x: 90 },
];

export default function Visionary_HorizonScan({ onComplete }: Props) {
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
    if (next < LANDMARKS.length) {
      setPlaced([...placed, next]);
      if (next + 1 >= LANDMARKS.length) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
      }
    }
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Mirror" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The horizon is empty.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>What can you see that doesn't exist yet?</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to place each possibility</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handlePlace}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
            <div style={{ width: '300px', height: '180px', position: 'relative' }}>
              {/* Horizon line */}
              <div style={{ position: 'absolute', left: 0, right: 0, top: '60%', height: '1px', background: palette.primaryFaint, opacity: 0.2 }} />
              {/* Landmarks */}
              {LANDMARKS.map((l, i) => {
                const isPlaced = placed.includes(i);
                return isPlaced ? (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.6, y: 0 }}
                    style={{ position: 'absolute', left: `${l.x}%`, top: '48%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                    <div style={{ width: '4px', height: '16px', background: palette.accent, margin: '0 auto', borderRadius: '2px', opacity: 0.5 }} />
                    <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', marginTop: '4px', whiteSpace: 'nowrap', maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {l.label}
                    </div>
                  </motion.div>
                ) : null;
              })}
              {/* Glow at horizon */}
              <motion.div animate={{ opacity: safeOpacity(0.05 + placed.length * 0.03) }}
                style={{ position: 'absolute', left: '10%', right: '10%', top: '55%', height: '20px', background: `radial-gradient(ellipse, ${palette.accentGlow}, transparent)`, filter: 'blur(8px)' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {placed.length} of {LANDMARKS.length} placed
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The horizon isn't empty anymore.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>You can see what doesn't exist yet. That's the first step.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Walk toward what you placed.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}