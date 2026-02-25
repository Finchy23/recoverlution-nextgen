/**
 * Mirror x Metacognition x Believing
 * Magic Signature: witness_ritual
 *
 * THE WITNESS
 * "Between two thoughts, you exist."
 *
 * NEUROSCIENCE: Metacognition is the brain observing its own processes.
 * The default mode network (DMN) generates a constant narrative.
 * When we create distance from that narrative — even for a moment —
 * the prefrontal cortex gains a window to intervene. That window
 * is where new neural pathways begin.
 *
 * PHILOSOPHY:
 * Alan Watts: "Thoughts are like clouds in the sky — you are the sky."
 * Ram Dass: "The quieter you become, the more you can hear."
 *
 * INTERACTION: Stillness detection. No taps. No buttons. No instructions.
 * The user does nothing — and that IS the practice. Thought-streams
 * slow as the user remains present. Space appears between thoughts.
 * The insight lands: you are not your thoughts.
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: constant mental chatter feels like "me"
 * 2. Different action possible: just... watch it
 * 3. Action executed: stillness → thoughts slow
 * 4. Evidence: the gap between thoughts is peaceful, not empty
 * 5. Repeated: each time, the gap is found faster
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, surfaces, spacing } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';

// ── Atmosphere ──────────────────────────────────────────────────────
const palette = {
  base: surfaces.solid.base,
  stone: 'hsla(30, 25%, 50%, 1)',
  stoneGlow: 'hsla(30, 25%, 50%, 0.15)',
  stoneFaint: 'hsla(30, 25%, 50%, 0.06)',
  warmWhite: 'hsla(35, 20%, 90%, 0.85)',
  whisper: 'hsla(35, 20%, 90%, 0.4)',
  breath: 'hsla(30, 25%, 50%, 0.3)',
};

type Stage = 'arriving' | 'settling' | 'witnessing' | 'spacious' | 'afterglow';

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

// Thought fragments — not labels, not categories. Real human noise.
const THOUGHT_STREAMS = [
  'I should be further along by now',
  'what if this doesn\u2019t work',
  'they probably think I\u2019m',
  'I need to remember to',
  'why did I say that',
  'tomorrow I have to',
  'is this really me',
  'I can\u2019t keep doing',
  'what\u2019s the point of',
  'if only I had',
  'maybe I\u2019m just not',
  'I wonder what they',
];

export default function Mirror_Integrate_Metacognition_B({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [stillnessLevel, setStillnessLevel] = useState(0);
  const [visibleThoughts, setVisibleThoughts] = useState<number[]>([]);
  const [gapRevealed, setGapRevealed] = useState(false);
  const stillnessTimerRef = useRef<number | null>(null);
  const lastMoveRef = useRef(Date.now());
  const thoughtIntervalRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  // ── Arrival sequence ─────────────────────────────────────────────
  useEffect(() => {
    const t1 = safeTimeout(() => setStage('settling'), 1800);
    const t2 = safeTimeout(() => {
      setStage('witnessing');
      startThoughtStream();
      startStillnessDetection();
    }, 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); timersRef.current.forEach(clearTimeout); };
  }, []);

  // ── Thought stream — fragments drift through consciousness ───────
  const startThoughtStream = useCallback(() => {
    let idx = 0;
    thoughtIntervalRef.current = window.setInterval(() => {
      setVisibleThoughts(prev => {
        const next = [...prev, idx % THOUGHT_STREAMS.length];
        // Keep only last 5 visible
        return next.slice(-5);
      });
      idx++;
    }, 2200);
  }, []);

  // ── Stillness detection — no interaction = presence ──────────────
  const startStillnessDetection = useCallback(() => {
    lastMoveRef.current = Date.now();

    stillnessTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - lastMoveRef.current;
      const level = Math.min(elapsed / 8000, 1); // 8 seconds to full stillness
      setStillnessLevel(level);

      if (level >= 1 && !gapRevealed) {
        setGapRevealed(true);
        // Slow the thought stream dramatically
        if (thoughtIntervalRef.current) {
          clearInterval(thoughtIntervalRef.current);
        }
        // Transition to spacious
        safeTimeout(() => {
          setStage('spacious');
          safeTimeout(() => {
            setStage('afterglow');
            onComplete?.();
          }, 6000);
        }, 3000);
      }
    }, 200);
  }, [gapRevealed, onComplete]);

  // Reset stillness on any interaction
  const handleInteraction = useCallback(() => {
    if (stage === 'witnessing') {
      lastMoveRef.current = Date.now();
      setStillnessLevel(0);
    }
  }, [stage]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (stillnessTimerRef.current) clearInterval(stillnessTimerRef.current);
      if (thoughtIntervalRef.current) clearInterval(thoughtIntervalRef.current);
    };
  }, []);

  // ── Ambient particles — dust motes in candlelight ────────────────
  const particles = useRef(
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 5,
      angle: Math.random() * 360,
    }))
  ).current;

  // Speed derived from stillness (slower = more still)
  const thoughtSpeed = gapRevealed ? 0.15 : 1 - stillnessLevel * 0.7;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
      onClick={handleInteraction}
      style={{
        width: '100%',
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(ellipse at 50% 40%, ${palette.stoneGlow}, ${palette.stoneFaint} 50%, ${palette.base} 80%)`,
        fontFamily: fonts.primary,
        cursor: 'default',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* ── Ambient dust ─────────────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: 0,
            }}
            animate={{
              opacity: [0, 0.25, 0],
              y: [0, -40, -80],
              x: [0, Math.sin(p.angle) * 20],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              background: palette.stone,
            }}
          />
        ))}
      </div>

      {/* ── Central experience ───────────────��───────────────────── */}
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
          gap: '0',
        }}
      >
        {/* ── Stage: Arriving ────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {stage === 'arriving' && (
            <motion.div
              key="arriving"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              style={{ textAlign: 'center' }}
            >
              <motion.div
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: palette.stone,
                  margin: '0 auto',
                }}
              />
            </motion.div>
          )}

          {/* ── Stage: Settling ──────────────────────────────────── */}
          {stage === 'settling' && (
            <motion.div
              key="settling"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: 'center' }}
            >
              <div
                style={{
                  fontSize: navicueType.afterglow.fontSize,
                  color: palette.whisper,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  letterSpacing: '0.03em',
                  lineHeight: 1.8,
                }}
              >
                Don't do anything.
                <br />
                Just... notice.
              </div>
            </motion.div>
          )}

          {/* ── Stage: Witnessing ────────────────────────────────── */}
          {stage === 'witnessing' && (
            <motion.div
              key="witnessing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              style={{
                width: '100%',
                minHeight: '360px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Thought stream flowing through */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '28px',
                }}
              >
                {visibleThoughts.map((thoughtIdx, i) => (
                  <motion.div
                    key={`${thoughtIdx}-${i}-${visibleThoughts.length}`}
                    initial={{ opacity: 0, x: -60 }}
                    animate={{
                      opacity: [0, 0.35 * thoughtSpeed, 0],
                      x: [-60, 0, 60],
                    }}
                    transition={{
                      duration: 4 / Math.max(thoughtSpeed, 0.15),
                      ease: 'linear',
                    }}
                    style={{
                      fontSize: navicueType.texture.fontSize,
                      color: palette.warmWhite,
                      fontFamily: fonts.secondary,
                      fontStyle: 'italic',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {THOUGHT_STREAMS[thoughtIdx]}...
                  </motion.div>
                ))}
              </div>

              {/* The observer point — still center */}
              <motion.div
                animate={{
                  boxShadow: [
                    `0 0 ${20 + stillnessLevel * 40}px ${palette.breath}`,
                    `0 0 ${30 + stillnessLevel * 60}px ${palette.breath}`,
                    `0 0 ${20 + stillnessLevel * 40}px ${palette.breath}`,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  width: `${6 + stillnessLevel * 10}px`,
                  height: `${6 + stillnessLevel * 10}px`,
                  borderRadius: '50%',
                  background: palette.stone,
                  transition: 'width 0.8s ease, height 0.8s ease',
                }}
              />

              {/* Stillness indicator — just the orb growing, nothing numeric */}
              <motion.div
                animate={{
                  opacity: stillnessLevel > 0.3 ? stillnessLevel * 0.5 : 0,
                }}
                style={{
                  position: 'absolute',
                  width: `${100 + stillnessLevel * 200}px`,
                  height: `${100 + stillnessLevel * 200}px`,
                  borderRadius: '50%',
                  border: `1px solid ${palette.stone}`,
                  opacity: 0,
                  transition: 'width 1s ease, height 1s ease',
                }}
              />
            </motion.div>
          )}

          {/* ── Stage: Spacious — the gap revealed ──────────────── */}
          {stage === 'spacious' && (
            <motion.div
              key="spacious"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '48px',
              }}
            >
              {/* The gap — luminous, expansive */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${palette.stoneGlow}, transparent 70%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      `0 0 40px ${palette.breath}`,
                      `0 0 80px ${palette.breath}`,
                      `0 0 40px ${palette.breath}`,
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: palette.stone,
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 2, delay: 1.5 }}
                style={{
                  fontSize: navicueType.prompt.fontSize,
                  color: palette.warmWhite,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  fontWeight: 300,
                  lineHeight: 1.5,
                  letterSpacing: '0.02em',
                }}
              >
                There.
                <br />
                Between two thoughts.
                <br />
                That's you.
              </motion.div>
            </motion.div>
          )}

          {/* ── Stage: Afterglow ─────────────────────────────────── */}
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
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{
                  width: '120px',
                  height: '1px',
                  background: `linear-gradient(90deg, transparent, ${palette.stone}, transparent)`,
                }}
              />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 2, delay: 1 }}
                style={{
                  fontSize: navicueType.afterglow.fontSize,
                  color: palette.whisper,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                }}
              >
                Notice the observer
              </motion.div>

              <motion.div
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: palette.stone,
                  marginTop: '16px',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom breath line — subtle progress, no counter ──── */}
      <motion.div
        animate={{
          scaleX: stage === 'afterglow' ? 1 :
                  stage === 'spacious' ? 0.8 :
                  stage === 'witnessing' ? stillnessLevel * 0.6 : 0,
        }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${palette.stone}, transparent)`,
          transformOrigin: 'center',
          opacity: 0.4,
        }}
      />
    </motion.div>
  );
}