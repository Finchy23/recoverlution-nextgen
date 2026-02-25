/**
 * Inventory Spark · Integrate · Metacognition · Embodying
 * 
 * ESSENCE: Hold to separate self from thought stream - witness thoughts flowing past
 * 
 * VISUAL LANGUAGE:
 * - Form: Signal (observer eye in center with thought stream flowing)
 * - Mechanism: Metacognition (witness perspective, separation from content)
 * - Interaction: Hold to Reveal (flowing particles slow to reveal individual thoughts)
 * - Magic: Witness Ritual (spacious, stable, creates distance)
 * 
 * STAGES:
 * - Dormant: Eye closed, thoughts rush past as blur
 * - Holding: Eye opens, thought stream slows progressively
 * - Revealed: Individual thoughts visible, spacing created
 * - Complete: Witnessing position sealed, clear observer space
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing, withAlpha } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';
import { radius } from '@/design-tokens';

type Stage = 'dormant' | 'holding' | 'revealed' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

export default function InventorySpark_Integrate_Metacognition_E({
  primary_prompt,
  cta_primary,
  onComplete,
}: NaviCueProps) {
  const signature = magicSignatures.witness_ritual;
  const [stage, setStage] = useState<Stage>('dormant');
  const [holdProgress, setHoldProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const holdTimerRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleHoldStart = () => {
    if (stage === 'dormant' || stage === 'revealed') {
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
          setStage('revealed');
          safeTimeout(() => {
            setStage('complete');
            onComplete?.();
          }, 800);
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

  const thoughtParticles = [
    { id: 1, delay: 0, label: 'worry' },
    { id: 2, delay: 0.3, label: 'plan' },
    { id: 3, delay: 0.6, label: 'memory' },
    { id: 4, delay: 0.9, label: 'judgment' },
    { id: 5, delay: 1.2, label: 'story' },
  ];

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

      {/* Observer Eye + Thought Stream */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '320px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Thought Stream */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {thoughtParticles.map((thought) => (
            <motion.div
              key={thought.id}
              initial={{ x: '-100%', opacity: 0.3 }}
              animate={{
                x: stage === 'dormant' ? '100%' : '50%',
                opacity: stage === 'holding' || stage === 'revealed' ? 0.7 : 0.3,
              }}
              transition={{
                x: {
                  duration: stage === 'dormant' ? 4 : 8 * (1 - holdProgress * 0.8),
                  repeat: Infinity,
                  ease: 'linear',
                  delay: thought.delay,
                },
                opacity: { duration: 0.6 },
              }}
              style={{
                position: 'absolute',
                top: `${20 + thought.id * 15}%`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: navicueType.texture.fontSize,
                color: signature.colors.secondary,
                fontFamily: navicueTypography.ui.label.fontFamily,
              }}
            >
              <div
                style={{
                  width: stage === 'revealed' ? '60px' : '40px',
                  height: '8px',
                  backgroundColor: signature.colors.primary,
                  opacity: stage === 'revealed' ? 0.6 : 0.3,
                  borderRadius: radius.xs,
                  transition: 'all 0.4s ease',
                }}
              />
              {stage === 'revealed' && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    fontSize: navicueType.hint.fontSize,
                    fontStyle: 'italic',
                  }}
                >
                  {thought.label}
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Observer Eye */}
        <motion.div
          onMouseDown={handleHoldStart}
          onMouseUp={handleHoldEnd}
          onMouseLeave={handleHoldEnd}
          onTouchStart={handleHoldStart}
          onTouchEnd={handleHoldEnd}
          animate={{
            scale: stage === 'holding' ? 1.1 : 1,
          }}
          style={{
            position: 'relative',
            zIndex: 10,
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${signature.colors.glow}, transparent)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          {/* Eye Shape */}
          <div
            style={{
              width: '80px',
              height: stage === 'dormant' ? '8px' : '50px',
              borderRadius: stage === 'dormant' ? '4px' : '50%',
              border: `2px solid ${signature.colors.primary}`,
              background: stage === 'dormant' ? 'transparent' : signature.colors.glow,
              transition: 'all 0.6s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Pupil */}
            {stage !== 'dormant' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: signature.colors.primary,
                }}
              />
            )}
          </div>

          {/* Hold Progress Ring */}
          {stage === 'holding' && (
            <svg
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                transform: 'rotate(-90deg)',
              }}
            >
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={signature.colors.primary}
                strokeWidth="3"
                strokeDasharray={339.292}
                strokeDashoffset={339.292 * (1 - holdProgress)}
                style={{ transition: 'stroke-dashoffset 0.1s linear' }}
              />
            </svg>
          )}
        </motion.div>
      </div>

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
              borderRadius: radius.xs,
              transition: 'all 0.4s ease',
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
          Hold the eye to slow the stream
        </motion.div>
      )}
    </div>
  );
}