/**
 * Key · Integrate · Exposure · Embodying
 * 
 * ESSENCE: Hold to gradually reveal what lies beyond the door
 * 
 * VISUAL LANGUAGE:
 * - Form: Directional (door becomes transparent as you hold)
 * - Mechanism: Exposure (titrated courage, informed choice, safe space visible)
 * - Interaction: Hold to Reveal (opacity fades in sections, preview before commitment)
 * - Magic: Witness Ritual (ceremonial revealing, patience rewarded)
 * 
 * STAGES:
 * - Dormant: Door solid, unknown beyond
 * - Holding: Door becomes transparent progressively, safe space revealed
 * - Complete: Full visibility, choice clear
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing, withAlpha } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';

type Stage = 'dormant' | 'holding' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

export default function Key_Integrate_Exposure_E({
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
      const duration = 3500;

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
          height: '340px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Scene Behind Door (revealed progressively) */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: radius.md,
            background: `linear-gradient(135deg, ${signature.colors.glow}, ${withAlpha(signature.colors.primary, 0.13)})`,
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            opacity: holdProgress * 0.8,
          }}
        >
          {/* Gentle elements showing safe space */}
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${signature.colors.primary}, transparent)`,
            opacity: 0.5,
          }} />
          <div style={{
            width: '80%',
            height: '2px',
            backgroundColor: signature.colors.secondary,
            opacity: 0.4,
          }} />
          <div style={{
            fontSize: navicueType.hint.fontSize,
            color: signature.colors.primary,
            opacity: 0.7,
            fontStyle: 'italic',
            textAlign: 'center',
          }}>
            A gentle space
          </div>
        </div>

        {/* Door (becomes transparent) */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: `4px solid ${signature.colors.primary}`,
            borderRadius: radius.md,
            backgroundColor: stage === 'dormant' ? withAlpha(signature.colors.primary, 0.20) : 'transparent',
            backdropFilter: `blur(${(1 - holdProgress) * 20}px)`,
            transition: 'background-color 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Frosted sections clearing progressively */}
          {[0, 1, 2].map((section) => (
            <div
              key={section}
              style={{
                position: 'absolute',
                top: `${section * 33}%`,
                left: 0,
                right: 0,
                height: '33%',
                backgroundColor: withAlpha(signature.colors.primary, 0.13),
                opacity: Math.max(0, 1 - (holdProgress - section * 0.3) * 3),
                transition: 'opacity 0.2s ease',
              }}
            />
          ))}

          {/* Keyhole */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: `3px solid ${signature.colors.primary}`,
              position: 'relative',
              zIndex: 10,
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
          </div>

          {/* Hold Progress Ring */}
          {stage === 'holding' && (
            <svg
              style={{
                position: 'absolute',
                width: '100px',
                height: '100px',
                transform: 'rotate(-90deg)',
              }}
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={signature.colors.primary}
                strokeWidth="3"
                strokeDasharray={282.74}
                strokeDashoffset={282.74 * (1 - holdProgress)}
                style={{ transition: 'stroke-dashoffset 0.1s linear' }}
              />
            </svg>
          )}
        </div>
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
          Hold to see what awaits
        </motion.div>
      )}
    </div>
  );
}