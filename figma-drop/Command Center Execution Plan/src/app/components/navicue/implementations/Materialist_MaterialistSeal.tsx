/**
 * MATERIALIST #10 -- 1040. The Materialist Seal
 * "The pyramid stands because every block carries the one above it. You are the base."
 * INTERACTION: Ceremonial hold. A pyramid builds from base to apex
 * as tension increases. Each layer is smaller. At full tension,
 * the apex stone glows and the structure achieves perfect geometry.
 * The science: Neuroplasticity -- repeated behavior literally builds
 * new neural architecture.
 * STEALTH KBE: E (Embodying) -- Structural Integrity
 *
 * SEAL SPECIMEN: Extended timing, ceremony grammar.
 */
import { useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveHoldButton } from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

const LAYERS = [
  { y: 170, w: 180, h: 20 },
  { y: 148, w: 150, h: 20 },
  { y: 126, w: 120, h: 20 },
  { y: 104, w: 90,  h: 20 },
  { y: 82,  w: 60,  h: 20 },
];

export default function Materialist_MaterialistSeal({ onComplete }: Props) {
  const hold = useHoldInteraction({ maxDuration: 8000 });
  const advanceRef = useRef<(() => void) | null>(null);
  const advancedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (hold.completed && !advancedRef.current) {
      advancedRef.current = true;
      setTimeout(() => advanceRef.current?.(), 2500);
    }
  }, [hold.completed]);

  const visibleLayers = Math.ceil(hold.tension * LAYERS.length);
  const complete = hold.completed;

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Ember',
        chrono: 'night',
        kbe: 'embodying',
        hook: 'hold',
        specimenSeed: 1040,
        isSeal: true,
      }}
      arrivalText="Stone on stone. The base is laid."
      prompt="Hold to build. Layer by layer. The pyramid rises."
      resonantText="The pyramid stands because every block carries the one above it."
      afterglowCoda="Materialized."
      onComplete={onComplete}
      mechanism="Structural Integrity"
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
            {/* Pyramid */}
            <div style={navicueStyles.heroScene(verse.palette, 260 / 220)}>
              <svg viewBox="0 0 260 220" style={navicueStyles.heroSvg}>
                {/* Ground line */}
                <line x1={20} y1={192} x2={240} y2={192}
                  stroke={verse.palette.primary} strokeWidth={0.5} opacity={0.08} />

                {/* Pyramid layers */}
                {LAYERS.map((layer, i) => {
                  const visible = i < visibleLayers;
                  const cx = 130;
                  return (
                    <motion.rect
                      key={i}
                      x={cx - layer.w / 2}
                      y={layer.y}
                      width={layer.w}
                      height={layer.h}
                      rx={2}
                      fill={verse.palette.primary}
                      animate={{
                        opacity: visible ? 0.08 + (i / LAYERS.length) * 0.08 : 0,
                        y: visible ? layer.y : layer.y + 20,
                      }}
                      transition={{
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                        delay: visible ? i * 0.1 : 0,
                      }}
                    />
                  );
                })}

                {/* Block lines within visible layers */}
                {LAYERS.map((layer, i) => {
                  if (i >= visibleLayers) return null;
                  const cx = 130;
                  const blocks = LAYERS.length - i;
                  return Array.from({ length: blocks - 1 }, (_, b) => (
                    <motion.line
                      key={`${i}-${b}`}
                      x1={cx - layer.w / 2 + (b + 1) * (layer.w / blocks)}
                      y1={layer.y + 2}
                      x2={cx - layer.w / 2 + (b + 1) * (layer.w / blocks)}
                      y2={layer.y + layer.h - 2}
                      stroke={verse.palette.primary}
                      strokeWidth={0.3}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.06 }}
                      transition={{ delay: i * 0.15 + b * 0.05 }}
                    />
                  ));
                })}

                {/* Apex capstone */}
                {complete && (
                  <motion.path
                    d="M 118 78 L 130 55 L 142 78 Z"
                    fill={verse.palette.accent}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.25, y: 0 }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}

                {/* Completion glow */}
                {complete && (
                  <motion.circle
                    cx={130} cy={65}
                    fill={verse.palette.primaryGlow}
                    initial={{ r: 0, opacity: 0 }}
                    animate={{ r: 30, opacity: 0.06 }}
                    transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </svg>
            </div>

            {/* Status */}
            <motion.div
              animate={{ opacity: hold.tension > 0 ? 0.6 : 0.3 }}
              style={{ ...navicueType.data, color: verse.palette.textFaint, textAlign: 'center' }}
            >
              {complete
                ? 'Complete.'
                : hold.tension > 0
                  ? `Layer ${visibleLayers} of ${LAYERS.length}`
                  : 'Hold to begin building'}
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
                  <div style={btn.label}>build</div>
                </motion.div>
              );
            })()}

            {/* Science fact */}
            {complete && (
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
                Neuroplasticity: repeated behavior literally builds new neural architecture. Every rep is a brick. The brain is the pyramid.
              </motion.div>
            )}
          </div>
        );
      }}
    </NaviCueVerse>
  );
}