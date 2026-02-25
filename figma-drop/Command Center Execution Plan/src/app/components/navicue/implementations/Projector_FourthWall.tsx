/**
 * PROJECTOR #7 -- 1007. The Fourth Wall
 * "The character who knows they are in a story is the only free one."
 * INTERACTION: Tap to crack through layers of a "screen." Each tap
 * creates a fracture revealing text behind the surface. After enough
 * taps, the wall shatters entirely, revealing the insight.
 * STEALTH KBE: B (Believing) -- Metacognitive awareness of narrative role
 *
 * PROOF SPECIMEN: Validates NaviCueVerse with tap interaction,
 * pattern_glitch signature, Theater form, social chrono, seed 1007.
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const CRACK_COUNT = 5;

const REVEALS = [
  'You are watching yourself.',
  'You are narrating yourself.',
  'You are casting yourself.',
  'You wrote this scene.',
  'The wall was always yours.',
];

export default function Projector_FourthWall({ onComplete }: Props) {
  const [cracks, setCracks] = useState<{ x: number; y: number; angle: number }[]>([]);
  const [shattered, setShattered] = useState(false);

  const handleTap = useCallback((advance: () => void) => {
    if (shattered) return;

    const newCrack = {
      x: 20 + Math.random() * 60,
      y: 15 + Math.random() * 70,
      angle: Math.random() * 360,
    };

    const nextCracks = [...cracks, newCrack];
    setCracks(nextCracks);

    if (nextCracks.length >= CRACK_COUNT) {
      setShattered(true);
      setTimeout(() => advance(), 2500);
    }
  }, [cracks, shattered]);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Theater',
        chrono: 'social',
        kbe: 'believing',
        hook: 'tap',
        specimenSeed: 1007,
        isSeal: false,
      }}
      arrivalText="A screen flickers..."
      prompt="Tap to crack through. There is something behind the surface."
      resonantText="The character who sees the script is free to rewrite it."
      afterglowCoda="You were never the audience."
      onComplete={onComplete}
      mechanism="Metacognition"
    >
      {(verse) => (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          width: '100%',
        }}>
          {/* The wall */}
          <div
            onClick={() => handleTap(verse.advance)}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 300,
              height: 240,
              borderRadius: 12,
              overflow: 'hidden',
              cursor: shattered ? 'default' : 'pointer',
              userSelect: 'none',
              touchAction: 'none',
            }}
          >
            {/* Surface layer */}
            <motion.div
              animate={{
                opacity: shattered ? 0 : 1,
              }}
              transition={{ duration: shattered ? 1.5 : 0 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: verse.palette.primaryFaint,
                border: `1px solid ${verse.palette.primaryGlow}`,
                borderRadius: 12,
                zIndex: 2,
              }}
            >
              {/* Crack lines */}
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              >
                {cracks.map((crack, i) => {
                  const len = 12 + Math.random() * 8;
                  const rad = (crack.angle * Math.PI) / 180;
                  const branches = 2 + Math.floor(Math.random() * 3);

                  return (
                    <g key={i}>
                      {/* Main crack */}
                      <motion.line
                        x1={crack.x}
                        y1={crack.y}
                        x2={crack.x + Math.cos(rad) * len}
                        y2={crack.y + Math.sin(rad) * len}
                        stroke={verse.palette.accent}
                        strokeWidth={0.5}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.6 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      />
                      {/* Branch cracks */}
                      {Array.from({ length: branches }, (_, b) => {
                        const branchAngle = crack.angle + (b - 1) * 40 + Math.random() * 20;
                        const branchRad = (branchAngle * Math.PI) / 180;
                        const branchLen = 5 + Math.random() * 6;
                        const startDist = len * (0.3 + Math.random() * 0.5);
                        const sx = crack.x + Math.cos(rad) * startDist;
                        const sy = crack.y + Math.sin(rad) * startDist;

                        return (
                          <motion.line
                            key={`${i}-${b}`}
                            x1={sx}
                            y1={sy}
                            x2={sx + Math.cos(branchRad) * branchLen}
                            y2={sy + Math.sin(branchRad) * branchLen}
                            stroke={verse.palette.primary}
                            strokeWidth={0.3}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            transition={{ duration: 0.2, delay: 0.15 }}
                          />
                        );
                      })}
                    </g>
                  );
                })}
              </svg>

              {/* Surface label */}
              {cracks.length === 0 && (
                <motion.div
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...navicueType.hint,
                    color: verse.palette.textFaint,
                  }}
                >
                  tap to fracture
                </motion.div>
              )}
            </motion.div>

            {/* Revealed text layer (behind the surface) */}
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: 20,
            }}>
              <AnimatePresence>
                {cracks.map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: shattered ? 0.8 : 0.4, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    style={{
                      ...navicueType.texture,
                      color: verse.palette.text,
                      textAlign: 'center',
                    }}
                  >
                    {REVEALS[i]}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Progress */}
          <div style={{
            display: 'flex',
            gap: 6,
            alignItems: 'center',
          }}>
            {Array.from({ length: CRACK_COUNT }, (_, i) => (
              <motion.div
                key={i}
                animate={{
                  background: i < cracks.length ? verse.palette.accent : 'transparent',
                  borderColor: i < cracks.length ? verse.palette.accent : verse.palette.primaryGlow,
                }}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  border: `1px solid ${verse.palette.primaryGlow}`,
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>

          {/* Status */}
          {!shattered && cracks.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              style={{
                ...navicueType.hint,
                color: verse.palette.textFaint,
              }}
            >
              {CRACK_COUNT - cracks.length} more to break through
            </motion.div>
          )}
        </div>
      )}
    </NaviCueVerse>
  );
}
