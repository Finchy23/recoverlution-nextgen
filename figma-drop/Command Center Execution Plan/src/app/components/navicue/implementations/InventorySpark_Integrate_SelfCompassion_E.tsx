/**
 * Inventory Spark · Integrate · Self-Compassion · Embodying
 * 
 * ESSENCE: Hold to embrace yourself fully in this moment
 * 
 * VISUAL LANGUAGE:
 * - Form: Signal (two hands forming heart shape)
 * - Mechanism: Self-Compassion (deep self-acceptance, completion)
 * - Interaction: Hold to Continue (progress fills heart from edges to center)
 * - Magic: Witness Ritual (ceremonial completion, warm glow expands)
 * 
 * STAGES:
 * - Dormant: Hands apart, heart outline empty
 * - Holding: Hands draw together, heart fills with warmth
 * - Complete: Full embrace, glow expands outward
 */

import React, { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing, radius } from '@/design-tokens';

type Stage = 'dormant' | 'holding' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

export default function InventorySpark_Integrate_SelfCompassion_E({
  primary_prompt,
  cta_primary,
  onComplete,
}: NaviCueProps) {
  const signature = magicSignatures.witness_ritual;
  const [stage, setStage] = useState<Stage>('dormant');
  const [holdProgress, setHoldProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const holdTimerRef = useRef<number | null>(null);
  const uniqueId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleHoldStart = () => {
    if (stage === 'dormant') {
      setStage('holding');
      const startTime = Date.now();
      const duration = 4000;

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
      {/* Contemplative Prompt */}
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

      {/* Heart Embrace */}
      <motion.div
        onMouseDown={handleHoldStart}
        onMouseUp={handleHoldEnd}
        onMouseLeave={handleHoldEnd}
        onTouchStart={handleHoldStart}
        onTouchEnd={handleHoldEnd}
        style={{
          position: 'relative',
          width: '280px',
          height: '280px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Expanding Glow */}
        <motion.div
          animate={{
            opacity: stage === 'complete' ? 0.5 : 0,
            scale: stage === 'complete' ? 2.5 : 1,
          }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${signature.colors.glow}, transparent)`,
            pointerEvents: 'none',
          }}
        />

        {/* Left Hand */}
        <motion.div
          animate={{
            x: stage === 'dormant' ? -40 : 0,
            rotate: stage === 'dormant' ? -15 : -45,
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            left: '20%',
            top: '35%',
            width: '50px',
            height: '60px',
            border: `3px solid ${signature.colors.primary}`,
            borderRadius: `${radius['2xl']} ${radius['2xl']} ${radius.lg} ${radius.lg}`,
            backgroundColor: 'transparent',
            transformOrigin: 'bottom center',
          }}
        >
          {/* Thumb */}
          <div
            style={{
              position: 'absolute',
              left: '-12px',
              top: '50%',
              width: '15px',
              height: '25px',
              border: `3px solid ${signature.colors.primary}`,
              borderRadius: radius.full,
              backgroundColor: 'transparent',
            }}
          />
        </motion.div>

        {/* Right Hand */}
        <motion.div
          animate={{
            x: stage === 'dormant' ? 40 : 0,
            rotate: stage === 'dormant' ? 15 : 45,
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            right: '20%',
            top: '35%',
            width: '50px',
            height: '60px',
            border: `3px solid ${signature.colors.primary}`,
            borderRadius: `${radius['2xl']} ${radius['2xl']} ${radius.lg} ${radius.lg}`,
            backgroundColor: 'transparent',
            transformOrigin: 'bottom center',
          }}
        >
          {/* Thumb */}
          <div
            style={{
              position: 'absolute',
              right: '-12px',
              top: '50%',
              width: '15px',
              height: '25px',
              border: `3px solid ${signature.colors.primary}`,
              borderRadius: radius.full,
              backgroundColor: 'transparent',
            }}
          />
        </motion.div>

        {/* Heart Shape (fills on hold) */}
        <svg
          viewBox="0 0 100 100"
          style={{
            width: '120px',
            height: '120px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Heart Outline */}
          <path
            d="M50,85 C50,85 15,60 15,40 C15,25 25,20 32,20 C40,20 45,25 50,35 C55,25 60,20 68,20 C75,20 85,25 85,40 C85,60 50,85 50,85 Z"
            fill="none"
            stroke={signature.colors.primary}
            strokeWidth="2"
          />
          
          {/* Heart Fill (progress) */}
          <defs>
            <clipPath id={`heartClip-${uniqueId}`}>
              <path d="M50,85 C50,85 15,60 15,40 C15,25 25,20 32,20 C40,20 45,25 50,35 C55,25 60,20 68,20 C75,20 85,25 85,40 C85,60 50,85 50,85 Z" />
            </clipPath>
          </defs>
          
          <rect
            x="0"
            y={100 - holdProgress * 100}
            width="100"
            height={holdProgress * 100}
            fill={signature.colors.primary}
            opacity="0.6"
            clipPath={`url(#heartClip-${uniqueId})`}
          />
        </svg>

        {/* Progress Ring */}
        {stage === 'holding' && (
          <svg
            style={{
              position: 'absolute',
              width: '180px',
              height: '180px',
              transform: 'rotate(-90deg)',
            }}
          >
            <circle
              cx="90"
              cy="90"
              r="85"
              fill="none"
              stroke={signature.colors.primary}
              strokeWidth="2"
              opacity="0.3"
            />
            <circle
              cx="90"
              cy="90"
              r="85"
              fill="none"
              stroke={signature.colors.primary}
              strokeWidth="3"
              strokeDasharray={534.07}
              strokeDashoffset={534.07 * (1 - holdProgress)}
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
          </svg>
        )}
      </motion.div>

      {/* CTA */}
      <AnimatePresence>
        {stage === 'complete' && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
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

      {/* Instruction */}
      {stage === 'dormant' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          style={{
            ...navicueTypography.contemplative.whisper,
            textAlign: 'center',
          }}
        >
          Hold to complete the embrace
        </motion.div>
      )}
    </div>
  );
}