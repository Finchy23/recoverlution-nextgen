/**
 * Key · Integrate · Self-Compassion · Believing
 * 
 * ESSENCE: Hold key gently to unlock self-kindness - gentleness is the mechanism
 * 
 * VISUAL LANGUAGE:
 * - Form: Directional (key made of soft light, lock melts rather than clicks)
 * - Mechanism: Self-Compassion (tender unlocking, force releases)
 * - Interaction: Hold to Continue (hold to fill lock with warmth)
 * - Magic: Sacred Ordinary (everyday gentleness)
 * 
 * STAGES:
 * - Dormant: Light key hovering near frozen lock
 * - Holding: Lock warms and melts progressively
 * - Complete: Lock dissolved, passage open through kindness
 */

import React, { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing, withAlpha } from '@/design-tokens';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';

type Stage = 'dormant' | 'holding' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

export default function Key_Integrate_SelfCompassion_B({
  primary_prompt,
  cta_primary,
  onComplete,
}: NaviCueProps) {
  const signature = magicSignatures.sacred_ordinary;
  const [stage, setStage] = useState<Stage>('dormant');
  const [holdProgress, setHoldProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const holdTimerRef = useRef<number | null>(null);
  const svgId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleHoldStart = () => {
    if (stage === 'dormant') {
      setStage('holding');
      const startTime = Date.now();
      const duration = 3000;

      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setHoldProgress(progress);

        if (progress < 1) {
          holdTimerRef.current = requestAnimationFrame(updateProgress);
        } else {
          setStage('complete');
          onComplete?.();
        }
      };

      holdTimerRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const handleHoldEnd = () => {
    if (holdTimerRef.current) {
      cancelAnimationFrame(holdTimerRef.current);
    }
    if (stage === 'holding' && holdProgress < 1) {
      setStage('dormant');
      setHoldProgress(0);
    }
  };

  if (!mounted) return null;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        padding: spacing.xl,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: spacing.xl,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          ...navicueTypography.contemplative.primary,
          textAlign: 'center',
          marginBottom: spacing.md,
        }}
      >
        {primary_prompt}
      </motion.div>

      <motion.div
        onMouseDown={handleHoldStart}
        onMouseUp={handleHoldEnd}
        onMouseLeave={handleHoldEnd}
        onTouchStart={handleHoldStart}
        onTouchEnd={handleHoldEnd}
        style={{
          position: 'relative',
          width: '280px',
          height: '320px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Lock (melts) */}
        <motion.div
          animate={{
            opacity: 1 - holdProgress * 0.7,
            scale: 1 + holdProgress * 0.2,
            filter: `blur(${holdProgress * 8}px)`,
          }}
          style={{
            width: '100px',
            height: '120px',
            border: `3px solid ${signature.colors.primary}`,
            borderRadius: radius.lg,
            background: stage === 'dormant' ? withAlpha(signature.colors.primary, 0.13) : `${signature.colors.glow}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Keyhole (melts) */}
          <motion.div
            animate={{
              opacity: 1 - holdProgress,
            }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: `2px solid ${signature.colors.primary}`,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: `14px solid ${signature.colors.primary}`,
              }}
            />
          </motion.div>

          {/* Melting drips */}
          {stage === 'holding' && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0, opacity: 0 }}
                  animate={{
                    y: 40 + i * 10,
                    opacity: [0, 0.6, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.3,
                    repeat: Infinity,
                  }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: `${30 + i * 20}%`,
                    width: '8px',
                    height: '20px',
                    backgroundColor: signature.colors.primary,
                    borderRadius: '0 0 4px 4px',
                  }}
                />
              ))}
            </>
          )}
        </motion.div>

        {/* Light Key */}
        <motion.div
          animate={{
            x: stage === 'dormant' ? -80 : 0,
            opacity: stage === 'complete' ? 0.3 : 1,
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            filter: 'drop-shadow(0 0 12px ' + signature.colors.glow + ')',
          }}
        >
          <svg width="80" height="40" viewBox="0 0 80 40">
            <defs>
              <radialGradient id={`${svgId}-lightGradient`}>
                <stop offset="0%" stopColor={signature.colors.primary} stopOpacity="1" />
                <stop offset="100%" stopColor={signature.colors.primary} stopOpacity="0.3" />
              </radialGradient>
            </defs>
            <circle cx="15" cy="20" r="12" fill={`url(#${svgId}-lightGradient)`} opacity="0.8" />
            <circle cx="15" cy="20" r="6" fill={signature.colors.primary} opacity="0.6" />
            <rect x="22" y="17" width="40" height="6" fill={signature.colors.primary} opacity="0.7" rx="3" />
            <path d="M 50 23 L 50 28 M 55 23 L 55 30 M 60 23 L 60 27" stroke={signature.colors.primary} strokeWidth="2" opacity="0.7" />
          </svg>
        </motion.div>

        {/* Warmth Glow */}
        <motion.div
          animate={{
            opacity: holdProgress * 0.6,
            scale: 1 + holdProgress * 0.5,
          }}
          style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${signature.colors.glow}, transparent)`,
            pointerEvents: 'none',
          }}
        />

        {/* Hold Progress Ring */}
        {stage === 'holding' && (
          <svg
            style={{
              position: 'absolute',
              width: '160px',
              height: '160px',
              transform: 'rotate(-90deg)',
            }}
          >
            <circle
              cx="80"
              cy="80"
              r="75"
              fill="none"
              stroke={signature.colors.primary}
              strokeWidth="2"
              strokeDasharray={471.24}
              strokeDashoffset={471.24 * (1 - holdProgress)}
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
          </svg>
        )}
      </motion.div>

      <AnimatePresence>
        {stage === 'complete' && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={signature.motion.entry}
            style={{
              ...navicueTypography.ui.button,
              padding: '12px 32px',
              backgroundColor: signature.colors.primary,
              color: 'rgba(0, 0, 0, 0.9)',
              border: 'none',
              borderRadius: radius.sm,
              cursor: 'pointer',
            }}
          >
            {cta_primary}
          </motion.button>
        )}
      </AnimatePresence>

      {stage === 'dormant' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          style={{
            ...navicueTypography.contemplative.whisper,
            textAlign: 'center',
          }}
        >
          Hold gently to melt the lock
        </motion.div>
      )}
    </div>
  );
}