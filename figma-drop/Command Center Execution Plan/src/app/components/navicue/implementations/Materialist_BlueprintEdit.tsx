/**
 * MATERIALIST #2 -- 1032. The Blueprint Edit
 * "The blueprint is not the building. Edit the plan before you pour the concrete."
 * INTERACTION: A wireframe blueprint is shown. Type the name of a wall
 * to remove, then a pillar to add. The structure transforms.
 * STEALTH KBE: K (Knowing) -- Cognitive Restructuring / Plan Revision
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

const WALLS = ['fear', 'doubt', 'habit', 'comfort'];

export default function Materialist_BlueprintEdit({ onComplete }: Props) {
  const [removed, setRemoved] = useState<string | null>(null);
  const [committed, setCommitted] = useState(false);

  const type = useTypeInteraction({ minLength: 3 });

  const matchedWall = WALLS.find(w => type.value.toLowerCase().includes(w));

  const handleSubmit = useCallback((advance: () => void) => {
    if (!matchedWall && type.value.length < 3) return;
    const wallToRemove = matchedWall || type.value.toLowerCase();
    type.submit();
    setRemoved(wallToRemove);
    setCommitted(true);
    setTimeout(() => advance(), 2500);
  }, [matchedWall, type]);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Ember',
        chrono: 'work',
        kbe: 'knowing',
        hook: 'type',
        specimenSeed: 1032,
        isSeal: false,
      }}
      arrivalText="A blueprint unfolds..."
      prompt="Type the wall that needs to come down."
      resonantText="The blueprint is not the building. Edit the plan."
      afterglowCoda="Revised."
      onComplete={onComplete}
      mechanism="Plan Revision"
    >
      {(verse) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
          {/* Blueprint */}
          <div style={navicueStyles.heroScene(verse.palette, 240 / 180)}>
            <svg viewBox="0 0 240 180" style={navicueStyles.heroSvg}>
              {/* Grid */}
              {Array.from({ length: 6 }, (_, i) => (
                <g key={i}>
                  <line x1={20 + i * 40} y1={10} x2={20 + i * 40} y2={170}
                    stroke={verse.palette.primary} strokeWidth={0.2} opacity={0.06} />
                  <line x1={10} y1={10 + i * 32} x2={230} y2={10 + i * 32}
                    stroke={verse.palette.primary} strokeWidth={0.2} opacity={0.06} />
                </g>
              ))}

              {/* Walls */}
              {WALLS.map((w, i) => {
                const isRemoved = removed === w;
                const x1 = 40 + i * 45;
                return (
                  <motion.g key={w}>
                    <motion.line
                      x1={x1} y1={40} x2={x1} y2={140}
                      stroke={verse.palette.primary}
                      strokeWidth={isRemoved ? 0.3 : 0.8}
                      animate={{ opacity: isRemoved ? 0.02 : 0.15 }}
                      transition={{ duration: 1.5 }}
                    />
                    <motion.text
                      x={x1} y={155}
                      textAnchor="middle" fontSize={7} fontFamily="inherit"
                      fill={verse.palette.textFaint}
                      animate={{ opacity: isRemoved ? 0.05 : 0.2 }}
                      transition={{ duration: 1 }}
                    >
                      {w}
                    </motion.text>
                  </motion.g>
                );
              })}

              {/* New pillar (appears after removal) */}
              {committed && (
                <motion.rect
                  x={115} y={35} width={10} height={110} rx={2}
                  fill={verse.palette.accent}
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 0.2, scaleY: 1 }}
                  transition={{ duration: 1.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: '120px 145px' }}
                />
              )}

              {/* Floor line */}
              <line x1={20} y1={145} x2={220} y2={145}
                stroke={verse.palette.primary} strokeWidth={0.5} opacity={0.1} />
            </svg>
          </div>

          {/* Input */}
          {!committed ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%', maxWidth: 280 }}>
              <input
                type="text"
                value={type.value}
                onChange={(e) => type.onChange(e.target.value)}
                placeholder="Name the wall..."
                autoComplete="off"
                style={{
                  width: '100%', background: 'transparent',
                  border: `1px solid ${verse.palette.primaryGlow}`,
                  borderRadius: 8, padding: '12px 16px',
                  color: verse.palette.text, fontSize: 15,
                  fontFamily: 'inherit', outline: 'none', textAlign: 'center',
                }}
              />
              {matchedWall && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                  style={{ ...navicueType.hint, color: verse.palette.textFaint }}
                >
                  wall identified: {matchedWall}
                </motion.div>
              )}
              {type.value.length >= 3 && (
                <motion.button
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  onClick={() => handleSubmit(verse.advance)}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    ...immersiveTapButton,
                    ...navicueType.hint,
                    color: verse.palette.text,
                    cursor: 'pointer',
                  }}
                >
                  Remove this wall
                </motion.button>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
              transition={{ delay: 1.2, duration: 1.5 }}
              style={{ ...navicueType.texture, color: verse.palette.textFaint, textAlign: 'center', fontStyle: 'italic' }}
            >
              Wall removed. Pillar placed. Stronger.
            </motion.div>
          )}
        </div>
      )}
    </NaviCueVerse>
  );
}