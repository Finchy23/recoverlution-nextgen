/**
 * ALCHEMIST COLLECTION #3
 * The Time Telescope
 *
 * "Ask the version of you who has already won."
 *
 * A zoom interface. Pinch out (or tap to zoom). You fly past
 * "Now," past "Tonight," to "10 Years From Now." You see a
 * blurred, golden version of yourself looking back.
 *
 * INTERACTION: Three concentric rings -- now, soon, future.
 * Tap each to zoom through time. At the center: a golden blur,
 * the version of you who already made it. What would they do?
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fonts } from '@/design-tokens';
import {
  navicueQuickstart,
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } =
  navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Ember');

type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
type TimeHorizon = 'now' | 'tonight' | 'year' | 'decade';

const HORIZONS: { key: TimeHorizon; label: string; scale: number; blur: number }[] = [
  { key: 'now', label: 'Now', scale: 1, blur: 0 },
  { key: 'tonight', label: 'Tonight', scale: 1.5, blur: 1 },
  { key: 'year', label: 'One Year', scale: 2.5, blur: 3 },
  { key: 'decade', label: 'Ten Years', scale: 4, blur: 6 },
];

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Alchemist_TimeTelescope({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [horizonIndex, setHorizonIndex] = useState(0);
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timersRef.current.push(t);
  };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleZoom = () => {
    if (stage !== 'active') return;
    const next = horizonIndex + 1;
    if (next < HORIZONS.length) {
      setHorizonIndex(next);
      if (next === HORIZONS.length - 1) {
        addTimer(() => {
          setStage('resonant');
          addTimer(() => {
            setStage('afterglow');
            onComplete?.();
          }, 6000);
        }, 3000);
      }
    }
  };

  const horizon = HORIZONS[horizonIndex];

  return (
    <NaviCueShell
      signatureKey="science_x_soul"
      mechanism="Metacognition"
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
            Look further.
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
              Where does this moment lead?
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              tap to zoom through time
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
              gap: '40px',
              cursor: horizonIndex < HORIZONS.length - 1 ? 'pointer' : 'default',
            }}
            onClick={handleZoom}
          >
            {/* Concentric rings */}
            <div style={{ position: 'relative', width: '240px', height: '240px' }}>
              {HORIZONS.map((h, i) => (
                <motion.div
                  key={h.key}
                  animate={{
                    scale: i <= horizonIndex ? 1 : 0.3 + (i * 0.2),
                    opacity: i <= horizonIndex ? (i === horizonIndex ? 1 : 0.3) : 0.1,
                    filter: `blur(${i <= horizonIndex ? 0 : h.blur}px)`,
                  }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: 'absolute',
                    inset: `${i * 20}px`,
                    borderRadius: '50%',
                    border: `1px solid ${i === horizonIndex ? palette.accent : palette.primary}`,
                    opacity: 0.2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              ))}
              {/* Golden center -- the future self */}
              {horizonIndex === HORIZONS.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: 'absolute',
                    inset: '60px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, hsla(42, 70%, 65%, 0.4), hsla(42, 70%, 50%, 0.1), transparent)`,
                    filter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <motion.div
                    animate={{ opacity: [0.5, 0.9, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'hsla(42, 80%, 70%, 0.6)',
                      boxShadow: '0 0 30px hsla(42, 80%, 60%, 0.3)',
                    }}
                  />
                </motion.div>
              )}
            </div>

            {/* Horizon label */}
            <motion.div
              key={horizon.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ ...navicueType.texture, color: palette.text, textAlign: 'center' }}
            >
              {horizon.label}
            </motion.div>
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
            <div style={{ ...navicueType.prompt, color: 'hsla(42, 70%, 70%, 0.9)' }}>
              The version of you who already won
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.5, duration: 2 }}
              style={{ ...navicueType.texture, color: palette.textFaint }}
            >
              What would they do right now?
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
            You already know the answer.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}