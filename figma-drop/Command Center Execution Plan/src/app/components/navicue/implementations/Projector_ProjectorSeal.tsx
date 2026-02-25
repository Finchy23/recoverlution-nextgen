/**
 * PROJECTOR #10 -- 1010. The Projector Seal
 * "The projectionist sees every film. None of them are real. All of them are true."
 * INTERACTION: Extended ceremonial hold. The projector beam narrows
 * as tension builds, collapsing from a wide floodlight into a single
 * point of light. At full tension, the beam inverts -- darkness
 * becomes the screen, light becomes the film. The projectionist
 * and the projection are one.
 * STEALTH KBE: E (Embodying) -- Integration of observer and observed
 *
 * SEAL SPECIMEN: Uses NaviCueVerse with hold interaction,
 * sacred_ordinary signature, Theater form, night chrono, seed 1010.
 * Extended timing, ritual interaction shape, ceremony pacing.
 */
import { useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  immersiveHoldButton,
} from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function Projector_ProjectorSeal({ onComplete }: Props) {
  const hold = useHoldInteraction({
    maxDuration: 8000,
  });

  const advanceRef = useRef<(() => void) | null>(null);
  const advancedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (hold.completed && !advancedRef.current) {
      advancedRef.current = true;
      setTimeout(() => advanceRef.current?.(), 2000);
    }
  }, [hold.completed]);

  // Beam geometry
  const beamWidth = 1 - hold.tension; // 1 = full flood, 0 = point
  const beamTopWidth = 30 + beamWidth * 120; // px
  const beamBottomWidth = 80 + beamWidth * 180;
  const beamOpacity = 0.04 + hold.tension * 0.08;

  // Inversion at completion
  const inverted = hold.completed;

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Theater',
        chrono: 'night',
        kbe: 'embodying',
        hook: 'hold',
        specimenSeed: 1010,
        isSeal: true,
      }}
      arrivalText="The projector booth. Empty. Waiting."
      prompt="Hold to narrow the beam. Find the singular point."
      resonantText="The projectionist sees every film. None are real. All are true."
      afterglowCoda="Projection."
      onComplete={onComplete}
      mechanism="Integration"
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 32,
            width: '100%',
          }}>
            {/* Projector beam */}
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: 340,
              height: 260,
            }}>
              <svg viewBox="0 0 340 260" style={{ width: '100%', height: '100%' }}>
                {/* Beam trapezoid */}
                <motion.polygon
                  initial={{
                    points: `${170 - 40},20 ${170 + 40},20 ${170 + 60},240 ${170 - 60},240`,
                  }}
                  animate={{
                    points: inverted
                      ? `${170 - 5},20 ${170 + 5},20 ${170 + 5},240 ${170 - 5},240`
                      : `${170 - beamTopWidth / 2},20 ${170 + beamTopWidth / 2},20 ${170 + beamBottomWidth / 2},240 ${170 - beamBottomWidth / 2},240`,
                  }}
                  transition={{ duration: inverted ? 2 : 0.15 }}
                  fill={inverted ? verse.palette.accent : verse.palette.primary}
                  opacity={inverted ? 0.2 : beamOpacity}
                />

                {/* Beam edge lines */}
                <motion.line
                  initial={{
                    x1: 170 - 40,
                    y1: 20,
                    x2: 170 - 60,
                    y2: 240,
                  }}
                  animate={{
                    x1: 170 - (inverted ? 5 : beamTopWidth / 2),
                    y1: 20,
                    x2: 170 - (inverted ? 5 : beamBottomWidth / 2),
                    y2: 240,
                  }}
                  transition={{ duration: 0.15 }}
                  stroke={verse.palette.primary}
                  strokeWidth={0.5}
                  opacity={0.15 + hold.tension * 0.15}
                />
                <motion.line
                  initial={{
                    x1: 170 + 40,
                    y1: 20,
                    x2: 170 + 60,
                    y2: 240,
                  }}
                  animate={{
                    x1: 170 + (inverted ? 5 : beamTopWidth / 2),
                    y1: 20,
                    x2: 170 + (inverted ? 5 : beamBottomWidth / 2),
                    y2: 240,
                  }}
                  transition={{ duration: 0.15 }}
                  stroke={verse.palette.primary}
                  strokeWidth={0.5}
                  opacity={0.15 + hold.tension * 0.15}
                />

                {/* Projector source (top) */}
                <motion.circle
                  cx={170} cy={15}
                  fill={verse.palette.accent}
                  initial={{ r: 3, opacity: 0.2 }}
                  animate={{
                    r: inverted ? [5, 7, 5] : [3, 3 + hold.tension * 3, 3],
                    opacity: inverted
                      ? [0.4, 0.6, 0.4]
                      : [0.2, 0.3 + hold.tension * 0.2, 0.2],
                  }}
                  transition={{
                    duration: inverted ? 3 : 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Dust motes in beam */}
                {hold.tension > 0.1 && (
                  <g>
                    {Array.from({ length: 8 }, (_, i) => {
                      const t = i / 8;
                      const y = 30 + t * 200;
                      const spread = (beamTopWidth + (beamBottomWidth - beamTopWidth) * t) / 2;
                      const x = 170 + (Math.sin(i * 2.7) * spread * 0.6);

                      return (
                        <motion.circle
                          key={i}
                          cx={x}
                          cy={y}
                          r={0.8}
                          fill={verse.palette.accent}
                          initial={{ opacity: 0, cy: y }}
                          animate={{
                            opacity: inverted
                              ? [0, 0]
                              : [0, hold.tension * 0.15, 0],
                            cy: [y, y - 5, y],
                          }}
                          transition={{
                            duration: 3 + i * 0.5,
                            repeat: Infinity,
                            delay: i * 0.4,
                            ease: 'easeInOut',
                          }}
                        />
                      );
                    })}
                  </g>
                )}

                {/* Screen surface at bottom */}
                <motion.rect
                  x={20} y={242} width={300} height={3} rx={1.5}
                  fill={verse.palette.primary}
                  initial={{ opacity: 0.06 }}
                  animate={{
                    opacity: inverted ? [0.15, 0.25, 0.15] : [0.06, 0.1, 0.06],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Inversion glow */}
                {inverted && (
                  <motion.circle
                    cx={170} cy={130}
                    fill={verse.palette.primaryGlow}
                    initial={{ r: 0, opacity: 0 }}
                    animate={{ r: 50, opacity: 0.08 }}
                    transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </svg>
            </div>

            {/* Tension readout */}
            <motion.div
              animate={{ opacity: hold.tension > 0 ? 0.6 : 0.3 }}
              style={{
                ...navicueType.data,
                color: verse.palette.textFaint,
                textAlign: 'center',
              }}
            >
              {inverted
                ? 'Inverted.'
                : hold.tension > 0
                  ? `${Math.round(hold.tension * 100)}% focused`
                  : 'Hold to begin'}
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

            {/* Seal ceremony indicator */}
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
                The projector and the projection are one.
              </motion.div>
            )}
          </div>
        );
      }}
    </NaviCueVerse>
  );
}