/**
 * Probe x Values Clarification x Believing
 * Magic Signature: values_depth
 *
 * THE TIDE
 * "Beneath the performance, something is real."
 *
 * NEUROSCIENCE: Social evaluation circuitry (medial prefrontal cortex,
 * temporoparietal junction) constantly models how others perceive us.
 * This creates "performed values" — what we say matters because it
 * sounds right. Probing beneath this layer deactivates social
 * monitoring and activates authentic self-referential processing.
 * The real values live deeper. Affect labeling (Lieberman et al.)
 * shows that naming the honest thing reduces amygdala activation
 * and increases ventrolateral prefrontal engagement.
 *
 * PHILOSOPHY:
 * Alan Watts: "Trying to define yourself is like trying to bite
 * your own teeth."
 * Ram Dass: "What you meet in another being is the projection
 * of your own level of evolution."
 *
 * INTERACTION: Hold-to-descend through layers. Surface: polished
 * values. Mid-depth: messier, more honest. Bottom: one value
 * remains, undecorated. Not pretty. Just true.
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: performed values, social performance
 * 2. Different action possible: hold → go beneath
 * 3. Action executed: layers strip away
 * 4. Evidence: the honest value is simpler and truer
 * 5. Repeated: values become private truth, not public performance
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, surfaces, spacing, radius } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';

const palette = {
  base: surfaces.solid.base,
  teal: 'hsla(195, 45%, 42%, 1)',
  tealGlow: 'hsla(195, 45%, 42%, 0.25)',
  tealFaint: 'hsla(195, 45%, 42%, 0.06)',
  tealDeep: 'hsla(200, 50%, 25%, 1)',
  clearLight: 'hsla(180, 35%, 70%, 0.9)',
  clearGlow: 'hsla(180, 35%, 70%, 0.2)',
  text: 'hsla(195, 15%, 85%, 0.85)',
  textFaint: 'hsla(195, 15%, 85%, 0.35)',
  stripped: 'hsla(195, 20%, 75%, 0.5)',
};

type Stage = 'arriving' | 'surface' | 'descending' | 'bedrock' | 'afterglow';

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

// Three layers — surface performance → honest middle → bedrock truth
interface ValueLayer {
  depth: string;
  text: string;
  opacity: number;
}

const LAYERS: ValueLayer[] = [
  { depth: 'surface', text: '"I value authenticity"', opacity: 0.5 },
  { depth: 'surface', text: '"Growth is important to me"', opacity: 0.45 },
  { depth: 'surface', text: '"I care about making a difference"', opacity: 0.4 },
  { depth: 'middle', text: '"I want to be liked"', opacity: 0.55 },
  { depth: 'middle', text: '"I\u2019m afraid of being ordinary"', opacity: 0.6 },
  { depth: 'bedrock', text: '"I just want to feel safe"', opacity: 0.9 },
];

export default function Probe_Integrate_ValuesClarification_B({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [depth, setDepth] = useState(0); // 0 = surface, 1 = bedrock
  const [holding, setHolding] = useState(false);
  const [visibleLayerIdx, setVisibleLayerIdx] = useState(-1);
  const holdAnimRef = useRef<number | null>(null);
  const holdStartRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  // ── Arrival ───────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setStage('surface'), 3000);
    return () => clearTimeout(t);
  }, []);

  // ── Hold-to-descend ───────────────────────────────────────────
  const startHold = useCallback(() => {
    if (stage !== 'surface' && stage !== 'descending') return;
    setHolding(true);
    setStage('descending');
    holdStartRef.current = Date.now() - depth * 14000;

    const animate = () => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min(elapsed / 14000, 1);
      setDepth(progress);

      // Reveal layers at thresholds
      const layerIdx = Math.floor(progress * LAYERS.length);
      setVisibleLayerIdx(Math.min(layerIdx, LAYERS.length - 1));

      if (progress >= 1) {
        setHolding(false);
        setStage('bedrock');
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
      timersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  // ── Particles — sediment drifting ─────────────────────────────
  const particles = useRef(
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 20 + Math.random() * 60,
      size: 1 + Math.random() * 2.5,
      duration: 7 + Math.random() * 9,
      delay: Math.random() * 4,
      drift: (Math.random() - 0.5) * 40,
    }))
  ).current;

  // ── Derived ───────────────────────────────────────────────────
  const clarity = depth;
  const bgGlow = `radial-gradient(
    ellipse at 50% ${45 + depth * 15}%,
    ${depth > 0.7 ? palette.clearGlow : palette.tealFaint},
    ${palette.tealDeep} ${35 + depth * 20}%,
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
      {/* ── Sediment particles ────────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {particles.map(p => (
          <motion.div
            key={p.id}
            animate={{
              y: [0, p.drift * 0.5, p.drift],
              x: [0, p.drift * 0.3],
              opacity: [0, 0.12 + clarity * 0.08, 0],
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
              height: `${p.size * 2}px`,
              borderRadius: '50%',
              background: depth > 0.7
                ? `linear-gradient(180deg, ${palette.clearGlow}, transparent)`
                : `linear-gradient(180deg, ${palette.tealGlow}, transparent)`,
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
                What you say matters to you
                <br />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 1.5, duration: 1.5 }}
                >
                  and what actually does
                </motion.span>
                <br />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.35 }}
                  transition={{ delay: 2.5, duration: 1 }}
                >
                  are not always the same.
                </motion.span>
              </div>
            </motion.div>
          )}

          {/* ── Surface / Descending ─────────────────────────────── */}
          {(stage === 'surface' || stage === 'descending') && (
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
                gap: '40px',
                width: '100%',
              }}
            >
              {/* Layer stack — visible values shift as you descend */}
              <motion.div
                onMouseDown={startHold}
                onMouseUp={stopHold}
                onMouseLeave={stopHold}
                onTouchStart={startHold}
                onTouchEnd={stopHold}
                style={{
                  width: '100%',
                  maxWidth: '360px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  cursor: 'pointer',
                  position: 'relative',
                  minHeight: '280px',
                  justifyContent: 'center',
                }}
              >
                {LAYERS.map((layer, i) => {
                  const isRevealed = i <= visibleLayerIdx;
                  const isCurrent = i === visibleLayerIdx;
                  const isPast = i < visibleLayerIdx;
                  const isBedrock = layer.depth === 'bedrock';

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
                      animate={{
                        opacity: isRevealed ? (isPast ? 0.15 : isBedrock ? 0.9 : 0.6) : 0,
                        y: isRevealed ? 0 : 15,
                        filter: isRevealed ? 'blur(0px)' : 'blur(6px)',
                        scale: isCurrent ? 1.02 : 1,
                      }}
                      transition={{ duration: 1.2 }}
                      style={{
                        fontSize: isBedrock
                          ? navicueType.subheading.fontSize
                          : navicueType.texture.fontSize,
                        color: isBedrock
                          ? palette.clearLight
                          : isPast
                          ? palette.stripped
                          : palette.text,
                        fontFamily: fonts.secondary,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        lineHeight: 1.5,
                        padding: '8px 16px',
                        borderRadius: radius.md,
                        background: isCurrent && !isBedrock
                          ? palette.tealFaint
                          : 'transparent',
                        textDecoration: isPast ? 'line-through' : 'none',
                        transition: 'color 1s ease, text-decoration 0.5s ease',
                      }}
                    >
                      {layer.text}
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Depth cue */}
              <div style={{ minHeight: '40px', textAlign: 'center' }}>
                {stage === 'surface' && depth === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ duration: 1.5 }}
                    style={{
                      fontSize: navicueType.hint.fontSize,
                      color: palette.textFaint,
                      fontFamily: fonts.secondary,
                      fontStyle: 'italic',
                    }}
                  >
                    hold to go beneath
                  </motion.div>
                )}
                {stage === 'descending' && depth > 0.3 && depth < 0.7 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.35 }}
                    style={{
                      fontSize: navicueType.caption.fontSize,
                      color: palette.teal,
                      fontFamily: fonts.secondary,
                      fontStyle: 'italic',
                    }}
                  >
                    past the performance...
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Bedrock — the real value, undecorated ────────────── */}
          {stage === 'bedrock' && (
            <motion.div
              key="bedrock"
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
              {/* Clear light — what remains */}
              <motion.div
                animate={{
                  boxShadow: [
                    `0 0 30px ${palette.clearGlow}`,
                    `0 0 60px ${palette.clearGlow}`,
                    `0 0 30px ${palette.clearGlow}`,
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: palette.clearLight,
                }}
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 2, delay: 1 }}
                style={{
                  fontSize: navicueType.arrival.fontSize,
                  color: palette.clearLight,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  fontWeight: 300,
                  lineHeight: 1.6,
                }}
              >
                This one doesn't need
                <br />
                an audience.
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: 2, delay: 3 }}
                style={{
                  fontSize: navicueType.afterglow.fontSize,
                  color: palette.textFaint,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                }}
              >
                The simplest values are the truest.
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
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 6, repeat: Infinity }}
                style={{
                  width: '160px',
                  height: '1px',
                  background: `linear-gradient(90deg, transparent, ${palette.clearLight}, transparent)`,
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
                The tide goes out.
                <br />
                What remains on the shore
                <br />
                was never performing.
              </motion.div>

              <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: palette.teal,
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
            depth > 0.7 ? palette.clearLight : palette.teal
          }, transparent)`,
          transformOrigin: 'center',
          opacity: 0.3,
          transition: 'background 2s ease',
        }}
      />
    </motion.div>
  );
}