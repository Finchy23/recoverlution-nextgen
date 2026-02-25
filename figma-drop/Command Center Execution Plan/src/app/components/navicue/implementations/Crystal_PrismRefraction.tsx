/**
 * CRYSTAL #9 -- 1129. The Prism Refraction
 * "You cannot selectively numb emotion. Let the whole spectrum pass through."
 * INTERACTION: White light enters prism -- rainbow exits -- block red (rainbow vanishes) -- unblock
 * STEALTH KBE: Emotional Wholeness -- wholeness (B)
 *
 * COMPOSITOR: poetic_precision / Glacier / night / believing / tap / 1129
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const SPECTRUM = [
  { color: 'hsla(0, 60%, 55%, 0.6)', label: 'anger' },
  { color: 'hsla(30, 60%, 55%, 0.6)', label: 'fear' },
  { color: 'hsla(55, 60%, 55%, 0.6)', label: 'joy' },
  { color: 'hsla(120, 40%, 50%, 0.6)', label: 'peace' },
  { color: 'hsla(210, 50%, 55%, 0.6)', label: 'sadness' },
  { color: 'hsla(270, 45%, 55%, 0.6)', label: 'wonder' },
];

export default function Crystal_PrismRefraction({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Glacier',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1129,
        isSeal: false,
      }}
      arrivalText="White light. A prism."
      prompt="You cannot selectively numb emotion. If you block the red, you lose the blue. Let the whole spectrum pass through."
      resonantText="Emotional Wholeness. You unblocked the red, and the rainbow returned. Every color depends on every other. Wholeness is not the absence of dark. It is the presence of all."
      afterglowCoda="All or nothing."
      onComplete={onComplete}
    >
      {(verse) => <PrismRefractionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PrismRefractionInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'full' | 'blocked' | 'restored'>('full');
  const [showPrompt, setShowPrompt] = useState(false);

  // Show block prompt after initial display
  useState(() => {
    setTimeout(() => setShowPrompt(true), 1500);
  });

  const blockRed = useCallback(() => {
    if (phase !== 'full') return;
    setPhase('blocked');
  }, [phase]);

  const unblockRed = useCallback(() => {
    if (phase !== 'blocked') return;
    setPhase('restored');
    setTimeout(() => verse.advance(), 2200);
  }, [phase, verse]);

  const rainbowVisible = phase === 'full' || phase === 'restored';

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Prism scene */}
      <div style={navicueStyles.heroCssScene(verse.palette, 200 / 140)}>
        {/* White light beam (input) */}
        <div style={{
          position: 'absolute', left: 0, top: '45%',
          width: 50, height: 3,
          background: 'hsla(0, 0%, 90%, 0.4)',
          transform: 'translateY(-50%)',
        }} />

        {/* Prism */}
        <div style={{
          position: 'absolute', left: 50, top: '50%',
          width: 0, height: 0,
          borderLeft: '30px solid transparent',
          borderRight: '30px solid transparent',
          borderBottom: `50px solid hsla(0, 0%, 80%, ${phase === 'restored' ? 0.15 : 0.08})`,
          transform: 'translateY(-60%)',
        }} />

        {/* Rainbow beams (output) */}
        {SPECTRUM.map((band, i) => {
          const isRed = i === 0;
          const visible = rainbowVisible || (!isRed);
          const dimmed = phase === 'blocked';
          return (
            <motion.div
              key={band.label}
              animate={{
                opacity: dimmed ? 0 : visible ? (phase === 'restored' ? 0.7 : 0.5) : 0,
                scaleX: dimmed ? 0 : 1,
              }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute',
                left: 108,
                top: `${28 + i * 14}%`,
                width: 85,
                height: 3,
                background: band.color,
                borderRadius: 1,
                transformOrigin: 'left center',
              }}
            />
          );
        })}

        {/* Block indicator on red */}
        {phase === 'blocked' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            style={{
              position: 'absolute', left: 100, top: '25%',
              ...navicueType.hint, color: 'hsla(0, 50%, 55%, 0.5)', fontSize: 14,
            }}
          >
            x
          </motion.div>
        )}
      </div>

      {/* Actions */}
      {phase === 'full' && showPrompt && (
        <motion.button onClick={blockRed}
          style={immersiveTapButton(verse.palette, 'faint').base}
          whileTap={immersiveTapButton(verse.palette, 'faint').active}>
          block anger
        </motion.button>
      )}
      {phase === 'full' && !showPrompt && (
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.4 }}>
          full spectrum
        </span>
      )}
      {phase === 'blocked' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={navicueStyles.shadowAnnotation(verse.palette)}>
            rainbow disappeared
          </span>
          <motion.button onClick={unblockRed}
            style={immersiveTapButton(verse.palette).base}
            whileTap={immersiveTapButton(verse.palette).active}>
            let it through
          </motion.button>
        </div>
      )}
      {phase === 'restored' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          whole
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'restored' ? 'emotional wholeness' : phase === 'blocked' ? 'numb' : 'full spectrum'}
      </div>
    </div>
  );
}