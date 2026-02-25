/**
 * LUMINARY #3 — The Legacy Letter
 * "What will you leave behind?"
 * INTERACTION: Legacy themes presented one by one. Tap each to
 * claim it as yours. Your legacy forms from what you choose.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Values Clarification', 'believing', 'Key');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LEGACIES = [
  'Kindness when it was hard.',
  'Honesty when it was risky.',
  'Showing up when it was easier to leave.',
  'Loving without guarantees.',
  'Building something that outlasts you.',
];

export default function Luminary_LegacyLetter({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [claimed, setClaimed] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleClaim = (i: number) => {
    if (stage !== 'active' || claimed.includes(i)) return;
    const next = [...claimed, i];
    setClaimed(next);
    if (next.length >= LEGACIES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Values Clarification" kbe="believing" form="Key" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            What remains.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>What will you leave behind?</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each legacy to claim it</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '300px' }}>
            {LEGACIES.map((l, i) => {
              const isClaimed = claimed.includes(i);
              return (
                <motion.button key={i} onClick={() => handleClaim(i)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: isClaimed ? 0.8 : 0.3, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={!isClaimed ? { opacity: 0.5, scale: 1.02 } : undefined}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.01)', border: `1px solid ${isClaimed ? palette.accent : palette.primaryFaint}`, borderRadius: radius.md, cursor: isClaimed ? 'default' : 'pointer', textAlign: 'left' }}>
                  <div style={{ ...navicueType.texture, color: isClaimed ? palette.text : palette.textFaint, fontSize: '12px', fontStyle: 'italic' }}>{l}</div>
                </motion.button>
              );
            })}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '4px' }}>{claimed.length} of {LEGACIES.length} claimed</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>This is what you leave behind.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Not monuments. Moments.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Live the letter.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}