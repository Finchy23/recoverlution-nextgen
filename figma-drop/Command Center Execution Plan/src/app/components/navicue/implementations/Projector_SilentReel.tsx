/**
 * PROJECTOR #6 -- 1006. The Silent Reel
 * "The body remembers films the mind has forgotten."
 * INTERACTION: Draw a slow arc across a dark field. As the line
 * extends, faint memory-surface patterns emerge beneath it --
 * the body's archive surfacing through gesture, not thought.
 * STEALTH KBE: E (Embodying) -- Somatic memory via drawing ritual
 *
 * Uses NaviCueVerse with draw interaction,
 * witness_ritual signature, Theater form, night chrono, seed 1006.
 */
import { useCallback, useMemo, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { useDrawInteraction } from '../interactions/useDrawInteraction';

interface Props { data?: any; onComplete?: () => void; }

const MEMORY_FRAGMENTS = [
  'A doorway you walked through more than once.',
  'The weight of something held too long.',
  'A sound you cannot place but still hear.',
  'The warmth of a room you will not return to.',
];

export default function Projector_SilentReel({ onComplete }: Props) {
  const draw = useDrawInteraction({
    coverageThreshold: 0.25,
    minStrokes: 1,
    gridRes: 8,
  });

  const advancedRef = useRef(false);
  const advanceRef = useRef<(() => void) | null>(null);

  // Advance once on completion via effect (never in render)
  useEffect(() => {
    if (draw.completed && !advancedRef.current) {
      advancedRef.current = true;
      setTimeout(() => advanceRef.current?.(), 2000);
    }
  }, [draw.completed]);

  const fragmentIndex = Math.min(
    MEMORY_FRAGMENTS.length - 1,
    Math.floor(draw.coverage * MEMORY_FRAGMENTS.length * 1.5),
  );

  // Combine all stroke points for SVG path rendering
  const allPoints = useMemo(() => {
    const pts = draw.strokes.flatMap(s => s.points);
    if (draw.currentStroke.length > 0) pts.push(...draw.currentStroke);
    return pts;
  }, [draw.strokes, draw.currentStroke]);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Theater',
        chrono: 'night',
        kbe: 'embodying',
        hook: 'draw',
        specimenSeed: 1006,
        isSeal: false,
      }}
      arrivalText="Darkness, and a reel turning..."
      prompt="Draw slowly across the dark. Let the body remember."
      resonantText="The reel was always running. You just stopped to watch."
      afterglowCoda="Silence."
      onComplete={onComplete}
      mechanism="Body Memory"
    >
      {(verse) => {
        advanceRef.current = verse.advance;

        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            width: '100%',
          }}>
            {/* Drawing canvas */}
            <div
              ref={(el) => {
                if (draw.drawProps.ref) {
                  (draw.drawProps.ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
                }
              }}
              {...draw.drawProps}
              style={{
                ...draw.drawProps.style,
                width: '100%',
                maxWidth: 320,
                height: 200,
                borderRadius: 12,
                border: `1px solid ${verse.palette.primaryGlow}`,
                background: verse.palette.primaryFaint,
                position: 'relative',
                overflow: 'hidden',
                cursor: draw.completed ? 'default' : 'crosshair',
                touchAction: 'none',
              }}
            >
              {/* User drawn strokes */}
              <svg
                viewBox="0 0 1 1"
                preserveAspectRatio="none"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              >
                {/* Completed strokes */}
                {draw.strokes.map((stroke, si) => (
                  <motion.polyline
                    key={si}
                    points={stroke.points.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={verse.palette.primary}
                    strokeWidth={0.004}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ duration: 0.5 }}
                  />
                ))}
                {/* Current stroke */}
                {draw.currentStroke.length > 1 && (
                  <polyline
                    points={draw.currentStroke.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={verse.palette.accent}
                    strokeWidth={0.005}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.5}
                  />
                )}
              </svg>

              {/* Memory surface emerging under strokes */}
              {draw.coverage > 0.05 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: Math.min(0.3, draw.coverage * 0.8) }}
                  transition={{ duration: 1 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(ellipse at 50% 60%, ${verse.palette.primaryGlow}, transparent 70%)`,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* "Draw here" hint */}
              {allPoints.length === 0 && !draw.completed && (
                <motion.div
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...navicueType.hint,
                    color: verse.palette.textFaint,
                    pointerEvents: 'none',
                  }}
                >
                  draw slowly
                </motion.div>
              )}
            </div>

            {/* Memory fragment */}
            {draw.coverage > 0.05 && (
              <motion.div
                key={fragmentIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 0.6, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  ...navicueType.texture,
                  color: verse.palette.textFaint,
                  textAlign: 'center',
                  maxWidth: 280,
                  fontStyle: 'italic',
                }}
              >
                {MEMORY_FRAGMENTS[fragmentIndex]}
              </motion.div>
            )}

            {/* Coverage indicator */}
            <div style={{
              width: 60,
              height: 2,
              borderRadius: 1,
              background: verse.palette.primaryFaint,
              overflow: 'hidden',
            }}>
              <motion.div
                animate={{ width: `${Math.min(100, draw.coverage * 400)}%` }}
                transition={{ duration: 0.3 }}
                style={{
                  height: '100%',
                  background: verse.palette.primary,
                  opacity: 0.4,
                  borderRadius: 1,
                }}
              />
            </div>
          </div>
        );
      }}
    </NaviCueVerse>
  );
}