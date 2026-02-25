/**
 * CHRONOMANCER #10 -- 1020. The Chronos Seal
 * "Time is the servant. You are the master."
 * INTERACTION: Ceremonial hold. An hourglass rotates from vertical
 * to horizontal as tension builds. Sand stops flowing and suspends
 * in mid-air. At full tension, time crystallizes into a single point.
 * The science: Subjective time perception is elastic.
 * STEALTH KBE: E (Embodying) -- Temporal Mastery
 *
 * SEAL SPECIMEN: Extended timing, ritual pacing, ceremony grammar.
 */
import { useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, safeOpacity, immersiveHoldButton } from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function Chronomancer_ChronosSeal({ onComplete }: Props) {
  const hold = useHoldInteraction({ maxDuration: 8000 });
  const advanceRef = useRef<(() => void) | null>(null);
  const advancedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (hold.completed && !advancedRef.current) {
      advancedRef.current = true;
      setTimeout(() => advanceRef.current?.(), 2500);
    }
  }, [hold.completed]);

  const rotation = hold.tension * 90; // 0 = vertical, 90 = horizontal
  const sandFlow = 1 - hold.tension; // Sand stops as tension rises
  const suspended = hold.completed;

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'embodying',
        hook: 'hold',
        specimenSeed: 1020,
        isSeal: true,
      }}
      arrivalText="The hourglass stands. Sand falls."
      prompt="Hold to turn the glass. Stop time itself."
      resonantText="Time is the servant. You are the master."
      afterglowCoda="Chronos."
      onComplete={onComplete}
      mechanism="Temporal Mastery"
      timing={{
        presentAt: 5000,
        activeAt: 7500,
        resonantDuration: 6000,
        afterglowDuration: 5000,
      }}
    >
      {(verse) => {
        advanceRef.current = verse.advance;
        if (hold.completed) handleComplete();

        return (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 32, width: '100%',
          }}>
            {/* Hourglass */}
            <div style={navicueStyles.heroScene(verse.palette, 200 / 280)}>
              <motion.div
                animate={{ rotate: rotation }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg viewBox="0 0 120 200" width={120} height={200}>
                  {/* Glass outline -- upper bulb */}
                  <motion.path
                    d="M 25 20 Q 25 20, 25 20 L 25 80 Q 60 100, 95 80 L 95 20 Z"
                    fill="none"
                    stroke={verse.palette.primary}
                    strokeWidth={0.8}
                    animate={{ opacity: suspended ? 0.25 : 0.15 }}
                  />
                  {/* Glass outline -- lower bulb */}
                  <motion.path
                    d="M 25 180 Q 25 180, 25 180 L 25 120 Q 60 100, 95 120 L 95 180 Z"
                    fill="none"
                    stroke={verse.palette.primary}
                    strokeWidth={0.8}
                    animate={{ opacity: suspended ? 0.25 : 0.15 }}
                  />
                  {/* Neck */}
                  <motion.line
                    x1={55} y1={95} x2={65} y2={95}
                    stroke={verse.palette.primary}
                    strokeWidth={0.5}
                    opacity={0.1}
                  />

                  {/* Sand in upper bulb -- decreases as time passes */}
                  <motion.path
                    d={`M 30 ${55 + sandFlow * 20} Q 60 ${60 + sandFlow * 22}, 90 ${55 + sandFlow * 20} L 90 80 Q 60 95, 30 80 Z`}
                    fill={verse.palette.accent}
                    animate={{ opacity: suspended ? 0.15 : 0.08 + sandFlow * 0.08 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Sand in lower bulb -- increases */}
                  <motion.path
                    d={`M 30 ${175 - (1 - sandFlow) * 15} Q 60 ${178 - (1 - sandFlow) * 18}, 90 ${175 - (1 - sandFlow) * 15} L 90 180 Q 60 182, 30 180 Z`}
                    fill={verse.palette.accent}
                    animate={{ opacity: safeOpacity(0.06 + (1 - sandFlow) * 0.1) }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Falling sand stream */}
                  {!suspended && sandFlow > 0.1 && (
                    <motion.line
                      x1={60} y1={95} x2={60} y2={140}
                      stroke={verse.palette.accent}
                      strokeWidth={0.5}
                      animate={{
                        opacity: [sandFlow * 0.15, sandFlow * 0.08, sandFlow * 0.15],
                        y2: [135, 145, 135],
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}

                  {/* Suspended sand particles */}
                  {suspended && Array.from({ length: 12 }, (_, i) => {
                    const angle = (i / 12) * Math.PI * 2;
                    const r = 15 + (i % 3) * 8;
                    return (
                      <motion.circle
                        key={i}
                        cx={60 + Math.cos(angle) * r}
                        cy={100 + Math.sin(angle) * r * 0.6}
                        r={1}
                        fill={verse.palette.accent}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: [0, 0.2, 0.15],
                          cy: [100 + Math.sin(angle) * r * 0.6, 98 + Math.sin(angle) * r * 0.6, 100 + Math.sin(angle) * r * 0.6],
                        }}
                        transition={{
                          duration: 4 + i * 0.3,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: 'easeInOut',
                        }}
                      />
                    );
                  })}

                  {/* Crystallization point at center */}
                  {suspended && (
                    <motion.circle
                      cx={60} cy={100}
                      fill={verse.palette.primaryGlow}
                      initial={{ r: 0, opacity: 0 }}
                      animate={{ r: 6, opacity: 0.1 }}
                      transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}

                  {/* Frame ends */}
                  <rect x={20} y={16} width={80} height={3} rx={1.5}
                    fill={verse.palette.primary} opacity={0.1} />
                  <rect x={20} y={181} width={80} height={3} rx={1.5}
                    fill={verse.palette.primary} opacity={0.1} />
                </svg>
              </motion.div>
            </div>

            {/* Status */}
            <motion.div
              animate={{ opacity: hold.tension > 0 ? 0.6 : 0.3 }}
              style={{ ...navicueType.data, color: verse.palette.textFaint, textAlign: 'center' }}
            >
              {suspended
                ? 'Suspended.'
                : hold.tension > 0
                  ? `${Math.round(rotation)}' rotation`
                  : 'Hold to rotate the glass'}
            </motion.div>

            {/* Hold zone */}
            {!hold.completed && (() => {
              const btn = immersiveHoldButton(verse.palette, 90);
              return (
                <motion.div
                  {...hold.holdProps}
                  animate={hold.isHolding ? btn.holding : {}}
                  transition={{ duration: 0.2 }}
                  style={{ ...hold.holdProps.style, ...btn.base }}
                >
                  <svg viewBox="0 0 90 90" style={btn.progressRing.svg}>
                    <circle {...btn.progressRing.track} />
                    <circle {...btn.progressRing.fill(hold.tension)} />
                  </svg>
                  <div style={btn.label}>hold</div>
                </motion.div>
              );
            })()}

            {/* Science fact */}
            {suspended && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.35, y: 0 }}
                transition={{ duration: 2, delay: 1 }}
                style={{
                  ...navicueType.texture,
                  color: verse.palette.textFaint,
                  textAlign: 'center',
                  maxWidth: 280,
                  fontStyle: 'italic',
                }}
              >
                Subjective time perception is elastic. High dopamine slows it down. Routine speeds it up. You control the dial.
              </motion.div>
            )}
          </div>
        );
      }}
    </NaviCueVerse>
  );
}