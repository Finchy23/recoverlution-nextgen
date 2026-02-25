import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { colors, surfaces, fonts, spacing, magicSignatures, navicueTypography } from '@/design-tokens';

/**
 * NAVICUE #8: Identity Koan · Integrate · Self-Compassion · Embodying
 * 
 * nct__integrate__mirror_probe_reframe_practice_transfer_seal__identity_koan__self_compassion__e
 * 
 * MAGIC SIGNATURE: Sacred Ordinary (variant 2)
 * Different from #2 - same signature, different color palette and animation
 * 
 * DESIGN PHILOSOPHY:
 * - Breath-gated arrival with hand on heart
 * - Soft lavender/lilac palette (NOT purple from #1, NOT amber from #2)
 * - Blooming circles (flowers opening) - unique animation
 * - Three breath cycles seal embodiment
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

// Use Sacred Ordinary signature but with unique lavender palette
const signature = {
  ...magicSignatures.sacred_ordinary,
  colors: {
    primary: 'hsla(270, 35%, 70%, 1)', // soft lavender
    secondary: 'hsla(275, 30%, 75%, 1)', // pale lilac
    accent: 'hsla(265, 33%, 73%, 1)', // gentle periwinkle
    glow: 'hsla(270, 35%, 70%, 0.3)',
  },
};

export function SelfCompassion_IdentityKoan_Integrate_E({ data, onProgress, onComplete }: Props) {
  const [stage, setStage] = useState<'dormant' | 'breathing' | 'embodied'>('dormant');
  const [breathCycle, setBreathCycle] = useState(0);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    if (stage === 'breathing') {
      const breathInterval = setInterval(() => {
        setBreathCycle(prev => {
          const next = prev + 1;
          if (onProgress) onProgress(next / 3);
          
          if (next >= 3) {
            clearInterval(breathInterval);
            safeTimeout(() => {
              setStage('embodied');
              if (onComplete) onComplete();
            }, 1500);
          }
          return next;
        });
      }, 6000); // 6 seconds per cycle (inhale 3s, exhale 3s)

      return () => clearInterval(breathInterval);
    }
  }, [stage, onProgress, onComplete]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: signature.motion.entry.duration / 1000, ease: signature.motion.entry.ease }}
      onClick={() => stage === 'dormant' && setStage('breathing')}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(ellipse at 50% 45%, ${signature.colors.glow}, transparent 70%), ${surfaces.solid.base}`,
        fontFamily: fonts.primary,
        cursor: stage === 'dormant' ? 'pointer' : 'default',
      }}
    >
      {/* Blooming circles - flowers opening */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: stage === 'dormant' ? 0.15 : 0.25,
        transition: 'opacity 2s ease',
        pointerEvents: 'none',
      }}>
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: stage === 'dormant' ? 0 : [0, 1.5, 0],
              opacity: stage === 'dormant' ? 0 : [0, 0.3, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: i * 0.75,
            }}
            style={{
              position: 'absolute',
              top: `${30 + (i * 10) % 40}%`,
              left: `${20 + (i * 15) % 60}%`,
              width: `${80 + i * 20}px`,
              height: `${80 + i * 20}px`,
              borderRadius: '50%',
              border: `1px solid ${signature.colors.primary}`,
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
            transition={{ duration: 0.8 }}
          >
            <div style={{
              ...navicueTypography.eyebrow,
              marginBottom: spacing.md,
              color: signature.colors.accent,
            }}>
              Hand on heart
            </div>
            <div style={{
              ...navicueTypography.contemplative.primary,
              marginBottom: spacing.lg,
            }}>
              Place your hand on your heart. Feel it beat.
            </div>
            <div style={{
              ...navicueTypography.contemplative.whisper,
            }}>
              Three breaths. That's all.
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
              Touch to begin
            </motion.div>
          </motion.div>
        )}

        {/* Breathing */}
        {stage === 'breathing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div style={{
              ...navicueTypography.contemplative.secondary,
              marginBottom: spacing['2xl'],
            }}>
              Breathe with compassion
            </div>

            {/* Breath visualization */}
            <div style={{
              position: 'relative',
              width: '200px',
              height: '200px',
              margin: '0 auto',
              marginBottom: spacing['2xl'],
            }}>
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: `2px solid ${signature.colors.primary}`,
                }}
              />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                ...navicueTypography.contemplative.primary,
                color: signature.colors.primary,
              }}>
                {'·'.repeat(breathCycle) || '…'}
              </div>
            </div>

            <div style={{
              ...navicueTypography.contemplative.whisper,
            }}>
              Inhale compassion, exhale judgment
            </div>
          </motion.div>
        )}

        {/* Embodied */}
        {stage === 'embodied' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2 }}
          >
            <motion.div
              animate={{
                boxShadow: [
                  `0 0 40px ${signature.colors.glow}`,
                  `0 0 70px ${signature.colors.glow}`,
                  `0 0 40px ${signature.colors.glow}`,
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                width: '120px',
                height: '120px',
                margin: '0 auto',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${signature.colors.primary}, transparent)`,
                marginBottom: spacing.xl,
              }}
            />
            <div style={{
              ...navicueTypography.contemplative.primary,
              marginBottom: spacing.sm,
            }}>
              Your hand remembers.
            </div>
            <div style={{
              ...navicueTypography.contemplative.whisper,
            }}>
              The heart remembers
            </div>
          </motion.div>
        )}
      </div>

      {/* Progress indicator */}
      {stage !== 'dormant' && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{
            scaleX: stage === 'embodied' ? 1 : breathCycle / 3,
          }}
          transition={{ duration: 0.5 }}
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