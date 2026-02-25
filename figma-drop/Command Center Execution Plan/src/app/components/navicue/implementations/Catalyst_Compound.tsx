/**
 * CATALYST #4 -- 1064. The Compound (Synthesis)
 * "Sodium explodes in water. Chlorine is poison. Together, they are salt."
 * INTERACTION: Tap to combine dangerous elements into something stable
 * STEALTH KBE: Dialectical synthesis -- synthesis changes nature (K)
 *
 * COMPOSITOR: koan_paradox / Glacier / social / knowing / tap / 1064
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const COMPOUNDS = [
  { a: 'Fear', aNote: 'toxic', b: 'Love', bNote: 'soft', result: 'Courage', resultNote: 'stable' },
  { a: 'Doubt', aNote: 'corrosive', b: 'Effort', bNote: 'volatile', result: 'Confidence', resultNote: 'forged' },
  { a: 'Pain', aNote: 'sharp', b: 'Meaning', bNote: 'fragile', result: 'Wisdom', resultNote: 'durable' },
];

export default function Catalyst_Compound({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Glacier',
        chrono: 'social',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1064,
        isSeal: false,
      }}
      arrivalText="Two dangerous elements. Apart, they destroy."
      prompt="Sodium explodes in water. Chlorine is poison. Together, they are salt. Combine your fear and your love. Make something new."
      resonantText="Dialectical synthesis. The parts were dangerous alone. Combined, they became essential. The compound is not a compromise. It is a new substance entirely."
      afterglowCoda="Make something new."
      onComplete={onComplete}
    >
      {(verse) => <CompoundInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CompoundInteraction({ verse }: { verse: any }) {
  const [step, setStep] = useState(0);
  const [reacting, setReacting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const compound = COMPOUNDS[step];

  const handleCombine = () => {
    setReacting(true);
    // Flash explosion
    setTimeout(() => {
      setShowResult(true);
      setTimeout(() => {
        if (step < COMPOUNDS.length - 1) {
          setStep(prev => prev + 1);
          setReacting(false);
          setShowResult(false);
        } else {
          setAllDone(true);
          setTimeout(() => verse.advance(), 2000);
        }
      }, 2200);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      {/* Reaction chamber */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        position: 'relative',
      }}>
        {/* Element A */}
        <motion.div
          style={{
            width: 70,
            height: 70,
            borderRadius: 8,
            border: `1px solid hsla(0, 40%, 50%, 0.3)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
          animate={{
            x: reacting ? 25 : 0,
            opacity: showResult ? 0 : 1,
          }}
          transition={{ duration: 0.6 }}
        >
          <span style={{ ...navicueType.texture, color: 'hsla(0, 40%, 60%, 0.7)' }}>
            {compound.a}
          </span>
          <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11 }}>
            {compound.aNote}
          </span>
        </motion.div>

        {/* Plus / explosion */}
        <motion.div
          key="boom"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 2, 0.5], opacity: [1, 1, 0] }}
          transition={{ duration: 1 }}
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${verse.palette.accent}, transparent)`,
          }}
        />

        {/* Element B */}
        <motion.div
          style={{
            width: 70,
            height: 70,
            borderRadius: 8,
            border: `1px solid hsla(210, 30%, 50%, 0.3)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
          animate={{
            x: reacting ? -25 : 0,
            opacity: showResult ? 0 : 1,
          }}
          transition={{ duration: 0.6 }}
        >
          <span style={{ ...navicueType.texture, color: 'hsla(210, 30%, 60%, 0.7)' }}>
            {compound.b}
          </span>
          <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11 }}>
            {compound.bNote}
          </span>
        </motion.div>

        {/* Result overlay */}
        {showResult && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ ...navicueType.texture, color: verse.palette.accent, fontSize: 16 }}>
              {compound.result}
            </span>
            <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11 }}>
              {compound.resultNote}
            </span>
          </motion.div>
        )}
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 6 }}>
        {COMPOUNDS.map((_, i) => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: '50%',
            background: i < step || (i === step && showResult)
              ? verse.palette.accent
              : i === step ? verse.palette.primary : verse.palette.primaryFaint,
            transition: 'background 0.4s',
          }} />
        ))}
      </div>

      {/* Combine button */}
      {!reacting && !allDone && (
        <motion.button onClick={handleCombine}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          combine
        </motion.button>
      )}
    </div>
  );
}