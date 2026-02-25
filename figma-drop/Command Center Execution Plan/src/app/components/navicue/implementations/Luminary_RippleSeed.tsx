/**
 * LUMINARY #2 — The Ripple Seed
 * "One act. Infinite ripples."
 * INTERACTION: Tap center to drop a stone. Watch ripples expand
 * outward in concentric rings. Each ring carries a consequence.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('witness_ritual', 'Behavioral Activation', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const RIPPLES = [
  'You showed up.',
  'Someone noticed.',
  'They were changed.',
  'They changed someone else.',
  'The ripple reached a stranger.',
];

export default function Luminary_RippleSeed({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [rings, setRings] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleDrop = () => {
    if (stage !== 'active') return;
    const next = rings + 1;
    if (next <= RIPPLES.length) {
      setRings(next);
      if (next >= RIPPLES.length) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
      }
    }
  };

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Behavioral Activation" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            One stone.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>One act. Infinite ripples.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to drop the stone</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleDrop}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: 'pointer' }}>
            <div style={{ width: '220px', height: '220px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Ripple rings */}
              {Array.from({ length: rings }, (_, i) => (
                <motion.div key={i}
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 0.1 + (RIPPLES.length - i) * 0.03 }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{ position: 'absolute', width: `${30 + i * 16}%`, height: `${30 + i * 16}%`, borderRadius: '50%', border: `1px solid ${palette.accent}` }} />
              ))}
              {/* Center stone */}
              <motion.div
                animate={{ scale: rings > 0 ? 0.6 : 1, opacity: 0.5 }}
                style={{ width: '10px', height: '10px', borderRadius: '50%', background: palette.accent, boxShadow: `0 0 12px ${palette.accentGlow}`, zIndex: 1 }} />
            </div>
            {rings > 0 && (
              <motion.div key={rings} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.5, y: 0 }}
                style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '12px', fontStyle: 'italic', textAlign: 'center' }}>
                {RIPPLES[rings - 1]}
              </motion.div>
            )}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{rings} of {RIPPLES.length} ripples</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You will never see all the ripples.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>But they continue long after the stone is gone.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The ripple reaches.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
