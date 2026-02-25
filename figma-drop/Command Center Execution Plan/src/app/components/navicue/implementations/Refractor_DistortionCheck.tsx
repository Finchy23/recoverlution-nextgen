/**
 * REFRACTOR #3 -- 1043. The Distortion Check
 * "Your brain has a fisheye lens. Flatten the glass."
 * INTERACTION: Tap to correct a distorted thought to its factual version
 * STEALTH KBE: Reality testing -- objective truth (K)
 *
 * COMPOSITOR: koan_paradox / Stellar / social / knowing / tap / 1043
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const DISTORTIONS = [
  { warped: 'Everyone hates me', flat: 'One person criticized me' },
  { warped: 'I always fail', flat: 'I failed at this one thing' },
  { warped: 'Nothing ever works', flat: 'This attempt did not work yet' },
];

export default function Refractor_DistortionCheck({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Stellar',
        chrono: 'social',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1043,
        isSeal: false,
      }}
      arrivalText="A funhouse mirror."
      prompt="Your brain has a fisheye lens. It bends mistake into catastrophe. Flatten the glass. See the data, not the curve."
      resonantText="Reality testing. The distortion was never in the event. It was in the optics. Correction is not denial. It is precision."
      afterglowCoda="Flatten the glass."
      onComplete={onComplete}
    >
      {(verse) => <DistortionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function DistortionInteraction({ verse }: { verse: any }) {
  const [current, setCurrent] = useState(0);
  const [flattened, setFlattened] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const distortion = DISTORTIONS[current];

  const handleFlatten = () => {
    setFlattened(true);
    setTimeout(() => {
      if (current < DISTORTIONS.length - 1) {
        setCurrent(prev => prev + 1);
        setFlattened(false);
      } else {
        setAllDone(true);
        setTimeout(() => verse.advance(), 2000);
      }
    }, 2200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      {/* Mirror frame */}
      <div style={{
        width: 200,
        minHeight: 80,
        border: `1px solid ${verse.palette.primaryGlow}`,
        borderRadius: 8,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Distortion warp effect */}
        {!flattened && !allDone && (
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse at 50% 50%, transparent 40%, ${verse.palette.primaryFaint} 100%)`,
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <AnimatePresence mode="wait">
          {!allDone && (
            <motion.div
              key={`${current}-${flattened}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                ...navicueType.texture,
                color: flattened ? verse.palette.accent : verse.palette.text,
                fontStyle: flattened ? 'normal' : 'italic',
                position: 'relative',
              }}
            >
              {flattened ? distortion.flat : distortion.warped}
            </motion.div>
          )}
          {allDone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ ...navicueType.hint, color: verse.palette.accent }}
            >
              clear glass
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6 }}>
        {DISTORTIONS.map((_, i) => (
          <div key={i} style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: i < current || (i === current && flattened)
              ? verse.palette.accent
              : i === current
                ? verse.palette.primary
                : verse.palette.primaryFaint,
            transition: 'background 0.4s',
          }} />
        ))}
      </div>

      {/* Flatten button */}
      {!flattened && !allDone && (
        <motion.button onClick={handleFlatten}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          flat mirror
        </motion.button>
      )}
    </div>
  );
}