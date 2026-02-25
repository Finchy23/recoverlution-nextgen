/**
 * MATERIALIST #6 -- 1036. The Concrete Pour
 * "Concrete needs time. Walk on it too soon and you sink."
 * INTERACTION: Hold to pour concrete into a form. A timer counts.
 * The user must wait for it to cure before stepping on it.
 * Patience is the interaction -- premature release means restart.
 * STEALTH KBE: E (Embodying) -- Patience / Delayed Gratification
 */
import { useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function Materialist_ConcretePour({ onComplete }: Props) {
  const hold = useHoldInteraction({ maxDuration: 7000 });
  const advanceRef = useRef<(() => void) | null>(null);
  const advancedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (hold.completed && !advancedRef.current) {
      advancedRef.current = true;
      setTimeout(() => advanceRef.current?.(), 2500);
    }
  }, [hold.completed]);

  const fillLevel = hold.tension;
  const curing = fillLevel > 0.6;
  const cured = hold.completed;

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Ember',
        chrono: 'night',
        kbe: 'embodying',
        hook: 'hold',
        specimenSeed: 1036,
        isSeal: false,
      }}
      arrivalText="A mold sits empty..."
      prompt="Hold to pour. Then wait. Patience is the hardest material."
      resonantText="Concrete needs time. Walk on it too soon and you sink."
      afterglowCoda="Set."
      onComplete={onComplete}
      mechanism="Delayed Gratification"
    >
      {(verse) => {
        advanceRef.current = verse.advance;
        if (hold.completed) handleComplete();

        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
            {/* Concrete form */}
            <div style={navicueStyles.heroScene(verse.palette, 240 / 160)}>
              <svg viewBox="0 0 240 160" style={navicueStyles.heroSvg}>
                {/* Mold outline */}
                <rect x={40} y={40} width={160} height={100} rx={3}
                  fill="none" stroke={verse.palette.primary} strokeWidth={0.8} opacity={0.15} />

                {/* Concrete fill */}
                <motion.rect
                  x={42} width={156} rx={2}
                  fill={verse.palette.accent}
                  animate={{
                    y: 138 - fillLevel * 96,
                    height: fillLevel * 96,
                    opacity: cured ? 0.25 : 0.1 + fillLevel * 0.08,
                  }}
                  transition={{ duration: 0.2 }}
                />

                {/* Surface texture (when curing) */}
                {curing && !cured && Array.from({ length: 8 }, (_, i) => (
                  <motion.line
                    key={i}
                    x1={50 + i * 18} y1={138 - fillLevel * 96}
                    x2={55 + i * 18} y2={138 - fillLevel * 96}
                    stroke={verse.palette.primary}
                    strokeWidth={0.3}
                    animate={{ opacity: [0, 0.08, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}

                {/* Cure indicator */}
                {cured && (
                  <motion.text
                    x={120} y={95}
                    textAnchor="middle" fontSize={10} fontFamily="inherit"
                    fill={verse.palette.text}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ duration: 1.5 }}
                  >
                    solid
                  </motion.text>
                )}

                {/* Pour stream */}
                {hold.isHolding && !cured && (
                  <motion.line
                    x1={120} y1={10} x2={120} y2={40}
                    stroke={verse.palette.accent}
                    strokeWidth={2}
                    animate={{ opacity: [0.1, 0.15, 0.1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </svg>
            </div>

            {/* Status */}
            <motion.div
              animate={{ opacity: 0.5 }}
              style={{ ...navicueType.data, color: verse.palette.textFaint, textAlign: 'center' }}
            >
              {cured
                ? 'Cured. Solid. Ready.'
                : curing
                  ? `Curing... ${Math.round(fillLevel * 100)}%`
                  : fillLevel > 0
                    ? `Pouring... ${Math.round(fillLevel * 100)}%`
                    : 'Hold to begin'}
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
                  border: `1px solid ${verse.palette.primaryGlow}`,
                  background: verse.palette.primaryFaint,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', position: 'relative',
                }}
              >
                <svg viewBox="0 0 76 76" style={{ position: 'absolute', inset: 0 }}>
                  <circle cx={38} cy={38} r={33} fill="none"
                    stroke={verse.palette.primary} strokeWidth={1.5}
                    strokeDasharray={`${hold.tension * 207} 207`}
                    strokeLinecap="round" opacity={0.4}
                    transform="rotate(-90 38 38)" />
                </svg>
                <div style={{ ...navicueType.hint, color: verse.palette.textFaint }}>
                  pour
                </div>
              </motion.div>
            )}
          </div>
        );
      }}
    </NaviCueVerse>
  );
}