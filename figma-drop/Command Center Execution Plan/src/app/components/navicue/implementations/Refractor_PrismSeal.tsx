/**
 * REFRACTOR #10 -- 1050. The Prism Seal (The Proof)
 * "You are the glass. The light passes through you."
 * TIER: ADVANCED (Full ceremony) | SCIENCE: Refraction
 * SIGNATURE: science_x_soul | FORM: Stellar | CHRONO: night
 *
 * DELIVERY STACK:
 *   NaviCueVerse (compositor-driven 5-stage arc)
 *   useHoldInteraction (sustained presence -- become the prism)
 */
import { useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, immersiveHoldButton } from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function Refractor_PrismSeal({ onComplete }: Props) {
  const hold = useHoldInteraction({ maxDuration: 5000 });

  const advanceRef = useRef<(() => void) | null>(null);
  const advancedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (hold.completed && !advancedRef.current) {
      advancedRef.current = true;
      setTimeout(() => advanceRef.current?.(), 2000);
    }
  }, [hold.completed]);

  // Rainbow colors for the split beam
  const RAINBOW = [
    'hsla(0, 60%, 55%, 0.5)',
    'hsla(30, 60%, 55%, 0.5)',
    'hsla(55, 60%, 55%, 0.5)',
    'hsla(120, 50%, 45%, 0.5)',
    'hsla(210, 55%, 55%, 0.5)',
    'hsla(270, 50%, 50%, 0.5)',
  ];

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Stellar',
        chrono: 'night',
        kbe: 'embodying',
        hook: 'hold',
        specimenSeed: 1050,
        isSeal: true,
      }}
      arrivalText="A glass prism. A single beam."
      prompt="You are the glass. The light passes through you."
      resonantText="Refraction. The change in direction of a wave passing from one medium to another. You are the medium that changes the direction of the event."
      afterglowCoda="You are the glass."
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
            {/* Prism + beam SVG */}
            <svg width="240" height="120" viewBox="0 0 240 120">
              {/* Incoming white beam */}
              <motion.line
                x1="10" y1="60" x2="95" y2="60"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={1.5}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Prism */}
              <motion.polygon
                points="100,20 140,100 60,100"
                fill="none"
                stroke={verse.palette.primary}
                strokeWidth={1}
                animate={{ opacity: [0.3, 0.5 + hold.tension * 0.3, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Split rainbow beams (appear with hold progress) */}
              {RAINBOW.map((color, i) => (
                <motion.line
                  key={i}
                  x1="130" y1="60"
                  x2="235" y2={15 + i * 18}
                  stroke={color}
                  strokeWidth={1 + hold.tension * 0.5}
                  animate={{ opacity: hold.tension * 0.6 }}
                  transition={{ duration: 0.3 }}
                />
              ))}
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
                ? 'Refracted.'
                : hold.tension > 0
                  ? `${Math.round(hold.tension * 100)}% refracting`
                  : 'Hold to become the prism'}
            </motion.div>

            {/* Hold zone */}
            {!hold.completed && (() => {
              const btn = immersiveHoldButton(verse.palette, 80);
              return (
                <motion.div
                  {...hold.holdProps}
                  animate={hold.isHolding ? btn.holding : {}}
                  transition={{ duration: 0.2 }}
                  style={{ ...hold.holdProps.style, ...btn.base }}
                >
                  <svg viewBox="0 0 80 80" style={btn.progressRing.svg}>
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
                The light has passed through you.
              </motion.div>
            )}
          </div>
        );
      }}
    </NaviCueVerse>
  );
}