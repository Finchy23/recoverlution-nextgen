/**
 * MATERIALIST #4 -- 1034. The Friction Test
 * "Without friction, nothing moves. With too much, everything burns."
 * INTERACTION: Hold to push a block across a surface. Sparks fly
 * proportional to hold duration. Find the right friction -- enough
 * to grip, not enough to ignite.
 * STEALTH KBE: B (Believing) -- Productive Struggle / Right Effort
 */
import { useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function Materialist_FrictionTest({ onComplete }: Props) {
  const hold = useHoldInteraction({ maxDuration: 5000 });
  const advanceRef = useRef<(() => void) | null>(null);
  const advancedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (hold.completed && !advancedRef.current) {
      advancedRef.current = true;
      setTimeout(() => advanceRef.current?.(), 2000);
    }
  }, [hold.completed]);

  const blockX = 30 + hold.tension * 180; // Block slides right
  const sparkIntensity = hold.tension;
  const tooMuch = hold.tension > 0.85;

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Ember',
        chrono: 'work',
        kbe: 'believing',
        hook: 'hold',
        specimenSeed: 1034,
        isSeal: false,
      }}
      arrivalText="A surface. A block. Resistance."
      prompt="Hold to push. Feel the friction. Find the balance."
      resonantText="Without friction, nothing moves. With too much, everything burns."
      afterglowCoda="Right effort."
      onComplete={onComplete}
      mechanism="Productive Struggle"
    >
      {(verse) => {
        advanceRef.current = verse.advance;
        if (hold.completed) handleComplete();

        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
            <div style={navicueStyles.heroScene(verse.palette, 260 / 140)}>
              <svg viewBox="0 0 260 140" style={navicueStyles.heroSvg}>
                {/* Surface */}
                <line x1={10} y1={100} x2={250} y2={100}
                  stroke={verse.palette.primary} strokeWidth={0.8} opacity={0.12} />
                {/* Surface texture */}
                {Array.from({ length: 24 }, (_, i) => (
                  <line key={i}
                    x1={10 + i * 10} y1={100} x2={12 + i * 10} y2={104}
                    stroke={verse.palette.primary} strokeWidth={0.3} opacity={0.06} />
                ))}

                {/* Block */}
                <motion.rect
                  y={70} width={30} height={30} rx={3}
                  fill={verse.palette.accent}
                  animate={{
                    x: blockX,
                    opacity: tooMuch ? [0.2, 0.25, 0.2] : 0.2,
                  }}
                  transition={{
                    x: { duration: 0.15 },
                    opacity: tooMuch
                      ? { duration: 0.3, repeat: Infinity }
                      : { duration: 0.3 },
                  }}
                />

                {/* Sparks */}
                {sparkIntensity > 0.1 && Array.from({ length: Math.ceil(sparkIntensity * 8) }, (_, i) => (
                  <motion.circle
                    key={i}
                    r={0.8}
                    fill={tooMuch ? 'hsla(15, 70%, 50%, 0.4)' : verse.palette.accent}
                    animate={{
                      cx: [blockX + 5, blockX - 5 - i * 3],
                      cy: [98, 90 - i * 4 - Math.random() * 10],
                      opacity: [sparkIntensity * 0.3, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.08,
                    }}
                  />
                ))}

                {/* Friction zone indicator */}
                <motion.rect
                  x={blockX} y={100} width={30} height={2}
                  fill={tooMuch ? 'hsla(15, 60%, 50%, 0.2)' : verse.palette.accent}
                  animate={{ opacity: sparkIntensity * 0.3 }}
                />
              </svg>
            </div>

            {/* Status */}
            <motion.div
              animate={{ opacity: 0.5 }}
              style={{ ...navicueType.data, color: verse.palette.textFaint, textAlign: 'center' }}
            >
              {hold.completed
                ? 'Moved.'
                : tooMuch
                  ? 'Careful. Too much heat.'
                  : hold.tension > 0
                    ? `friction: ${Math.round(sparkIntensity * 100)}%`
                    : 'Hold to push'}
            </motion.div>

            {/* Hold zone */}
            {!hold.completed && (
              <motion.div
                {...hold.holdProps}
                animate={{ scale: hold.isHolding ? 0.94 : 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  ...hold.holdProps.style,
                  width: 76, height: 76, borderRadius: '50%',
                  border: `1px solid ${tooMuch ? 'hsla(15, 50%, 40%, 0.3)' : verse.palette.primaryGlow}`,
                  background: verse.palette.primaryFaint,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <div style={{ ...navicueType.hint, color: verse.palette.textFaint }}>push</div>
              </motion.div>
            )}
          </div>
        );
      }}
    </NaviCueVerse>
  );
}