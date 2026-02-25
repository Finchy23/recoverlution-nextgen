/**
 * VISIONARY #7 — The Obstacle Flip
 * "Every wall has a door you haven't found."
 * INTERACTION: Obstacles appear as solid blocks. Tap each to flip
 * it — revealing the hidden opportunity on the other side.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'embodying', 'Key');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const OBSTACLES = [
  { wall: 'I don\'t have enough time.', door: 'I have enough time for what matters.' },
  { wall: 'I\'m not qualified.', door: 'No one was, until they started.' },
  { wall: 'It\'s too late.', door: 'It\'s exactly the right time to begin.' },
  { wall: 'People will judge me.', door: 'The right people will recognize me.' },
];

export default function Visionary_ObstacleFlip({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [flipped, setFlipped] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleFlip = (i: number) => {
    if (stage !== 'active' || flipped.includes(i)) return;
    const next = [...flipped, i];
    setFlipped(next);
    if (next.length >= OBSTACLES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="embodying" form="Key" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Walls everywhere.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Every wall has a door.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each obstacle to flip it</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '300px' }}>
            {OBSTACLES.map((o, i) => {
              const isFlipped = flipped.includes(i);
              return (
                <motion.button key={i} onClick={() => handleFlip(i)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: isFlipped ? 0.8 : 0.4, y: 0 }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  whileHover={!isFlipped ? { scale: 1.02 } : undefined}
                  style={{ width: '100%', padding: '14px 16px', background: isFlipped ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isFlipped ? palette.accent : palette.primaryFaint}`, borderRadius: radius.md, cursor: isFlipped ? 'default' : 'pointer', textAlign: 'center' }}>
                  <AnimatePresence mode="wait">
                    {!isFlipped ? (
                      <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
                        style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '12px', fontStyle: 'italic' }}>
                        {o.wall}
                      </motion.div>
                    ) : (
                      <motion.div key="d" initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 0.7, rotateY: 0 }} transition={{ duration: 0.6 }}
                        style={{ ...navicueType.texture, color: palette.accent, fontSize: '12px' }}>
                        {o.door}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '4px' }}>{flipped.length} of {OBSTACLES.length} flipped</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The obstacle is the way.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Every wall was a door waiting to be turned.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Walk through.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}