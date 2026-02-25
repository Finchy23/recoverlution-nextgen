/**
 * Key · Integrate · Behavioral Activation · Embodying
 * 
 * ESSENCE: Hold key steady to open the passage completely
 * 
 * VISUAL LANGUAGE:
 * - Form: Directional (key turning slowly in lock)
 * - Mechanism: Behavioral Activation (commitment to passage, threshold authority)
 * - Interaction: Hold to Continue (door swings open revealing lit pathway)
 * - Magic: Witness Ritual (ceremonial opening, commitment)
 * 
 * STAGES:
 * - Dormant: Key in lock, ready to turn
 * - Holding: Key rotates progressively, door begins to open
 * - Complete: Door fully open, illuminated path visible
 */

import React, { useState, useEffect, useRef } from 'react';
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

export default function Key_Integrate_BehavioralActivation_E({
  primary_prompt,
  cta_primary,
  onComplete,
}: NaviCueProps) {
  const signature = magicSignatures.witness_ritual;
  const [stage, setStage] = useState<Stage>('dormant');
  const [holdProgress, setHoldProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const holdTimerRef = useRef<number | null>(null);

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

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '340px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Door */}
        <motion.div
          animate={{
            rotateY: holdProgress * -80,
          }}
          transition={{ duration: 0.2 }}
          style={{
            width: '220px',
            height: '300px',
            border: `4px solid ${signature.colors.primary}`,
            borderRadius: radius.md,
            backgroundColor: withAlpha(signature.colors.primary, 0.08),
            transformStyle: 'preserve-3d',
            position: 'relative',
          }}
        >
          {/* Lock Plate with Key */}
          <motion.div
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            style={{
              position: 'absolute',
              right: '30px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            {/* Lock Plate */}
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: `3px solid ${signature.colors.primary}`,
                background: `radial-gradient(circle, ${signature.colors.glow}, transparent)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Key (rotates) */}
              <motion.div
                animate={{
                  rotate: holdProgress * 90,
                }}
                transition={{ duration: 0.2 }}
                style={{
                  transformOrigin: 'center center',
                }}
              >
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="8" stroke={signature.colors.primary} strokeWidth="2" fill="none" />
                  <rect x="20" y="18" width="15" height="4" fill={signature.colors.primary} rx="2" />
                  <path d="M 32 22 L 32 26 M 35 22 L 35 25" stroke={signature.colors.primary} strokeWidth="2" />
                </svg>
              </motion.div>
            </div>

            {/* Hold Progress Ring */}
            {stage === 'holding' && (
              <svg
                style={{
                  position: 'absolute',
                  width: '76px',
                  height: '76px',
                  top: '-8px',
                  left: '-8px',
                  transform: 'rotate(-90deg)',
                }}
              >
                <circle
                  cx="38"
                  cy="38"
                  r="35"
                  fill="none"
                  stroke={signature.colors.primary}
                  strokeWidth="3"
                  strokeDasharray={219.91}
                  strokeDashoffset={219.91 * (1 - holdProgress)}
                  style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                />
              </svg>
            )}
          </motion.div>
        </motion.div>

        {/* Light Path Beyond Door */}
        <motion.div
          animate={{
            opacity: holdProgress * 0.6,
            scaleX: holdProgress,
          }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            left: '60%',
            width: '200px',
            height: '240px',
            background: `linear-gradient(to right, ${signature.colors.glow}, ${withAlpha(signature.colors.primary, 0.27)}, transparent)`,
            borderRadius: '0 16px 16px 0',
            transformOrigin: 'left center',
            pointerEvents: 'none',
          }}
        >
          {/* Path rays */}
          {stage === 'complete' && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: [0, 0.4, 0], x: 100 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.4,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: `${30 + i * 20}%`,
                    width: '80px',
                    height: '2px',
                    backgroundColor: signature.colors.primary,
                  }}
                />
              ))}
            </>
          )}
        </motion.div>
      </div>

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
          Hold the key to turn and open
        </motion.div>
      )}
    </div>
  );
}