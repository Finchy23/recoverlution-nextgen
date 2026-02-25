/**
 * Probe x Exposure x Embodying
 * Magic Signature: sensory_cinema
 *
 * THE APPROACH
 * "What you avoid doesn't shrink. It waits."
 *
 * NEUROSCIENCE: Avoidance strengthens the amygdala's threat prediction.
 * Every time you look away, the brain logs: "confirmed dangerous."
 * Exposure therapy works by providing corrective prediction errors —
 * approaching the feared thing and discovering it's survivable.
 * The body learns safety ONLY through approach, never through logic.
 *
 * PHILOSOPHY:
 * Alan Watts: "The only way to make sense out of change is to plunge
 * into it, move with it, and join the dance."
 * Ram Dass: "The resistance to the unpleasant situation is the root
 * of suffering."
 *
 * INTERACTION: Hold-to-approach. A warm presence exists in the deep.
 * It seems large and threatening from far away. As the user holds,
 * they approach. But the closer they get, the more detail resolves —
 * texture, nuance, even beauty. What seemed monolithic becomes
 * navigable. The body learns: approaching is survivable.
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: avoidance feels safe
 * 2. Different action possible: hold → approach
 * 3. Action executed: body stays present while approaching
 * 4. Evidence: it's survivable, even interesting up close
 * 5. Repeated: avoidance threshold lowers across contexts
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, surfaces, spacing } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';

const palette = {
  base: surfaces.solid.base,
  ocean: 'hsla(200, 35%, 45%, 1)',
  oceanDeep: 'hsla(210, 40%, 20%, 1)',
  oceanGlow: 'hsla(200, 35%, 45%, 0.25)',
  oceanFaint: 'hsla(200, 35%, 45%, 0.08)',
  warmLight: 'hsla(35, 60%, 70%, 0.9)',
  warmGlow: 'hsla(35, 60%, 60%, 0.3)',
  warmFaint: 'hsla(35, 60%, 60%, 0.08)',
  text: 'hsla(200, 15%, 85%, 0.85)',
  textFaint: 'hsla(200, 15%, 85%, 0.35)',
};

type Stage = 'arriving' | 'present' | 'approaching' | 'close' | 'afterglow';

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

// Texture words that resolve as you approach — not clinical, human
const TEXTURES = [
  'it has edges',
  'it has a shape',
  'it breathes',
  'it\u2019s not solid',
  'it has colour',
  'there\u2019s space inside it',
];

export default function Probe_Integrate_Exposure_E({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [approach, setApproach] = useState(0); // 0 = far, 1 = arrived
  const [holding, setHolding] = useState(false);
  const [textureIdx, setTextureIdx] = useState(-1);
  const holdAnimRef = useRef<number | null>(null);
  const holdStartRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  // ── Arrival ───────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setStage('present'), 2500);
    return () => { clearTimeout(t); timersRef.current.forEach(clearTimeout); };
  }, []);

  // ── Hold-to-approach engine ───────────────────────────────────
  const startHold = useCallback(() => {
    if (stage !== 'present' && stage !== 'approaching') return;
    setHolding(true);
    setStage('approaching');
    holdStartRef.current = Date.now() - approach * 10000;

    const animate = () => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min(elapsed / 10000, 1); // 10 seconds full approach
      setApproach(progress);

      // Reveal textures at thresholds
      const texIdx = Math.floor(progress * TEXTURES.length);
      setTextureIdx(Math.min(texIdx, TEXTURES.length - 1));

      if (progress >= 1) {
        setHolding(false);
        setStage('close');
        safeTimeout(() => {
          setStage('afterglow');
          onComplete?.();
        }, 5000);
        return;
      }

      holdAnimRef.current = requestAnimationFrame(animate);
    };

    holdAnimRef.current = requestAnimationFrame(animate);
  }, [stage, approach, onComplete]);

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

  // ── Depth particles — like light filtering through water ──────
  const depthParticles = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 10 + Math.random() * 80,
      size: 1 + Math.random() * 3,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 4,
      drift: (Math.random() - 0.5) * 30,
    }))
  ).current;

  // ── Derived values ────────────────────────────────────────────
  const presenceSize = 20 + (1 - approach) * 80; // Gets smaller (closer = detailed, not looming)
  const warmth = approach; // More warmth as you approach
  const backgroundGlow = `radial-gradient(
    ellipse at 50% ${50 - approach * 15}%,
    ${approach > 0.5 ? palette.warmFaint : palette.oceanFaint},
    ${palette.oceanDeep} ${40 + approach * 20}%,
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
        background: backgroundGlow,
        fontFamily: fonts.primary,
        cursor: 'default',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 1s ease',
      }}
    >
      {/* ── Depth particles ──────────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {depthParticles.map(p => (
          <motion.div
            key={p.id}
            animate={{
              y: [0, p.drift, 0],
              opacity: [0, 0.15 + warmth * 0.15, 0],
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
              height: `${p.size * 4}px`,
              borderRadius: '50%',
              background: approach > 0.5
                ? `linear-gradient(180deg, ${palette.warmGlow}, transparent)`
                : `linear-gradient(180deg, ${palette.oceanGlow}, transparent)`,
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
                Something is here
                <br />
                that you haven't looked at yet.
              </div>
            </motion.div>
          )}

          {/* ── Present — the presence exists, invitation to approach */}
          {(stage === 'present' || stage === 'approaching') && (
            <motion.div
              key="presence"
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
              {/* The presence — warm glow in the deep */}
              <motion.div
                onMouseDown={startHold}
                onMouseUp={stopHold}
                onMouseLeave={stopHold}
                onTouchStart={startHold}
                onTouchEnd={stopHold}
                animate={{
                  scale: holding ? 1.05 : 1,
                }}
                transition={{ duration: 0.6 }}
                style={{
                  position: 'relative',
                  width: '280px',
                  height: '280px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {/* Outer atmosphere */}
                <motion.div
                  animate={{
                    opacity: [0.15, 0.25, 0.15],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${
                      approach > 0.5 ? palette.warmGlow : palette.oceanGlow
                    }, transparent 70%)`,
                    transition: 'background 2s ease',
                  }}
                />

                {/* The presence itself */}
                <motion.div
                  animate={{
                    width: `${presenceSize}px`,
                    height: `${presenceSize}px`,
                    opacity: 0.4 + approach * 0.4,
                  }}
                  transition={{ duration: 0.5 }}
                  style={{
                    borderRadius: approach > 0.7 ? '30%' : '50%',
                    background: approach > 0.5
                      ? `radial-gradient(circle, ${palette.warmLight}, ${palette.warmGlow})`
                      : `radial-gradient(circle, ${palette.ocean}, ${palette.oceanGlow})`,
                    transition: 'border-radius 2s ease, background 2s ease',
                    boxShadow: `0 0 ${40 + approach * 60}px ${
                      approach > 0.5 ? palette.warmGlow : palette.oceanGlow
                    }`,
                  }}
                />

                {/* Detail textures that resolve with approach */}
                {approach > 0.3 && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: '20%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    {Array.from({ length: Math.floor(approach * 5) }, (_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 0.2 + approach * 0.2, scaleX: 1 }}
                        transition={{ duration: 1, delay: i * 0.15 }}
                        style={{
                          width: `${30 + Math.random() * 40}%`,
                          height: '1px',
                          background: approach > 0.5 ? palette.warmLight : palette.text,
                          borderRadius: '1px',
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Texture narration — what resolves as you approach */}
              <div style={{ minHeight: '60px', textAlign: 'center' }}>
                <AnimatePresence mode="wait">
                  {textureIdx >= 0 && stage === 'approaching' && (
                    <motion.div
                      key={textureIdx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 0.6, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 1 }}
                      style={{
                        fontSize: navicueType.texture.fontSize,
                        color: palette.text,
                        fontFamily: fonts.secondary,
                        fontStyle: 'italic',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {TEXTURES[textureIdx]}
                    </motion.div>
                  )}
                  {stage === 'present' && approach === 0 && (
                    <motion.div
                      key="invite"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.35 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5 }}
                      style={{
                        fontSize: navicueType.hint.fontSize,
                        color: palette.textFaint,
                        fontFamily: fonts.secondary,
                        fontStyle: 'italic',
                      }}
                    >
                      stay with it
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ── Close — arrived, it's not what you expected ──────── */}
          {stage === 'close' && (
            <motion.div
              key="close"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2.5 }}
              style={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '40px',
              }}
            >
              {/* Warmth radiating outward */}
              <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.8, 2.5],
                      opacity: [0.2, 0.1, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: i * 1.3,
                    }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      border: `1px solid ${palette.warmLight}`,
                    }}
                  />
                ))}
                <motion.div
                  animate={{
                    boxShadow: [
                      `0 0 40px ${palette.warmGlow}`,
                      `0 0 80px ${palette.warmGlow}`,
                      `0 0 40px ${palette.warmGlow}`,
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '20px',
                    height: '20px',
                    borderRadius: '30%',
                    background: `radial-gradient(circle, ${palette.warmLight}, ${palette.warmGlow})`,
                  }}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 2, delay: 1 }}
                style={{
                  fontSize: navicueType.arrival.fontSize,
                  color: palette.text,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  fontWeight: 300,
                  lineHeight: 1.6,
                }}
              >
                Closer than you expected.
                <br />
                Smaller than it seemed.
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
                gap: '24px',
              }}
            >
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 6, repeat: Infinity }}
                style={{
                  width: '160px',
                  height: '1px',
                  background: `linear-gradient(90deg, transparent, ${palette.warmLight}, transparent)`,
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
                The things we approach
                <br />
                teach us they were never the enemy.
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Depth line ───────────────────────────────────────────── */}
      <motion.div
        animate={{ scaleX: approach }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${
            approach > 0.5 ? palette.warmLight : palette.ocean
          }, transparent)`,
          transformOrigin: 'center',
          opacity: 0.3,
          transition: 'background 2s ease',
        }}
      />
    </motion.div>
  );
}