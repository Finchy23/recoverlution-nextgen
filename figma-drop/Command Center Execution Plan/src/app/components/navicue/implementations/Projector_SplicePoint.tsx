/**
 * PROJECTOR #8 -- 1008. The Splice Point
 * "Every story has a splice point where the original was cut."
 * INTERACTION: A film strip with frames scrolls by. Tap to mark
 * where you sense a "splice" -- a moment the narrative was edited.
 * After enough splices are found, the strip reveals what was
 * cut: the parts you chose not to tell yourself.
 * STEALTH KBE: K (Knowing) -- Narrative discontinuity detection
 *
 * Uses NaviCueVerse with tap interaction,
 * science_x_soul signature, Theater form, work chrono, seed 1008.
 */
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const FRAME_COUNT = 8;
const SPLICE_TARGET = 3;

const HIDDEN_TRUTHS = [
  'You edited out the moment you changed your mind.',
  'The version where you were kind was cut for time.',
  'The original had no villain.',
];

export default function Projector_SplicePoint({ onComplete }: Props) {
  const [splices, setSplices] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const advanceRef = useRef<(() => void) | null>(null);

  const handleSplice = useCallback((frameIndex: number) => {
    if (revealed) return;
    if (splices.includes(frameIndex)) return;

    const next = [...splices, frameIndex];
    setSplices(next);

    if (next.length >= SPLICE_TARGET) {
      setRevealed(true);
      setTimeout(() => {
        advanceRef.current?.();
      }, 3000);
    }
  }, [splices, revealed]);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Theater',
        chrono: 'work',
        kbe: 'knowing',
        hook: 'tap',
        specimenSeed: 1008,
        isSeal: false,
      }}
      arrivalText="A film strip unfurls..."
      prompt="Tap where the story was spliced. Find the edits."
      resonantText="What was cut from the reel is still running somewhere."
      afterglowCoda="The splice."
      onComplete={onComplete}
      mechanism="Narrative Analysis"
    >
      {(verse) => {
        advanceRef.current = verse.advance;

        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 28,
            width: '100%',
          }}>
            {/* Film strip */}
            <div style={{
              display: 'flex',
              gap: 3,
              width: '100%',
              maxWidth: 340,
              justifyContent: 'center',
            }}>
              {Array.from({ length: FRAME_COUNT }, (_, i) => {
                const isSpliced = splices.includes(i);
                const sprocketHoles = i % 2 === 0;

                return (
                  <motion.div
                    key={i}
                    onClick={() => handleSplice(i)}
                    whileTap={!revealed && !isSpliced ? { scale: 0.92 } : undefined}
                    animate={{
                      borderColor: isSpliced
                        ? verse.palette.accent
                        : verse.palette.primaryGlow,
                      background: isSpliced
                        ? verse.palette.primaryFaint
                        : 'transparent',
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      width: 36,
                      height: 56,
                      borderRadius: 4,
                      border: `1px solid ${verse.palette.primaryGlow}`,
                      position: 'relative',
                      cursor: revealed || isSpliced ? 'default' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Sprocket holes */}
                    {sprocketHoles && (
                      <>
                        <div style={{
                          position: 'absolute',
                          top: 3,
                          width: 6,
                          height: 3,
                          borderRadius: 1,
                          background: verse.palette.primaryGlow,
                          opacity: 0.3,
                        }} />
                        <div style={{
                          position: 'absolute',
                          bottom: 3,
                          width: 6,
                          height: 3,
                          borderRadius: 1,
                          background: verse.palette.primaryGlow,
                          opacity: 0.3,
                        }} />
                      </>
                    )}

                    {/* Splice mark */}
                    {isSpliced && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.7 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <svg width={16} height={16} viewBox="0 0 16 16">
                          <line
                            x1={3} y1={3} x2={13} y2={13}
                            stroke={verse.palette.accent}
                            strokeWidth={1.5}
                            strokeLinecap="round"
                          />
                          <line
                            x1={13} y1={3} x2={3} y2={13}
                            stroke={verse.palette.accent}
                            strokeWidth={1.5}
                            strokeLinecap="round"
                          />
                        </svg>
                      </motion.div>
                    )}

                    {/* Frame number */}
                    {!isSpliced && (
                      <motion.div
                        animate={{ opacity: revealed ? 0.1 : 0.25 }}
                        style={{
                          fontSize: 11,
                          fontFamily: 'inherit',
                          color: verse.palette.textFaint,
                        }}
                      >
                        {i + 1}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Progress dots */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {Array.from({ length: SPLICE_TARGET }, (_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    background: i < splices.length
                      ? verse.palette.accent
                      : 'transparent',
                    borderColor: i < splices.length
                      ? verse.palette.accent
                      : verse.palette.primaryGlow,
                    opacity: i < splices.length ? 0.6 : 0.2,
                  }}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    border: `1px solid ${verse.palette.primaryGlow}`,
                  }}
                />
              ))}
            </div>

            {/* Hidden truths reveal */}
            <AnimatePresence>
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    alignItems: 'center',
                    maxWidth: 280,
                  }}
                >
                  {HIDDEN_TRUTHS.map((truth, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 0.6, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.8, duration: 0.8 }}
                      style={{
                        ...navicueType.texture,
                        color: verse.palette.textFaint,
                        textAlign: 'center',
                        fontStyle: 'italic',
                      }}
                    >
                      {truth}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint */}
            {!revealed && splices.length > 0 && splices.length < SPLICE_TARGET && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                style={{
                  ...navicueType.hint,
                  color: verse.palette.textFaint,
                }}
              >
                {SPLICE_TARGET - splices.length} more splice{SPLICE_TARGET - splices.length > 1 ? 's' : ''} to find
              </motion.div>
            )}
          </div>
        );
      }}
    </NaviCueVerse>
  );
}
