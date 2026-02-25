/**
 * ENGINE #10 -- 1060. The Engine Seal (The Proof)
 * "Order from Chaos. Work from Heat."
 * TIER: ADVANCED (Full ceremony) | SCIENCE: Second Law of Thermodynamics
 * SIGNATURE: science_x_soul | FORM: Circuit | CHRONO: night
 *
 * DELIVERY STACK:
 *   NaviCueVerse (compositor-driven 5-stage arc)
 *   useHoldInteraction (sustained presence -- feel the differential)
 */
import { useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, immersiveHoldButton } from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function Engine_EngineSeal({ onComplete }: Props) {
  const hold = useHoldInteraction({ maxDuration: 5000 });

  const advanceRef = useRef<(() => void) | null>(null);
  const advancedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (hold.completed && !advancedRef.current) {
      advancedRef.current = true;
      setTimeout(() => advanceRef.current?.(), 2000);
    }
  }, [hold.completed]);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Circuit',
        chrono: 'night',
        kbe: 'embodying',
        hook: 'hold',
        specimenSeed: 1060,
        isSeal: true,
      }}
      arrivalText="A Stirling engine. Heat on one side. Cold on the other."
      prompt="Order from Chaos. Work from Heat."
      resonantText="The Second Law of Thermodynamics. Entropy always increases unless energy is applied to create order. You are the anti-entropy machine."
      afterglowCoda="Order from Chaos."
      onComplete={onComplete}
      timing={{
        presentAt: 4000,
        activeAt: 6500,
        resonantDuration: 6000,
        afterglowDuration: 5000,
      }}
    >
      {(verse) => {
        advanceRef.current = verse.advance;
        if (hold.completed) handleComplete();

        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            width: '100%',
          }}>
            {/* Stirling engine visualization */}
            <svg width="200" height="80" viewBox="0 0 200 80">
              {/* Hot side */}
              <rect x="10" y="20" width="60" height="40" rx="4"
                fill={`hsla(0, ${30 + hold.tension * 30}%, ${25 + hold.tension * 15}%, 0.3)`}
                stroke="hsla(0, 40%, 40%, 0.3)" strokeWidth={0.8} />
              <text x="40" y="45" textAnchor="middle" fill="hsla(0, 40%, 50%, 0.4)"
                style={{ fontSize: 11 }}>hot</text>

              {/* Cold side */}
              <rect x="130" y="20" width="60" height="40" rx="4"
                fill="hsla(210, 25%, 20%, 0.3)"
                stroke="hsla(210, 30%, 40%, 0.3)" strokeWidth={0.8} />
              <text x="160" y="45" textAnchor="middle" fill="hsla(210, 30%, 50%, 0.4)"
                style={{ fontSize: 11 }}>cold</text>

              {/* Piston / connecting rod */}
              <motion.line
                x1="70" y1="40" x2="130" y2="40"
                stroke={verse.palette.primary}
                strokeWidth={1.5}
                opacity={0.3 + hold.tension * 0.4}
              />

              {/* Flywheel in center */}
              <motion.circle
                cx="100" cy="40" r="12"
                fill="none"
                stroke={verse.palette.accent}
                strokeWidth={1}
                opacity={0.3 + hold.tension * 0.4}
                animate={{ rotate: hold.tension > 0 ? 360 : 0 }}
                transition={{ duration: 2 - hold.tension * 1.5, repeat: hold.tension > 0 ? Infinity : 0, ease: 'linear' }}
                style={{ transformOrigin: '100px 40px' }}
              />
              <motion.line
                x1="100" y1="40" x2="100" y2="28"
                stroke={verse.palette.accent}
                strokeWidth={0.8}
                opacity={0.3 + hold.tension * 0.4}
                animate={{ rotate: hold.tension > 0 ? 360 : 0 }}
                transition={{ duration: 2 - hold.tension * 1.5, repeat: hold.tension > 0 ? Infinity : 0, ease: 'linear' }}
                style={{ transformOrigin: '100px 40px' }}
              />
            </svg>

            {/* Tension readout */}
            <motion.div
              animate={{ opacity: hold.tension > 0 ? 0.6 : 0.3 }}
              style={{
                ...navicueType.data,
                color: verse.palette.textFaint,
                textAlign: 'center',
              }}
            >
              {hold.completed
                ? 'Running.'
                : hold.tension > 0
                  ? `${Math.round(hold.tension * 100)}% differential`
                  : 'Hold to feel the heat differential'}
            </motion.div>

            {/* Hold zone */}
            {!hold.completed && (() => {
              const btn = immersiveHoldButton(verse.palette, 120);
              return (
                <motion.div
                  {...hold.holdProps}
                  animate={hold.isHolding ? btn.holding : {}}
                  transition={{ duration: 0.2 }}
                  style={{ ...hold.holdProps.style, ...btn.base }}
                >
                  <svg viewBox="0 0 120 120" style={btn.progressRing.svg}>
                    <circle {...btn.progressRing.track} />
                    <circle {...btn.progressRing.fill(hold.tension)} />
                  </svg>
                  <span style={btn.label}>hold</span>
                </motion.div>
              );
            })()}

            {/* Post-hold message */}
            {hold.completed && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.4, y: 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                style={{
                  ...navicueType.texture,
                  color: verse.palette.textFaint,
                  textAlign: 'center',
                  fontStyle: 'italic',
                  maxWidth: 260,
                }}
              >
                Work from heat. Order from chaos.
              </motion.div>
            )}
          </div>
        );
      }}
    </NaviCueVerse>
  );
}