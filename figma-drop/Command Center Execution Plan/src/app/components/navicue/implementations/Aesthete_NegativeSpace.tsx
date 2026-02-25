/**
 * AESTHETE #4 -- The Negative Space
 * "The music is not in the notes. It is the silence between them."
 * INTERACTION: A screen that is 90% emptiness. A single small dot in
 * the corner. Tap the dot and it pulses -- but the real art is the
 * vast space around it. Progressively notice the space, not the object.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Probe');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const DOT_POSITIONS = [
  { x: '85%', y: '15%' },
  { x: '12%', y: '78%' },
  { x: '50%', y: '50%' },
];

const INSIGHTS = [
  'You found the dot. But the emptiness held it.',
  'Again. The space is larger than the mark.',
  'The silence is the music.',
];

export default function Aesthete_NegativeSpace({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [found, setFound] = useState(0);
  const [pulsing, setPulsing] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const tapDot = () => {
    if (stage !== 'active' || pulsing || found >= DOT_POSITIONS.length) return;
    setPulsing(true);
    addTimer(() => {
      const next = found + 1;
      setFound(next);
      setPulsing(false);
      if (next >= DOT_POSITIONS.length) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
      }
    }, 1800);
  };

  const currentPos = found < DOT_POSITIONS.length ? DOT_POSITIONS[found] : DOT_POSITIONS[DOT_POSITIONS.length - 1];

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Probe" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Emptying...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The music is not in the notes. It is the silence between them.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>find the dot and honor the space</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '280px' }}>
            {/* The vast empty field */}
            <div style={{ position: 'relative', width: '240px', height: '200px', border: `1px solid ${palette.primaryFaint}`, borderRadius: radius.md, overflow: 'hidden' }}>
              {/* The space -- intentionally empty, vast */}
              {/* The dot */}
              {found < DOT_POSITIONS.length && (
                <motion.div
                  key={found}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: pulsing ? 0.8 : 0.3 }}
                  onClick={tapDot}
                  style={{ position: 'absolute', left: currentPos.x, top: currentPos.y, transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 2 }}>
                  <motion.div
                    animate={pulsing ? { scale: [1, 1.8, 1], opacity: [0.8, 0.2, 0.8] } : {}}
                    transition={pulsing ? { duration: 1.5, ease: 'easeInOut' } : {}}
                    style={{ width: '6px', height: '6px', borderRadius: '50%', background: palette.accent }}>
                  </motion.div>
                  {pulsing && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0.3 }}
                      animate={{ scale: 8, opacity: 0 }}
                      transition={{ duration: 1.5 }}
                      style={{ position: 'absolute', inset: '-3px', borderRadius: '50%', border: `1px solid ${palette.accent}` }}
                    />
                  )}
                </motion.div>
              )}
            </div>
            {/* Insight */}
            {found > 0 && (
              <motion.div key={`i${found}`} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', textAlign: 'center' }}>
                {INSIGHTS[found - 1]}
              </motion.div>
            )}
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.2 }}>
              {found >= DOT_POSITIONS.length ? 'the space was the art' : `${found} of ${DOT_POSITIONS.length}`}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Honor the space.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>What you don't fill is what you are. The emptiness holds everything.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
                                              ·
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}