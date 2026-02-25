/**
 * CHRONOMANCER #8 -- 1018. The Wormhole
 * "Distance is mental friction. Flow folds space."
 * INTERACTION: Hold to fold a winding road so Start meets Finish.
 * As tension increases, the road bends and compresses. At full
 * tension the wormhole opens and the user jumps through.
 * STEALTH KBE: E (Embodying) -- Flow Entry / Deep Work
 */
import { useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function Chronomancer_Wormhole({ onComplete }: Props) {
  const hold = useHoldInteraction({ maxDuration: 5000 });
  const advanceRef = useRef<(() => void) | null>(null);
  const advancedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (hold.completed && !advancedRef.current) {
      advancedRef.current = true;
      setTimeout(() => advanceRef.current?.(), 2000);
    }
  }, [hold.completed]);

  // Road geometry -- bends as tension increases
  const fold = hold.tension;
  const roadMidY = 120 - fold * 70; // Mid-point rises as road folds

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'work',
        kbe: 'embodying',
        hook: 'hold',
        specimenSeed: 1018,
        isSeal: false,
      }}
      arrivalText="A long road stretches ahead..."
      prompt="Hold to fold space. Let the distance collapse."
      resonantText="Distance is mental friction. Flow folds space."
      afterglowCoda="Jump."
      onComplete={onComplete}
      mechanism="Flow Entry"
    >
      {(verse) => {
        advanceRef.current = verse.advance;
        if (hold.completed) handleComplete();

        const startY = 180;
        const endY = 30;
        const wormholeOpen = hold.completed;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
            {/* Road / Wormhole visualization */}
            <div style={navicueStyles.heroScene(verse.palette, 240 / 200)}>
              <svg viewBox="0 0 240 200" style={navicueStyles.heroSvg}>
                {/* Road path -- S-curve that compresses */}
                <motion.path
                  d={`M 120 ${startY} Q 60 ${roadMidY + 30}, 120 ${roadMidY} Q 180 ${roadMidY - 30}, 120 ${endY}`}
                  fill="none"
                  stroke={verse.palette.primary}
                  strokeWidth={1}
                  animate={{ opacity: wormholeOpen ? 0.05 : 0.15 }}
                  transition={{ duration: 1 }}
                />

                {/* Distance markers along path */}
                {!wormholeOpen && Array.from({ length: 5 }, (_, i) => {
                  const t = (i + 1) / 6;
                  const y = startY + (endY - startY) * t;
                  return (
                    <motion.circle
                      key={i}
                      cx={120 + Math.sin(t * Math.PI * 2) * (20 - fold * 15)}
                      cy={y}
                      r={1.2}
                      fill={verse.palette.primary}
                      animate={{ opacity: 0.1 - fold * 0.06 }}
                    />
                  );
                })}

                {/* Start marker */}
                <motion.circle
                  cx={120} cy={startY}
                  r={4} fill={verse.palette.accent}
                  animate={{
                    opacity: [0.2, 0.3, 0.2],
                    cy: wormholeOpen ? 105 : startY,
                  }}
                  transition={{
                    opacity: { duration: 3, repeat: Infinity },
                    cy: { duration: 1.5, ease: [0.22, 1, 0.36, 1] },
                  }}
                />
                <motion.text
                  x={120} y={startY + 14}
                  textAnchor="middle" fontSize={8} fontFamily="inherit"
                  fill={verse.palette.textFaint}
                  animate={{ opacity: wormholeOpen ? 0 : 0.3 }}
                >
                  start
                </motion.text>

                {/* End marker */}
                <motion.circle
                  cx={120} cy={endY}
                  r={4} fill={verse.palette.accent}
                  animate={{
                    opacity: [0.15, 0.25, 0.15],
                    cy: wormholeOpen ? 95 : endY,
                  }}
                  transition={{
                    opacity: { duration: 3, repeat: Infinity, delay: 1.5 },
                    cy: { duration: 1.5, ease: [0.22, 1, 0.36, 1] },
                  }}
                />
                <motion.text
                  x={120} y={endY - 10}
                  textAnchor="middle" fontSize={8} fontFamily="inherit"
                  fill={verse.palette.textFaint}
                  animate={{ opacity: wormholeOpen ? 0 : 0.3 }}
                >
                  finish
                </motion.text>

                {/* Wormhole */}
                {wormholeOpen && (
                  <motion.circle
                    cx={120} cy={100}
                    fill={verse.palette.primaryGlow}
                    initial={{ r: 0, opacity: 0 }}
                    animate={{ r: 25, opacity: 0.12 }}
                    transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </svg>
            </div>

            {/* Hold zone */}
            {!hold.completed && (
              <motion.div
                {...hold.holdProps}
                animate={{ scale: hold.isHolding ? 0.93 : 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  ...hold.holdProps.style,
                  width: 120, height: 120, borderRadius: '50%',
                  border: `1px solid ${verse.palette.primaryGlow}`,
                  background: verse.palette.primaryFaint,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', position: 'relative',
                }}
              >
                <svg viewBox="0 0 80 80" style={{ position: 'absolute', inset: 0 }}>
                  <circle cx={40} cy={40} r={35} fill="none"
                    stroke={verse.palette.primary} strokeWidth={1.5}
                    strokeDasharray={`${hold.tension * 220} 220`}
                    strokeLinecap="round" opacity={0.4}
                    transform="rotate(-90 40 40)" />
                </svg>
                <div style={{ ...navicueType.hint, color: verse.palette.textFaint }}>
                  fold
                </div>
              </motion.div>
            )}

            {/* Status */}
            <motion.div
              animate={{ opacity: 0.5 }}
              style={{ ...navicueType.data, color: verse.palette.textFaint }}
            >
              {wormholeOpen
                ? 'Space folded.'
                : hold.tension > 0
                  ? `${Math.round((1 - fold) * 100)}% distance remaining`
                  : 'Hold to compress space'}
            </motion.div>
          </div>
        );
      }}
    </NaviCueVerse>
  );
}