/**
 * Key · Integrate · Metacognition · Believing
 * 
 * ESSENCE: Choose which door to observe your patterns through
 * 
 * VISUAL LANGUAGE:
 * - Form: Directional (one key, two different keyholes)
 * - Mechanism: Metacognition (meta-awareness, choosing vantage point, different perspectives)
 * - Interaction: Branch Fork (keyholes preview thought patterns inside)
 * - Magic: Sacred Ordinary (everyday perspective choice)
 * 
 * STAGES:
 * - Dormant: Key between two doors
 * - Choosing: Hover to preview what each door reveals
 * - Committed: Key enters chosen door
 * - Complete: Observer position selected
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing, withAlpha } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';

type Stage = 'dormant' | 'choosing' | 'committed' | 'complete';
type DoorChoice = 'left' | 'right' | null;

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  cta_defer: string;
  onComplete?: () => void;
}

export default function Key_Integrate_Metacognition_B({
  primary_prompt,
  cta_primary,
  cta_defer,
  onComplete,
}: NaviCueProps) {
  const signature = magicSignatures.sacred_ordinary;
  const [stage, setStage] = useState<Stage>('dormant');
  const [hoveredDoor, setHoveredDoor] = useState<DoorChoice>(null);
  const [chosenDoor, setChosenDoor] = useState<DoorChoice>(null);
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleKeyClick = () => {
    if (stage === 'dormant') {
      setStage('choosing');
    }
  };

  const handleDoorChoose = (door: DoorChoice) => {
    if (stage === 'choosing') {
      setChosenDoor(door);
      setStage('committed');
      safeTimeout(() => {
        setStage('complete');
        onComplete?.();
      }, 800);
    }
  };

  if (!mounted) return null;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '700px',
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
        style={{
          position: 'relative',
          width: '100%',
          height: '320px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '80px',
        }}
      >
        {/* Left Door - Thought Content View */}
        <motion.div
          onMouseEnter={() => stage === 'choosing' && setHoveredDoor('left')}
          onMouseLeave={() => stage === 'choosing' && setHoveredDoor(null)}
          onClick={() => handleDoorChoose('left')}
          animate={{
            opacity: chosenDoor === 'right' ? 0.3 : 1,
            scale: hoveredDoor === 'left' || chosenDoor === 'left' ? 1.05 : 1,
          }}
          style={{
            width: '160px',
            height: '240px',
            border: `3px solid ${signature.colors.primary}`,
            borderRadius: radius.md,
            background: hoveredDoor === 'left' ? `${signature.colors.glow}` : withAlpha(signature.colors.primary, 0.07),
            cursor: stage === 'choosing' ? 'pointer' : 'default',
            position: 'relative',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            userSelect: 'none',
          }}
        >
          {/* Keyhole */}
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: `2px solid ${signature.colors.primary}`,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '18px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: `12px solid ${signature.colors.primary}`,
              }}
            />
          </div>

          {/* Preview: Thought bubbles */}
          {(hoveredDoor === 'left' || chosenDoor === 'left') && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.6 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    width: `${30 + i * 8}px`,
                    height: `${30 + i * 8}px`,
                    borderRadius: '50%',
                    border: `2px solid ${signature.colors.secondary}`,
                    backgroundColor: withAlpha(signature.colors.primary, 0.13),
                  }}
                />
              ))}
            </>
          )}

          <div style={{
            fontSize: navicueType.hint.fontSize,
            color: signature.colors.primary,
            textAlign: 'center',
            fontFamily: navicueTypography.ui.label.fontFamily,
          }}>
            {cta_defer}
          </div>
        </motion.div>

        {/* Center Key */}
        <motion.div
          onClick={handleKeyClick}
          animate={{
            x: chosenDoor === 'left' ? -120 : chosenDoor === 'right' ? 120 : 0,
            scale: stage === 'dormant' ? 1 : 0.8,
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            cursor: stage === 'dormant' ? 'pointer' : 'default',
            userSelect: 'none',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <svg width="80" height="40" viewBox="0 0 80 40">
            <circle cx="15" cy="20" r="12" stroke={signature.colors.primary} strokeWidth="3" fill="none" />
            <circle cx="15" cy="20" r="6" stroke={signature.colors.primary} strokeWidth="2" fill="none" />
            <rect x="22" y="17" width="40" height="6" fill={signature.colors.primary} rx="2" />
            <path d="M 50 23 L 50 28 M 55 23 L 55 30 M 60 23 L 60 27" stroke={signature.colors.primary} strokeWidth="2" />
          </svg>

          {stage === 'dormant' && (
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '15px',
                transform: 'translate(-50%, -50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${signature.colors.glow}, transparent)`,
                pointerEvents: 'none',
              }}
            />
          )}
        </motion.div>

        {/* Right Door - Observer View */}
        <motion.div
          onMouseEnter={() => stage === 'choosing' && setHoveredDoor('right')}
          onMouseLeave={() => stage === 'choosing' && setHoveredDoor(null)}
          onClick={() => handleDoorChoose('right')}
          animate={{
            opacity: chosenDoor === 'left' ? 0.3 : 1,
            scale: hoveredDoor === 'right' || chosenDoor === 'right' ? 1.05 : 1,
          }}
          style={{
            width: '160px',
            height: '240px',
            border: `3px solid ${signature.colors.primary}`,
            borderRadius: radius.md,
            background: hoveredDoor === 'right' ? `${signature.colors.glow}` : withAlpha(signature.colors.primary, 0.07),
            cursor: stage === 'choosing' ? 'pointer' : 'default',
            position: 'relative',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            userSelect: 'none',
          }}
        >
          {/* Keyhole */}
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: `2px solid ${signature.colors.primary}`,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '18px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: `12px solid ${signature.colors.primary}`,
              }}
            />
          </div>

          {/* Preview: Observer eye */}
          {(hoveredDoor === 'right' || chosenDoor === 'right') && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.8 }}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                border: `3px solid ${signature.colors.primary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: signature.colors.primary,
                }}
              />
            </motion.div>
          )}

          <div style={{
            fontSize: navicueType.hint.fontSize,
            color: signature.colors.primary,
            textAlign: 'center',
            fontFamily: navicueTypography.ui.label.fontFamily,
          }}>
            {cta_primary}
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
            Enter
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
          Tap key, then choose your perspective
        </motion.div>
      )}
    </div>
  );
}