/**
 * CHRONOMANCER #4 -- 1014. The Ancestral Link
 * "10,000 ancestors are standing behind you, holding you up."
 * INTERACTION: Hold to scroll back through generations on a DNA helix.
 * The further back you hold, the more ancestral support accumulates.
 * At full depth, a "Survival" gene lights up.
 * STEALTH KBE: B (Believing) -- Ancestral Grounding / Resource Access
 */
import { useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

const DEPTHS = [
  { years: 0,     label: 'You' },
  { years: 100,   label: '4 generations' },
  { years: 500,   label: '20 generations' },
  { years: 1000,  label: '40 generations' },
  { years: 10000, label: '400 generations' },
];

export default function Chronomancer_AncestralLink({ onComplete }: Props) {
  const hold = useHoldInteraction({ maxDuration: 6000 });
  const advanceRef = useRef<(() => void) | null>(null);
  const advancedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (hold.completed && !advancedRef.current) {
      advancedRef.current = true;
      setTimeout(() => advanceRef.current?.(), 2500);
    }
  }, [hold.completed]);

  const depthIdx = Math.min(DEPTHS.length - 1, Math.floor(hold.tension * DEPTHS.length));
  const depth = DEPTHS[depthIdx];

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Cosmos',
        chrono: 'morning',
        kbe: 'believing',
        hook: 'hold',
        specimenSeed: 1014,
        isSeal: false,
      }}
      arrivalText="The helix turns..."
      prompt="Hold to reach back. Feel who stands behind you."
      resonantText="10,000 ancestors are standing behind you. Lean back."
      afterglowCoda="You were never alone."
      onComplete={onComplete}
      mechanism="Ancestral Grounding"
    >
      {(verse) => {
        advanceRef.current = verse.advance;
        if (hold.completed) handleComplete();

        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
            {/* DNA helix */}
            <div style={navicueStyles.heroScene(verse.palette, 120 / 220)}>
              <svg viewBox="0 0 120 220" style={navicueStyles.heroSvg}>
                {Array.from({ length: 16 }, (_, i) => {
                  const y = 10 + i * 13;
                  const phase = i * 0.5 + hold.tension * 3;
                  const x1 = 60 + Math.sin(phase) * 30;
                  const x2 = 60 - Math.sin(phase) * 30;
                  const active = i / 16 <= hold.tension;
                  return (
                    <g key={i}>
                      <motion.circle
                        cx={x1} cy={y} r={2.5}
                        fill={verse.palette.accent}
                        animate={{ opacity: active ? 0.3 : 0.06 }}
                        transition={{ duration: 0.4 }}
                      />
                      <motion.circle
                        cx={x2} cy={y} r={2.5}
                        fill={verse.palette.primary}
                        animate={{ opacity: active ? 0.25 : 0.05 }}
                        transition={{ duration: 0.4 }}
                      />
                      <motion.line
                        x1={x1} y1={y} x2={x2} y2={y}
                        stroke={verse.palette.primary}
                        strokeWidth={0.4}
                        animate={{ opacity: active ? 0.15 : 0.03 }}
                        transition={{ duration: 0.4 }}
                      />
                    </g>
                  );
                })}
                {/* Survival gene glow at bottom */}
                {hold.completed && (
                  <motion.circle
                    cx={60} cy={210}
                    fill={verse.palette.accent}
                    initial={{ r: 0, opacity: 0 }}
                    animate={{ r: 8, opacity: [0, 0.2, 0.15] }}
                    transition={{ duration: 2 }}
                  />
                )}
              </svg>
            </div>

            {/* Depth label */}
            <motion.div
              animate={{ opacity: hold.tension > 0 ? 0.7 : 0.3 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ ...navicueType.data, color: verse.palette.textFaint }}>
                {depth.label}
              </div>
              {depth.years > 0 && (
                <div style={{ ...navicueType.hint, color: verse.palette.textFaint, marginTop: 4 }}>
                  ~{depth.years.toLocaleString()} years deep
                </div>
              )}
            </motion.div>

            {/* Hold zone */}
            {!hold.completed && (
              <motion.div
                {...hold.holdProps}
                animate={{ scale: hold.isHolding ? 0.94 : 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  ...hold.holdProps.style,
                  width: 120, height: 120, borderRadius: '50%',
                  border: `1px solid ${verse.palette.primaryGlow}`,
                  background: verse.palette.primaryFaint,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <div style={{ ...navicueType.hint, color: verse.palette.textFaint }}>
                  hold
                </div>
              </motion.div>
            )}

            {hold.completed && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                transition={{ duration: 1.5 }}
                style={{ ...navicueType.texture, color: verse.palette.textFaint, fontStyle: 'italic' }}
              >
                Survival. Written in every cell.
              </motion.div>
            )}
          </div>
        );
      }}
    </NaviCueVerse>
  );
}