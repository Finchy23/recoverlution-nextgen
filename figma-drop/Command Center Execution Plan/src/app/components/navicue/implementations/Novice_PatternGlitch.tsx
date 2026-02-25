/**
 * NOVICE COLLECTION #1
 * The Pattern Glitch
 * 
 * "Stop. You are playing a script. You don't have to say the next line."
 *
 * The emptiest specimen in the entire system.
 * In a world of beautiful atmospheres and floating particles,
 * this one is brave enough to be nothing.
 *
 * NEUROSCIENCE: Inhibitory Control. It physically interrupts the
 * automaticity of the habit loop, creating a "choice point" in the
 * dorsolateral prefrontal cortex. The prediction error — "wait,
 * this isn't what usually happens here" — IS the window.
 *
 * INTERACTION: Absolute black. One word. Heartbeat pulse. Nothing
 * to do. The non-action is the action. After stillness, the script
 * reveals itself — and you realize you don't have to read it.
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: autopilot, same script, every time
 * 2. Different action possible: stop
 * 3. Action executed: you stopped. That's it. That's enough.
 * 4. Evidence: the script didn't collapse without you
 * 5. Repeated: the pause becomes the power
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fonts } from '@/design-tokens';
import {
  navicueQuickstart,
  navicueType,
  navicueLayout,
} from '@/app/design-system/navicue-blueprint';

// ── Derive from blueprint (suppressed atmosphere) ─────────────────
const { palette, atmosphere, motion: motionConfig } =
  navicueQuickstart('pattern_glitch', 'Behavioral Activation', 'believing', 'InventorySpark');

type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Novice_PatternGlitch({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [bpm, setBpm] = useState(60);
  const [scattered, setScattered] = useState(false);
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };

  // ── Stage progression ─────────────────────────────────────────
  useEffect(() => {
    // arriving → present (word appears)
    addTimer(() => setStage('present'), 400);
    // present → active (second line, after 5s of stillness in the stop)
    addTimer(() => setStage('active'), 5400);
    // active → resonant (pulse slows, dissolves)
    addTimer(() => {
      setStage('resonant');
      setBpm(50);
    }, 10400);
    // Slow further
    addTimer(() => setBpm(40), 12400);
    // Begin scatter
    addTimer(() => setScattered(true), 13400);
    // resonant → afterglow
    addTimer(() => {
      setStage('afterglow');
      onComplete?.();
    }, 16400);

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Heartbeat interval in ms
  const beatInterval = 60000 / bpm;
  // Scale pulse uses CSS custom property timing
  const pulseDuration = beatInterval / 1000;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        ...navicueLayout.immersive,
        background: 'hsla(0, 0%, 0%, 0.3)', // Subtle dark overlay, not opaque.
        fontFamily: fonts.secondary,
      }}
    >
      {/* ── Single particle — barely there ─────────────────────── */}
      {(stage === 'arriving' || stage === 'afterglow') && (
        <motion.div
          animate={{
            opacity: [0, 0.15, 0],
            y: [0, -20, -40],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '60%',
            width: '2px',
            height: '2px',
            borderRadius: '50%',
            background: palette.primary,
          }}
        />
      )}

      {/* ── Central experience ─────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '48px',
          textAlign: 'center',
          padding: '32px',
        }}
      >
        <AnimatePresence mode="wait">
          {/* ── Arriving: absolute emptiness ─────────────────── */}
          {stage === 'arriving' && (
            <motion.div
              key="arriving"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.08 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                background: palette.primary,
              }}
            />
          )}

          {/* ── Present: the word ────────────────────────────── */}
          {stage === 'present' && (
            <motion.div
              key="present"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0',
              }}
            >
              <HeartbeatWord word="Stop." duration={pulseDuration} />
            </motion.div>
          )}

          {/* ── Active: the revelation ──────────────────────── */}
          {stage === 'active' && (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '40px',
              }}
            >
              <HeartbeatWord word="Stop." duration={pulseDuration} />
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 0.5, y: 0 }}
                transition={{ duration: 2.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  ...navicueType.texture,
                  color: palette.textFaint,
                  maxWidth: '280px',
                  lineHeight: 1.8,
                }}
              >
                You are playing a script.
                <br />
                You don't have to say the next line.
              </motion.div>
            </motion.div>
          )}

          {/* ── Resonant: dissolution ───────────────────────── */}
          {stage === 'resonant' && (
            <motion.div
              key="resonant"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '32px',
              }}
            >
              {!scattered ? (
                <HeartbeatWord word="Stop." duration={pulseDuration} />
              ) : (
                <ScatteredWord word="Stop." color={palette.primary} />
              )}
            </motion.div>
          )}

          {/* ── Afterglow: one particle remains ─────────────── */}
          {stage === 'afterglow' && (
            <motion.div
              key="afterglow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 3 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px',
              }}
            >
              <motion.div
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.3, 1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: palette.primary,
                  boxShadow: `0 0 20px ${palette.primaryGlow}`,
                }}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 3, delay: 1.5 }}
                style={{
                  ...navicueType.afterglow,
                  color: palette.textFaint,
                }}
              >
                The pause is yours.
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Heartbeat line — bottom, barely visible ────────────── */}
      {(stage === 'present' || stage === 'active') && (
        <motion.div
          animate={{
            scaleX: [0, 0.3, 0],
            opacity: [0, 0.15, 0],
          }}
          transition={{
            duration: pulseDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${palette.primary}, transparent)`,
            transformOrigin: 'center',
          }}
        />
      )}
    </motion.div>
  );
}

// ── Heartbeat word — pulses at bpm cadence ──────────────────────
function HeartbeatWord({ word, duration }: { word: string; duration: number }) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.025, 1],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        fontSize: 'clamp(28px, 5vw, 38px)',
        fontFamily: fonts.secondary,
        fontStyle: 'italic',
        fontWeight: 300,
        color: palette.text,
        letterSpacing: '0.04em',
        userSelect: 'none',
      }}
    >
      {word}
    </motion.div>
  );
}

// ── Scattered word — letters drift apart ────────────────────────
function ScatteredWord({ word, color }: { word: string; color: string }) {
  const letters = word.split('');

  return (
    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
      {letters.map((letter, i) => (
        <motion.span
          key={`${letter}-${i}`}
          initial={{ opacity: 0.7, x: 0, y: 0 }}
          animate={{
            opacity: [0.7, 0.3, 0],
            x: (i - letters.length / 2) * (15 + Math.random() * 10),
            y: (Math.random() - 0.5) * 40,
            scale: 0.6,
          }}
          transition={{
            duration: 2.5,
            delay: i * 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            fontSize: 'clamp(28px, 5vw, 38px)',
            fontFamily: fonts.secondary,
            fontStyle: 'italic',
            fontWeight: 300,
            color,
            display: 'inline-block',
          }}
        >
          {letter}
        </motion.span>
      ))}
    </div>
  );
}