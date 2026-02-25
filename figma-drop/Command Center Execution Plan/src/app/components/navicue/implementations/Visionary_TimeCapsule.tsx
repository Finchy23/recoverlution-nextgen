/**
 * VISIONARY #6 — The Time Capsule
 * "Write to the person you're becoming."
 * INTERACTION: Seal intentions into a capsule one by one. Each
 * intention is a message to your future self, placed with care.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Connection', 'embodying', 'Mirror');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const MESSAGES = [
  'You will be okay.',
  'Keep the promises you made to yourself.',
  'The hard part was worth it.',
  'Don\'t forget what matters.',
  'You deserve the life you\'re building.',
];

export default function Visionary_TimeCapsule({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [sealed, setSealed] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleSeal = (i: number) => {
    if (stage !== 'active' || sealed.includes(i)) return;
    if (i !== sealed.length) return;
    const next = [...sealed, i];
    setSealed(next);
    if (next.length >= MESSAGES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Connection" kbe="embodying" form="Mirror" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A message forward.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Write to the person you're becoming.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each message to seal it</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '280px' }}>
            {MESSAGES.map((m, i) => {
              const isSealed = sealed.includes(i);
              const isNext = i === sealed.length;
              return (
                <motion.button key={i} onClick={() => handleSeal(i)}
                  animate={{ opacity: isSealed ? 0.6 : isNext ? 0.35 : 0.1 }}
                  whileHover={isNext ? { opacity: 0.5 } : undefined}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.01)', border: `1px solid ${isSealed ? palette.accent : palette.primaryFaint}`, borderRadius: radius.md, cursor: isNext ? 'pointer' : 'default', textAlign: 'center' }}>
                  <div style={{ ...navicueType.texture, color: isSealed ? palette.text : palette.textFaint, fontSize: '12px', fontStyle: 'italic' }}>{m}</div>
                  {isSealed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px', marginTop: '4px' }}>sealed</motion.div>
                  )}
                </motion.button>
              );
            })}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '4px' }}>{sealed.length} of {MESSAGES.length} sealed</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The capsule is sealed.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Future you will remember this moment of intention.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The future is listening.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}