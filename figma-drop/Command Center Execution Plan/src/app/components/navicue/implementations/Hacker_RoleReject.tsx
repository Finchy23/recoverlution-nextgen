/**
 * HACKER #8 — The Role Reject
 * "You are not your role. You are the space in which the role is played."
 * INTERACTION: Masks with social roles. Swipe each mask off to
 * reveal the blank face underneath — the self behind the performance.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Metacognition', 'embodying', 'Circuit');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const MASKS = [
  'The Good One',
  'The Strong One',
  'The Productive One',
  'The Easy-Going One',
  'The One Who Has It Together',
];

export default function Hacker_RoleReject({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [removed, setRemoved] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleRemove = (i: number) => {
    if (stage !== 'active' || removed.includes(i)) return;
    const next = [...removed, i];
    setRemoved(next);
    if (next.length >= MASKS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const allRemoved = removed.length >= MASKS.length;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="embodying" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            So many masks.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are not your role.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each mask to take it off</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '280px' }}>
            {/* The face behind */}
            <motion.div animate={{ opacity: allRemoved ? 0.5 : 0.05, scale: allRemoved ? 1 : 0.9 }}
              transition={{ duration: 1.5 }}
              style={{ width: '60px', height: '60px', borderRadius: '50%', border: `2px solid ${allRemoved ? palette.accent : palette.primaryFaint}`, margin: '8px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: allRemoved ? `0 0 20px ${palette.accentGlow}` : 'none' }}>
              {allRemoved && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                  style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px', textAlign: 'center' }}>you</motion.div>
              )}
            </motion.div>
            {/* Masks */}
            {MASKS.map((m, i) => {
              const isRemoved = removed.includes(i);
              return (
                <motion.button key={i} onClick={() => handleRemove(i)}
                  animate={{ opacity: isRemoved ? 0.08 : 0.45, x: isRemoved ? (i % 2 === 0 ? -40 : 40) : 0, scale: isRemoved ? 0.85 : 1 }}
                  transition={{ duration: 0.6 }}
                  whileHover={!isRemoved ? { opacity: 0.6, scale: 1.02 } : undefined}
                  style={{ width: '100%', padding: '14px 14px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${isRemoved ? 'transparent' : palette.primaryFaint}`, borderRadius: radius.full, cursor: isRemoved ? 'default' : 'pointer', textAlign: 'center' }}>
                  <span style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '12px' }}>"{m}"</span>
                </motion.button>
              );
            })}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '4px' }}>{removed.length} of {MASKS.length} removed</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Underneath all the masks: you.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The space in which the roles are played.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Unmasked. Unscripted. You.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}