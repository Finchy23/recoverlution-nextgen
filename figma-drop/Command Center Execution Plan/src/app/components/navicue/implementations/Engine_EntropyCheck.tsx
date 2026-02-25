/**
 * ENGINE #1 -- 1051. The Entropy Check
 * "Disorder is the default state. Order requires energy."
 * INTERACTION: Drag to clean the room as entropy accumulates
 * STEALTH KBE: Maintenance -- reality acceptance (B)
 *
 * COMPOSITOR: sacred_ordinary / Circuit / morning / believing / drag / 1051
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Engine_EntropyCheck({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Circuit',
        chrono: 'morning',
        kbe: 'b',
        hook: 'drag',
        specimenSeed: 1051,
        isSeal: false,
      }}
      arrivalText="A clean room. Ordered."
      prompt="Disorder is the default state of the universe. Order requires energy. If you stop inputting energy, the system dies. Do the maintenance."
      resonantText="Maintenance. Entropy is not punishment. It is physics. The house gathers dust whether you deserve it or not. Clean anyway."
      afterglowCoda="Do the maintenance."
      onComplete={onComplete}
    >
      {(verse) => <EntropyInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function EntropyInteraction({ verse }: { verse: any }) {
  const [entropy, setEntropy] = useState(0);
  const [cleaned, setCleaned] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // Entropy accumulates automatically
  useEffect(() => {
    if (accepted) return;
    const iv = setInterval(() => {
      setEntropy(prev => Math.min(prev + 0.8, 100));
    }, 120);
    return () => clearInterval(iv);
  }, [accepted]);

  const handleClean = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (accepted) return;
    setEntropy(prev => {
      const next = Math.max(prev - 3, 0);
      if (prev > 30 && next <= 30 && !cleaned) {
        setCleaned(true);
        setAccepted(true);
        setTimeout(() => verse.advance(), 2500);
      }
      return next;
    });
  }, [accepted, cleaned, verse]);

  // Dust particles based on entropy
  const dustCount = Math.floor(entropy / 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Room visualization */}
      <div
        style={{
          width: 200,
          height: 130,
          borderRadius: 8,
          border: `1px solid ${verse.palette.primaryFaint}`,
          position: 'relative',
          overflow: 'hidden',
          cursor: accepted ? 'default' : 'pointer',
          touchAction: 'none',
        }}
        onPointerMove={handleClean}
      >
        {/* Room base */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, 
            hsla(220, 8%, ${22 - entropy * 0.08}%, 0.6) 0%, 
            hsla(220, 6%, ${16 - entropy * 0.06}%, 0.8) 100%)`,
        }} />

        {/* Dust particles */}
        {Array.from({ length: dustCount }, (_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              borderRadius: '50%',
              background: `rgba(160,150,140,${0.1 + (entropy / 200)})`,
              left: `${10 + (i * 37) % 80}%`,
              top: `${15 + (i * 53) % 70}%`,
            }}
            animate={{
              y: [0, 3 + i % 4, 0],
              opacity: [0.1, 0.2 + entropy / 300, 0.1],
            }}
            transition={{ duration: 2 + (i % 3), repeat: Infinity }}
          />
        ))}

        {/* Order level indicator */}
        <div style={{
          position: 'absolute',
          bottom: 6,
          left: 8,
          right: 8,
          height: 3,
          borderRadius: 1.5,
          background: verse.palette.primaryFaint,
          overflow: 'hidden',
        }}>
          <motion.div
            style={{
              height: '100%',
              borderRadius: 1.5,
              background: entropy > 60 ? 'hsla(0, 40%, 45%, 0.6)' : verse.palette.primary,
            }}
            animate={{ width: `${100 - entropy}%` }}
          />
        </div>

        {/* Status */}
        <div style={{
          position: 'absolute',
          top: 6,
          right: 8,
          ...navicueType.micro,
          color: verse.palette.textFaint,
          fontSize: 11,
        }}>
          {entropy > 70 ? 'chaos' : entropy > 40 ? 'drifting' : 'ordered'}
        </div>
      </div>

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint }}>
        {accepted ? '' : 'sweep to restore order'}
      </div>

      {accepted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          maintained
        </motion.div>
      )}
    </div>
  );
}