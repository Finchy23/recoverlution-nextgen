/**
 * MATERIALIST #8 -- 1038. The Demolition
 * "Some structures must come down before the real one can rise."
 * INTERACTION: A rotting shack. Drag to swing a wrecking ball.
 * Each swing removes a section. Underneath: a clean foundation.
 * STEALTH KBE: B (Believing) -- Creative Destruction / Letting Go
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
} from '@/app/design-system/navicue-blueprint';
import { useDragInteraction } from '../interactions/useDragInteraction';

interface Props { data?: any; onComplete?: () => void; }

const SECTIONS = ['roof', 'left_wall', 'right_wall', 'floor'];

export default function Materialist_Demolition({ onComplete }: Props) {
  const [destroyed, setDestroyed] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const drag = useDragInteraction({
    axis: 'x',
    sticky: false,
    onThreshold: (p) => {
      if (done) return;
      const idx = Math.floor(p * SECTIONS.length);
      const section = SECTIONS[idx];
      if (section && !destroyed.includes(section)) {
        setDestroyed(d => [...d, section]);
      }
    },
  });

  const allDestroyed = destroyed.length >= SECTIONS.length;

  const handleAccept = useCallback((advance: () => void) => {
    setDone(true);
    setTimeout(() => advance(), 2000);
  }, []);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Ember',
        chrono: 'work',
        kbe: 'believing',
        hook: 'drag',
        specimenSeed: 1038,
        isSeal: false,
      }}
      arrivalText="A structure crumbles..."
      prompt="Drag to demolish. Clear the rotten. Reveal the foundation."
      resonantText="Some structures must come down before the real one can rise."
      afterglowCoda="Cleared."
      onComplete={onComplete}
      mechanism="Creative Destruction"
    >
      {(verse) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
          <div style={navicueStyles.heroScene(verse.palette, 240 / 180)}>
            <svg viewBox="0 0 240 180" style={navicueStyles.heroSvg}>
              {/* Shack sections */}
              {/* Roof */}
              <motion.path
                d="M 60 50 L 120 20 L 180 50 Z"
                fill="none" stroke={verse.palette.primary} strokeWidth={0.8}
                animate={{ opacity: destroyed.includes('roof') ? 0.02 : 0.15 }}
                transition={{ duration: 0.8 }}
              />
              {/* Left wall */}
              <motion.line
                x1={60} y1={50} x2={60} y2={140}
                stroke={verse.palette.primary} strokeWidth={0.8}
                animate={{ opacity: destroyed.includes('left_wall') ? 0.02 : 0.15 }}
                transition={{ duration: 0.8 }}
              />
              {/* Right wall */}
              <motion.line
                x1={180} y1={50} x2={180} y2={140}
                stroke={verse.palette.primary} strokeWidth={0.8}
                animate={{ opacity: destroyed.includes('right_wall') ? 0.02 : 0.15 }}
                transition={{ duration: 0.8 }}
              />
              {/* Floor */}
              <motion.line
                x1={60} y1={140} x2={180} y2={140}
                stroke={verse.palette.primary} strokeWidth={0.8}
                animate={{ opacity: destroyed.includes('floor') ? 0.02 : 0.15 }}
                transition={{ duration: 0.8 }}
              />

              {/* Debris particles */}
              {destroyed.map((s, di) =>
                Array.from({ length: 3 }, (_, i) => (
                  <motion.circle
                    key={`${s}-${i}`}
                    r={1}
                    fill={verse.palette.primary}
                    initial={{ cx: 120, cy: 80, opacity: 0.15 }}
                    animate={{
                      cx: 80 + Math.random() * 80,
                      cy: 150 + Math.random() * 20,
                      opacity: 0,
                    }}
                    transition={{ duration: 1.5, delay: di * 0.1 + i * 0.1 }}
                  />
                ))
              )}

              {/* Foundation revealed underneath */}
              <motion.rect
                x={50} y={145} width={140} height={8} rx={2}
                fill={verse.palette.accent}
                animate={{ opacity: allDestroyed ? 0.2 : 0.03 }}
                transition={{ duration: 1.5 }}
              />
              {allDestroyed && (
                <motion.text
                  x={120} y={165}
                  textAnchor="middle" fontSize={9} fontFamily="inherit"
                  fill={verse.palette.textFaint}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ delay: 0.5, duration: 1 }}
                >
                  foundation
                </motion.text>
              )}
            </svg>
          </div>

          {/* Drag zone */}
          {!done && !allDestroyed && (
            <div
              {...drag.dragProps}
              style={{
                ...drag.dragProps.style,
                width: '100%', maxWidth: 260, height: 44,
                borderRadius: 22,
                background: verse.palette.primaryFaint,
                border: `1px solid ${verse.palette.primaryGlow}`,
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...navicueType.hint, color: verse.palette.textFaint,
              }}>
                drag to demolish ({destroyed.length}/{SECTIONS.length})
              </div>
            </div>
          )}

          {allDestroyed && !done && (
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              onClick={() => handleAccept(verse.advance)}
              whileTap={{ scale: 0.95 }}
              style={{
                ...immersiveTapButton,
                ...navicueType.hint,
                color: verse.palette.text,
                cursor: 'pointer',
              }}
            >
              Build from the foundation
            </motion.button>
          )}

          {done && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
              style={{ ...navicueType.texture, color: verse.palette.textFaint, fontStyle: 'italic' }}
            >
              The ground is clear.
            </motion.div>
          )}
        </div>
      )}
    </NaviCueVerse>
  );
}