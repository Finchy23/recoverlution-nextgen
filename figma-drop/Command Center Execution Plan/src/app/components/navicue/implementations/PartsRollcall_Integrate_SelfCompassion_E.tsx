/**
 * Parts Rollcall × Self-Compassion × Embodying
 * Magic Signature: sacred_ordinary
 *
 * ═══════════════════════════════════════════════════
 * THE CONNECTION THREAD
 * "You are not alone in this dark."
 * ═══════════════════════════════════════════════════
 *
 * NEUROSCIENCE: The Social Safety System. Mammals evolved
 * caregiving circuitry — the ventral vagal complex — that
 * is the strongest known buffer against stress. When this
 * system is active, cortisol drops, heart rate variability
 * increases, the immune system strengthens. But here's the
 * key: the brain can't distinguish between real and vividly
 * imagined social connection. Visualizing a witness — someone
 * who sees you, who walks with you — activates the same
 * circuitry as being physically held.
 *
 * PHILOSOPHY:
 * Ram Dass: "We're all just walking each other home."
 * Not fixing. Not advising. Walking. Together.
 *
 * INTERACTION: Your dot pulses alone in darkness. You tap it.
 * A thread extends outward. Another dot appears — the witness.
 * The thread glows between you. Both dots pulse in sync.
 * You were never alone. You just forgot to look.
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: isolation, "nobody understands"
 * 2. Different action possible: reach outward, even in imagination
 * 3. Action executed: the thread connects, the witness appears
 * 4. Evidence: the warmth is physical — the body responds
 * 5. Repeated: connection becomes a reflex, not a luxury
 */

import React, { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, surfaces, spacing } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';

const palette = {
  base: surfaces.solid.base,
  rose: 'hsla(345, 45%, 60%, 1)',
  roseGlow: 'hsla(345, 45%, 60%, 0.2)',
  roseFaint: 'hsla(345, 45%, 60%, 0.06)',
  warmWhite: 'hsla(35, 30%, 85%, 0.85)',
  warmFaint: 'hsla(35, 30%, 85%, 0.3)',
  gold: 'hsla(40, 50%, 60%, 0.7)',
  goldGlow: 'hsla(40, 50%, 60%, 0.15)',
  text: 'hsla(345, 12%, 88%, 0.85)',
  textFaint: 'hsla(345, 12%, 88%, 0.35)',
  threadColor: 'hsla(345, 40%, 65%, 0.5)',
};

