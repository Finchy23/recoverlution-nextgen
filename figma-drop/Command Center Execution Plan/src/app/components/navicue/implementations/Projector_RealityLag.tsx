/**
 * PROJECTOR #4 -- 1004. The Reality Lag
 * "Between the flash and the thunder, you can measure the distance."
 * INTERACTION: Hold to create a gap between stimulus and response.
 * A visual "lag counter" shows the space being created. The longer
 * the hold, the wider the gap, the more freedom emerges.
 * STEALTH KBE: B (Believing) -- Metacognitive gap awareness
 *
 * PROOF SPECIMEN: Validates NaviCueVerse with hold interaction,
 * koan_paradox signature, Theater form, social chrono, seed 1004.
 */
import { useCallback, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function Projector_RealityLag({ onComplete }: Props) {
  const hold = useHoldInteraction({
    maxDuration: 6000,
  });

  const gapMs = Math.round(hold.tension * 6000);
  const gapLabel = gapMs < 1000
    ? `${gapMs}ms`
    : `${(gapMs / 1000).toFixed(1)}s`;

  const advancedRef = useRef(false);
  const advanceRef = useRef<(() => void) | null>(null);

  // Advance once on completion
  useEffect(() => {
    if (hold.completed && !advancedRef.current) {
      advancedRef.current = true;
      setTimeout(() => advanceRef.current?.(), 800);
    }
  }, [hold.completed]);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Theater',
        chrono: 'social',
        kbe: 'believing',
        hook: 'hold',
        specimenSeed: 1004,
        isSeal: false,
      }}
      arrivalText="A flash of lightning..."
      prompt="Hold to widen the gap between stimulus and response."
      resonantText="In that gap lives your entire freedom."
      afterglowCoda="The lag is the gift."
      onComplete={onComplete}
      mechanism="Metacognition"
    >
      {(verse) => {
        advanceRef.current = verse.advance;

        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 32,
            width: '100%',
          }}>
            {/* The gap visualizer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              maxWidth: 300,
            }}>
              {/* Stimulus marker */}
              <motion.div
                animate={{
                  scale: hold.isHolding ? [1, 1.2, 1] : 1,
                  opacity: 0.4 + hold.tension * 0.4,
                }}
                transition={{ duration: 0.6, repeat: hold.isHolding ? Infinity : 0 }}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: verse.palette.accent,
                  flexShrink: 0,
                }}
              />

              {/* The gap -- grows as you hold */}
              <motion.div
                animate={{ flex: Math.max(0.05, hold.tension) }}
                transition={{ duration: 0.1 }}
                style={{
                  height: 2,
                  background: `linear-gradient(90deg, ${verse.palette.accentGlow}, transparent, ${verse.palette.primaryGlow})`,
                  borderRadius: 1,
                  opacity: 0.4 + hold.tension * 0.4,
                }}
              />

              {/* Response marker */}
              <motion.div
                animate={{
                  opacity: 0.2 + hold.tension * 0.3,
                }}
                transition={{ duration: 0.3 }}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  border: `1px solid ${verse.palette.primary}`,
                  background: hold.completed ? verse.palette.primary : 'transparent',
                  flexShrink: 0,
                }}
              />
            </div>

            {/* Gap counter */}
            <motion.div
              animate={{ opacity: hold.tension > 0 ? 1 : 0.3 }}
              style={{
                ...navicueType.display,
                color: verse.palette.text,
                textAlign: 'center',
              }}
            >
              {gapLabel}
            </motion.div>

            {/* Insight at thresholds */}
            <motion.div
              animate={{ opacity: hold.tension > 0.25 ? 0.6 : 0 }}
              style={{
                ...navicueType.texture,
                color: verse.palette.textFaint,
                textAlign: 'center',
                maxWidth: 260,
              }}
            >
              {hold.tension < 0.5
                ? 'The gap is growing...'
                : hold.tension < 0.75
                ? 'Freedom lives in this space.'
                : hold.completed
                ? 'You created the distance.'
                : 'Almost there. Hold the pause.'}
            </motion.div>

            {/* Hold zone */}
            {!hold.completed && (
              <motion.div
                {...hold.holdProps}
                animate={{
                  scale: hold.isHolding ? 0.95 : 1,
                  borderColor: hold.isHolding ? verse.palette.accent : verse.palette.primaryGlow,
                }}
                transition={{ duration: 0.2 }}
                style={{
                  ...hold.holdProps.style,
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  border: `1px solid ${verse.palette.primaryGlow}`,
                  background: verse.palette.primaryFaint,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Fill ring */}
                <svg viewBox="0 0 80 80" style={{ position: 'absolute', inset: 0 }}>
                  <circle
                    cx={40} cy={40} r={36}
                    fill="none"
                    stroke={verse.palette.primary}
                    strokeWidth={1.5}
                    strokeDasharray={`${hold.tension * 226} 226`}
                    strokeLinecap="round"
                    opacity={0.5}
                    transform="rotate(-90 40 40)"
                  />
                </svg>
                <div style={{
                  ...navicueType.hint,
                  color: verse.palette.textFaint,
                }}>
                  hold
                </div>
              </motion.div>
            )}
          </div>
        );
      }}
    </NaviCueVerse>
  );
}