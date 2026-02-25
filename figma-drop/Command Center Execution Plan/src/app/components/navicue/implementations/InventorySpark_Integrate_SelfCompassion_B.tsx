/**
 * Inventory Spark · Integrate · Self-Compassion · Believing
 * 
 * ESSENCE: Touch points of self-kindness to build warmth network
 * 
 * VISUAL LANGUAGE:
 * - Form: Signal (constellation of glowing heart points)
 * - Mechanism: Self-Compassion (gentle nurturing, safety net)
 * - Interaction: Swatch Constellation (tap each point to activate network)
 * - Magic: Sacred Ordinary (gentle, everyday kindness)
 * 
 * STAGES:
 * - Dormant: Heart points dim, disconnected
 * - Activating: Points light up as touched, connections form
 * - Complete: Full web of warmth, all points connected
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing, withAlpha } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';
import { radius } from '@/design-tokens';

type Stage = 'dormant' | 'activating' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

export default function InventorySpark_Integrate_SelfCompassion_B({
  primary_prompt,
  cta_primary,
  onComplete,
}: NaviCueProps) {
  const signature = magicSignatures.sacred_ordinary;
  const [stage, setStage] = useState<Stage>('dormant');
  const [activatedPoints, setActivatedPoints] = useState<Set<number>>(new Set());
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    setMounted(true);
    return () => {
      timersRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  const compassionPoints = [
    { id: 1, x: 50, y: 20, label: 'notice' },
    { id: 2, x: 20, y: 45, label: 'soften' },
    { id: 3, x: 80, y: 45, label: 'accept' },
    { id: 4, x: 35, y: 75, label: 'care' },
    { id: 5, x: 65, y: 75, label: 'hold' },
  ];

  const handlePointActivate = (id: number) => {
    if (!activatedPoints.has(id)) {
      const newActivated = new Set(activatedPoints);
      newActivated.add(id);
      setActivatedPoints(newActivated);
      setStage('activating');

      if (newActivated.size === compassionPoints.length) {
        safeTimeout(() => {
          setStage('complete');
          onComplete?.();
        }, 800);
      }
    }
  };

  const getConnectionOpacity = (point1: number, point2: number) => {
    return activatedPoints.has(point1) && activatedPoints.has(point2) ? 0.4 : 0;
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

      {/* Constellation */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '360px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
          }}
        >
          {/* Connection Lines */}
          {compassionPoints.map((point1, i) =>
            compassionPoints.slice(i + 1).map((point2) => (
              <motion.line
                key={`${point1.id}-${point2.id}`}
                x1={`${point1.x}%`}
                y1={`${point1.y}%`}
                x2={`${point2.x}%`}
                y2={`${point2.y}%`}
                stroke={signature.colors.primary}
                strokeWidth="2"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: getConnectionOpacity(point1.id, point2.id),
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            ))
          )}
        </svg>

        {/* Heart Points */}
        {compassionPoints.map((point) => {
          const isActivated = activatedPoints.has(point.id);
          return (
            <motion.div
              key={point.id}
              onClick={() => handlePointActivate(point.id)}
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
              }}
              transition={{
                delay: point.id * 0.1,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                position: 'absolute',
                left: `${point.x}%`,
                top: `${point.y}%`,
                transform: 'translate(-50%, -50%)',
                cursor: isActivated ? 'default' : 'pointer',
                userSelect: 'none',
              }}
            >
              {/* Glow */}
              <motion.div
                animate={{
                  opacity: isActivated ? 0.6 : 0,
                  scale: isActivated ? 2 : 1,
                }}
                transition={{ duration: 0.8 }}
                style={{
                  position: 'absolute',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${signature.colors.glow}, transparent)`,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Heart Icon */}
              <motion.div
                animate={{
                  scale: isActivated ? 1.2 : 1,
                }}
                transition={{ duration: 0.4 }}
                style={{
                  width: '32px',
                  height: '32px',
                  position: 'relative',
                }}
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <motion.path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill={isActivated ? signature.colors.primary : signature.colors.secondary}
                    animate={{
                      fill: isActivated ? signature.colors.primary : signature.colors.secondary,
                    }}
                    transition={{ duration: 0.4 }}
                  />
                </svg>
              </motion.div>

              {/* Label */}
              <AnimatePresence>
                {isActivated && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 0.8, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      position: 'absolute',
                      top: '-32px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      whiteSpace: 'nowrap',
                      fontSize: navicueType.hint.fontSize,
                      fontFamily: navicueTypography.contemplative.whisper.fontFamily,
                      fontStyle: 'italic',
                      color: signature.colors.primary,
                    }}
                  >
                    {point.label}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Whisper */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: stage === 'activating' ? 0.5 : 0 }}
        style={{
          ...navicueTypography.contemplative.whisper,
          textAlign: 'center',
          fontStyle: 'italic',
        }}
      >
        The web is forming…
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
          transition={{ delay: 0.6 }}
          style={{
            ...navicueTypography.contemplative.whisper,
            textAlign: 'center',
          }}
        >
          Touch each point to weave the web
        </motion.div>
      )}
    </div>
  );
}