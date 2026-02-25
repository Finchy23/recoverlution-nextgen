/**
 * CATALYST #9 -- 1069. The Enzyme (Speed)
 * "The mentor lowers the cost of the reaction."
 * INTERACTION: Tap to select a catalyst (mentor/book) to speed the reaction
 * STEALTH KBE: Accelerated learning -- humility (K)
 *
 * COMPOSITOR: science_x_soul / Glacier / night / knowing / tap / 1069
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const CATALYSTS = [
  { label: 'Mentor', desc: 'someone who has been there' },
  { label: 'Book', desc: 'centuries of compressed wisdom' },
  { label: 'Practice', desc: 'deliberate repetition with feedback' },
];

export default function Catalyst_Enzyme({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Glacier',
        chrono: 'night',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1069,
        isSeal: false,
      }}
      arrivalText="A reaction happening slowly. 100 years."
      prompt="You can learn it the hard way. Or you can use a catalyst. The mentor lowers the cost of the reaction."
      resonantText="Accelerated learning. The enzyme did not change the destination. It changed the speed. Asking for help is not weakness. It is chemistry."
      afterglowCoda="Lower the cost."
      onComplete={onComplete}
    >
      {(verse) => <EnzymeInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function EnzymeInteraction({ verse }: { verse: any }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [timeDisplay, setTimeDisplay] = useState('100 years');
  const [accelerating, setAccelerating] = useState(false);
  const [done, setDone] = useState(false);

  const handleSelect = (idx: number) => {
    setSelected(idx);
    setAccelerating(true);

    // Countdown animation
    const stages = ['50 years', '10 years', '1 year', '1 month', '1 week', '1 second'];
    let i = 0;
    const timer = setInterval(() => {
      if (i < stages.length) {
        setTimeDisplay(stages[i]);
        i++;
      } else {
        clearInterval(timer);
        setDone(true);
        setTimeout(() => verse.advance(), 2000);
      }
    }, 400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      {/* Timer display */}
      <div style={{
        width: 180,
        height: 80,
        borderRadius: 8,
        border: `1px solid ${verse.palette.primaryGlow}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={timeDisplay}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            style={{
              ...navicueType.texture,
              color: done ? verse.palette.accent : accelerating ? verse.palette.primary : verse.palette.text,
              fontSize: accelerating ? 18 : 14,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {timeDisplay}
          </motion.div>
        </AnimatePresence>
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11 }}>
          {done ? 'catalyzed' : 'time to learn'}
        </span>
      </div>

      {/* Enzyme / catalyst options */}
      {selected === null && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ ...navicueType.hint, color: verse.palette.textFaint }}>
            choose your enzyme
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            {CATALYSTS.map((c, i) => (
              <motion.div
                key={c.label}
                onClick={() => handleSelect(i)}
                whileTap={{ scale: 0.94 }}
                style={{
                  ...immersiveTapButton(verse.palette).base,
                  flexDirection: 'column',
                  gap: 4,
                  padding: '12px 16px',
                  minWidth: 'auto',
                }}
              >
                <span style={{ ...navicueType.hint, color: verse.palette.text, fontSize: 12 }}>{c.label}</span>
                <span style={{ ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.5 }}>{c.desc}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Selected indicator */}
      {selected !== null && !done && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          {CATALYSTS[selected].label} applied
        </motion.div>
      )}
    </div>
  );
}