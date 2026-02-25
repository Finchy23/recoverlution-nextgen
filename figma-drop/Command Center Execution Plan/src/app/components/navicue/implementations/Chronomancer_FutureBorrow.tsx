/**
 * CHRONOMANCER #2 -- 1012. The Future Borrow
 * "You are solvent in the future. Borrow confidence from the version of you who has already succeeded."
 * INTERACTION: Tap the portal to "borrow" energy from future self.
 * A battery fills as confidence transfers across time.
 * STEALTH KBE: B (Believing) -- Future Self-Continuity / Confidence Projection
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  navicueInteraction,
  immersiveTapButton,
  immersiveTap,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Chronomancer_FutureBorrow({ onComplete }: Props) {
  const [charge, setCharge] = useState(0);
  const [borrowed, setBorrowed] = useState(false);

  const handleTap = useCallback(() => {
    if (borrowed) return;
    setCharge(c => {
      const next = Math.min(1, c + 0.2);
      return next;
    });
  }, [borrowed]);

  const handleAccept = useCallback((advance: () => void) => {
    setBorrowed(true);
    setTimeout(() => advance(), 2000);
  }, []);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'morning',
        kbe: 'believing',
        hook: 'tap',
        specimenSeed: 1012,
        isSeal: false,
      }}
      arrivalText="A portal shimmers..."
      prompt="You are empty now. Tomorrow you are full. Tap to borrow from the future."
      resonantText="You are solvent in the future. Spend the confidence now."
      afterglowCoda="Borrowed light."
      onComplete={onComplete}
      mechanism="Confidence Projection"
    >
      {(verse) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%' }}>
          {/* Battery */}
          <div style={navicueStyles.heroScene(verse.palette, 80 / 140)}>
            <svg viewBox="0 0 80 140" style={navicueStyles.heroSvg}>
              {/* Battery outline */}
              <rect x={15} y={15} width={50} height={110} rx={6}
                fill="none" stroke={verse.palette.primary} strokeWidth={0.8} opacity={0.2} />
              <rect x={28} y={8} width={24} height={10} rx={3}
                fill="none" stroke={verse.palette.primary} strokeWidth={0.6} opacity={0.15} />
              {/* Fill level */}
              <motion.rect
                x={18} rx={4}
                width={44}
                animate={{
                  y: 18 + (1 - charge) * 104,
                  height: charge * 104,
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                fill={verse.palette.accent}
                opacity={0.15}
              />
              {/* Energy particles inside */}
              {charge > 0 && Array.from({ length: Math.ceil(charge * 6) }, (_, i) => (
                <motion.circle
                  key={i}
                  cx={25 + (i % 3) * 15}
                  r={1}
                  fill={verse.palette.accent}
                  animate={{
                    cy: [120 - i * 15, 115 - i * 15, 120 - i * 15],
                    opacity: [0.05, 0.15, 0.05],
                  }}
                  transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
              {/* Percentage */}
              <text
                x={40} y={80}
                textAnchor="middle"
                fill={verse.palette.textFaint}
                fontSize={11}
                fontFamily="inherit"
                opacity={0.5}
              >
                {Math.round(charge * 100)}%
              </text>
            </svg>
          </div>

          {/* Portal tap zone */}
          {!borrowed && (
            <motion.div
              onClick={handleTap}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: `0 0 ${20 + charge * 30}px ${charge * 8}px ${verse.palette.primaryFaint}`,
              }}
              style={{
                ...immersiveTap(verse.palette).zone,
                position: 'relative',
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <svg viewBox="0 0 60 60" width={60} height={60}>
                  <circle cx={30} cy={30} r={25} fill="none"
                    stroke={verse.palette.primary} strokeWidth={0.5}
                    strokeDasharray="4 8" opacity={0.2} />
                  <circle cx={30} cy={30} r={15} fill="none"
                    stroke={verse.palette.accent} strokeWidth={0.4}
                    strokeDasharray="2 6" opacity={0.15} />
                </svg>
              </motion.div>
              <div style={{
                position: 'absolute',
                ...navicueType.hint, color: verse.palette.textFaint,
              }}>
                borrow
              </div>
            </motion.div>
          )}

          {/* Accept loan */}
          {!borrowed && charge >= 1 && (
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
              transition={{ duration: 0.8 }}
              onClick={() => handleAccept(verse.advance)}
              whileTap={immersiveTapButton(verse.palette, 'accent').active}
              style={immersiveTapButton(verse.palette, 'accent').base}
            >
              accept the loan
            </motion.button>
          )}

          {borrowed && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ ...navicueType.texture, color: verse.palette.textFaint, textAlign: 'center' }}
            >
              Pay it forward, not back.
            </motion.div>
          )}
        </div>
      )}
    </NaviCueVerse>
  );
}