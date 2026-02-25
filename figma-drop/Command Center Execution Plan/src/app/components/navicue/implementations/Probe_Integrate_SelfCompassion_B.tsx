/**
 * Probe x Self-Compassion x Believing
 * Magic Signature: compassionate_depth
 *
 * THE UNDERTOW
 * "What if the bottom isn't empty?"
 *
 * NEUROSCIENCE: Self-compassion activates the mammalian care system —
 * vagus nerve, oxytocin circuits, left prefrontal cortex. But we only
 * get there by approaching pain, not bypassing it. The amygdala marks
 * inner suffering as "threat" and the default response is avoidance.
 * Probing INTO pain WITH compassion creates a prediction error:
 * "I went toward it and it was... warm?" That error rewires the
 * threat circuit. The bottom of feeling is solid ground.
 *
 * PHILOSOPHY:
 * Alan Watts: "To have faith is to trust yourself to the water."
 * Ram Dass: "We're all just walking each other home."
 *
 * INTERACTION: Hold-to-descend — structurally echoes The Approach,
 * but inverted. Instead of approaching an external presence, you
 * descend into your own ache. The deeper you hold, the warmer it
 * gets — not colder. Words of self-compassion emerge from the deep.
 * At the bottom: not emptiness, but a floor. Solid. Warm.
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: avoidance of inner pain
 * 2. Different action possible: hold → descend
 * 3. Action executed: body stays present while descending
 * 4. Evidence: the bottom is warm, not empty
 * 5. Repeated: feelings become navigable, not threatening
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, surfaces, spacing } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';

const palette = {
  base: surfaces.solid.base,
  rose: 'hsla(330, 35%, 52%, 1)',
  roseGlow: 'hsla(330, 35%, 52%, 0.25)',
  roseFaint: 'hsla(330, 35%, 52%, 0.06)',
  warmDeep: 'hsla(340, 30%, 40%, 1)',
  warmGold: 'hsla(35, 50%, 65%, 0.9)',
  warmGoldGlow: 'hsla(35, 50%, 65%, 0.25)',
  text: 'hsla(330, 15%, 85%, 0.85)',
  textFaint: 'hsla(330, 15%, 85%, 0.35)',
};

type Stage = 'arriving' | 'present' | 'descending' | 'floor' | 'afterglow';

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

// What surfaces at different depths — not advice, recognition
const DEPTH_WORDS = [
  'it aches',
  'it has been here a while',
  'it isn\u2019t dangerous',
  'it\u2019s just... sad',
  'there\u2019s warmth underneath',
  'the floor is solid',
];

export default function Probe_Integrate_SelfCompassion_B({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [depth, setDepth] = useState(0); // 0 = surface, 1 = bottom
  const [holding, setHolding] = useState(false);
  const [depthWordIdx, setDepthWordIdx] = useState(-1);
  const holdAnimRef = useRef<number | null>(null);
  const holdStartRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  // ── Arrival ───────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setStage('present'), 2800);
    return () => clearTimeout(t);
  }, []);

  // ── Hold-to-descend ───────────────────────────────────────────
  const startHold = useCallback(() => {
    if (stage !== 'present' && stage !== 'descending') return;
    setHolding(true);
    setStage('descending');
    holdStartRef.current = Date.now() - depth * 12000;

    const animate = () => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min(elapsed / 12000, 1);
      setDepth(progress);

      const wordIdx = Math.floor(progress * DEPTH_WORDS.length);
      setDepthWordIdx(Math.min(wordIdx, DEPTH_WORDS.length - 1));

      if (progress >= 1) {
        setHolding(false);
        setStage('floor');
        safeTimeout(() => {
          setStage('afterglow');
          onComplete?.();
        }, 6000);
        return;
      }

      holdAnimRef.current = requestAnimationFrame(animate);
    };

    holdAnimRef.current = requestAnimationFrame(animate);
  }, [stage, depth, onComplete]);

  const stopHold = useCallback(() => {
    setHolding(false);
    if (holdAnimRef.current) {
      cancelAnimationFrame(holdAnimRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (holdAnimRef.current) cancelAnimationFrame(holdAnimRef.current);
      timersRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // ── Particles — warmth rising from the deep ──────────────────
  const particles = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      y: 40 + Math.random() * 50,
      size: 1.5 + Math.random() * 3,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 5,
      drift: (Math.random() - 0.5) * 20,
    }))
  ).current;

  // ── Derived ───────────────────────────────────────────────────
  const warmth = depth;
  const bgGlow = `radial-gradient(
    ellipse at 50% ${60 + depth * 20}%,
    ${depth > 0.5 ? palette.warmGoldGlow : palette.roseFaint},
    ${palette.warmDeep} ${30 + depth * 25}%,
    ${palette.base} 85%
  )`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.5 }}
      style={{
        width: '100%',
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: bgGlow,
        fontFamily: fonts.primary,
        cursor: 'default',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 1.5s ease',
      }}
    >
      {/* ── Warmth particles ─────────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {particles.map(p => (
          <motion.div
            key={p.id}
            animate={{
              y: [0, -(30 + warmth * 40), -(60 + warmth * 60)],
              x: [0, p.drift],
              opacity: [0, 0.1 + warmth * 0.2, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              background: depth > 0.5 ? palette.warmGold : palette.rose,
              filter: 'blur(0.5px)',
              transition: 'background 2s ease',
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
          maxWidth: '640px',
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
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: 'center' }}
            >
              <div
                style={{
                  fontSize: navicueType.prompt.fontSize,
                  color: palette.text,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  fontWeight: 300,
                  lineHeight: 1.6,
                }}
              >
                There's something underneath
                <br />
                you've been swimming above.
              </div>
            </motion.div>
          )}

          {/* ── Present / Descending ─────────────────────────────── */}
          {(stage === 'present' || stage === 'descending') && (
            <motion.div
              key="descend"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '48px',
              }}
            >
              {/* The depth orb — press to descend */}
              <motion.div
                onMouseDown={startHold}
                onMouseUp={stopHold}
                onMouseLeave={stopHold}
                onTouchStart={startHold}
                onTouchEnd={stopHold}
                animate={{
                  scale: holding ? 1.08 : 1,
                }}
                transition={{ duration: 0.8 }}
                style={{
                  position: 'relative',
                  width: '260px',
                  height: '260px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {/* Outer atmosphere — shifts warm with depth */}
                <motion.div
                  animate={{
                    opacity: [0.12, 0.22, 0.12],
                    scale: [1, 1.04, 1],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${
                      depth > 0.5 ? palette.warmGoldGlow : palette.roseGlow
                    }, transparent 70%)`,
                    transition: 'background 2s ease',
                  }}
                />

                {/* Core — gets warmer and softer */}
                <motion.div
                  animate={{
                    width: `${40 + depth * 60}px`,
                    height: `${40 + depth * 60}px`,
                    opacity: 0.3 + depth * 0.5,
                  }}
                  transition={{ duration: 0.6 }}
                  style={{
                    borderRadius: '50%',
                    background: depth > 0.5
                      ? `radial-gradient(circle, ${palette.warmGold}, ${palette.warmGoldGlow})`
                      : `radial-gradient(circle, ${palette.rose}, ${palette.roseGlow})`,
                    transition: 'background 2s ease',
                    boxShadow: `0 0 ${30 + depth * 60}px ${
                      depth > 0.5 ? palette.warmGoldGlow : palette.roseGlow
                    }`,
                  }}
                />

                {/* Depth rings — concentric, fading inward */}
                {depth > 0.2 && (
                  <>
                    {Array.from({ length: Math.floor(depth * 4) }, (_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.1 + depth * 0.1, scale: 1 }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                        style={{
                          position: 'absolute',
                          width: `${80 + i * 40}px`,
                          height: `${80 + i * 40}px`,
                          borderRadius: '50%',
                          border: `1px solid ${depth > 0.5 ? palette.warmGold : palette.rose}`,
                          opacity: 0.08,
                        }}
                      />
                    ))}
                  </>
                )}
              </motion.div>

              {/* Depth narration */}
              <div style={{ minHeight: '60px', textAlign: 'center' }}>
                <AnimatePresence mode="wait">
                  {depthWordIdx >= 0 && stage === 'descending' && (
                    <motion.div
                      key={depthWordIdx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 0.6, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 1.2 }}
                      style={{
                        fontSize: navicueType.texture.fontSize,
                        color: depth > 0.5 ? palette.warmGold : palette.text,
                        fontFamily: fonts.secondary,
                        fontStyle: 'italic',
                        letterSpacing: '0.02em',
                        transition: 'color 2s ease',
                      }}
                    >
                      {DEPTH_WORDS[depthWordIdx]}
                    </motion.div>
                  )}
                  {stage === 'present' && depth === 0 && (
                    <motion.div
                      key="invite"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5 }}
                      style={{
                        fontSize: navicueType.hint.fontSize,
                        color: palette.textFaint,
                        fontFamily: fonts.secondary,
                        fontStyle: 'italic',
                      }}
                    >
                      hold to descend
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ── Floor — the bottom is solid, warm ────────────────── */}
          {stage === 'floor' && (
            <motion.div
              key="floor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 3 }}
              style={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '48px',
              }}
            >
              {/* Warmth radiating — solid ground */}
              <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.6, 2],
                      opacity: [0.15, 0.08, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: i * 1.2,
                    }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      border: `1px solid ${palette.warmGold}`,
                    }}
                  />
                ))}
                <motion.div
                  animate={{
                    boxShadow: [
                      `0 0 40px ${palette.warmGoldGlow}`,
                      `0 0 80px ${palette.warmGoldGlow}`,
                      `0 0 40px ${palette.warmGoldGlow}`,
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${palette.warmGold}, ${palette.warmGoldGlow})`,
                  }}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 2.5, delay: 1 }}
                style={{
                  fontSize: navicueType.arrival.fontSize,
                  color: palette.warmGold,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  fontWeight: 300,
                  lineHeight: 1.6,
                }}
              >
                There.
                <br />
                The bottom isn't empty.
                <br />
                It's warm.
              </motion.div>
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
                gap: '28px',
              }}
            >
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{
                  width: '140px',
                  height: '1px',
                  background: `linear-gradient(90deg, transparent, ${palette.warmGold}, transparent)`,
                }}
              />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 2, delay: 1 }}
                style={{
                  fontSize: navicueType.afterglow.fontSize,
                  color: palette.textFaint,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  lineHeight: 1.8,
                }}
              >
                The things you carry
                <br />
                are lighter when you stop swimming.
              </motion.div>

              <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: palette.warmGold,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Depth line ───────────────────────────────────────────── */}
      <motion.div
        animate={{ scaleX: depth }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${
            depth > 0.5 ? palette.warmGold : palette.rose
          }, transparent)`,
          transformOrigin: 'center',
          opacity: 0.3,
          transition: 'background 2s ease',
        }}
      />
    </motion.div>
  );
}