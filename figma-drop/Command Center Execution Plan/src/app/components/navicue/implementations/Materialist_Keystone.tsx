/**
 * MATERIALIST #7 -- 1037. The Keystone
 * "The arch stands because every stone leans on its neighbor. Remove the keystone and everything falls."
 * INTERACTION: An arch with a missing center stone. Tap to place the
 * keystone. The arch stabilizes. Without it, the sides tremble.
 * STEALTH KBE: K (Knowing) -- Identifying the Critical Element
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Materialist_Keystone({ onComplete }: Props) {
  const [placed, setPlaced] = useState(false);

  const handlePlace = useCallback((advance: () => void) => {
    setPlaced(true);
    setTimeout(() => advance(), 2500);
  }, []);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Ember',
        chrono: 'morning',
        kbe: 'knowing',
        hook: 'tap',
        specimenSeed: 1037,
        isSeal: false,
      }}
      arrivalText="An arch. Almost complete."
      prompt="The keystone is missing. Everything trembles. Tap to place it."
      resonantText="The arch stands because every stone leans on its neighbor."
      afterglowCoda="The keystone."
      onComplete={onComplete}
      mechanism="Critical Path"
    >
      {(verse) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
          <div style={navicueStyles.heroScene(verse.palette, 260 / 200)}>
            <svg viewBox="0 0 260 200" style={navicueStyles.heroSvg}>
              {/* Arch stones -- left side */}
              {Array.from({ length: 5 }, (_, i) => {
                const angle = (-90 + i * 18) * Math.PI / 180;
                const x = 130 + Math.cos(angle) * 80;
                const y = 140 + Math.sin(angle) * 80;
                return (
                  <motion.rect
                    key={`l${i}`}
                    x={x - 8} y={y - 5} width={16} height={10} rx={2}
                    fill={verse.palette.primary}
                    transform={`rotate(${-90 + i * 18} ${x} ${y})`}
                    animate={{
                      opacity: 0.12,
                      x: placed ? x - 8 : [x - 8, x - 8 + Math.random() * 2 - 1, x - 8],
                    }}
                    transition={placed ? {} : { duration: 0.5, repeat: Infinity }}
                  />
                );
              })}

              {/* Arch stones -- right side */}
              {Array.from({ length: 5 }, (_, i) => {
                const angle = (i * 18) * Math.PI / 180;
                const x = 130 + Math.cos(angle) * 80;
                const y = 140 + Math.sin(angle) * 80;
                return (
                  <motion.rect
                    key={`r${i}`}
                    x={x - 8} y={y - 5} width={16} height={10} rx={2}
                    fill={verse.palette.primary}
                    transform={`rotate(${i * 18} ${x} ${y})`}
                    animate={{
                      opacity: 0.12,
                      x: placed ? x - 8 : [x - 8, x - 8 + Math.random() * 2 - 1, x - 8],
                    }}
                    transition={placed ? {} : { duration: 0.5, repeat: Infinity, delay: 0.1 }}
                  />
                );
              })}

              {/* Keystone slot / placed stone */}
              <motion.path
                d="M 122 58 L 130 52 L 138 58 L 136 70 L 124 70 Z"
                fill={placed ? verse.palette.accent : 'transparent'}
                stroke={placed ? verse.palette.accent : verse.palette.primaryGlow}
                strokeWidth={placed ? 0 : 0.8}
                strokeDasharray={placed ? '0' : '3 3'}
                animate={{
                  opacity: placed ? 0.3 : [0.1, 0.2, 0.1],
                  y: placed ? 0 : undefined,
                }}
                transition={placed
                  ? { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
                  : { duration: 2, repeat: Infinity }}
              />

              {/* Pillars */}
              <rect x={40} y={140} width={20} height={50} rx={2}
                fill={verse.palette.primary} opacity={0.1} />
              <rect x={200} y={140} width={20} height={50} rx={2}
                fill={verse.palette.primary} opacity={0.1} />

              {/* Ground */}
              <line x1={20} y1={190} x2={240} y2={190}
                stroke={verse.palette.primary} strokeWidth={0.5} opacity={0.08} />

              {/* Stability glow */}
              {placed && (
                <motion.circle
                  cx={130} cy={62}
                  fill={verse.palette.primaryGlow}
                  initial={{ r: 0, opacity: 0 }}
                  animate={{ r: 15, opacity: 0.06 }}
                  transition={{ duration: 2 }}
                />
              )}
            </svg>
          </div>

          {!placed ? (
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              onClick={() => handlePlace(verse.advance)}
              whileTap={immersiveTapButton(verse.palette).active}
              style={immersiveTapButton(verse.palette).base}
            >
              place the keystone
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
              transition={{ delay: 0.8, duration: 1.5 }}
              style={{ ...navicueType.texture, color: verse.palette.textFaint, fontStyle: 'italic' }}
            >
              One stone holds the whole arch.
            </motion.div>
          )}
        </div>
      )}
    </NaviCueVerse>
  );
}