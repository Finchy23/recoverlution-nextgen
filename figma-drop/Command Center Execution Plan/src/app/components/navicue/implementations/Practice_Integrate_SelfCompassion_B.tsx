/**
 * Practice x Self-Compassion x Believing
 * Magic Signature: sacred_ordinary
 *
 * THE SOFTENING
 * "What if the voice you hear most was kinder?"
 *
 * NEUROSCIENCE: The inner critic is a threat-detection loop running
 * in the default mode network. Self-compassion activates the
 * mammalian care system — the vagus nerve, oxytocin pathways, the
 * left prefrontal cortex. But you can't think your way to
 * self-compassion. The body has to practice it. Touch, warmth,
 * softening — these are the signals the nervous system trusts.
 *
 * PHILOSOPHY:
 * Ram Dass: "Treat yourself as if you were someone you were
 * responsible for helping."
 * Alan Watts: "You are under no obligation to be the same person
 * you were five minutes ago."
 *
 * INTERACTION: Harsh self-talk phrases appear — familiar,
 * universal. Touch one. It doesn't vanish or get "fixed."
 * It softens. The words dissolve like ink in warm water, and
 * through the dissolution, a truer version surfaces. Not
 * positive affirmation. Completion. Adding what the harsh
 * voice always omits.
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: self-criticism as default inner voice
 * 2. Different action possible: touch the harsh words
 * 3. Action executed: words soften → truer version appears
 * 4. Evidence: the kinder version feels... more accurate
 * 5. Repeated: self-compassion becomes the first response, not the afterthought
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, surfaces, spacing } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';

const palette = {
  base: surfaces.solid.base,
  honey: 'hsla(35, 60%, 60%, 1)',
  honeyGlow: 'hsla(35, 60%, 60%, 0.2)',
  honeyFaint: 'hsla(35, 60%, 60%, 0.06)',
  peach: 'hsla(25, 50%, 70%, 0.8)',
  warmWhite: 'hsla(40, 30%, 90%, 0.85)',
  warmFaint: 'hsla(40, 30%, 90%, 0.3)',
  harshText: 'hsla(0, 0%, 75%, 0.6)',
};

interface TransmutationPair {
  harsh: string;
  true: string;
}

const TRANSMUTATIONS: TransmutationPair[] = [
  {
    harsh: 'I should have done better',
    true: 'I did what I could with what I had',
  },
  {
    harsh: 'I can\u2019t handle this',
    true: 'This is hard, and I\u2019m still here',
  },
  {
    harsh: 'I\u2019m not enough',
    true: 'I\u2019m not finished. That\u2019s different.',
  },
  {
    harsh: 'Everyone else has it figured out',
    true: 'Everyone else is also pretending',
  },
  {
    harsh: 'I always mess things up',
    true: 'I\u2019m learning. That requires mistakes.',
  },
];

type Stage = 'arriving' | 'present' | 'softening' | 'afterglow';

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Practice_Integrate_SelfCompassion_B({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [currentPairIdx, setCurrentPairIdx] = useState(0);
  const [dissolved, setDissolved] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const totalPairs = 3; // Only show 3 for a focused experience

  // ── Arrival ───────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setStage('present'), 2800);
    return () => clearTimeout(t);
  }, []);

  // ── Touch harsh words → dissolution → truth ──────────────────
  const handleTouch = () => {
    if (stage !== 'present' || dissolved) return;
    setDissolved(true);

    // After truth settles, advance or complete
    safeTimeout(() => {
      const nextCount = completedCount + 1;
      setCompletedCount(nextCount);

      if (nextCount >= totalPairs) {
        setStage('afterglow');
        onComplete?.();
      } else {
        // Fade to next pair
        setDissolved(false);
        setCurrentPairIdx(prev => prev + 1);
      }
    }, 4500);
  };

  const pair = TRANSMUTATIONS[currentPairIdx];

  // Ambient warmth particles
  const particles = useRef(
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      y: 20 + Math.random() * 60,
      size: 2 + Math.random() * 4,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 5,
    }))
  ).current;

  // Safe timeout management
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => {
    return () => {
      timersRef.current.forEach(id => clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      style={{
        width: '100%',
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(ellipse at 50% 60%, ${palette.honeyFaint}, ${palette.base} 70%)`,
        fontFamily: fonts.primary,
        cursor: 'default',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* ── Warmth particles ─────────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {particles.map(p => (
          <motion.div
            key={p.id}
            animate={{
              opacity: [0, 0.2, 0],
              scale: [0.5, 1, 0.5],
              y: [0, -20, -40],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              background: palette.honey,
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>

      {/* ── Central experience ───────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '600px',
          padding: spacing['2xl'],
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <AnimatePresence mode="wait">
          {/* ── Arriving ─────────────────────────────────────────── */}
          {stage === 'arriving' && (
            <motion.div
              key="arrive"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: 'center' }}
            >
              <div
                style={{
                  fontSize: navicueType.arrival.fontSize,
                  color: palette.warmWhite,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  fontWeight: 300,
                  lineHeight: 1.6,
                }}
              >
                The voice you hear most
                <br />
                is your own.
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: 1.5, delay: 1.5 }}
                style={{
                  marginTop: '24px',
                  fontSize: navicueType.texture.fontSize,
                  color: palette.warmFaint,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                }}
              >
                What if it was kinder?
              </motion.div>
            </motion.div>
          )}

          {/* ── Present — the softening loop ─────────────────────── */}
          {stage === 'present' && (
            <motion.div
              key={`pair-${currentPairIdx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '64px',
                minHeight: '300px',
                justifyContent: 'center',
              }}
            >
              {/* The harsh words */}
              <motion.div
                onClick={handleTouch}
                animate={{
                  opacity: dissolved ? 0 : 1,
                  filter: dissolved ? 'blur(12px)' : 'blur(0px)',
                  scale: dissolved ? 1.05 : 1,
                }}
                transition={{ duration: dissolved ? 2 : 0.3 }}
                style={{
                  fontSize: navicueType.subheading.fontSize,
                  color: palette.harshText,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  fontWeight: 400,
                  textAlign: 'center',
                  lineHeight: 1.5,
                  cursor: dissolved ? 'default' : 'pointer',
                  padding: '20px 32px',
                  borderRadius: radius.lg,
                  background: dissolved ? 'transparent' : `${palette.honeyFaint}`,
                  border: dissolved ? '1px solid transparent' : `1px solid hsla(35, 60%, 60%, 0.08)`,
                  transition: 'background 1s ease, border 1s ease',
                  position: 'relative',
                }}
              >
                "{pair.harsh}"

                {/* Dissolution ripple */}
                {dissolved && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0.3 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 2 }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${palette.honeyGlow}, transparent)`,
                    }}
                  />
                )}
              </motion.div>

              {/* The truer version — emerges through the dissolution */}
              <AnimatePresence>
                {dissolved && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 2, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      fontSize: navicueType.subheading.fontSize,
                      color: palette.warmWhite,
                      fontFamily: fonts.secondary,
                      fontStyle: 'italic',
                      fontWeight: 400,
                      textAlign: 'center',
                      lineHeight: 1.5,
                      position: 'relative',
                    }}
                  >
                    "{pair.true}"

                    {/* Warm underline */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      style={{
                        position: 'absolute',
                        bottom: '-8px',
                        left: '20%',
                        right: '20%',
                        height: '1px',
                        background: `linear-gradient(90deg, transparent, ${palette.honey}, transparent)`,
                        transformOrigin: 'center',
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Gentle touch invitation */}
              {!dissolved && (
                <motion.div
                  animate={{ opacity: [0.2, 0.35, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    fontSize: navicueType.hint.fontSize,
                    color: palette.warmFaint,
                    fontFamily: fonts.secondary,
                    fontStyle: 'italic',
                  }}
                >
                  touch to soften
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Afterglow ────────────────────────────────────────── */}
          {stage === 'afterglow' && (
            <motion.div
              key="afterglow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 3 }}
              style={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '40px',
              }}
            >
              {/* Warmth settling */}
              <motion.div
                animate={{
                  boxShadow: [
                    `0 0 40px ${palette.honeyGlow}`,
                    `0 0 80px ${palette.honeyGlow}`,
                    `0 0 40px ${palette.honeyGlow}`,
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${palette.honeyGlow}, transparent 70%)`,
                }}
              />

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 0.8, y: 0 }}
                transition={{ duration: 2, delay: 1 }}
                style={{
                  fontSize: navicueType.subheading.fontSize,
                  color: palette.warmWhite,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  fontWeight: 300,
                  lineHeight: 1.6,
                }}
              >
                Not kinder because it's nicer.
                <br />
                Kinder because it's truer.
              </motion.div>

              <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{
                  width: '120px',
                  height: '1px',
                  background: `linear-gradient(90deg, transparent, ${palette.honey}, transparent)`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Warmth line ──────────────────────────────────────────── */}
      <motion.div
        animate={{
          background: `linear-gradient(90deg, transparent, ${palette.honey}, transparent)`,
          opacity: stage === 'afterglow' ? 0.5 : 0.2,
        }}
        transition={{ duration: 2 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
        }}
      />
    </motion.div>
  );
}