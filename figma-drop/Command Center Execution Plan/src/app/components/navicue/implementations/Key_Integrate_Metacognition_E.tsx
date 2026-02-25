/**
 * Key · Integrate · Metacognition · Embodying
 * 
 * ESSENCE: Unlock the room where you can see your own mind
 * 
 * VISUAL LANGUAGE:
 * - Form: Directional (key opens observatory with telescopes pointing inward)
 * - Mechanism: Metacognition (clarity chamber, witnessing position secured, thought architecture visible)
 * - Interaction: Tap Reveal (mirrors and lenses revealing structure)
 * - Magic: Witness Ritual (ceremonial access to meta-view)
 * 
 * STAGES:
 * - Dormant: Locked observatory door
 * - Revealing: Door opens, telescopes and mirrors visible inside
 * - Complete: Full observatory access, meta-view established
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing, withAlpha } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';

type Stage = 'dormant' | 'revealing' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

export default function Key_Integrate_Metacognition_E({
  primary_prompt,
  cta_primary,
  onComplete,
}: NaviCueProps) {
  const signature = magicSignatures.witness_ritual;
  const [stage, setStage] = useState<Stage>('dormant');
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUnlock = () => {
    if (stage === 'dormant') {
      setStage('revealing');
      safeTimeout(() => {
        setStage('complete');
        onComplete?.();
      }, 1600);
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
        onClick={handleUnlock}
        style={{
          position: 'relative',
          width: '320px',
          height: '360px',
          cursor: stage === 'dormant' ? 'pointer' : 'default',
          userSelect: 'none',
        }}
      >
        {/* Observatory Interior (revealed) */}
        <motion.div
          animate={{
            opacity: stage === 'dormant' ? 0 : 1,
            scale: stage === 'dormant' ? 0.9 : 1,
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: radius.lg,
            background: `linear-gradient(135deg, ${signature.colors.glow}, transparent)`,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          {/* Central Observer Eye */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: stage === 'dormant' ? 0 : 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: `3px solid ${signature.colors.primary}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: signature.colors.primary,
              }}
            />
          </motion.div>

          {/* Telescopes/Lenses pointing inward */}
          {[0, 1, 2, 3].map((i) => {
            const angle = (i * 90) - 45;
            const orbitRadius = 90;
            const x = Math.cos((angle * Math.PI) / 180) * orbitRadius;
            const y = Math.sin((angle * Math.PI) / 180) * orbitRadius;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: stage === 'dormant' ? 0 : 0.6,
                  scale: stage === 'dormant' ? 0 : 1,
                }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  width: '40px',
                  height: '40px',
                  transform: `translate(-50%, -50%) rotate(${angle + 135}deg)`,
                }}
              >
                {/* Telescope shape */}
                <div
                  style={{
                    width: '100%',
                    height: '12px',
                    background: `linear-gradient(to right, ${signature.colors.secondary}, ${signature.colors.primary})`,
                    borderRadius: radius.sm,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: `2px solid ${signature.colors.primary}`,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  />
                </div>
              </motion.div>
            );
          })}

          {/* Mirrors */}
          {[0, 1].map((i) => (
            <motion.div
              key={`mirror-${i}`}
              initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
              animate={{
                opacity: stage === 'complete' ? 0.4 : 0,
                x: 0,
              }}
              transition={{ delay: 1, duration: 0.6 }}
              style={{
                position: 'absolute',
                [i === 0 ? 'left' : 'right']: '20px',
                top: '30%',
                width: '40px',
                height: '80px',
                border: `2px solid ${signature.colors.primary}`,
                borderRadius: radius.xs,
                background: `linear-gradient(${i === 0 ? '90deg' : '270deg'}, ${signature.colors.glow}, transparent)`,
              }}
            />
          ))}
        </motion.div>

        {/* Door (slides open) */}
        <motion.div
          animate={{
            x: stage === 'dormant' ? 0 : -320,
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: `4px solid ${signature.colors.primary}`,
            borderRadius: radius.lg,
            backgroundColor: withAlpha(signature.colors.primary, 0.13),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Lock */}
          <div
            style={{
              width: '80px',
              height: '100px',
              border: `2px solid ${signature.colors.primary}`,
              borderRadius: radius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: `3px solid ${signature.colors.primary}`,
                position: 'relative',
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
          </div>

          <div
            style={{
              fontSize: navicueType.hint.fontSize,
              fontFamily: navicueTypography.ui.label.fontFamily,
              color: signature.colors.primary,
              letterSpacing: '0.1em',
            }}
          >
            OBSERVATORY
          </div>
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
          Tap to unlock the viewing room
        </motion.div>
      )}
    </div>
  );
}