/**
 * Mirror × Behavioral Activation × Believing
 * Magic Signature: sacred_ordinary
 *
 * ═══════════════════════════════════════════════════
 * THE FUTURE SIMULATION
 * "Run the tape forward."
 * ═══════════════════════════════════════════════════
 *
 * NEUROSCIENCE: Episodic Future Thinking engages the hippocampus
 * to simulate a future reward, making it competitive with the
 * immediate gratification of an impulse. The brain is a prediction
 * machine. When you show it two movies — the old loop and the
 * new one — the prefrontal cortex can finally vote. The key is
 * making the new movie VIVID enough to compete with the familiar.
 *
 * PHILOSOPHY:
 * Alan Watts: "The only way to make sense out of change is to
 * plunge into it, move with it, and join the dance."
 *
 * INTERACTION: Two paths appear. Left: the loop you know — dim,
 * circular, repeating. Right: the path you haven't taken — brighter,
 * forward, unknown. Tap the right side to "play" it. The old loop
 * fades. The new path illuminates. You've already chosen.
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: doing the same thing, expecting different
 * 2. Different action possible: see both futures side by side
 * 3. Action executed: tap the unfamiliar path → it becomes real
 * 4. Evidence: the old loop doesn't collapse — it just gets quieter
 * 5. Repeated: future-self becomes the default imagination
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, surfaces, spacing } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';

const palette = {
  base: surfaces.solid.base,
  warmGold: 'hsla(40, 55%, 58%, 1)',
  warmGlow: 'hsla(40, 55%, 58%, 0.2)',
  warmFaint: 'hsla(40, 55%, 58%, 0.06)',
  dimGray: 'hsla(220, 10%, 40%, 0.6)',
  dimFaint: 'hsla(220, 10%, 40%, 0.08)',
  loopGray: 'hsla(220, 10%, 50%, 0.25)',
  text: 'hsla(40, 15%, 88%, 0.85)',
  textFaint: 'hsla(40, 15%, 88%, 0.35)',
  textDim: 'hsla(220, 10%, 60%, 0.5)',
};

type Stage = 'arriving' | 'split' | 'chosen' | 'playing' | 'afterglow';

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Mirror_Integrate_BehavioralActivation_B({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');

  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    const t = setTimeout(() => setStage('split'), 3500);
    return () => { clearTimeout(t); timersRef.current.forEach(clearTimeout); };
  }, []);

  const handleChooseNew = () => {
    if (stage !== 'split') return;
    setStage('chosen');
    safeTimeout(() => setStage('playing'), 1500);
    safeTimeout(() => {
      setStage('afterglow');
      onComplete?.();
    }, 8000);
  };

  // Ambient particles
  const particles = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      y: 20 + Math.random() * 60,
      size: 1 + Math.random() * 2,
      duration: 8 + Math.random() * 10,
      delay: Math.random() * 5,
    }))
  ).current;

  const showSplit = stage === 'split' || stage === 'chosen' || stage === 'playing';

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
        background: `radial-gradient(ellipse at 50% 50%, ${palette.warmFaint}, ${palette.base} 75%)`,
        fontFamily: fonts.primary,
        cursor: 'default',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* ── Ambient particles ──────────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {particles.map(p => (
          <motion.div
            key={p.id}
            animate={{ opacity: [0, 0.15, 0], y: [0, -30, -60] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              background: palette.warmGold,
            }}
          />
        ))}
      </div>

      {/* ── Central experience ─────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '640px',
          padding: spacing['2xl'],
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <AnimatePresence mode="wait">
          {/* ── Arriving ──────────────────────────────────────────── */}
          {stage === 'arriving' && (
            <motion.div
              key="arrive"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: 'center' }}
            >
              <div
                style={{
                  fontSize: navicueType.arrival.fontSize,
                  color: palette.text,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  fontWeight: 300,
                  lineHeight: 1.6,
                }}
              >
                You already know
                <br />
                how the old story ends.
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 1.8, duration: 1.5 }}
                style={{
                  marginTop: '24px',
                  fontSize: navicueType.afterglow.fontSize,
                  color: palette.textFaint,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                }}
              >
                What about the other one?
              </motion.div>
            </motion.div>
          )}

          {/* ── Split — two paths ─────────────────────────────────── */}
          {showSplit && (
            <motion.div
              key="split"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '48px',
                width: '100%',
              }}
            >
              {/* The two paths side by side */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 'clamp(24px, 5vw, 48px)',
                  width: '100%',
                }}
              >
                {/* ── LEFT: The Old Loop ─────────────────────────── */}
                <motion.div
                  animate={{
                    opacity: stage === 'chosen' || stage === 'playing' ? 0.15 : 0.6,
                    scale: stage === 'chosen' || stage === 'playing' ? 0.9 : 1,
                    filter: stage === 'playing' ? 'blur(3px)' : 'blur(0px)',
                  }}
                  transition={{ duration: 1.5 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px',
                    flex: 1,
                    maxWidth: '200px',
                  }}
                >
                  {/* Circular loop animation */}
                  <div
                    style={{
                      position: 'relative',
                      width: '120px',
                      height: '120px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        border: `1.5px solid ${palette.loopGray}`,
                        borderTopColor: palette.dimGray,
                      }}
                    />
                    {/* Dot going in circles */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                      style={{
                        position: 'absolute',
                        width: '100px',
                        height: '100px',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: '-3px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: palette.dimGray,
                        }}
                      />
                    </motion.div>
                  </div>

                  <div
                    style={{
                      fontSize: navicueType.hint.fontSize,
                      color: palette.textDim,
                      fontFamily: fonts.secondary,
                      fontStyle: 'italic',
                      textAlign: 'center',
                      lineHeight: 1.5,
                    }}
                  >
                    The familiar loop
                  </div>
                </motion.div>

                {/* ── Divider ────────────────────────────────────── */}
                <motion.div
                  animate={{
                    opacity: stage === 'playing' ? 0 : [0.1, 0.25, 0.1],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    width: '1px',
                    alignSelf: 'stretch',
                    background: `linear-gradient(180deg, transparent, ${palette.warmGlow}, transparent)`,
                  }}
                />

                {/* ── RIGHT: The New Path ────────────────────────── */}
                <motion.div
                  onClick={handleChooseNew}
                  animate={{
                    opacity: stage === 'split' ? 0.7 : 1,
                    scale: stage === 'chosen' || stage === 'playing' ? 1.05 : 1,
                  }}
                  transition={{ duration: 1 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px',
                    flex: 1,
                    maxWidth: '200px',
                    cursor: stage === 'split' ? 'pointer' : 'default',
                  }}
                >
                  {/* Forward path animation */}
                  <div
                    style={{
                      position: 'relative',
                      width: '120px',
                      height: '120px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Growing path line */}
                    <motion.div
                      animate={{
                        height: stage === 'playing'
                          ? ['40px', '90px', '40px']
                          : '60px',
                        opacity: stage === 'playing'
                          ? [0.4, 0.7, 0.4]
                          : 0.4,
                      }}
                      transition={{
                        duration: stage === 'playing' ? 3 : 0,
                        repeat: stage === 'playing' ? Infinity : 0,
                        ease: 'easeInOut',
                      }}
                      style={{
                        width: '2px',
                        background: `linear-gradient(180deg, ${palette.warmGold}, transparent)`,
                        borderRadius: '1px',
                      }}
                    />

                    {/* Forward dot — moving upward */}
                    <motion.div
                      animate={{
                        y: stage === 'playing'
                          ? [20, -30, 20]
                          : [10, -10, 10],
                        opacity: [0.5, 0.9, 0.5],
                      }}
                      transition={{
                        duration: stage === 'playing' ? 2.5 : 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{
                        position: 'absolute',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: palette.warmGold,
                        boxShadow: `0 0 12px ${palette.warmGlow}`,
                      }}
                    />

                    {/* Glow behind path */}
                    {(stage === 'chosen' || stage === 'playing') && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.15 }}
                        style={{
                          position: 'absolute',
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: `radial-gradient(circle, ${palette.warmGlow}, transparent 70%)`,
                        }}
                      />
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: navicueType.hint.fontSize,
                      color: stage === 'playing' ? palette.warmGold : palette.text,
                      fontFamily: fonts.secondary,
                      fontStyle: 'italic',
                      textAlign: 'center',
                      lineHeight: 1.5,
                      transition: 'color 1s ease',
                    }}
                  >
                    {stage === 'playing'
                      ? 'This one is yours'
                      : 'The different thing'}
                  </div>
                </motion.div>
              </div>

              {/* Whisper */}
              {stage === 'split' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ delay: 1, duration: 1.5 }}
                  style={{
                    fontSize: navicueType.caption.fontSize,
                    color: palette.textFaint,
                    fontFamily: fonts.secondary,
                    fontStyle: 'italic',
                  }}
                >
                  tap the path you haven't taken
                </motion.div>
              )}

              {/* Playing text */}
              {stage === 'playing' && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 0.7, y: 0 }}
                  transition={{ duration: 2, delay: 1.5 }}
                  style={{
                    fontSize: navicueType.narrative.fontSize,
                    color: palette.text,
                    fontFamily: fonts.secondary,
                    fontStyle: 'italic',
                    fontWeight: 300,
                    textAlign: 'center',
                    lineHeight: 1.6,
                  }}
                >
                  Ten minutes from now,
                  <br />
                  you're glad you chose this.
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Afterglow ─────────────────────────────────────────── */}
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
                gap: '32px',
              }}
            >
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: palette.warmGold,
                  boxShadow: `0 0 20px ${palette.warmGlow}`,
                }}
              />
              <div
                style={{
                  fontSize: navicueType.afterglow.fontSize,
                  color: palette.textFaint,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  lineHeight: 1.8,
                }}
              >
                The future is not a place you go.
                <br />
                It's a place you build
                <br />
                with the next small thing.
              </div>

              <motion.div
                animate={{ opacity: [0.15, 0.3, 0.15] }}
                transition={{ duration: 6, repeat: Infinity }}
                style={{
                  width: '140px',
                  height: '1px',
                  background: `linear-gradient(90deg, transparent, ${palette.warmGold}, transparent)`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom accent line ─────────────────────────────────────── */}
      <motion.div
        animate={{
          opacity: stage === 'afterglow' ? 0.4 : stage === 'playing' ? 0.3 : 0.15,
        }}
        transition={{ duration: 2 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${palette.warmGold}, transparent)`,
        }}
      />
    </motion.div>
  );
}