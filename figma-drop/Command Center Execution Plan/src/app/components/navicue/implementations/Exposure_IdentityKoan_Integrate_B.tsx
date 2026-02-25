import { motion } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { colors, surfaces, fonts, spacing, magicSignatures, navicueTypography } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';

/**
 * NAVICUE #3: Identity Koan · Integrate · Exposure · Believing
 * 
 * nct__integrate__mirror_probe_reframe_practice_transfer_seal__identity_koan__exposure__b
 * 
 * MAGIC SIGNATURE: Science × Soul
 * Authority with humanity - approach the edge with structured support
 * 
 * DESIGN PHILOSOPHY:
 * - Binary choice revealing deeper truth
 * - Cool jade/teal palette - clinical meets natural
 * - Geometric grid that breathes (unique animation)
 * - Progressive disclosure with gentle embodiment check
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

const signature = magicSignatures.science_x_soul;

export function Exposure_IdentityKoan_Integrate_B({ data, onProgress, onComplete }: Props) {
  const [stage, setStage] = useState<'dormant' | 'choosing' | 'integrating' | 'complete'>('dormant');
  const [choice, setChoice] = useState<'approach' | 'defer' | null>(null);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => { return () => timersRef.current.forEach(clearTimeout); }, []);

  const handleChoice = (selected: 'approach' | 'defer') => {
    setChoice(selected);
    setStage('integrating');
    if (onProgress) onProgress(0.5);

    safeTimeout(() => {
      setStage('complete');
      if (onProgress) onProgress(1);
      if (onComplete) onComplete();
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: signature.motion.entry.duration / 1000, ease: signature.motion.entry.ease }}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(ellipse at 50% 30%, ${signature.colors.glow}, transparent 60%), ${surfaces.solid.base}`,
        fontFamily: fonts.primary,
        cursor: stage === 'dormant' ? 'pointer' : 'default',
      }}
      onClick={() => stage === 'dormant' && setStage('choosing')}
    >
      {/* Breathing geometric grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: stage === 'dormant' ? 0.1 : 0.2,
        transition: 'opacity 2s ease',
        overflow: 'hidden',
      }}>
        {[...Array(8)].map((_, row) => (
          <div key={`row-${row}`} style={{ display: 'flex', height: '12.5%' }}>
            {[...Array(12)].map((_, col) => (
              <motion.div
                key={`${row}-${col}`}
                animate={{
                  scale: stage === 'dormant' ? 1 : [0.98, 1.02, 0.98],
                  opacity: [(col + row) % 2 === 0 ? 0.15 : 0.05, (col + row) % 2 === 0 ? 0.25 : 0.1, (col + row) % 2 === 0 ? 0.15 : 0.05],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: (row + col) * 0.1,
                }}
                style={{
                  flex: 1,
                  border: `1px solid ${signature.colors.primary}`,
                  opacity: 0.1,
                }}
              />
            ))}
          </div>
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
            transition={{ duration: 1 }}
          >
            <div style={{
              ...navicueTypography.eyebrow,
              marginBottom: spacing.md,
              color: signature.colors.accent,
            }}>
              At the edge
            </div>
            <div style={{
              ...navicueTypography.contemplative.primary,
              marginBottom: spacing.lg,
            }}>
              What are you ready to stand closer to?
            </div>
            <div style={{
              ...navicueTypography.contemplative.whisper,
            }}>
              Not force yourself toward. Ready to stand closer to.
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
              Touch to continue
            </motion.div>
          </motion.div>
        )}

        {/* Choosing */}
        {stage === 'choosing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div style={{
              ...navicueTypography.contemplative.secondary,
              marginBottom: spacing['2xl'],
            }}>
              What are you ready to stand closer to?
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: spacing.lg,
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                onClick={() => handleChoice('approach')}
                style={{
                  ...navicueTypography.ui.button,
                  background: `rgba(236, 239, 229, 0.08)`,
                  border: `1px solid ${signature.colors.primary}`,
                  color: colors.neutral.white,
                  padding: spacing.lg,
                  borderRadius: radius.lg,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ fontSize: navicueType.choice.fontSize, marginBottom: '8px' }}>Open it</div>
                <div style={{ ...navicueTypography.ui.caption, opacity: 0.6 }}>Approach the edge</div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                onClick={() => handleChoice('defer')}
                style={{
                  ...navicueTypography.ui.button,
                  background: `rgba(236, 239, 229, 0.05)`,
                  border: `1px solid rgba(236, 239, 229, 0.15)`,
                  color: colors.neutral.gray[400],
                  padding: spacing.lg,
                  borderRadius: radius.lg,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ fontSize: navicueType.choice.fontSize, marginBottom: '8px' }}>Not yet</div>
                <div style={{ ...navicueTypography.ui.caption, opacity: 0.5 }}>And that's okay</div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Integrating */}
        {stage === 'integrating' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{
                width: '200px',
                height: '200px',
                margin: '0 auto',
                position: 'relative',
                marginBottom: spacing.xl,
              }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, opacity: 0.6 }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '2px',
                    height: '80px',
                    background: `linear-gradient(180deg, ${signature.colors.primary}, transparent)`,
                    transformOrigin: '50% 0%',
                    transform: `translate(-50%, 0) rotate(${(360 / 6) * i}deg)`,
                  }}
                />
              ))}
            </motion.div>

            <div style={{
              ...navicueTypography.contemplative.secondary,
            }}>
              {choice === 'approach' ? 'Standing at the edge with you' : 'Honoring your readiness'}
            </div>
          </motion.div>
        )}

        {/* Complete */}
        {stage === 'complete' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
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
              {choice === 'approach' ? 'The edge noticed' : 'Readiness honored'}
            </div>
            <div style={{
              ...navicueTypography.contemplative.whisper,
            }}>
              Something shifted.
            </div>
          </motion.div>
        )}
      </div>

      {/* Progress indicator */}
      {stage !== 'dormant' && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ 
            scaleX: stage === 'complete' ? 1 : 0.5,
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