/**
 * Parts Rollcall · Integrate · Self-Compassion · Believing
 * 
 * ESSENCE: Each part receives tenderness — even the difficult ones
 * 
 * VISUAL: Parts appear as small figures. Tap each to give it a warm
 * glow (a hug of light). The Critic and Protector receive kindness too.
 * Heart/warmth aesthetics, soft nurturing tones.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing, withAlpha, radius } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';

type Stage = 'gathering' | 'nurturing' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

const PARTS = [
  { name: 'The sharp voice', needs: 'patience' },
  { name: 'The tender place', needs: 'tenderness' },
  { name: 'The fire', needs: 'understanding' },
  { name: 'The small one', needs: 'safety' },
  { name: 'The hidden one', needs: 'acceptance' },
];

export default function PartsRollcall_Integrate_SelfCompassion_B({
  primary_prompt, cta_primary, onComplete,
}: NaviCueProps) {
  const sig = magicSignatures.sacred_ordinary;
  const [nurtured, setNurtured] = useState<number[]>([]);
  const [stage, setStage] = useState<Stage>('gathering');
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { setMounted(true); }, []);

  const handleNurture = (index: number) => {
    if (stage === 'complete') return;
    if (!nurtured.includes(index)) {
      const next = [...nurtured, index];
      setNurtured(next);
      if (next.length >= PARTS.length) {
        setStage('nurturing');
        safeTimeout(() => { setStage('complete'); onComplete?.(); }, 1800);
      }
    }
  };

  if (!mounted) return null;

  return (
    <div style={{
      width: '100%', maxWidth: '600px', margin: '0 auto', padding: spacing.xl,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.xl,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ ...navicueTypography.contemplative.primary, textAlign: 'center' }}
      >{primary_prompt}</motion.div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: '12px', width: '280px',
      }}>
        {PARTS.map((part, i) => {
          const isNurtured = nurtured.includes(i);
          return (
            <motion.div
              key={part.name}
              onClick={() => handleNurture(i)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', borderRadius: radius.md,
                border: `1.5px solid ${withAlpha(isNurtured ? sig.colors.accent : sig.colors.primary, 0.20)}`,
                backgroundColor: isNurtured ? `${sig.colors.glow}` : 'transparent',
                cursor: 'pointer', transition: 'all 0.4s ease',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Warm glow when nurtured */}
              {isNurtured && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.3, scale: 1 }}
                  style={{
                    position: 'absolute', left: '-10%', top: '-50%',
                    width: '120%', height: '200%',
                    background: `radial-gradient(circle, ${withAlpha(sig.colors.accent, 0.27)}, transparent)`,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Heart icon */}
              <motion.div
                animate={{
                  scale: isNurtured ? [1, 1.2, 1] : 1,
                }}
                transition={{ duration: 0.6 }}
                style={{
                  width: '24px', height: '24px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="18" height="16" viewBox="0 0 18 16">
                  <path
                    d="M9 15 C9 15 1 10 1 5 C1 2.2 3 0.5 5.5 0.5 C7 0.5 9 2 9 2 C9 2 11 0.5 12.5 0.5 C15 0.5 17 2.2 17 5 C17 10 9 15 9 15Z"
                    fill={isNurtured ? sig.colors.accent : 'transparent'}
                    stroke={isNurtured ? sig.colors.accent : sig.colors.primary}
                    strokeWidth="1"
                    opacity={isNurtured ? 0.8 : 0.3}
                  />
                </svg>
              </motion.div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: navicueType.caption.fontSize, fontWeight: 500,
                  color: sig.colors.primary, opacity: isNurtured ? 0.9 : 0.6,
                  fontFamily: navicueTypography.contemplative.whisper.fontFamily,
                }}>
                  {part.name}
                </div>
                <AnimatePresence>
                  {isNurtured && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 0.6, height: 'auto' }}
                      style={{
                        fontSize: navicueType.caption.fontSize, fontStyle: 'italic',
                        color: sig.colors.accent, marginTop: '2px',
                        fontFamily: navicueTypography.contemplative.whisper.fontFamily,
                      }}
                    >
                      receives {part.needs}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div animate={{ opacity: 0.5 }}
        style={{ ...navicueTypography.contemplative.whisper, textAlign: 'center' }}>
        {nurtured.length < PARTS.length
          ? 'Tap each part to offer kindness'
          : 'Every part is held'}
      </motion.div>
    </div>
  );
}