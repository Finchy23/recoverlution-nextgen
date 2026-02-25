/**
 * FIELD ARCHITECT #1 -- 1101. The Polarity Check
 * "Stop pushing. Flip your energy."
 * INTERACTION: Two magnets repel (N-N) -- tap to flip one -- they snap together
 * STEALTH KBE: Social Calibration -- adaptability (K)
 *
 * COMPOSITOR: witness_ritual / Stellar / morning / knowing / tap / 1101
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function FieldArchitect_PolarityCheck({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Stellar',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1101,
        isSeal: false,
      }}
      arrivalText="Two magnets. Pushing apart."
      prompt="You are trying to force a connection with the wrong polarity. Stop pushing. Flip your energy. Be the receiver to their transmitter."
      resonantText="Social Calibration. You did not push harder. You flipped. The same force that repelled now attracts. The magnet did not change. Your orientation did."
      afterglowCoda="Flip your energy."
      onComplete={onComplete}
    >
      {(verse) => <PolarityCheckInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PolarityCheckInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'repelling' | 'flipping' | 'attracting' | 'connected'>('repelling');
  const [gap, setGap] = useState(80);

  const flipMagnet = () => {
    if (phase !== 'repelling') return;
    setPhase('flipping');
    setTimeout(() => {
      setPhase('attracting');
      // Animate snap together
      const snap = setInterval(() => {
        setGap(prev => {
          if (prev <= 4) {
            clearInterval(snap);
            setPhase('connected');
            setTimeout(() => verse.advance(), 1800);
            return 0;
          }
          return prev - 6;
        });
      }, 40);
    }, 600);
  };

  const leftColor = phase === 'connected' ? 'hsla(220, 40%, 55%, 0.8)' : 'hsla(0, 45%, 55%, 0.7)';
  const rightColor = phase === 'repelling' || phase === 'flipping'
    ? 'hsla(0, 45%, 55%, 0.7)'
    : 'hsla(220, 40%, 55%, 0.8)';

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Magnets */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 100 }}>
        {/* Left magnet */}
        <motion.div
          animate={{ x: phase === 'repelling' ? -10 : 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          style={{
            width: 60, height: 36, borderRadius: 6,
            background: `linear-gradient(90deg, hsla(220, 40%, 55%, 0.6), ${leftColor})`,
            border: `1px solid ${verse.palette.primaryGlow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ ...navicueType.micro, color: verse.palette.textPrimary, opacity: 0.7 }}>
            N
          </span>
        </motion.div>

        {/* Gap / force lines */}
        <div style={{ width: gap, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'width 0.1s' }}>
          {phase === 'repelling' && (
            <motion.div
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ repeat: Infinity, duration: 1 }}
              style={{ ...navicueType.hint, color: 'hsla(0, 40%, 55%, 0.6)', fontSize: 14 }}
            >
              |||
            </motion.div>
          )}
          {phase === 'connected' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ width: 4, height: 4, borderRadius: '50%', background: verse.palette.accent }}
            />
          )}
        </div>

        {/* Right magnet */}
        <motion.div
          animate={{
            x: phase === 'repelling' ? 10 : 0,
            rotateY: phase === 'flipping' ? 180 : phase === 'attracting' || phase === 'connected' ? 180 : 0,
          }}
          transition={{ type: 'spring', stiffness: 100 }}
          style={{
            width: 60, height: 36, borderRadius: 6,
            background: `linear-gradient(90deg, ${rightColor}, hsla(220, 40%, 55%, 0.6))`,
            border: `1px solid ${verse.palette.primaryGlow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ ...navicueType.micro, color: verse.palette.textPrimary, opacity: 0.7 }}>
            {phase === 'repelling' || phase === 'flipping' ? 'N' : 'S'}
          </span>
        </motion.div>
      </div>

      {/* Action */}
      {phase === 'repelling' && (
        <motion.button onClick={flipMagnet}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          flip polarity
        </motion.button>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'repelling' ? 'wrong polarity' : phase === 'flipping' ? 'flipping...' : phase === 'attracting' ? 'attracting...' : 'adapted'}
      </div>
    </div>
  );
}