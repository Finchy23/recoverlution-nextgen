/**
 * CATALYST #2 -- 1062. The Precipitate (Clarity)
 * "One drop of decision precipitates the truth."
 * INTERACTION: Tap to add a decision drop -- clouds settle to crystals
 * STEALTH KBE: Decision making -- decisiveness as clarity (K)
 *
 * COMPOSITOR: science_x_soul / Glacier / work / knowing / tap / 1062
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const DECISIONS = [
  { cloud: 'Should I stay or leave?', crystal: 'I will leave when ready.' },
  { cloud: 'Am I good enough?', crystal: 'I am learning. That is enough.' },
  { cloud: 'What if it fails?', crystal: 'Then I will know what does not work.' },
];

export default function Catalyst_Precipitate({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Glacier',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1062,
        isSeal: false,
      }}
      arrivalText="A cloudy solution. Saturated with doubt."
      prompt="The solution is supersaturated with doubt. One drop of decision precipitates the truth. Make the call. Watch the clarity fall out."
      resonantText="Decision making. The clarity was always dissolved in the confusion. It needed a single point of commitment to crystallize."
      afterglowCoda="Watch the clarity fall out."
      onComplete={onComplete}
    >
      {(verse) => <PrecipitateInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PrecipitateInteraction({ verse }: { verse: any }) {
  const [current, setCurrent] = useState(0);
  const [dropped, setDropped] = useState(false);
  const [allClear, setAllClear] = useState(false);

  const decision = DECISIONS[current];

  const handleDrop = () => {
    setDropped(true);
    setTimeout(() => {
      if (current < DECISIONS.length - 1) {
        setCurrent(prev => prev + 1);
        setDropped(false);
      } else {
        setAllClear(true);
        setTimeout(() => verse.advance(), 2000);
      }
    }, 2400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      {/* Beaker */}
      <div style={{
        width: 160,
        height: 120,
        borderRadius: '4px 4px 20px 20px',
        border: `1px solid ${verse.palette.primaryGlow}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Cloudy liquid */}
        <motion.div
          style={{ position: 'absolute', inset: 0 }}
          animate={{
            background: dropped || allClear
              ? 'transparent'
              : `radial-gradient(circle at 50% 40%, ${verse.palette.primaryFaint}, transparent)`,
          }}
          transition={{ duration: 2 }}
        />

        {/* Cloud particles */}
        {!dropped && !allClear && [0, 1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: verse.palette.primaryGlow,
            }}
            animate={{
              x: [20 + i * 25, 30 + i * 20, 20 + i * 25],
              y: [20 + i * 15, 40 + i * 10, 20 + i * 15],
              opacity: [0.3, 0.15, 0.3],
            }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity }}
          />
        ))}

        {/* Crystals at bottom */}
        {(dropped || allClear) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              bottom: 4,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 3,
            }}
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.2 }}
                style={{
                  width: 6 + i * 2,
                  height: 8 + i * 2,
                  background: verse.palette.accent,
                  opacity: 0.5,
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                }}
              />
            ))}
          </motion.div>
        )}

        {/* Label */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={`${current}-${dropped}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                ...navicueType.texture,
                color: dropped ? verse.palette.accent : verse.palette.text,
                textAlign: 'center',
                padding: '0 12px',
                fontStyle: dropped ? 'normal' : 'italic',
              }}
            >
              {allClear ? 'clear' : dropped ? decision.crystal : decision.cloud}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 6 }}>
        {DECISIONS.map((_, i) => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: '50%',
            background: i < current || (i === current && dropped)
              ? verse.palette.accent
              : i === current ? verse.palette.primary : verse.palette.primaryFaint,
            transition: 'background 0.4s',
          }} />
        ))}
      </div>

      {/* Drop button */}
      {!dropped && !allClear && (
        <motion.button onClick={handleDrop}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          add decision drop
        </motion.button>
      )}
    </div>
  );
}