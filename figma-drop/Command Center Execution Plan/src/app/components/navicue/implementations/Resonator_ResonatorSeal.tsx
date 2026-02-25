/**
 * RESONATOR #10 -- 1030. The Resonator Seal (The Proof)
 * "Sound creates form. Speak your world."
 * TIER: ADVANCED (Full ceremony) | SCIENCE: Cymatics
 * SIGNATURE: sensory_cinema | FORM: Ocean | CHRONO: night
 *
 * DELIVERY STACK:
 *   NaviCueVerse (compositor-driven 5-stage arc)
 *   useHoldInteraction (sustained presence -- feel the frequency)
 */
import { useCallback, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, immersiveHoldPill } from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

// Chladni mandala geometry
const MANDALA_RINGS = 5;
const POINTS_PER_RING = [6, 12, 18, 24, 30];

export default function Resonator_ResonatorSeal({ onComplete }: Props) {
  const hold = useHoldInteraction({ maxDuration: 6000 });

  const advanceRef = useRef<(() => void) | null>(null);
  const advancedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (hold.completed && !advancedRef.current) {
      advancedRef.current = true;
      setTimeout(() => advanceRef.current?.(), 2000);
    }
  }, [hold.completed]);

  // Generate Chladni-like mandala points that form with hold tension
  const mandalaPoints = useMemo(() => {
    const points: { x: number; y: number; ring: number; opacity: number }[] = [];
    for (let ring = 0; ring < MANDALA_RINGS; ring++) {
      const count = POINTS_PER_RING[ring];
      const r = 15 + ring * 18;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        points.push({
          x: 100 + Math.cos(angle) * r,
          y: 100 + Math.sin(angle) * r,
          ring,
          opacity: Math.max(0, (hold.tension - ring * 0.15) / 0.3),
        });
      }
    }
    return points;
  }, [hold.tension]);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Ocean',
        chrono: 'night',
        kbe: 'embodying',
        hook: 'hold',
        specimenSeed: 1030,
        isSeal: true,
      }}
      arrivalText="A metal plate. Sand scattered across it. Silence."
      prompt="Sound creates form. Speak your world."
      resonantText="Cymatics. The study of visible sound and vibration. Sound waves can organize matter into complex, ordered patterns. The frequency you hold shapes the matter around you."
      afterglowCoda="Sound creates form."
      onComplete={onComplete}
      mechanism="Somatic Regulation"
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

        const amp = verse.breathAmplitude;

        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            width: '100%',
            maxWidth: 320,
          }}>
            {/* Chladni plate */}
            <svg width="200" height="200" viewBox="0 0 200 200">
              {/* Plate border */}
              <rect x="5" y="5" width="190" height="190" rx="4"
                fill="none" stroke={verse.palette.primaryGlow} strokeWidth={0.5} />
              {/* Sand particles forming pattern */}
              {mandalaPoints.map((p, i) => (
                <motion.circle key={i}
                  cx={p.x} cy={p.y}
                  r={0.8 + amp * 0.4}
                  fill={verse.palette.accent}
                  fillOpacity={Math.min(0.25, p.opacity * 0.25)}
                  animate={{ opacity: Math.min(1, p.opacity) }}
                  transition={{ duration: 0.3 }}
                />
              ))}
              {/* Center glow at completion */}
              {hold.tension > 0.9 && (
                <motion.circle cx="100" cy="100" r="8"
                  fill={verse.palette.accentGlow}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </svg>

            {/* Tension readout */}
            <div style={{ ...navicueType.hint, color: verse.palette.textFaint }}>
              {hold.completed
                ? 'cymatics'
                : hold.tension > 0.6
                  ? 'forming...'
                  : hold.tension > 0.1
                    ? 'vibrating...'
                    : 'bow the plate'}
            </div>

            {/* Hold zone */}
            {!hold.completed && (() => {
              const pill = immersiveHoldPill(verse.palette);
              return (
                <motion.div
                  {...hold.holdProps}
                  animate={hold.isHolding ? pill.holding : {}}
                  transition={{ duration: 0.2 }}
                  style={{ ...hold.holdProps.style, ...pill.base(hold.tension) }}
                >
                  <span style={pill.label}>
                    {hold.isHolding ? 'sand is moving...' : 'hold to vibrate the plate'}
                  </span>
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
                Your frequency shaped the pattern.
              </motion.div>
            )}
          </div>
        );
      }}
    </NaviCueVerse>
  );
}