type Stage = 'arriving' | 'alone' | 'reaching' | 'connected' | 'held' | 'afterglow';

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function PartsRollcall_Integrate_SelfCompassion_E({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [threadProgress, setThreadProgress] = useState(0);
  const animRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };
  const svgId = useId();

  useEffect(() => {
    const t1 = safeTimeout(() => setStage('alone'), 3000);
    return () => {
      clearTimeout(t1);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleReach = () => {
    if (stage !== 'alone') return;
    setStage('reaching');

    // Animate thread extending
    const start = performance.now();
    const duration = 3000;

    const animate = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setThreadProgress(eased);

      if (progress >= 1) {
        setStage('connected');
        safeTimeout(() => setStage('held'), 3000);
        safeTimeout(() => {
          setStage('afterglow');
          onComplete?.();
        }, 9000);
        return;
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
  };

  // Ambient warmth particles
  const particles = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      duration: 10 + Math.random() * 10,
      delay: Math.random() * 6,
    }))
  ).current;

  const showDots = stage === 'alone' || stage === 'reaching' || stage === 'connected' || stage === 'held';

  // Positions
  const selfX = 30;
  const selfY = 50;
  const witnessX = 70;
  const witnessY = 50;

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
        background: `radial-gradient(ellipse at 50% 50%, ${palette.roseFaint}, ${palette.base} 70%)`,
        fontFamily: fonts.primary,
        cursor: 'default',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* ── Ambient warmth ─────────────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {particles.map(p => (
          <motion.div
            key={p.id}
            animate={{
              opacity: [0, stage === 'held' || stage === 'afterglow' ? 0.2 : 0.08, 0],
              y: [0, -20],
            }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              background: palette.rose,
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
                The hardest part
                <br />
                is believing you're not alone in it.
              </div>
            </motion.div>
          )}

          {/* ── The connection field ──────────────────────────────── */}
          {showDots && (
            <motion.div
              key="field"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              style={{
                width: '100%',
                height: '320px',
                position: 'relative',
              }}
            >
              {/* ── Your dot ─────────────────────────────────────── */}
              <motion.div
                onClick={handleReach}
                animate={{
                  boxShadow:
                    stage === 'connected' || stage === 'held'
                      ? [
                          `0 0 15px ${palette.roseGlow}`,
                          `0 0 30px ${palette.roseGlow}`,
                          `0 0 15px ${palette.roseGlow}`,
                        ]
                      : [
                          `0 0 8px ${palette.roseGlow}`,
                          `0 0 20px ${palette.roseGlow}`,
                          `0 0 8px ${palette.roseGlow}`,
                        ],
                }}
                transition={{ duration: stage === 'held' ? 2 : 3, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  left: `${selfX}%`,
                  top: `${selfY}%`,
                  transform: 'translate(-50%, -50%)',
                  width: stage === 'held' ? '18px' : '14px',
                  height: stage === 'held' ? '18px' : '14px',
                  borderRadius: '50%',
                  background: palette.rose,
                  cursor: stage === 'alone' ? 'pointer' : 'default',
                  transition: 'width 1s ease, height 1s ease',
                  zIndex: 3,
                }}
              />

              {/* "You" label */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: stage === 'alone' ? 0.5 : 0.3 }}
                transition={{ duration: 1 }}
                style={{
                  position: 'absolute',
                  left: `${selfX}%`,
                  top: `${selfY + 8}%`,
                  transform: 'translateX(-50%)',
                  fontSize: navicueType.caption.fontSize,
                  color: palette.textFaint,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                }}
              >
                you
              </motion.div>

              {/* ── The thread ────────────────────────────────────── */}
              {(stage === 'reaching' || stage === 'connected' || stage === 'held') && (
                <svg
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                >
                  <defs>
                    <linearGradient id={`${svgId}-threadGrad`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={palette.rose} stopOpacity="0.6" />
                      <stop offset="50%" stopColor={palette.gold} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={palette.rose} stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                  <motion.line
                    x1={`${selfX}%`}
                    y1={`${selfY}%`}
                    x2={`${selfX + (witnessX - selfX) * threadProgress}%`}
                    y2={`${selfY + (witnessY - selfY) * threadProgress}%`}
                    stroke={`url(#${svgId}-threadGrad)`}
                    strokeWidth={stage === 'held' ? 2 : 1}
                    strokeLinecap="round"
                    animate={{
                      opacity: stage === 'held'
                        ? [0.5, 0.8, 0.5]
                        : 0.5,
                    }}
                    transition={{
                      duration: 2,
                      repeat: stage === 'held' ? Infinity : 0,
                    }}
                  />
                </svg>
              )}

              {/* ── The witness dot ──────────────────────────────── */}
              {(stage === 'connected' || stage === 'held') && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    boxShadow: stage === 'held'
                      ? [
                          `0 0 15px ${palette.roseGlow}`,
                          `0 0 30px ${palette.roseGlow}`,
                          `0 0 15px ${palette.roseGlow}`,
                        ]
                      : `0 0 12px ${palette.roseGlow}`,
                  }}
                  transition={{
                    scale: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                    boxShadow: { duration: 2, repeat: stage === 'held' ? Infinity : 0 },
                  }}
                  style={{
                    position: 'absolute',
                    left: `${witnessX}%`,
                    top: `${witnessY}%`,
                    transform: 'translate(-50%, -50%)',
                    width: stage === 'held' ? '18px' : '12px',
                    height: stage === 'held' ? '18px' : '12px',
                    borderRadius: '50%',
                    background: palette.rose,
                    transition: 'width 1s ease, height 1s ease',
                    zIndex: 3,
                  }}
                />
              )}

              {/* "A witness" label */}
              {(stage === 'connected' || stage === 'held') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  style={{
                    position: 'absolute',
                    left: `${witnessX}%`,
                    top: `${witnessY + 8}%`,
                    transform: 'translateX(-50%)',
                    fontSize: navicueType.caption.fontSize,
                    color: palette.textFaint,
                    fontFamily: fonts.secondary,
                    fontStyle: 'italic',
                  }}
                >
                  a witness
                </motion.div>
              )}

              {/* ── Shared warmth glow (held stage) ──────────────── */}
              {stage === 'held' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.05, 0.12, 0.05] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '60%',
                    height: '40%',
                    borderRadius: '50%',
                    background: `radial-gradient(ellipse, ${palette.roseGlow}, transparent 70%)`,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* ── Whisper prompts ───────────────────────────────── */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '5%',
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                }}
              >
                {stage === 'alone' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.25, 0.4, 0.25] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{
                      fontSize: navicueType.caption.fontSize,
                      color: palette.textFaint,
                      fontFamily: fonts.secondary,
                      fontStyle: 'italic',
                    }}
                  >
                    tap to reach out
                  </motion.div>
                )}

                {stage === 'reaching' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    style={{
                      fontSize: navicueType.afterglow.fontSize,
                      color: palette.warmFaint,
                      fontFamily: fonts.secondary,
                      fontStyle: 'italic',
                    }}
                  >
                    reaching…
                  </motion.div>
                )}

                {stage === 'connected' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.6, y: 0 }}
                    transition={{ duration: 1.5 }}
                    style={{
                      fontSize: navicueType.choice.fontSize,
                      color: palette.text,
                      fontFamily: fonts.secondary,
                      fontStyle: 'italic',
                      fontWeight: 300,
                    }}
                  >
                    Someone sees you.
                  </motion.div>
                )}

                {stage === 'held' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    transition={{ duration: 2 }}
                    style={{
                      fontSize: navicueType.narrative.fontSize,
                      color: palette.text,
                      fontFamily: fonts.secondary,
                      fontStyle: 'italic',
                      fontWeight: 300,
                      lineHeight: 1.6,
                    }}
                  >
                    We are walking
                    <br />
                    each other home.
                  </motion.div>
                )}
              </div>
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
              {/* Two dots, synchronized */}
              <div style={{ display: 'flex', gap: '60px', alignItems: 'center' }}>
                <motion.div
                  animate={{
                    opacity: [0.4, 0.8, 0.4],
                    boxShadow: [
                      `0 0 10px ${palette.roseGlow}`,
                      `0 0 25px ${palette.roseGlow}`,
                      `0 0 10px ${palette.roseGlow}`,
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: palette.rose,
                  }}
                />
                <motion.div
                  animate={{ opacity: [0.2, 0.35, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    width: '40px',
                    height: '1px',
                    background: `linear-gradient(90deg, ${palette.rose}, ${palette.gold}, ${palette.rose})`,
                  }}
                />
                <motion.div
                  animate={{
                    opacity: [0.4, 0.8, 0.4],
                    boxShadow: [
                      `0 0 10px ${palette.roseGlow}`,
                      `0 0 25px ${palette.roseGlow}`,
                      `0 0 10px ${palette.roseGlow}`,
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: palette.rose,
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: navicueType.afterglow.fontSize,
                  color: palette.textFaint,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  lineHeight: 1.8,
                }}
              >
                You were never carrying this alone.
                <br />
                You just forgot to look up.
              </div>

              <motion.div
                animate={{ opacity: [0.15, 0.3, 0.15] }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{
                  width: '140px',
                  height: '1px',
                  background: `linear-gradient(90deg, transparent, ${palette.rose}, transparent)`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom accent ──────────────────────────────────────────── */}
      <motion.div
        animate={{
          opacity: stage === 'afterglow' ? 0.4 : stage === 'held' ? 0.3 : 0.1,
        }}
        transition={{ duration: 2 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${palette.rose}, transparent)`,
        }}
      />
    </motion.div>
  );
}