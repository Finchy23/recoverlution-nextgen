/**
 * ALCHEMIST COLLECTION #9
 * The Gratitude Sniper
 *
 * "Do not look for the miracle. Look for the crack where the light gets in."
 *
 * A crosshair. You have 10 seconds to find one tiny thing
 * that is okay. Lock on. Snap. The attention system retrains.
 *
 * INTERACTION: A scanning crosshair moves slowly. A countdown.
 * Tap when you've found something small that's okay.
 * The snap freezes the moment. One point of light in the dark.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  navicueQuickstart,
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } =
  navicueQuickstart('pattern_glitch', 'Attention Shift', 'embodying', 'Ember');

type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Alchemist_GratitudeSniper({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [countdown, setCountdown] = useState(10);
  const [locked, setLocked] = useState(false);
  const [crosshairPos, setCrosshairPos] = useState({ x: 50, y: 50 });
  const countdownRef = useRef<number>(0);
  const animRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timersRef.current.push(t);
  };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => {
      timersRef.current.forEach(clearTimeout);
      clearInterval(countdownRef.current);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Countdown + crosshair drift
  useEffect(() => {
    if (stage !== 'active' || locked) return;
    countdownRef.current = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Time's up -- auto-snap
          setLocked(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    let frame = 0;
    const drift = () => {
      frame++;
      setCrosshairPos({
        x: 50 + Math.sin(frame * 0.01) * 25,
        y: 50 + Math.cos(frame * 0.013) * 20,
      });
      animRef.current = requestAnimationFrame(drift);
    };
    animRef.current = requestAnimationFrame(drift);

    return () => {
      clearInterval(countdownRef.current);
      cancelAnimationFrame(animRef.current);
    };
  }, [stage, locked]);

  // When locked, transition to resonant
  useEffect(() => {
    if (locked && stage === 'active') {
      addTimer(() => {
        setStage('resonant');
        addTimer(() => {
          setStage('afterglow');
          onComplete?.();
        }, 5000);
      }, 2000);
    }
  }, [locked, stage]);

  const handleSnap = () => {
    if (stage !== 'active' || locked) return;
    setLocked(true);
  };

  return (
    <NaviCueShell
      signatureKey="pattern_glitch"
      mechanism="Attention Shift"
      kbe="embodying"
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
            Look closely.
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
              Find one thing that is okay.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              tap when you see it
            </div>
          </motion.div>
        )}

        {stage === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSnap}
            style={{
              position: 'relative',
              width: '280px',
              height: '280px',
              cursor: locked ? 'default' : 'crosshair',
            }}
          >
            {/* Crosshair */}
            <motion.div
              animate={locked ? { scale: 1.2, opacity: 0.8 } : undefined}
              style={{
                position: 'absolute',
                left: `${crosshairPos.x}%`,
                top: `${crosshairPos.y}%`,
                transform: 'translate(-50%, -50%)',
                width: '60px',
                height: '60px',
              }}
            >
              {/* Horizontal line */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                background: locked ? palette.accent : palette.primary,
                opacity: locked ? 0.8 : 0.4,
              }} />
              {/* Vertical line */}
              <div style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: '1px',
                background: locked ? palette.accent : palette.primary,
                opacity: locked ? 0.8 : 0.4,
              }} />
              {/* Center dot */}
              <motion.div
                animate={locked ? {
                  scale: [1, 2, 1.5],
                  opacity: [0.8, 1, 0.6],
                } : {
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: locked ? 0.5 : 1.5, repeat: locked ? 0 : Infinity }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: locked ? palette.accent : palette.primary,
                  boxShadow: locked ? `0 0 20px ${palette.accentGlow}` : 'none',
                }}
              />
              {/* Corner brackets */}
              {[
                { top: 0, left: 0, borderTop: '1px solid', borderLeft: '1px solid' },
                { top: 0, right: 0, borderTop: '1px solid', borderRight: '1px solid' },
                { bottom: 0, left: 0, borderBottom: '1px solid', borderLeft: '1px solid' },
                { bottom: 0, right: 0, borderBottom: '1px solid', borderRight: '1px solid' },
              ].map((corner, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  width: '12px',
                  height: '12px',
                  borderColor: locked ? palette.accent : palette.primary,
                  opacity: locked ? 0.6 : 0.2,
                  ...corner as any,
                }} />
              ))}
            </motion.div>

            {/* Countdown */}
            {!locked && (
              <motion.div
                key={countdown}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.4 }}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  ...navicueType.hint,
                  color: countdown <= 3 ? palette.accent : palette.textFaint,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {countdown}
              </motion.div>
            )}

            {/* Locked flash */}
            {locked && (
              <motion.div
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: radius.sm,
                }}
              />
            )}
          </motion.div>
        )}

        {stage === 'resonant' && (
          <motion.div
            key="resonant"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}
          >
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: palette.accent,
                boxShadow: `0 0 20px ${palette.accentGlow}`,
                marginBottom: '12px',
              }}
            />
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              There. You found it.
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.5, duration: 2 }}
              style={{ ...navicueType.texture, color: palette.textFaint }}
            >
              One crack where the light gets in.
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
            You can always find the light.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}