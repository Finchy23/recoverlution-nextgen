/**
 * ALCHEMIST COLLECTION #4
 * The Shadow Hug
 *
 * "Don't fight the demon. Invite it for tea."
 *
 * A dark shape (the urge) appears. Instead of pushing it away,
 * two arms (UI lines) gently wrap around it until it dissolves
 * into light. The paradox: embracing what you fear disarms it.
 *
 * INTERACTION: A shadow pulses. You hold your finger on it.
 * Arms of light slowly wrap around. The shadow softens, warms,
 * dissolves. It only screamed because it was hungry.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  navicueQuickstart,
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } =
  navicueQuickstart('koan_paradox', 'Exposure', 'believing', 'Ember');

type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Alchemist_ShadowHug({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdIntervalRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timersRef.current.push(t);
  };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 4000);
    return () => {
      timersRef.current.forEach(clearTimeout);
      clearInterval(holdIntervalRef.current);
    };
  }, []);

  const startHold = () => {
    if (stage !== 'active') return;
    setIsHolding(true);
    holdIntervalRef.current = window.setInterval(() => {
      setHoldProgress(prev => {
        const next = Math.min(prev + 2, 100);
        if (next >= 100) {
          clearInterval(holdIntervalRef.current);
          setStage('resonant');
          addTimer(() => {
            setStage('afterglow');
            onComplete?.();
          }, 5000);
        }
        return next;
      });
    }, 60);
  };

  const endHold = () => {
    setIsHolding(false);
    clearInterval(holdIntervalRef.current);
  };

  const dissolveProgress = holdProgress / 100;
  const shadowColor = `hsla(${260 + dissolveProgress * 40}, ${30 - dissolveProgress * 20}%, ${20 + dissolveProgress * 50}%, ${0.6 - dissolveProgress * 0.4})`;
  const armOpacity = dissolveProgress * 0.6;

  return (
    <NaviCueShell
      signatureKey="koan_paradox"
      mechanism="Exposure"
      kbe="believing"
      form="Ember"
      mode="immersive"
      isAfterglow={stage === 'afterglow'}
    >
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div
            key="arriving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}
          >
            Something is here.
          </motion.div>
        )}

        {stage === 'present' && (
          <motion.div
            key="present"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}
          >
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Don't push it away.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              hold the shadow
            </div>
          </motion.div>
        )}

        {stage === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '32px',
            }}
          >
            {/* The shadow + embrace container */}
            <div
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              style={{
                position: 'relative',
                width: '200px',
                height: '200px',
                cursor: 'pointer',
                touchAction: 'none',
              }}
            >
              {/* The shadow */}
              <motion.div
                animate={{
                  scale: isHolding ? [1, 0.95, 1] : [1, 1.08, 1],
                  opacity: 1 - dissolveProgress * 0.8,
                }}
                transition={{
                  duration: isHolding ? 1.5 : 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  position: 'absolute',
                  inset: '30px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${shadowColor}, transparent)`,
                  filter: `blur(${8 + dissolveProgress * 12}px)`,
                }}
              />

              {/* Golden light emerging from within */}
              <motion.div
                style={{
                  position: 'absolute',
                  inset: '50px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, hsla(42, 70%, 65%, ${dissolveProgress * 0.5}), transparent)`,
                  filter: 'blur(8px)',
                }}
              />

              {/* Left arm */}
              <motion.div
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  width: `${40 + dissolveProgress * 50}px`,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, hsla(42, 60%, 65%, ${armOpacity}))`,
                  transform: `translateY(-50%) rotate(${-20 + dissolveProgress * 20}deg)`,
                  transformOrigin: 'left center',
                  borderRadius: '2px',
                }}
              />

              {/* Right arm */}
              <motion.div
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  width: `${40 + dissolveProgress * 50}px`,
                  height: '2px',
                  background: `linear-gradient(-90deg, transparent, hsla(42, 60%, 65%, ${armOpacity}))`,
                  transform: `translateY(-50%) rotate(${20 - dissolveProgress * 20}deg)`,
                  transformOrigin: 'right center',
                  borderRadius: '2px',
                }}
              />
            </div>

            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: isHolding ? 0.6 : 0.3 }}>
              {isHolding ? 'embracing...' : 'hold to embrace'}
            </div>
          </motion.div>
        )}

        {stage === 'resonant' && (
          <motion.div
            key="resonant"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}
          >
            {/* Warm glow where shadow was */}
            <motion.div
              animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, hsla(42, 70%, 65%, 0.4), transparent)',
                filter: 'blur(10px)',
                marginBottom: '16px',
              }}
            />
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              It only screamed because it was hungry.
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 2, duration: 2 }}
              style={{ ...navicueType.texture, color: palette.textFaint }}
            >
              Now it's warm.
            </motion.div>
          </motion.div>
        )}

        {stage === 'afterglow' && (
          <motion.div
            key="afterglow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 3 }}
            style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}
          >
            What you embrace, you disarm.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}