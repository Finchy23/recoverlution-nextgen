/**
 * MENDER #4 — The Forgiveness Loop
 * "Forgiveness is not a pardon. It is releasing the grip."
 * INTERACTION: A clenched fist slowly opens. Tap to release each finger.
 * With each release, a weight lifts. Five fingers, five releases.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Self-Compassion', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const RELEASES = [
  { label: 'the need to understand', angle: -60 },
  { label: 'the need for an apology', angle: -30 },
  { label: 'the fantasy of revenge', angle: 0 },
  { label: 'the hope it never happened', angle: 30 },
  { label: 'the weight of carrying it', angle: 60 },
];

export default function Mender_ForgivenessLoop({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [released, setReleased] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleRelease = (i: number) => {
    if (stage !== 'active' || released.includes(i)) return;
    const next = [...released, i];
    setReleased(next);
    if (next.length >= RELEASES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const openness = released.length / RELEASES.length;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Self-Compassion" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            You are still holding it.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Release the grip. One finger at a time.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each to let go</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            {/* Fist → open hand */}
            <div style={{ width: '200px', height: '180px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Palm */}
              <motion.div
                animate={{ scale: 1 + openness * 0.15, opacity: 0.2 + openness * 0.2 }}
                style={{ width: '50px', height: '60px', borderRadius: `${radius['2xl']} ${radius['2xl']} ${radius.xl} ${radius.xl}`, background: palette.primaryGlow, zIndex: 0 }}
              />
              {/* Fingers */}
              {RELEASES.map((r, i) => {
                const isReleased = released.includes(i);
                const baseAngle = r.angle;
                const len = isReleased ? 48 : 20;
                const rad = (baseAngle * Math.PI) / 180;
                const x = Math.sin(rad) * len;
                const y = -Math.cos(rad) * len;
                return (
                  <motion.button key={i}
                    onClick={() => handleRelease(i)}
                    animate={{ x, y, opacity: isReleased ? 0.7 : 0.4 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={!isReleased ? { scale: 1.2 } : undefined}
                    style={{ position: 'absolute', width: '14px', height: '40px', borderRadius: radius.sm, background: isReleased ? palette.primaryGlow : palette.primaryFaint, border: `1px solid ${isReleased ? palette.accent : palette.primary}`, cursor: isReleased ? 'default' : 'pointer', padding: 0 }}
                  />
                );
              })}
            </div>
            {/* Current release label */}
            {released.length > 0 && (
              <motion.div key={released[released.length - 1]}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.5, y: 0 }}
                style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', fontSize: '12px', fontStyle: 'italic' }}>
                released: {RELEASES[released[released.length - 1]].label}
              </motion.div>
            )}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {released.length} of {RELEASES.length} released
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Forgiveness is not a pardon. It is an open hand.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>You did not excuse it. You just stopped carrying it.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The hand is open. The weight is gone.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}