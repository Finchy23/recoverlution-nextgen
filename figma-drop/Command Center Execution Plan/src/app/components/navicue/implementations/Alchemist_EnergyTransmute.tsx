/**
 * ALCHEMIST COLLECTION #6
 * The Energy Transmute
 *
 * "Anxiety is just excitement without breath. Add breath. Reclaim the fuel."
 *
 * A red, vibrating ball. You hold your thumb on it.
 * As you breathe, it changes color to gold.
 * The energy was never the enemy -- only the label was.
 *
 * INTERACTION: A pulsing sphere starts red/anxious.
 * Hold and breathe. The color shifts through amber to gold.
 * Same energy. New name. The transmutation is real.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  navicueQuickstart,
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } =
  navicueQuickstart('pattern_glitch', 'Somatic Regulation', 'embodying', 'Ember');

type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Alchemist_EnergyTransmute({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [transmuteProgress, setTransmuteProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdRef = useRef<number>(0);
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
      clearInterval(holdRef.current);
    };
  }, []);

  const startHold = () => {
    if (stage !== 'active') return;
    setIsHolding(true);
    holdRef.current = window.setInterval(() => {
      setTransmuteProgress(prev => {
        const next = Math.min(prev + 1.5, 100);
        if (next >= 100) {
          clearInterval(holdRef.current);
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
    clearInterval(holdRef.current);
  };

  const t = transmuteProgress / 100;
  // Red → Amber → Gold
  const hue = 0 + t * 42;
  const sat = 70 - t * 10;
  const light = 45 + t * 20;
  const sphereColor = `hsla(${hue}, ${sat}%, ${light}%, 0.7)`;
  const glowColor = `hsla(${hue}, ${sat}%, ${light}%, 0.3)`;
  const vibrateAmount = (1 - t) * 4;
  const label = t < 0.3 ? 'anxiety' : t < 0.7 ? 'energy' : 'excitement';

  return (
    <NaviCueShell
      signatureKey="pattern_glitch"
      mechanism="Somatic Regulation"
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
            Feel the charge.
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
              This energy is yours.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              hold and breathe to transmute
            </div>
          </motion.div>
        )}

        {stage === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}
          >
            <div
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              style={{
                position: 'relative',
                width: '160px',
                height: '160px',
                cursor: 'pointer',
                touchAction: 'none',
              }}
            >
              <motion.div
                animate={{
                  x: isHolding && t < 0.5 ? [0, vibrateAmount, -vibrateAmount, 0] : 0,
                  scale: isHolding ? [1, 1.05, 0.98, 1] : [1, 1.02, 1],
                }}
                transition={{
                  duration: isHolding ? 0.3 : 2,
                  repeat: Infinity,
                  ease: isHolding ? 'linear' : 'easeInOut',
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 40% 40%, ${sphereColor}, transparent 70%)`,
                  boxShadow: `0 0 ${40 + t * 30}px ${glowColor}`,
                }}
              />
            </div>

            {/* Label that shifts */}
            <motion.div
              key={label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              style={{
                ...navicueType.texture,
                color: `hsla(${hue}, ${sat}%, ${light + 15}%, 0.7)`,
                textAlign: 'center',
              }}
            >
              {label}
            </motion.div>

            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {isHolding ? 'breathing...' : 'hold to begin'}
            </div>
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
              animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, hsla(42, 70%, 65%, 0.5), transparent)',
                marginBottom: '12px',
              }}
            />
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Same fuel. New name.
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.5, duration: 2 }}
              style={{ ...navicueType.texture, color: palette.textFaint }}
            >
              Anxiety is just excitement without breath.
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
            Add breath. Reclaim the fuel.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}