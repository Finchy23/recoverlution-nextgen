/**
 * ARCHITECT #5 -- The Mirror Gaze
 * "Hello, old friend. You are still in there."
 * INTERACTION: A soft halo surrounds a central point. Hold your gaze
 * for 10 seconds. The halo warms and pulses with recognition.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('relational_ghost', 'Self-Compassion', 'embodying', 'Mirror');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

export default function Architect_MirrorGaze({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [holdTime, setHoldTime] = useState(0);
  const [holding, setHolding] = useState(false);
  const intervalRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); clearInterval(intervalRef.current); };
  }, []);

  const startHold = () => {
    if (stage !== 'active') return;
    setHolding(true);
    intervalRef.current = window.setInterval(() => {
      setHoldTime(prev => {
        const next = prev + 0.1;
        if (next >= 10) {
          clearInterval(intervalRef.current);
          setHolding(false);
          setStage('resonant');
          setTimeout(() => { setStage('afterglow'); onComplete?.(); }, 5000);
          return 10;
        }
        return next;
      });
    }, 100);
  };

  const stopHold = () => {
    setHolding(false);
    clearInterval(intervalRef.current);
  };

  const progress = Math.min(holdTime / 10, 1);
  const haloScale = 1 + progress * 0.3;
  const warmth = Math.round(progress * 40);

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Self-Compassion" kbe="embodying" form="Mirror" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Look.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Look into your own eyes.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>hold the center for ten seconds</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
            {/* Halo circle */}
            <div
              onPointerDown={startHold}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              style={{ width: '180px', height: '180px', borderRadius: '50%', position: 'relative', cursor: 'pointer', touchAction: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {/* Outer halo */}
              <motion.div
                animate={{ scale: haloScale, opacity: 0.15 + progress * 0.25 }}
                transition={{ duration: 0.3 }}
                style={{ position: 'absolute', inset: '-20px', borderRadius: '50%', background: `radial-gradient(circle, hsla(${345 + warmth}, 40%, 62%, ${0.2 + progress * 0.3}), transparent 70%)` }}
              />
              {/* Inner ring */}
              <svg width="180" height="180" style={{ position: 'absolute' }}>
                <circle cx="90" cy="90" r="80" fill="none" stroke={palette.primaryFaint} strokeWidth="1" />
                <circle cx="90" cy="90" r="80" fill="none" stroke={palette.primary} strokeWidth="1.5"
                  strokeDasharray={`${progress * 502} 502`} strokeLinecap="round" transform="rotate(-90 90 90)" opacity={0.5} />
              </svg>
              {/* Center dot */}
              <motion.div
                animate={{ scale: holding ? 1.2 : 1, boxShadow: holding ? `0 0 30px ${palette.accentGlow}` : `0 0 10px ${palette.primaryFaint}` }}
                style={{ width: '12px', height: '12px', borderRadius: '50%', background: palette.primary, zIndex: 1 }}
              />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>
              {holdTime < 10 ? `${Math.floor(holdTime)}s` : 'seen'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Hello, old friend.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>You are still in there.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The face beneath the performance.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}