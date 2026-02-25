/**
 * CHRONOMANCER #6 -- 1016. The Regret Reversal
 * "The un-lived life is a fantasy. It doesn't exist. Burn the ship."
 * INTERACTION: Drag fire across the "alternative path" to burn it.
 * Path A (taken) solidifies. Path B (fantasy) turns to ash.
 * STEALTH KBE: B (Believing) -- Amor Fati / Commitment
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

export default function Chronomancer_RegretReversal({ onComplete }: Props) {
  const [burnProgress, setBurnProgress] = useState(0);
  const [burned, setBurned] = useState(false);

  const drag = useDragInteraction({
    axis: 'x',
    sticky: false,
    onThreshold: (p) => {
      if (burned) return;
      setBurnProgress(p);
      if (p >= 0.95) {
        setBurned(true);
      }
    },
  });

  const handleAccept = useCallback((advance: () => void) => {
    setTimeout(() => advance(), 2000);
  }, []);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'believing',
        hook: 'drag',
        specimenSeed: 1016,
        isSeal: false,
      }}
      arrivalText="Two paths diverge..."
      prompt="Drag to burn the path not taken. The fantasy cannot hold you."
      resonantText="The un-lived life does not exist. Stop haunting the graveyard of what-if."
      afterglowCoda="Amor fati."
      onComplete={onComplete}
      mechanism="Commitment"
    >
      {(verse) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
          {/* Forking path */}
          <div style={navicueStyles.heroScene(verse.palette, 280 / 200)}>
            <svg viewBox="0 0 280 200" style={navicueStyles.heroSvg}>
              {/* Common stem */}
              <line x1={140} y1={180} x2={140} y2={120}
                stroke={verse.palette.primary} strokeWidth={1} opacity={0.15} />
              {/* Fork point */}
              <circle cx={140} cy={120} r={3}
                fill={verse.palette.accent} opacity={0.2} />

              {/* Path A (taken) -- left, solidifies */}
              <motion.path
                d="M 140 120 Q 90 80, 60 30"
                fill="none"
                stroke={verse.palette.accent}
                strokeWidth={1.2}
                animate={{ opacity: 0.15 + burnProgress * 0.2 }}
                transition={{ duration: 0.3 }}
              />
              <motion.text
                x={50} y={25}
                fill={verse.palette.text}
                fontSize={9} fontFamily="inherit"
                animate={{ opacity: 0.2 + burnProgress * 0.3 }}
              >
                chosen
              </motion.text>

              {/* Path B (not taken) -- right, burns away */}
              <motion.path
                d="M 140 120 Q 190 80, 220 30"
                fill="none"
                stroke={verse.palette.primary}
                strokeWidth={0.8}
                strokeDasharray={burned ? '0' : '4 4'}
                animate={{ opacity: burned ? 0 : 0.15 - burnProgress * 0.1 }}
                transition={{ duration: burned ? 1.5 : 0.3 }}
              />
              {!burned && (
                <motion.text
                  x={210} y={25}
                  fill={verse.palette.textFaint}
                  fontSize={9} fontFamily="inherit"
                  animate={{ opacity: 0.25 - burnProgress * 0.2 }}
                >
                  what if
                </motion.text>
              )}

              {/* Burn particles on path B */}
              {burnProgress > 0.1 && !burned && Array.from({ length: 6 }, (_, i) => {
                const t = i / 6;
                const x = 140 + (220 - 140) * t + Math.sin(t * 4) * 15;
                const y = 120 + (30 - 120) * t;
                return (
                  <motion.circle
                    key={i}
                    cx={x} cy={y} r={1}
                    fill={verse.palette.accent}
                    animate={{
                      opacity: burnProgress > t ? [0, 0.2, 0] : [0],
                      cy: burnProgress > t ? [y, y - 8, y] : [y],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  />
                );
              })}

              {/* Ash remnants after burn */}
              {burned && Array.from({ length: 4 }, (_, i) => (
                <motion.circle
                  key={`ash${i}`}
                  cx={160 + i * 20} cy={80 + Math.sin(i) * 20}
                  r={0.5} fill={verse.palette.primary}
                  initial={{ opacity: 0.1 }}
                  animate={{ opacity: 0, y: 10 }}
                  transition={{ duration: 3, delay: i * 0.3 }}
                />
              ))}
            </svg>
          </div>

          {/* Drag zone */}
          {!burned && (
            <div
              {...drag.dragProps}
              style={{
                ...drag.dragProps.style,
                width: '100%', maxWidth: 280, height: 44,
                borderRadius: 22,
                background: verse.palette.primaryFaint,
                border: `1px solid ${verse.palette.primaryGlow}`,
                position: 'relative', overflow: 'hidden',
              }}
            >
              <motion.div
                animate={{ width: `${burnProgress * 100}%` }}
                style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  background: `linear-gradient(90deg, transparent, hsla(15, 60%, 40%, 0.15))`,
                  borderRadius: 22,
                }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...navicueType.hint, color: verse.palette.textFaint,
              }}>
                drag to burn
              </div>
            </div>
          )}

          {burned && (
            <motion.button
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              onClick={() => handleAccept(verse.advance)}
              style={immersiveTapButton}
            >
              <div style={{
                ...navicueType.hint,
                color: verse.palette.text,
                cursor: 'pointer',
              }}>
                Live on this island
              </div>
            </motion.button>
          )}
        </div>
      )}
    </NaviCueVerse>
  );
}