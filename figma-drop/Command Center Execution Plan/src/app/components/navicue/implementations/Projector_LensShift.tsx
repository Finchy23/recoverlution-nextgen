/**
 * PROJECTOR #3 -- 1003. The Lens Shift
 * "Every lens is a confession of what you want to see."
 * INTERACTION: Type what you see in a situation. The typed words
 * distort and refract in real-time, revealing the perceptual bias
 * baked into the observation. Acceptance is free-form.
 * STEALTH KBE: K (Knowing) -- Perceptual bias awareness
 *
 * Uses NaviCueVerse with type interaction,
 * poetic_precision signature, Theater form, morning chrono, seed 1003.
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
} from '@/app/design-system/navicue-blueprint';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

interface Props { data?: any; onComplete?: () => void; }

const REFRACTIONS = [
  { label: 'Fear', tint: 'hsla(0, 60%, 50%, 0.15)' },
  { label: 'Hope', tint: 'hsla(160, 50%, 50%, 0.15)' },
  { label: 'Judgment', tint: 'hsla(270, 50%, 50%, 0.15)' },
  { label: 'Desire', tint: 'hsla(30, 60%, 50%, 0.15)' },
];

export default function Projector_LensShift({ onComplete }: Props) {
  const [committed, setCommitted] = useState(false);

  const type = useTypeInteraction({
    minLength: 5,
  });

  const charCount = type.value.length;
  const distortionLevel = Math.min(1, charCount / 30);
  const activeRefraction = charCount > 0
    ? REFRACTIONS[charCount % REFRACTIONS.length]
    : null;

  const handleCommit = useCallback((advance: () => void) => {
    if (charCount < 5) return;
    type.submit();
    setCommitted(true);
    setTimeout(() => advance(), 2500);
  }, [charCount, type]);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Theater',
        chrono: 'morning',
        kbe: 'knowing',
        hook: 'type',
        specimenSeed: 1003,
        isSeal: false,
      }}
      arrivalText="A lens clicks into place..."
      prompt="Type what you see. Watch how the lens bends it."
      resonantText="You never see the thing. You see the lens."
      afterglowCoda="The shift."
      onComplete={onComplete}
      mechanism="Perceptual Shift"
    >
      {(verse) => (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          width: '100%',
        }}>
          {/* Lens ring */}
          <div style={navicueStyles.heroScene(verse.palette, 140 / 140)}>
            <svg viewBox="0 0 140 140" style={navicueStyles.heroSvg}>
              {/* Outer lens ring */}
              <circle
                cx={70} cy={70} r={60}
                fill="none"
                stroke={verse.palette.primary}
                strokeWidth={0.8}
                opacity={0.2 + distortionLevel * 0.2}
              />
              {/* Inner refraction rings */}
              {REFRACTIONS.map((r, i) => (
                <motion.circle
                  key={r.label}
                  cx={70} cy={70}
                  fill="none"
                  stroke={verse.palette.accent}
                  strokeWidth={0.4}
                  animate={{
                    r: [25 + i * 8, 28 + i * 8 + distortionLevel * 4, 25 + i * 8],
                    opacity: activeRefraction?.label === r.label
                      ? [0.15, 0.3, 0.15]
                      : [0.04, 0.06, 0.04],
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.5,
                  }}
                />
              ))}
              {/* Center point */}
              <motion.circle
                cx={70} cy={70}
                r={3}
                fill={verse.palette.primaryGlow}
                animate={{
                  opacity: [0.1, 0.2 + distortionLevel * 0.15, 0.1],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </svg>
          </div>

          {/* Active refraction label */}
          <AnimatePresence mode="wait">
            {activeRefraction && !committed && (
              <motion.div
                key={activeRefraction.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 0.5, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                style={{
                  ...navicueType.data,
                  color: verse.palette.textFaint,
                }}
              >
                refraction: {activeRefraction.label.toLowerCase()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input area */}
          {!committed ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              width: '100%',
              maxWidth: 300,
            }}>
              <motion.div
                animate={{
                  filter: `blur(${distortionLevel * 1.5}px)`,
                  transform: `skewX(${distortionLevel * 2}deg)`,
                }}
                style={{ width: '100%' }}
              >
                <input
                  type="text"
                  value={type.value}
                  onChange={(e) => type.onChange(e.target.value)}
                  placeholder="What do you see..."
                  autoComplete="off"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: `1px solid ${verse.palette.primaryGlow}`,
                    borderRadius: 8,
                    padding: '12px 16px',
                    color: verse.palette.text,
                    fontSize: 15,
                    fontFamily: 'inherit',
                    outline: 'none',
                    textAlign: 'center',
                    letterSpacing: `${0.01 + distortionLevel * 0.03}em`,
                  }}
                />
              </motion.div>

              {charCount >= 5 && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  onClick={() => handleCommit(verse.advance)}
                  whileTap={immersiveTapButton(verse.palette).active}
                  style={immersiveTapButton(verse.palette).base}
                >
                  See through the lens
                </motion.button>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              style={{
                ...navicueType.texture,
                color: verse.palette.textFaint,
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              "{type.value}" -- refracted
            </motion.div>
          )}
        </div>
      )}
    </NaviCueVerse>
  );
}