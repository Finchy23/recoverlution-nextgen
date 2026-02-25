/**
 * REFRACTOR #1 -- 1041. The Spectrum Split (De-Overwhelm)
 * "White light is too heavy to carry. Break the problem into its frequencies."
 * INTERACTION: Tap to place prism, then select one color from the rainbow
 * STEALTH KBE: Decomposition -- cognitive segmentation (K)
 *
 * COMPOSITOR: science_x_soul / Stellar / morning / knowing / tap / 1041
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const COLORS = [
  { name: 'red', hue: 0, label: 'Urgency' },
  { name: 'orange', hue: 30, label: 'Energy' },
  { name: 'yellow', hue: 50, label: 'Clarity' },
  { name: 'green', hue: 130, label: 'Growth' },
  { name: 'blue', hue: 210, label: 'Calm' },
  { name: 'violet', hue: 270, label: 'Depth' },
];

export default function Refractor_SpectrumSplit({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Stellar',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1041,
        isSeal: false,
      }}
      arrivalText="A blinding white beam."
      prompt="White light is too heavy to carry. It blinds you. Break the problem into its frequencies. Do not solve the light. Solve the red."
      resonantText="Decomposition. The overwhelm was never one thing. It was every frequency arriving at once. Pick one. Just one."
      afterglowCoda="Solve the red."
      onComplete={onComplete}
    >
      {(verse) => <SpectrumInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SpectrumInteraction({ verse }: { verse: any }) {
  const [prismPlaced, setPrismPlaced] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const handlePlacePrism = () => {
    setPrismPlaced(true);
  };

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    setTimeout(() => verse.advance(), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      {/* Beam visualization */}
      <svg width="240" height="140" viewBox="0 0 240 140">
        {/* White beam entering */}
        <motion.line
          x1="10" y1="70" x2={prismPlaced ? 100 : 230} y2="70"
          stroke={prismPlaced ? 'transparent' : 'rgba(255,255,255,0.6)'}
          strokeWidth={prismPlaced ? 0 : 3}
          animate={{ opacity: prismPlaced ? 0 : [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Prism triangle */}
        {prismPlaced && (
          <motion.polygon
            points="100,30 130,110 70,110"
            fill="none"
            stroke={verse.palette.primary}
            strokeWidth={0.8}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{ duration: 0.8 }}
          />
        )}

        {/* Rainbow split */}
        {prismPlaced && COLORS.map((c, i) => (
          <motion.line
            key={c.name}
            x1="125" y1="70"
            x2="230" y2={25 + i * 18}
            stroke={`hsla(${c.hue}, 60%, 55%, ${selectedColor === c.name ? 0.9 : selectedColor ? 0.1 : 0.5})`}
            strokeWidth={selectedColor === c.name ? 2 : 1}
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 1, pathLength: 1 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
          />
        ))}
      </svg>

      {/* Place prism button */}
      {!prismPlaced && (
        <motion.button onClick={handlePlacePrism}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          place prism
        </motion.button>
      )}

      {/* Color selection */}
      {prismPlaced && !selectedColor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <div style={{ ...navicueType.hint, color: verse.palette.textFaint, width: '100%', textAlign: 'center', marginBottom: 4 }}>
            pick one frequency
          </div>
          {COLORS.map(c => {
            const btn = immersiveTapButton(verse.palette, 'faint', 'small');
            return (
              <motion.button
                key={c.name}
                onClick={() => handleSelectColor(c.name)}
                style={{
                  ...btn.base,
                  color: `hsla(${c.hue}, 55%, 60%, 0.8)`,
                }}
                whileTap={btn.active}
              >
                {c.label}
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {selectedColor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          isolated
        </motion.div>
      )}
    </div>
  );
}