import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { colors, surfaces, fonts, spacing, magicSignatures, navicueTypography, radius } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';

/**
 * NAVICUE #7: Identity Koan · Integrate · Self-Compassion · Believing
 * 
 * nct__integrate__mirror_probe_reframe_practice_transfer_seal__identity_koan__self_compassion__b
 * 
 * MAGIC SIGNATURE: Relational Ghost
 * Felt support without dependency - compassion through relational mirror
 * 
 * DESIGN PHILOSOPHY:
 * - Dual text: write to friend first, then self
 * - Soft rose/blush palette - tender presence (NOT bright red)
 * - Soft layers sliding (parallax) - unique animation
 * - Words migrate from first to second field
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

const signature = magicSignatures.relational_ghost;

export function SelfCompassion_IdentityKoan_Integrate_B({ data, onProgress, onComplete }: Props) {
  const [stage, setStage] = useState<'dormant' | 'writing_friend' | 'migrating' | 'aligned'>('dormant');
  const [friendText, setFriendText] = useState('');
  const [showSelfField, setShowSelfField] = useState(false);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  const handleFriendComplete = () => {
    if (friendText.trim().length > 10) {
      setStage('migrating');
      if (onProgress) onProgress(0.5);
      
      safeTimeout(() => {
        setShowSelfField(true);
        setStage('aligned');
        if (onProgress) onProgress(1);
        safeTimeout(() => {
          if (onComplete) onComplete();
        }, 3000);
      }, 2000);
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
      onClick={() => stage === 'dormant' && setStage('writing_friend')}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(ellipse at 50% 40%, ${signature.colors.glow}, transparent 65%), ${surfaces.solid.base}`,
        fontFamily: fonts.primary,
        cursor: stage === 'dormant' ? 'pointer' : 'default',
      }}
    >
      {/* Soft parallax layers - companionship */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.15,
        pointerEvents: 'none',
      }}>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: stage === 'dormant' ? 0 : [-20, 20, -20],
              y: stage === 'dormant' ? 0 : [-10, 10, -10],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              top: `${20 + i * 30}%`,
              left: `${10 + i * 25}%`,
              width: '40%',
              height: '30%',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${signature.colors.primary}, transparent)`,
              opacity: 0.1 - i * 0.02,
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
        maxWidth: '700px',
        padding: spacing.xl,
        zIndex: 1,
      }}>
        {/* Dormant */}
        {stage === 'dormant' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{
              ...navicueTypography.eyebrow,
              marginBottom: spacing.md,
              color: signature.colors.accent,
            }}>
              A quiet practice
            </div>
            <div style={{
              ...navicueTypography.contemplative.primary,
              marginBottom: spacing.lg,
            }}>
              What would you say to someone you love, standing where you stand?
            </div>
            <div style={{
              ...navicueTypography.contemplative.whisper,
            }}>
              Now say it to yourself.
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

        {/* Writing to friend */}
        {stage === 'writing_friend' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div style={{
              ...navicueTypography.contemplative.secondary,
              marginBottom: spacing.lg,
              textAlign: 'center',
            }}>
              What would you say to them?
            </div>

            <textarea
              value={friendText}
              onChange={(e) => setFriendText(e.target.value)}
              placeholder="Write to someone you love..."
              autoFocus
              style={{
                width: '100%',
                minHeight: '150px',
                padding: spacing.md,
                background: 'rgba(236, 239, 229, 0.05)',
                border: `1px solid ${signature.colors.primary}`,
                borderRadius: radius.md,
                color: colors.neutral.white,
                fontFamily: fonts.secondary,
                fontSize: navicueType.subheading.fontSize,
                fontStyle: 'italic',
                lineHeight: '1.6',
                resize: 'none',
                outline: 'none',
              }}
            />

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: friendText.trim().length > 10 ? 1 : 0.3 }}
              onClick={handleFriendComplete}
              disabled={friendText.trim().length <= 10}
              style={{
                ...navicueTypography.ui.button,
                background: friendText.trim().length > 10 
                  ? `linear-gradient(135deg, ${signature.colors.primary}, ${signature.colors.secondary})`
                  : 'rgba(236, 239, 229, 0.05)',
                border: `1px solid ${friendText.trim().length > 10 ? signature.colors.primary : 'rgba(236, 239, 229, 0.15)'}`,
                color: colors.neutral.white,
                padding: `${spacing.md} ${spacing.xl}`,
                borderRadius: radius.full, // True pill — was hardcoded '100px'
                marginTop: spacing.lg,
                width: '100%',
                cursor: friendText.trim().length > 10 ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
              }}
            >
              Continue
            </motion.button>
          </motion.div>
        )}

        {/* Migrating / Aligned */}
        {(stage === 'migrating' || stage === 'aligned') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div style={{
              ...navicueTypography.contemplative.secondary,
              marginBottom: spacing.xl,
              textAlign: 'center',
            }}>
              Now say it to yourself
            </div>

            {/* Friend's words (fading) */}
            <motion.div
              animate={{ opacity: stage === 'migrating' ? [1, 0.3] : 0.3 }}
              transition={{ duration: 2 }}
              style={{
                padding: spacing.md,
                background: 'rgba(236, 239, 229, 0.03)',
                border: `1px solid rgba(236, 239, 229, 0.1)`,
                borderRadius: radius.md,
                marginBottom: spacing.md,
              }}
            >
              <div style={{
                ...navicueTypography.ui.caption,
                color: signature.colors.accent,
                marginBottom: spacing.xs,
                opacity: 0.6,
              }}>
                To them
              </div>
              <div style={{
                fontFamily: fonts.secondary,
                fontSize: navicueType.narrative.fontSize,
                fontStyle: 'italic',
                color: colors.neutral.gray[500],
                lineHeight: '1.6',
              }}>
                {friendText}
              </div>
            </motion.div>

            {/* Self field (appearing) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showSelfField ? 1 : 0, y: showSelfField ? 0 : 20 }}
              transition={{ duration: 1.5 }}
              style={{
                padding: spacing.md,
                background: `linear-gradient(135deg, ${signature.colors.glow}, rgba(236, 239, 229, 0.05))`,
                border: `1px solid ${signature.colors.primary}`,
                borderRadius: radius.md,
              }}
            >
              <div style={{
                ...navicueTypography.ui.caption,
                color: signature.colors.primary,
                marginBottom: spacing.xs,
                opacity: 0.8,
              }}>
                To yourself
              </div>
              <div style={{
                fontFamily: fonts.secondary,
                fontSize: navicueType.narrative.fontSize,
                fontStyle: 'italic',
                color: colors.neutral.white,
                lineHeight: '1.6',
              }}>
                {friendText}
              </div>
            </motion.div>

            {stage === 'aligned' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 1 }}
                style={{
                  ...navicueTypography.contemplative.whisper,
                  textAlign: 'center',
                  marginTop: spacing.lg,
                }}
              >
                The same words. Now, for you.
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
            scaleX: stage === 'aligned' ? 1 : stage === 'migrating' ? 0.7 : 0.3,
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