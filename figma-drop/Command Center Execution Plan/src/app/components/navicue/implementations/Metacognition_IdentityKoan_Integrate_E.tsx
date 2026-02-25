import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { colors, surfaces, fonts, spacing, magicSignatures, navicueTypography } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';

/**
 * NAVICUE #6: Identity Koan · Integrate · Metacognition · Embodying
 * 
 * nct__integrate__mirror_probe_reframe_practice_transfer_seal__identity_koan__metacognition__e
 * 
 * MAGIC SIGNATURE: Poetic Precision
 * Insight with minimal words - the thought is not you
 * 
 * DESIGN PHILOSOPHY:
 * - Single statement, hold to embody
 * - Cool steel/silver palette - precise clarity
 * - Geometric shapes fade exact (no movement) - unique animation
 * - Progress ring fills over hold duration
 */

interface NavicueData {
  navicue_type_name: string;
  primary_prompt?: string;
  [key: string]: any;
}

interface Props {
  data: NavicueData;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

const signature = magicSignatures.poetic_precision;

export function Metacognition_IdentityKoan_Integrate_E({ data, onProgress, onComplete }: Props) {
  const [stage, setStage] = useState<'dormant' | 'holding' | 'embodied'>('dormant');
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  const handleMouseDown = () => {
    if (stage === 'dormant') {
      setStage('holding');
      setIsHolding(true);
    }
  };

  const handleMouseUp = () => {
    setIsHolding(false);
  };

  // Track hold progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isHolding && stage === 'holding') {
      interval = setInterval(() => {
        setHoldProgress(prev => {
          const next = prev + 0.033; // ~3 seconds to complete
          if (onProgress) onProgress(next);
          
          if (next >= 1) {
            setStage('embodied');
            setIsHolding(false);
            if (onComplete) onComplete();
            return 1;
          }
          return next;
        });
      }, 100);
    } else if (!isHolding && holdProgress < 1) {
      // Reset if released too early
      setHoldProgress(0);
      if (stage === 'holding') setStage('dormant');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHolding, stage, holdProgress, onProgress, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: signature.motion.entry.duration / 1000, ease: signature.motion.entry.ease }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(ellipse at 50% 50%, ${signature.colors.glow}, transparent 70%), ${surfaces.solid.base}`,
        fontFamily: fonts.primary,
        cursor: stage === 'dormant' ? 'pointer' : stage === 'holding' ? 'grabbing' : 'default',
      }}
    >
      {/* Geometric precision field - opacity only, no movement */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.15,
        pointerEvents: 'none',
      }}>
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.2, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.75,
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${100 + i * 80}px`,
              height: `${100 + i * 80}px`,
              border: `1px solid ${signature.colors.primary}`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      {/* Central Container */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: '800px',
        padding: spacing.xl,
        textAlign: 'center',
        zIndex: 1,
      }}>
        {/* Dormant */}
        {stage === 'dormant' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{
              ...navicueTypography.eyebrow,
              marginBottom: spacing.lg,
              color: signature.colors.accent,
            }}>
              A knowing
            </div>
            <div style={{
              fontSize: navicueType.koan.fontSize,
              fontFamily: fonts.secondary,
              fontStyle: 'italic',
              fontWeight: '300',
              lineHeight: '1.3',
              letterSpacing: '0.01em',
              color: colors.neutral.white,
              marginBottom: spacing.xl,
              opacity: 0.95,
            }}>
              The thought is not you.
            </div>
            <div style={{
              ...navicueTypography.contemplative.whisper,
              marginBottom: spacing['2xl'],
            }}>
              This knowing changes everything.
            </div>

            <motion.div
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                ...navicueTypography.ui.label,
                color: signature.colors.secondary,
              }}
            >
              Hold to embody
            </motion.div>
          </motion.div>
        )}

        {/* Holding */}
        {stage === 'holding' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{
              fontSize: navicueType.koan.fontSize,
              fontFamily: fonts.secondary,
              fontStyle: 'italic',
              fontWeight: '300',
              lineHeight: '1.3',
              color: colors.neutral.white,
              marginBottom: spacing['2xl'],
              opacity: 0.95,
            }}>
              The thought is not you.
            </div>

            {/* Hold progress ring */}
            <div style={{
              position: 'relative',
              width: '160px',
              height: '160px',
              margin: '0 auto',
            }}>
              <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={signature.colors.primary}
                  strokeWidth="2"
                  fill="none"
                  opacity="0.2"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={signature.colors.primary}
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - holdProgress)}`}
                  transition={{ duration: 0.1 }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}>
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: signature.colors.accent,
                  }}
                />
              </div>
            </div>

            <div style={{
              ...navicueTypography.contemplative.whisper,
              marginTop: spacing.lg,
            }}>
              Settling…
            </div>
          </motion.div>
        )}

        {/* Embodied */}
        {stage === 'embodied' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              animate={{
                boxShadow: [
                  `0 0 30px ${signature.colors.glow}`,
                  `0 0 50px ${signature.colors.glow}`,
                  `0 0 30px ${signature.colors.glow}`,
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                width: '100px',
                height: '100px',
                margin: '0 auto',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${signature.colors.primary}, transparent)`,
                marginBottom: spacing.xl,
              }}
            />
            <div style={{
              fontSize: navicueType.prompt.fontSize,
              fontFamily: fonts.secondary,
              fontStyle: 'italic',
              fontWeight: '300',
              color: colors.neutral.white,
              marginBottom: spacing.sm,
              opacity: 0.95,
            }}>
              You were always the one watching.
            </div>
            <div style={{
              ...navicueTypography.contemplative.whisper,
            }}>
              And now you know.
            </div>
          </motion.div>
        )}
      </div>

      {/* Progress indicator */}
      {stage !== 'dormant' && (
        <motion.div
          animate={{
            scaleX: stage === 'embodied' ? 1 : holdProgress,
          }}
          transition={{ duration: 0.1 }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: signature.colors.primary,
            transformOrigin: 'left',
            opacity: 0.8,
          }}
        />
      )}
    </motion.div>
  );
}