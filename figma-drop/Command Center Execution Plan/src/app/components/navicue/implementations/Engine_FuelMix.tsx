/**
 * ENGINE #8 -- 1058. The Fuel Mix
 * "Fire needs oxygen. Breathe."
 * INTERACTION: Type what kind of rest (air) you need to balance the fuel mix
 * STEALTH KBE: Balance -- physiological literacy (K)
 *
 * COMPOSITOR: science_x_soul / Circuit / morning / knowing / type / 1058
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Engine_FuelMix({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Circuit',
        chrono: 'morning',
        kbe: 'k',
        hook: 'type',
        specimenSeed: 1058,
        isSeal: false,
      }}
      arrivalText="An engine sputtering. Too lean."
      prompt="Fire needs oxygen. You are flooding the engine with fuel but no air. It will not burn. Breathe."
      resonantText="Balance. The stoichiometric ratio is 14.7 parts air to 1 part fuel. Not 50:1. Not 1:1. There is a precise number. Find yours."
      afterglowCoda="Breathe."
      onComplete={onComplete}
    >
      {(verse) => <FuelMixInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FuelMixInteraction({ verse }: { verse: any }) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [balanced, setBalanced] = useState(false);

  const handleSubmit = () => {
    if (input.trim().length < 2) return;
    setSubmitted(true);
    // Animate the balance
    setTimeout(() => setBalanced(true), 1500);
    setTimeout(() => verse.advance(), 3500);
  };

  // Visual: fuel/air ratio -- starts too lean (all fuel)
  const fuelWidth = submitted ? 50 : 85;
  const airWidth = submitted ? 50 : 15;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Combustion chamber */}
      <div style={{
        width: 180,
        height: 60,
        borderRadius: 8,
        border: `1px solid ${verse.palette.primaryFaint}`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
      }}>
        {/* Fuel side */}
        <motion.div
          style={{ height: '100%', background: 'hsla(30, 40%, 25%, 0.4)' }}
          animate={{ width: `${fuelWidth}%` }}
          transition={{ duration: 1.2 }}
        />
        {/* Air side */}
        <motion.div
          style={{ height: '100%', background: 'hsla(200, 30%, 30%, 0.3)' }}
          animate={{ width: `${airWidth}%` }}
          transition={{ duration: 1.2 }}
        />

        {/* Labels */}
        <div style={{
          position: 'absolute',
          left: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          ...navicueType.micro,
          color: 'hsla(30, 40%, 50%, 0.5)',
          fontSize: 11,
        }}>fuel (work)</div>
        <div style={{
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          ...navicueType.micro,
          color: 'hsla(200, 40%, 50%, 0.5)',
          fontSize: 11,
        }}>air (rest)</div>

        {/* Spark */}
        {balanced && (
          <motion.div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: verse.palette.accent,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{ scale: [1, 2, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </div>

      {/* Status */}
      <div style={{ ...navicueType.status, color: verse.palette.textFaint }}>
        {balanced ? 'combustion' : submitted ? 'balancing...' : 'sputtering'}
      </div>

      {/* Type input */}
      {!submitted && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ ...navicueType.hint, color: verse.palette.textFaint }}>
            what air do you need?
          </div>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="sleep, silence, walk..."
            style={{
              ...navicueType.input,
              background: 'transparent',
              border: `1px solid ${verse.palette.primaryGlow}`,
              borderRadius: 6,
              padding: '8px 14px',
              color: verse.palette.text,
              outline: 'none',
              width: 180,
              textAlign: 'center',
            }}
          />
          {input.trim().length >= 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}>
              <motion.button onClick={handleSubmit}
                style={immersiveTapButton(verse.palette).base}
                whileTap={immersiveTapButton(verse.palette).active}>
                add air
              </motion.button>
            </motion.div>
          )}
        </div>
      )}

      {balanced && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          ignited
        </motion.div>
      )}
    </div>
  );
}