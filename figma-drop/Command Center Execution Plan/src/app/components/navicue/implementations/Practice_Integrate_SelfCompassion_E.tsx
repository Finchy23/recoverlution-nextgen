/**
 * Practice · Integrate · Self-Compassion · Embodying
 * 
 * ═══════════════════════════════════════════════════
 * THE SOMATIC SIGH
 * "Nowhere to go. Nothing to be. Just this breath."
 * ═══════════════════════════════════════════════════
 * 
 * NEUROSCIENCE: The physiological sigh — a double inhale followed
 * by an extended exhale — is the fastest known voluntary mechanism
 * to shift the autonomic nervous system from sympathetic (fight/flight)
 * to parasympathetic (rest/digest). It hacks the vagus nerve directly.
 * No thinking required. The body does the rewiring.
 * 
 * PHILOSOPHY:
 * Ram Dass: "Be here now." Not later. Not the improved version.
 * This breath. This body. This moment is enough.
 * 
 * INTERACTION: A single orb of diffused, liquid light expands with
 * the inhale and contracts with the exhale. No buttons. No progress.
 * Just sync your breath to the light. Four cycles. The body remembers
 * what the mind forgot: how to be still.
 * 
 * REWIRING CHAIN:
 * 1. Old pattern active: shallow, chest-level panic breathing
 * 2. Different action possible: follow the light
 * 3. Action executed: nervous system physically downshifts
 * 4. Evidence: the exhale is longer, the shoulders drop
 * 5. Repeated: calm becomes a skill, not an accident
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, surfaces, spacing } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';

const palette = {
  base: surfaces.solid.base,
  opal: 'hsla(200, 30%, 70%, 1)',
  opalGlow: 'hsla(200, 30%, 70%, 0.15)',
  opalFaint: 'hsla(200, 30%, 70%, 0.05)',
  opalDeep: 'hsla(200, 35%, 55%, 0.3)',
  moonlight: 'hsla(210, 25%, 85%, 0.8)',
  moonFaint: 'hsla(210, 25%, 85%, 0.3)',
  lavender: 'hsla(250, 20%, 72%, 0.4)',
  text: 'hsla(210, 15%, 88%, 0.85)',
  textFaint: 'hsla(210, 15%, 88%, 0.35)',
};

type Stage = 'arriving' | 'inhale' | 'exhale' | 'radiant' | 'afterglow';

const BREATH_WHISPERS = [
  'Nowhere to go.',
  'Nothing to fix.',
  'Just this breath.',
  'And release.',
];

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Practice_Integrate_SelfCompassion_E({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [cycle, setCycle] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in');
  const [orbScale, setOrbScale] = useState(0.4);
  const animRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const totalCycles = 4;

  // Breath timing: 4s inhale, 6s exhale (physiological sigh ratio)
  const INHALE_MS = 4000;
  const EXHALE_MS = 6000;
  const CYCLE_MS = INHALE_MS + EXHALE_MS;

  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    const t = safeTimeout(() => {
      setStage('inhale');
      startBreathing();
    }, 3200);
    return () => {
      timersRef.current.forEach(id => clearTimeout(id));
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const startBreathing = () => {
    startRef.current = performance.now();
    const animate = () => {
      const elapsed = performance.now() - startRef.current;
      const currentCycle = Math.floor(elapsed / CYCLE_MS);
      const cycleElapsed = elapsed % CYCLE_MS;
      const isInhale = cycleElapsed < INHALE_MS;

      if (currentCycle >= totalCycles) {
        setStage('radiant');
        setCycle(totalCycles);
        safeTimeout(() => {
          setStage('afterglow');
          onComplete?.();
        }, 5000);
        return;
      }

      setCycle(currentCycle);
      setBreathPhase(isInhale ? 'in' : 'out');

      // Smooth eased orb scale
      let progress: number;
      if (isInhale) {
        progress = cycleElapsed / INHALE_MS;
        // ease-in-out
        progress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        setOrbScale(0.4 + progress * 0.6);
      } else {
        progress = (cycleElapsed - INHALE_MS) / EXHALE_MS;
        progress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        setOrbScale(1.0 - progress * 0.6);
      }

      setStage(isInhale ? 'inhale' : 'exhale');
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
  };

  // Ambient motes — like dust in moonlight
  const motes = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 1 + Math.random() * 3,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * 8,
      drift: (Math.random() - 0.5) * 30,
    }))
  ).current;

  const isBreathing = stage === 'inhale' || stage === 'exhale';

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
        background: `radial-gradient(ellipse at 50% 50%, ${palette.opalFaint}, ${palette.base} 70%)`,
        fontFamily: fonts.primary,
        cursor: 'default',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* ── Ambient moonlight motes ───────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {motes.map(m => (
          <motion.div
            key={m.id}
            animate={{
              y: [0, m.drift, m.drift * 1.5],
              x: [0, m.drift * 0.4],
              opacity: [0, 0.2, 0],
            }}
            transition={{
              duration: m.duration,
              repeat: Infinity,
              delay: m.delay,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              left: `${m.x}%`,
              top: `${m.y}%`,
              width: `${m.size}px`,
              height: `${m.size}px`,
              borderRadius: '50%',
              background: palette.opal,
              filter: 'blur(0.5px)',
            }}
          />
        ))}
      </div>

      {/* ── Central orb — the breath made visible ─────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '48px',
        }}
      >
        <AnimatePresence mode="wait">
          {stage === 'arriving' && (
            <motion.div
              key="arriving"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
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
                Let everything else
                <br />
                wait.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The liquid orb — multiple layered circles for depth */}
        {(isBreathing || stage === 'radiant' || stage === 'afterglow') && (
          <div
            style={{
              position: 'relative',
              width: '280px',
              height: '280px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Outermost halo */}
            <div
              style={{
                position: 'absolute',
                width: `${orbScale * 280}px`,
                height: `${orbScale * 280}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${palette.opalGlow}, transparent 70%)`,
                transition: 'width 0.1s linear, height 0.1s linear',
              }}
            />

            {/* Mid layer — slightly offset for liquid feel */}
            <div
              style={{
                position: 'absolute',
                width: `${orbScale * 200}px`,
                height: `${orbScale * 200}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle at 45% 45%, ${palette.opalDeep}, ${palette.lavender}, transparent 75%)`,
                transition: 'width 0.15s linear, height 0.15s linear',
                filter: 'blur(2px)',
              }}
            />

            {/* Inner core — brightest */}
            <div
              style={{
                position: 'absolute',
                width: `${orbScale * 120}px`,
                height: `${orbScale * 120}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle at 40% 40%, ${palette.moonFaint}, ${palette.opalGlow}, transparent 80%)`,
                transition: 'width 0.12s linear, height 0.12s linear',
              }}
            />

            {/* Center point — steady heartbeat */}
            <motion.div
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: palette.moonlight,
                position: 'relative',
                zIndex: 2,
              }}
            />

            {/* Radiance rings — visible after all cycles */}
            {(stage === 'radiant' || stage === 'afterglow') &&
              [0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [1, 1.8], opacity: [0.15, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 1,
                    ease: 'easeOut',
                  }}
                  style={{
                    position: 'absolute',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: `1px solid ${palette.opal}`,
                  }}
                />
              ))}
          </div>
        )}

        {/* ── Breath whisper — changes each cycle ─────────────────── */}
        {isBreathing && (
          <motion.div
            key={`whisper-${cycle}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.5, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: navicueType.texture.fontSize,
              color: palette.moonFaint,
              fontFamily: fonts.secondary,
              fontStyle: 'italic',
              textAlign: 'center',
              letterSpacing: '0.02em',
            }}
          >
            {BREATH_WHISPERS[Math.min(cycle, BREATH_WHISPERS.length - 1)]}
          </motion.div>
        )}

        {/* Breath direction — the gentlest possible cue */}
        {isBreathing && (
          <motion.div
            key={`phase-${breathPhase}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            transition={{ duration: 0.8 }}
            style={{
              fontSize: navicueType.caption.fontSize,
              color: palette.textFaint,
              fontFamily: fonts.secondary,
              fontStyle: 'italic',
              letterSpacing: '0.05em',
            }}
          >
            {breathPhase === 'in' ? 'in…' : 'out…'}
          </motion.div>
        )}

        {/* ── Radiant — the body remembers ────────────────────────── */}
        {stage === 'radiant' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2.5, delay: 1 }}
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <div
              style={{
                fontSize: navicueType.subheading.fontSize,
                color: palette.text,
                fontFamily: fonts.secondary,
                fontStyle: 'italic',
                fontWeight: 300,
                lineHeight: 1.6,
              }}
            >
              Your body already knew
              <br />
              how to do this.
            </div>
          </motion.div>
        )}

        {/* ── Afterglow ───────────────────────────────────────────── */}
        {stage === 'afterglow' && (
          <motion.div
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
                background: `linear-gradient(90deg, transparent, ${palette.opal}, transparent)`,
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
              Calm is not the absence of storms.
              <br />
              It is remembering you are the ocean.
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Bottom breath line ─────────────────────────────────────── */}
      <motion.div
        animate={{
          opacity: stage === 'afterglow' ? 0.4 : isBreathing ? 0.2 : 0.1,
        }}
        transition={{ duration: 2 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${palette.opal}, transparent)`,
        }}
      />
    </motion.div>
  );
}