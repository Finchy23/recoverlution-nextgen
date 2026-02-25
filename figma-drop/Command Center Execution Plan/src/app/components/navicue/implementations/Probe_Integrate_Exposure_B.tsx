/**
 * Probe x Exposure x Believing
 * "One Step Closer"
 *
 * NEUROSCIENCE: Exposure therapy works through inhibitory learning — the
 * amygdala predicts danger, the experience disconfirms the prediction,
 * and the new association (safe) competes with the old (threat). The
 * critical variable is *voluntary approach* while the fear system is
 * active. This NaviCue creates a literal approach-hold mechanic that
 * produces real physiological engagement via sustained attention on
 * an uncertain stimulus. Believing stage = building conviction that
 * approaching the avoided is survivable.
 *
 * CONCEPT: A warm glow pulses in the distance. You hold the screen to
 * approach. The glow transforms as you get closer — not threatening,
 * not what you expected. If you release, it gently recedes (not
 * punishingly). Each approach extends your window of tolerance.
 * Completion: "Still here. Still safe."
 *
 * MAGIC SIGNATURE: sacred_ordinary
 * FORM ARCHETYPE: depth
 * INTERACTION: hold_to_continue
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { withAlpha } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';

const PAL = {
  navy: '#0a0f1e',
  warmHoney: 'hsla(35, 60%, 60%, 1)',
  honeyGlow: 'hsla(35, 60%, 60%, 0.15)',
  honeyDeep: 'hsla(35, 60%, 60%, 0.08)',
  softGold: 'hsla(45, 55%, 65%, 0.8)',
  peach: 'hsla(25, 50%, 70%, 0.6)',
  textPrimary: 'rgba(255,255,255,0.88)',
  textSecondary: 'rgba(255,255,255,0.5)',
  textWhisper: 'rgba(255,255,255,0.28)',
};

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Probe_Integrate_Exposure_B({ data, onComplete }: Props) {
  const [stage, setStage] = useState<'waiting' | 'approaching' | 'arrived' | 'safe'>('waiting');
  const [proximity, setProximity] = useState(0); // 0 = far, 1 = arrived
  const [holding, setHolding] = useState(false);
  const [peakReached, setPeakReached] = useState(0);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  // --- hold mechanics: approach while holding, recede when released ---
  const tick = useCallback(() => {
    const now = performance.now();
    const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05); // seconds, capped
    lastTimeRef.current = now;

    setProximity(prev => {
      let next: number;
      if (holding) {
        // approach: slow at first, accelerates gently
        const speed = 0.08 + prev * 0.12;
        next = Math.min(prev + speed * dt, 1);
      } else {
        // recede: slow, gentle, not punishing
        next = Math.max(prev - 0.03 * dt, 0);
      }
      if (next >= 1 && prev < 1) {
        setPeakReached(1);
      }
      return next;
    });

    frameRef.current = requestAnimationFrame(tick);
  }, [holding]);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [tick]);

  // --- arrival detection ---
  useEffect(() => {
    if (proximity >= 1 && stage === 'approaching') {
      setStage('arrived');
      safeTimeout(() => {
        setStage('safe');
        onComplete?.();
      }, 3000);
    }
  }, [proximity, stage, onComplete]);

  const startHold = () => {
    if (stage === 'safe') return;
    setHolding(true);
    if (stage === 'waiting') setStage('approaching');
  };
  const endHold = () => setHolding(false);

  // --- derived visuals ---
  const glowSize = 40 + proximity * 180; // px
  const glowOpacity = 0.15 + proximity * 0.5;
  const bgGradientIntensity = proximity * 0.12;

  return (
    <div
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      onTouchStart={startHold}
      onTouchEnd={endHold}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse at 50% 50%, hsla(35, 60%, 60%, ${bgGradientIntensity}), transparent 60%),
          radial-gradient(ellipse at 50% 80%, ${PAL.honeyDeep}, transparent 50%),
          ${PAL.navy}
        `,
        fontFamily: "'Crimson Pro', 'Georgia', serif",
        userSelect: 'none',
        cursor: stage === 'safe' ? 'default' : 'pointer',
        touchAction: 'none',
      }}
    >
      {/* ── Ambient drift ── */}
      <AmbientField proximity={proximity} />

      {/* ── The Glow — what you're approaching ── */}
      <div
        style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* outer halo */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [glowOpacity * 0.3, glowOpacity * 0.5, glowOpacity * 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: `${glowSize * 2.5}px`,
            height: `${glowSize * 2.5}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${withAlpha(PAL.warmHoney, 0.13)}, transparent 70%)`,
          }}
        />
        {/* inner glow */}
        <motion.div
          animate={{
            scale: holding ? [1, 1.06, 1] : 1,
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: `${glowSize}px`,
            height: `${glowSize}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle,
              ${withAlpha(PAL.warmHoney, glowOpacity * 0.39)},
              ${withAlpha(PAL.softGold, glowOpacity * 0.20)},
              transparent 75%
            )`,
            boxShadow: proximity > 0.5
              ? `0 0 ${60 + proximity * 80}px ${withAlpha(PAL.warmHoney, proximity * 0.16)}`
              : 'none',
            transition: 'width 0.3s, height 0.3s, box-shadow 0.5s',
          }}
        />

        {/* core point */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: `${6 + proximity * 8}px`,
            height: `${6 + proximity * 8}px`,
            borderRadius: '50%',
            background: PAL.warmHoney,
            transition: 'width 0.3s, height 0.3s',
          }}
        />
      </div>

      {/* ── Copy layer ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 'clamp(60px, 15vh, 120px)',
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence mode="wait">
          {stage === 'waiting' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.8 } }}
              transition={{ duration: 1.5, delay: 0.5 }}
              style={{ textAlign: 'center' }}
            >
              <p style={{
                fontSize: navicueType.arrival.fontSize,
                fontStyle: 'italic',
                color: PAL.textPrimary,
                lineHeight: 1.5,
                marginBottom: '16px',
              }}>
                There is something here<br />you have been circling.
              </p>
              <p style={{
                fontSize: navicueType.caption.fontSize,
                fontFamily: "'Inter', sans-serif",
                color: PAL.textWhisper,
                letterSpacing: '0.04em',
              }}>
                Hold to move closer
              </p>
            </motion.div>
          )}

          {stage === 'approaching' && (
            <motion.p
              key="approaching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                fontSize: navicueType.narrative.fontSize,
                fontStyle: 'italic',
                color: PAL.softGold,
                textAlign: 'center',
              }}
            >
              {proximity < 0.3
                ? 'Closer.'
                : proximity < 0.6
                ? 'It shifts as you approach.'
                : proximity < 0.9
                ? 'Not what you expected.'
                : 'Almost there.'}
            </motion.p>
          )}

          {stage === 'arrived' && (
            <motion.div
              key="arrived"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              style={{ textAlign: 'center' }}
            >
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: PAL.warmHoney,
                  margin: '0 auto 24px',
                }}
              />
              <p style={{
                fontSize: navicueType.subheading.fontSize,
                fontStyle: 'italic',
                color: PAL.textPrimary,
                lineHeight: 1.5,
              }}>
                You arrived.
              </p>
            </motion.div>
          )}

          {stage === 'safe' && (
            <motion.div
              key="safe"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: 'center' }}
            >
              <p style={{
                fontSize: navicueType.prompt.fontSize,
                fontStyle: 'italic',
                color: PAL.textPrimary,
                lineHeight: 1.5,
                marginBottom: '12px',
              }}>
                Still here. Still safe.
              </p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1.5 }}
                style={{
                  fontSize: navicueType.caption.fontSize,
                  fontFamily: "'Inter', sans-serif",
                  color: PAL.textWhisper,
                  letterSpacing: '0.03em',
                }}
              >
                The avoided thing was smaller than the avoidance.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ====================================================================
// AMBIENT FIELD — subtle particles that respond to proximity
// ====================================================================
function AmbientField({ proximity }: { proximity: number }) {
  const specs = useRef(
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      dur: 15 + Math.random() * 20,
      delay: Math.random() * 10,
    }))
  ).current;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {specs.map(p => (
        <motion.div
          key={p.id}
          animate={{
            x: [0, 20 * (1 - proximity), -15, 0],
            y: [0, -15, 10 * (1 - proximity), 0],
            opacity: [0.05, 0.15 + proximity * 0.1, 0.08, 0.05],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: '2px',
            height: '50px',
            background: `linear-gradient(180deg, transparent, ${withAlpha(PAL.warmHoney, 0.20)}, transparent)`,
            borderRadius: '1px',
            filter: 'blur(0.5px)',
          }}
        />
      ))}
    </div>
  );
}