/**
 * Practice × Exposure × Embodying
 * Magic Signature: witness_ritual
 *
 * ═══════════════════════════════════════════════════
 * THE REALITY ANCHOR
 * "Find the floor. Find the light. You are here."
 * ═══════════════════════════════════════════════════
 *
 * NEUROSCIENCE: The Orienting Response. Under stress, the Default
 * Mode Network pulls you inward — rumination, catastrophizing,
 * time-traveling to the past or future. External sensory processing
 * competes directly with this network. When you force your brain
 * to locate, identify, and engage with concrete present-moment
 * stimuli, you physically pull neural resources away from the
 * rumination circuit. Three anchors is the minimum effective dose.
 *
 * PHILOSOPHY:
 * Ram Dass: "Be here now." The simplest and hardest instruction.
 * Not "be somewhere better." Not "be here but calmer."
 * Just: here. Just: now. Just: this.
 *
 * INTERACTION: Three luminous anchors float in darkness. Each is
 * a sensory prompt — something to find in your real environment.
 * Tap each one as you locate it. The world stabilizes. Not because
 * it changed, but because you proved you're in it.
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: spiraling inward, losing the present
 * 2. Different action possible: look outward, name what's real
 * 3. Action executed: three anchors tapped → senses engaged
 * 4. Evidence: the room exists. You exist in it.
 * 5. Repeated: grounding becomes reflex, not technique
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, surfaces, spacing } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';

const palette = {
  base: surfaces.solid.base,
  stone: 'hsla(30, 25%, 50%, 1)',
  stoneGlow: 'hsla(30, 25%, 50%, 0.2)',
  stoneFaint: 'hsla(30, 25%, 50%, 0.06)',
  amber: 'hsla(35, 50%, 55%, 1)',
  amberGlow: 'hsla(35, 50%, 55%, 0.25)',
  sage: 'hsla(150, 25%, 50%, 1)',
  sageGlow: 'hsla(150, 25%, 50%, 0.2)',
  sky: 'hsla(200, 35%, 60%, 1)',
  skyGlow: 'hsla(200, 35%, 60%, 0.2)',
  text: 'hsla(30, 15%, 88%, 0.85)',
  textFaint: 'hsla(30, 15%, 88%, 0.35)',
};

type Stage = 'arriving' | 'grounding' | 'anchored' | 'afterglow';

interface Anchor {
  id: number;
  prompt: string;
  color: string;
  glow: string;
  found: boolean;
  x: number;
  y: number;
}

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Practice_Integrate_Exposure_E({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [anchors, setAnchors] = useState<Anchor[]>([
    {
      id: 0,
      prompt: 'Something you can touch',
      color: palette.amber,
      glow: palette.amberGlow,
      found: false,
      x: 25,
      y: 35,
    },
    {
      id: 1,
      prompt: 'Something you can see',
      color: palette.sage,
      glow: palette.sageGlow,
      found: false,
      x: 70,
      y: 30,
    },
    {
      id: 2,
      prompt: 'Something you can hear',
      color: palette.sky,
      glow: palette.skyGlow,
      found: false,
      x: 45,
      y: 65,
    },
  ]);
  const [activeAnchor, setActiveAnchor] = useState(0);

  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    const t = safeTimeout(() => setStage('grounding'), 3200);
    return () => clearTimeout(t);
  }, []);

  const handleAnchorTap = (id: number) => {
    if (stage !== 'grounding' || id !== activeAnchor) return;

    setAnchors(prev => prev.map(a => a.id === id ? { ...a, found: true } : a));

    const nextActive = activeAnchor + 1;
    if (nextActive >= anchors.length) {
      // All found
      safeTimeout(() => setStage('anchored'), 800);
      safeTimeout(() => {
        setStage('afterglow');
        onComplete?.();
      }, 6000);
    } else {
      setActiveAnchor(nextActive);
    }
  };

  const foundCount = anchors.filter(a => a.found).length;

  // Ambient particles — grounding dust
  const dust = useRef(
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      duration: 10 + Math.random() * 12,
      delay: Math.random() * 6,
    }))
  ).current;

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
        background: `radial-gradient(ellipse at 50% 50%, ${palette.stoneFaint}, ${palette.base} 70%)`,
        fontFamily: fonts.primary,
        cursor: 'default',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* ── Ambient dust ───────────────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {dust.map(d => (
          <motion.div
            key={d.id}
            animate={{
              opacity: [0, 0.12 + foundCount * 0.05, 0],
              y: [0, -20, -40],
            }}
            transition={{ duration: d.duration, repeat: Infinity, delay: d.delay, ease: 'linear' }}
            style={{
              position: 'absolute',
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: `${d.size}px`,
              height: `${d.size}px`,
              borderRadius: '50%',
              background: palette.stone,
            }}
          />
        ))}

        {/* Ground line — stabilizes as anchors are found */}
        <motion.div
          animate={{
            opacity: foundCount === 3 ? 0.4 : foundCount * 0.1 + 0.05,
          }}
          transition={{ duration: 1.5 }}
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '10%',
            right: '10%',
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${palette.stone}, transparent)`,
          }}
        />
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
                You are not in the past.
                <br />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 1.5, duration: 1.5 }}
                >
                  Prove it.
                </motion.span>
              </div>
            </motion.div>
          )}

          {/* ── Grounding — the three anchors ─────────────────────── */}
          {stage === 'grounding' && (
            <motion.div
              key="grounding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
              style={{
                width: '100%',
                minHeight: '340px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* The three anchor orbs */}
              {anchors.map((anchor, i) => (
                <motion.div
                  key={anchor.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: anchor.found ? 0.9 : i === activeAnchor ? 0.8 : 0.25,
                    scale: anchor.found ? 1 : i === activeAnchor ? 1 : 0.7,
                  }}
                  transition={{ duration: 0.8, delay: i * 0.3 }}
                  onClick={() => handleAnchorTap(anchor.id)}
                  style={{
                    position: 'absolute',
                    left: `${anchor.x}%`,
                    top: `${anchor.y}%`,
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: i === activeAnchor && !anchor.found ? 'pointer' : 'default',
                  }}
                >
                  {/* Orb */}
                  <motion.div
                    animate={
                      i === activeAnchor && !anchor.found
                        ? {
                            boxShadow: [
                              `0 0 15px ${anchor.glow}`,
                              `0 0 35px ${anchor.glow}`,
                              `0 0 15px ${anchor.glow}`,
                            ],
                          }
                        : {}
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      width: anchor.found ? '16px' : '40px',
                      height: anchor.found ? '16px' : '40px',
                      borderRadius: '50%',
                      background: anchor.found
                        ? anchor.color
                        : `radial-gradient(circle, ${anchor.glow}, transparent 70%)`,
                      border: anchor.found
                        ? 'none'
                        : `1px solid ${anchor.color}`,
                      transition: 'width 0.5s ease, height 0.5s ease',
                    }}
                  />

                  {/* Prompt text */}
                  {i === activeAnchor && !anchor.found && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 0.7, y: 0 }}
                      transition={{ duration: 0.8 }}
                      style={{
                        fontSize: navicueType.input.fontSize,
                        color: anchor.color,
                        fontFamily: fonts.secondary,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {anchor.prompt}
                    </motion.div>
                  )}

                  {/* Found checkmark — subtle dot */}
                  {anchor.found && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      style={{
                        fontSize: navicueType.status.fontSize,
                        color: anchor.color,
                        fontFamily: fonts.secondary,
                        fontStyle: 'italic',
                        opacity: 0.6,
                      }}
                    >
                      found
                    </motion.div>
                  )}
                </motion.div>
              ))}

              {/* Center whisper */}
              <motion.div
                animate={{ opacity: [0.2, 0.35, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  fontSize: navicueType.caption.fontSize,
                  color: palette.textFaint,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  position: 'absolute',
                  bottom: '5%',
                }}
              >
                look around you — tap when you find it
              </motion.div>
            </motion.div>
          )}

          {/* ── Anchored — all three found ────────────────────────── */}
          {stage === 'anchored' && (
            <motion.div
              key="anchored"
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
              {/* Three dots in a row — the anchors, settled */}
              <div style={{ display: 'flex', gap: '24px' }}>
                {anchors.map((anchor, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 0.8 }}
                    transition={{ delay: i * 0.2, duration: 0.8 }}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: anchor.color,
                      boxShadow: `0 0 12px ${anchor.glow}`,
                    }}
                  />
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 2, delay: 0.8 }}
                style={{
                  fontSize: navicueType.arrival.fontSize,
                  color: palette.text,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  fontWeight: 300,
                  lineHeight: 1.6,
                }}
              >
                The room is real.
                <br />
                You are in it.
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 2.5, duration: 2 }}
                style={{
                  fontSize: navicueType.afterglow.fontSize,
                  color: palette.textFaint,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                }}
              >
                Not the story. Not the memory. Here.
              </motion.div>
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
                gap: '28px',
              }}
            >
              <motion.div
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{
                  width: '160px',
                  height: '1px',
                  background: `linear-gradient(90deg, transparent, ${palette.stone}, transparent)`,
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
                The mind wanders to survive.
                <br />
                The body stays to live.
              </div>
              <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: palette.stone,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom accent ──────────────────────────────────────────── */}
      <motion.div
        animate={{
          opacity: stage === 'afterglow' ? 0.4 : stage === 'anchored' ? 0.3 : 0.1,
        }}
        transition={{ duration: 2 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${palette.stone}, transparent)`,
        }}
      />
    </motion.div>
  );
}