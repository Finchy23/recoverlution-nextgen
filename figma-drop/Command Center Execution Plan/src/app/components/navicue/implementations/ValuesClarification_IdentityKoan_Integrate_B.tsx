import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { colors, surfaces, fonts, spacing, magicSignatures, navicueTypography, withAlpha, radius } from '@/design-tokens';

/**
 * NAVICUE #9: Identity Koan · Integrate · Values Clarification · Believing
 * 
 * nct__integrate__mirror_probe_reframe_practice_transfer_seal__identity_koan__values_clarification__b
 * 
 * MAGIC SIGNATURE: Koan/Paradox
 * Unlock reframing tension - hold both truths
 * 
 * DESIGN PHILOSOPHY:
 * - Paradox flip card reveals both sides
 * - Burnt sienna/terra cotta palette - grounded paradox
 * - Elements drift opposite directions - unique animation
 * - Integration through holding tension
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

const signature = magicSignatures.koan_paradox;

export function ValuesClarification_IdentityKoan_Integrate_B({ data, onProgress, onComplete }: Props) {
  const [stage, setStage] = useState<'dormant' | 'paradox' | 'flipped' | 'holding'>('dormant');
  const [isFlipped, setIsFlipped] = useState(false);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  const handleFlip = () => {
    if (stage === 'paradox' && !isFlipped) {
      setIsFlipped(true);
      setStage('flipped');
      if (onProgress) onProgress(0.5);
      
      safeTimeout(() => {
        setStage('holding');
        if (onProgress) onProgress(1);
        if (onComplete) onComplete();
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: signature.motion.entry.duration / 1000, ease: signature.motion.entry.ease }}
      onClick={() => stage === 'dormant' && setStage('paradox')}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(ellipse at 50% 50%, ${signature.colors.glow}, transparent 60%), ${surfaces.solid.base}`,
        fontFamily: fonts.primary,
        cursor: stage === 'dormant' ? 'pointer' : 'default',
      }}
    >
      {/* Elements drifting in opposite directions - productive tension */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.2,
        pointerEvents: 'none',
      }}>
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: i % 2 === 0 ? [-50, 50, -50] : [50, -50, 50],
              y: i % 3 === 0 ? [-30, 30, -30] : [30, -30, 30],
              rotate: [0, 180, 0],
            }}
            transition={{
              duration: 20 + i * 2,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              top: `${15 + (i * 15) % 70}%`,
              left: `${10 + (i * 20) % 80}%`,
              width: '3px',
              height: '40px',
              background: `linear-gradient(180deg, ${signature.colors.primary}, transparent)`,
              opacity: 0.3,
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            <div style={{
              ...navicueTypography.eyebrow,
              marginBottom: spacing.md,
              color: signature.colors.accent,
            }}>
              A koan
            </div>
            <div style={{
              ...navicueTypography.contemplative.primary,
              marginBottom: spacing.lg,
            }}>
              What if what you're running from is also what you're running toward?
            </div>
            <div style={{
              ...navicueTypography.contemplative.whisper,
            }}>
              Hold both truths.
            </div>
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                marginTop: spacing.xl,
                ...navicueTypography.ui.label,
                color: signature.colors.secondary,
              }}
            >
              Touch to explore
            </motion.div>
          </motion.div>
        )}

        {/* Paradox / Flipped / Holding */}
        {(stage === 'paradox' || stage === 'flipped' || stage === 'holding') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            {/* Flip card container */}
            <div style={{
              perspective: '1000px',
              marginBottom: spacing.xl,
            }}>
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '500px',
                  height: '300px',
                  margin: '0 auto',
                  transformStyle: 'preserve-3d',
                  cursor: stage === 'paradox' ? 'pointer' : 'default',
                }}
                onClick={handleFlip}
              >
                {/* Front side */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${withAlpha(signature.colors.primary, 0.13)}, ${signature.colors.glow})`,
                  border: `1px solid ${signature.colors.accent}`,
                  borderRadius: radius.lg,
                  padding: spacing.xl,
                }}>
                  <div style={{
                    ...navicueTypography.ui.caption,
                    color: colors.neutral.gray[300],
                    marginBottom: spacing.md,
                    opacity: 0.7,
                  }}>
                    Running from
                  </div>
                  <div style={{
                    ...navicueTypography.contemplative.primary,
                  }}>
                    The unknown
                  </div>
                  {stage === 'paradox' && (
                    <motion.div
                      animate={{ opacity: [0.4, 0.7, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        marginTop: spacing.lg,
                        ...navicueTypography.ui.caption,
                        color: colors.neutral.gray[400],
                      }}
                    >
                      Tap to turn
                    </motion.div>
                  )}
                </div>

                {/* Back side */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${withAlpha(signature.colors.secondary, 0.13)}, ${signature.colors.glow})`,
                  border: `1px solid ${signature.colors.accent}`,
                  borderRadius: radius.lg,
                  padding: spacing.xl,
                }}>
                  <div style={{
                    ...navicueTypography.ui.caption,
                    color: colors.neutral.gray[300],
                    marginBottom: spacing.md,
                    opacity: 0.7,
                  }}>
                    Running toward
                  </div>
                  <div style={{
                    ...navicueTypography.contemplative.primary,
                  }}>
                    The unknown
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Status text */}
            {stage === 'flipped' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                style={{
                  ...navicueTypography.contemplative.secondary,
                }}
              >
                Both are true.
              </motion.div>
            )}

            {stage === 'holding' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5 }}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      `0 0 40px ${signature.colors.glow}`,
                      `0 0 60px ${signature.colors.glow}`,
                      `0 0 40px ${signature.colors.glow}`,
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    width: '100px',
                    height: '100px',
                    margin: '0 auto',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${signature.colors.primary}, transparent)`,
                    marginBottom: spacing.lg,
                  }}
                />
                <div style={{
                  ...navicueTypography.contemplative.primary,
                  marginBottom: spacing.sm,
                }}>
                  It was always the same door.
                </div>
                <div style={{
                  ...navicueTypography.contemplative.whisper,
                }}>
                  The tension was the answer.
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Progress indicator */}
      {stage !== 'dormant' && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{
            scaleX: stage === 'holding' ? 1 : stage === 'flipped' ? 0.7 : 0.3,
          }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, ${signature.colors.primary}, ${signature.colors.secondary})`,
            transformOrigin: 'left',
            opacity: 0.6,
          }}
        />
      )}
    </motion.div>
  );
}