/**
 * MENDER #5 — The Reset Button
 * "You don't need a fresh start. You need a fresh next step."
 * INTERACTION: A glowing button pulses. Hold it down for 3 seconds.
 * The screen clears, but only the future — the past stays honored.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('pattern_glitch', 'Behavioral Activation', 'believing', 'Key');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Mender_ResetButton({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const intervalRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); clearInterval(intervalRef.current); };
  }, []);

  const startHold = () => {
    if (isReset) return;
    setIsHolding(true);
    intervalRef.current = window.setInterval(() => {
      setHoldProgress(prev => {
        const next = Math.min(1, prev + 0.033);
        if (next >= 1) {
          clearInterval(intervalRef.current);
          setIsReset(true);
          setIsHolding(false);
          setTimeout(() => { setStage('resonant'); setTimeout(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
        }
        return next;
      });
    }, 100);
  };

  const stopHold = () => {
    if (isReset) return;
    setIsHolding(false);
    clearInterval(intervalRef.current);
    if (holdProgress < 1) setHoldProgress(0);
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Behavioral Activation" kbe="believing" form="Key" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Not a fresh start.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>A fresh next step.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>hold the button for 3 seconds</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
            {/* Reset button */}
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
              {/* Progress ring */}
              <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="54" fill="none" stroke={palette.primaryFaint} strokeWidth="2" opacity={0.2} />
                <motion.circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke={isReset ? palette.accent : palette.primary}
                  strokeWidth="2" strokeLinecap="round"
                  strokeDasharray={`${54 * 2 * Math.PI}`}
                  strokeDashoffset={54 * 2 * Math.PI * (1 - holdProgress)}
                />
              </svg>
              {/* Button */}
              <motion.button
                onPointerDown={startHold}
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                animate={{
                  scale: isHolding ? 0.92 : isReset ? 1.05 : [1, 1.04, 1],
                  boxShadow: isReset ? `0 0 40px ${palette.accentGlow}` : `0 0 ${12 + holdProgress * 20}px ${palette.primaryGlow}`,
                }}
                transition={isReset ? { duration: 0.4 } : isHolding ? {} : { scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
                style={{ position: 'absolute', top: '10px', left: '10px', width: '100px', height: '100px', borderRadius: '50%', background: isReset ? palette.accentGlow : palette.primaryGlow, border: `1px solid ${isReset ? palette.accent : palette.primary}`, cursor: isReset ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ ...navicueType.hint, color: palette.text, fontSize: '11px', opacity: isReset ? 0.8 : 0.5 }}>
                  {isReset ? 'reset' : isHolding ? `${Math.round(holdProgress * 100)}%` : 'hold'}
                </span>
              </motion.button>
            </div>
            {!isReset && !isHolding && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>press and hold</div>
            )}
            {isReset && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.6, y: 0 }} transition={{ delay: 0.5 }}
                style={{ ...navicueType.texture, color: palette.text, textAlign: 'center' }}>
                The past stays. The next step is clear.
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You don't erase the past. You step forward from it.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>One step. That's all a reset is.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Fresh next step. Not fresh start.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
