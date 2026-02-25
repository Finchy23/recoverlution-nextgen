/**
 * CATALYST #3 -- 1063. The Titration (The Endpoint)
 * "Drop by drop until the colour changes. Precision is patience with a pipette."
 * INTERACTION: Tap to add drops one at a time -- solution shifts at exact threshold
 * STEALTH KBE: Calibrated awareness -- finding the exact point (E)
 *
 * COMPOSITOR: poetic_precision / Glacier / work / embodying / tap / 1063
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const ENDPOINT = 7; // number of drops to reach the endpoint

export default function Catalyst_Titration({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Glacier',
        chrono: 'work',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1063,
        isSeal: false,
      }}
      arrivalText="A clear solution. Waiting."
      prompt="Drop by drop until the colour changes. You cannot rush a titration. Precision is patience with a pipette."
      resonantText="Calibrated awareness. One drop too many and you overshoot. One too few and you never arrive. The endpoint is a relationship between attention and action."
      afterglowCoda="Drop by drop."
      onComplete={onComplete}
    >
      {(verse) => <TitrationInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function TitrationInteraction({ verse }: { verse: any }) {
  const [drops, setDrops] = useState(0);
  const [reached, setReached] = useState(false);
  const [overshot, setOvershot] = useState(false);
  const [ripple, setRipple] = useState(0);

  const handleDrop = useCallback(() => {
    if (reached || overshot) return;
    const next = drops + 1;
    setDrops(next);
    setRipple(prev => prev + 1);

    if (next === ENDPOINT) {
      setReached(true);
      setTimeout(() => verse.advance(), 2500);
    } else if (next > ENDPOINT) {
      setOvershot(true);
    }
  }, [drops, reached, overshot, verse]);

  // Colour progression: clear -> faintest blush -> pink at endpoint
  const progress = Math.min(drops / ENDPOINT, 1);
  const hue = 340; // rose/phenolphthalein
  const saturation = Math.round(progress * 45);
  const lightness = 92 - Math.round(progress * 25);
  const solutionColor = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.15 + progress * 0.5})`;

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Flask */}
      <div style={{
        width: 120,
        height: 100,
        borderRadius: '8px 8px 40px 40px',
        border: `1px solid ${verse.palette.primaryGlow}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Solution fill */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '70%',
            background: solutionColor,
          }}
          animate={{ background: solutionColor }}
          transition={{ duration: 0.6 }}
        />

        {/* Drop ripple */}
        <AnimatePresence>
          {ripple > 0 && (
            <motion.div
              key={ripple}
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                position: 'absolute',
                top: '30%',
                left: '50%',
                width: 10,
                height: 10,
                borderRadius: '50%',
                border: `1px solid ${verse.palette.accent}`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Endpoint flash */}
        {reached && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 1.5 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at 50% 60%, ${verse.palette.accent}40, transparent 70%)`,
            }}
          />
        )}

        {/* Label */}
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 9 }}>
            {reached ? 'endpoint' : overshot ? 'overshot' : `${drops} drop${drops !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* Drop counter -- subtle, not gamified */}
      {!reached && !overshot && (
        <div style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 9, opacity: 0.4 }}>
          the solution is listening
        </div>
      )}

      {/* Drop button */}
      {!reached && (
        <motion.button
          onClick={handleDrop}
          whileTap={immersiveTapButton(verse.palette).active}
          style={immersiveTapButton(verse.palette).base}
        >
          add one drop
        </motion.button>
      )}

      {/* Overshoot recovery */}
      {overshot && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        >
          <span style={{ ...navicueType.hint, color: verse.palette.textFaint }}>
            too much. begin again.
          </span>
          <motion.button
            onClick={() => { setDrops(0); setOvershot(false); setRipple(0); }}
            whileTap={immersiveTapButton(verse.palette).active}
            style={immersiveTapButton(verse.palette).base}
          >
            reset
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}