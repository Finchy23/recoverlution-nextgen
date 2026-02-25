/**
 * Mirror x Behavioral Activation x Embodying
 * Magic Signature: sacred_ordinary
 *
 * THE SIGNAL
 * "The mirror shows what you do, not who you are."
 *
 * NEUROSCIENCE: Mirror neurons fire both when we perform an action
 * and when we observe it. The visual cortex doesn't distinguish
 * between watching yourself move and imagining yourself move.
 * When the reflection matches your gesture — when you SEE yourself
 * in motion — the basal ganglia registers this as a completed
 * action sequence. It becomes easier to repeat.
 *
 * INTERACTION: Touch the mirror surface. Ripples spread from your
 * touch. A silhouette begins to move — first subtly, then rhythmically.
 * Your touches create the rhythm. The reflection doesn't just copy —
 * it anticipates. You are already the motion.
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: paralysis, watching from outside
 * 2. Different action possible: touch the surface
 * 3. Action executed: ripples → reflection moves → you feel it
 * 4. Evidence: the body responded before the mind decided
 * 5. Repeated: action becomes identity, not effort
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fonts, surfaces, radius } from '@/design-tokens';
import {
  navicueQuickstart,
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

// ── Derive palette from the blueprint ───────────────────────────────
const { palette, atmosphere, motion: motionConfig } =
  navicueQuickstart('sacred_ordinary', 'Behavioral Activation', 'embodying', 'Mirror');

type Stage = 'arriving' | 'present' | 'rippling' | 'resonant' | 'afterglow';

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Mirror_Integrate_BehavioralActivation_E({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [touchCount, setTouchCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  // ── Arrival sequence ─────────────────────────────────────────────
  useEffect(() => {
    const t1 = setTimeout(() => setStage('present'), motionConfig.arrivingDuration);
    return () => { clearTimeout(t1); timersRef.current.forEach(clearTimeout); };
  }, []);

  // ── Mirror touch interaction ─────────────────────────────────────
  const handleMirrorTouch = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (stage === 'afterglow' || stage === 'resonant') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setRipples(prev => [...prev.slice(-5), { id: Date.now(), x, y }]);

    const next = touchCount + 1;
    setTouchCount(next);

    if (stage === 'present' || stage === 'arriving') {
      setStage('rippling');
    }

    if (next >= 5) {
      safeTimeout(() => {
        setStage('resonant');
        safeTimeout(() => {
          setStage('afterglow');
          onComplete?.();
        }, motionConfig.afterglowDuration);
      }, 2000);
    }
  }, [stage, touchCount, onComplete]);

  // ── Derived values ────────────────────────────────────────────────
  const motionIntensity = Math.min(touchCount / 5, 1);
  const breathProgress = stage === 'afterglow' ? 1 : stage === 'resonant' ? 0.8 : motionIntensity * 0.6;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Behavioral Activation" kbe="embodying" form="Mirror" mode="immersive" breathProgress={breathProgress} isAfterglow={stage === 'afterglow'} particleSeed={24}>
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
            <div style={{ ...navicueType.arrival, color: palette.text }}>
              What does it look like
              <br />
              when you move?
            </div>
          </motion.div>
        )}

        {/* ── Present + Rippling — the mirror ──────────────────── */}
        {(stage === 'present' || stage === 'rippling') && (
          <motion.div
            key="mirror"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '40px',
            }}
          >
            {/* The mirror surface */}
            <motion.div
              onClick={handleMirrorTouch}
              style={{
                position: 'relative',
                width: '280px',
                height: '360px',
                cursor: 'pointer',
                overflow: 'hidden',
                borderRadius: `${radius.lg} ${radius.lg} ${radius.xs} ${radius.xs}`,
                opacity: 0.6,
                border: `1.5px solid ${palette.primaryGlow}`,
                background: `linear-gradient(180deg, ${palette.primaryGlow}, ${palette.primaryFaint})`,
              }}
            >
              {/* Ripple effects */}
              <AnimatePresence>
                {ripples.map(r => (
                  <motion.div
                    key={r.id}
                    initial={{ width: 0, height: 0, opacity: 0.5 }}
                    animate={{ width: 200, height: 200, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.6, ease: 'easeOut' }}
                    onAnimationComplete={() =>
                      setRipples(prev => prev.filter(p => p.id !== r.id))
                    }
                    style={{
                      position: 'absolute',
                      left: `${r.x}%`,
                      top: `${r.y}%`,
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                      border: `1.5px solid ${palette.accent}`,
                      pointerEvents: 'none',
                    }}
                  />
                ))}
              </AnimatePresence>

              {/* Silhouette — grows more kinetic with touches */}
              <motion.div
                animate={{
                  y: motionIntensity > 0.3 ? [0, -6, 0, -3, 0] : 0,
                  scale: motionIntensity > 0.3
                    ? [1, 1 + motionIntensity * 0.04, 1, 1 + motionIntensity * 0.02, 1]
                    : 1,
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: 0.3 + motionIntensity * 0.5,
                  transition: 'opacity 0.8s ease',
                }}
              >
                {/* Head */}
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: palette.primary,
                    opacity: 0.7,
                  }}
                />
                {/* Body */}
                <motion.div
                  animate={{
                    rotate: motionIntensity > 0.3 ? [-2, 2, -2] : 0,
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    width: '32px',
                    height: '50px',
                    backgroundColor: palette.primary,
                    borderRadius: `${radius.lg} ${radius.lg} ${radius.xs} ${radius.xs}`,
                    opacity: 0.6,
                  }}
                />
                {/* Arms */}
                <div
                  style={{
                    position: 'absolute',
                    top: '36px',
                    display: 'flex',
                    gap: '36px',
                  }}
                >
                  <motion.div
                    animate={{
                      rotate: motionIntensity > 0.3 ? [-15 * motionIntensity, 15 * motionIntensity, -15 * motionIntensity] : 0,
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{
                      width: '5px',
                      height: '28px',
                      backgroundColor: palette.primary,
                      borderRadius: '3px',
                      transformOrigin: 'top center',
                      opacity: 0.5,
                    }}
                  />
                  <motion.div
                    animate={{
                      rotate: motionIntensity > 0.3 ? [15 * motionIntensity, -15 * motionIntensity, 15 * motionIntensity] : 0,
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{
                      width: '5px',
                      height: '28px',
                      backgroundColor: palette.primary,
                      borderRadius: '3px',
                      transformOrigin: 'top center',
                      opacity: 0.5,
                    }}
                  />
                </div>
              </motion.div>

              {/* Light shimmer */}
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(90deg, transparent 0%, ${palette.primaryFaint} 50%, transparent 100%)`,
                  pointerEvents: 'none',
                }}
              />
            </motion.div>

            {/* Invitation hint */}
            {stage === 'present' && touchCount === 0 && (
              <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ ...navicueType.hint, color: palette.textFaint }}
              >
                touch the surface
              </motion.div>
            )}

            {/* Texture narration as touches accumulate */}
            {touchCount > 0 && touchCount < 5 && stage === 'rippling' && (
              <motion.div
                key={`tex-${touchCount}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.6, y: 0 }}
                transition={{ duration: 1 }}
                style={{ ...navicueType.texture, color: palette.text, textAlign: 'center' }}
              >
                {['the surface responds', 'it follows you', 'you feel the rhythm', 'almost there'][Math.min(touchCount - 1, 3)]}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Resonant — the landing ──────────────────────────── */}
        {stage === 'resonant' && (
          <motion.div
            key="resonant"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.5 }}
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '48px',
            }}
          >
            {/* Radiating presence */}
            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.6, 2.2],
                    opacity: [0.2, 0.1, 0],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    delay: i * 1.2,
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: `1px solid ${palette.primary}`,
                  }}
                />
              ))}
              <motion.div
                animate={{
                  boxShadow: [
                    `0 0 30px ${palette.primaryGlow}`,
                    `0 0 60px ${palette.primaryGlow}`,
                    `0 0 30px ${palette.primaryGlow}`,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${palette.primary}, ${palette.primaryGlow})`,
                }}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2, delay: 0.8 }}
              style={{ ...navicueType.prompt, color: palette.text }}
            >
              You are already the rhythm.
              <br />
              The mirror just showed you.
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
              gap: '32px',
            }}
          >
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 6, repeat: Infinity }}
              style={{
                width: '140px',
                height: '1px',
                background: `linear-gradient(90deg, transparent, ${palette.primary}, transparent)`,
              }}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 2, delay: 1 }}
              style={{ ...navicueType.afterglow, color: palette.textFaint }}
            >
              Motion doesn't wait for permission.
              <br />
              Neither do you.
            </motion.div>

            <motion.div
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: palette.primary,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}