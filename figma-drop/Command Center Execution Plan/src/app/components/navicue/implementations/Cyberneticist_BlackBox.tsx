/**
 * CYBERNETICIST #9 -- 1099. The Black Box
 * "Change the input. Stop drinking the poison."
 * INTERACTION: Type a new input to replace the toxic one -- output changes
 * STEALTH KBE: Input/Output Logic -- behavioral modification (K)
 *
 * COMPOSITOR: pattern_glitch / Circuit / night / knowing / type / 1099
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const INPUT_MAP: Record<string, string> = {
  coffee: 'anxiety',
  doom: 'dread',
  comparing: 'shame',
  rushing: 'panic',
};

const GOOD_INPUTS = ['water', 'rest', 'walk', 'silence', 'breath', 'music', 'reading', 'sleep', 'nature', 'tea'];

export default function Cyberneticist_BlackBox({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Circuit',
        chrono: 'night',
        kbe: 'k',
        hook: 'type',
        specimenSeed: 1099,
        isSeal: false,
      }}
      arrivalText='Input: "Coffee." Output: "Anxiety."'
      prompt="You do not need to know how the box works to know the output is bad. Change the input. Stop drinking the poison."
      resonantText="Input/Output Logic. You changed the input. The box did what boxes do. The output changed. You did not need to understand the mechanism. You just needed to stop feeding it."
      afterglowCoda="New input."
      onComplete={onComplete}
    >
      {(verse) => <BlackBoxInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function BlackBoxInteraction({ verse }: { verse: any }) {
  const [currentInput, setCurrentInput] = useState('coffee');
  const [typedInput, setTypedInput] = useState('');
  const [output, setOutput] = useState('anxiety');
  const [changed, setChanged] = useState(false);

  const submitInput = () => {
    const cleaned = typedInput.trim().toLowerCase();
    if (!cleaned) return;

    if (INPUT_MAP[cleaned]) {
      setCurrentInput(cleaned);
      setOutput(INPUT_MAP[cleaned]);
      setTypedInput('');
    } else if (GOOD_INPUTS.includes(cleaned) || cleaned.length >= 3) {
      setCurrentInput(cleaned);
      setOutput('calm');
      setChanged(true);
      setTimeout(() => verse.advance(), 2200);
    }
    setTypedInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submitInput();
  };

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Input/Box/Output flow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Input */}
        <div style={{
          padding: '8px 14px', borderRadius: 6,
          border: `1px solid ${changed ? 'hsla(140, 40%, 50%, 0.4)' : verse.palette.primaryGlow}`,
          minWidth: 70, textAlign: 'center',
        }}>
          <span style={{ ...navicueType.hint, color: changed ? 'hsla(140, 40%, 55%, 0.8)' : verse.palette.textFaint, fontSize: 11 }}>
            {currentInput}
          </span>
        </div>

        {/* Arrow */}
        <span style={{ color: verse.palette.textFaint, opacity: 0.3, fontSize: 12 }}>-&gt;</span>

        {/* Black Box */}
        <motion.div
          animate={{ opacity: changed ? 0.8 : 0.5 }}
          style={{
            width: 50, height: 50, borderRadius: 6,
            background: `hsla(0, 0%, 10%, 0.3)`,
            border: `1px solid ${verse.palette.primaryGlow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.4 }}>?</span>
        </motion.div>

        {/* Arrow */}
        <span style={{ color: verse.palette.textFaint, opacity: 0.3, fontSize: 12 }}>-&gt;</span>

        {/* Output */}
        <div style={{
          padding: '8px 14px', borderRadius: 6,
          border: `1px solid ${changed ? 'hsla(140, 40%, 50%, 0.4)' : 'hsla(0, 40%, 50%, 0.3)'}`,
          minWidth: 70, textAlign: 'center',
        }}>
          <span style={{
            ...navicueType.hint,
            color: changed ? 'hsla(140, 40%, 55%, 0.8)' : 'hsla(0, 40%, 55%, 0.7)',
            fontSize: 11,
          }}>
            {output}
          </span>
        </div>
      </div>

      {/* Type new input */}
      {!changed && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            value={typedInput}
            onChange={e => setTypedInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="new input..."
            style={{
              background: 'transparent',
              border: `1px solid ${verse.palette.primaryGlow}`,
              borderRadius: 6,
              padding: '6px 12px',
              color: verse.palette.textFaint,
              fontSize: 12,
              outline: 'none',
              width: 120,
              ...navicueType.hint,
            }}
          />
          <motion.button onClick={submitInput}
            style={immersiveTapButton(verse.palette, 'primary', 'small').base}
            whileTap={immersiveTapButton(verse.palette, 'primary', 'small').active}>
            enter
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {changed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ ...navicueType.hint, color: 'hsla(140, 40%, 55%, 0.8)', fontSize: 11 }}
          >
            output changed
          </motion.div>
        )}
      </AnimatePresence>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {changed ? 'behavioral modification' : 'change the input'}
      </div>
    </div>
  );
}