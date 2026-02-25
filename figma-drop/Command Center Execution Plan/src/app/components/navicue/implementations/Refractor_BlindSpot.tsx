/**
 * REFRACTOR #5 -- 1045. The Blind Spot
 * "You cannot fix what you cannot see."
 * INTERACTION: Observe -- sit with the warning, awareness reveals the hidden
 * STEALTH KBE: Shadow work -- awareness creates safety (K)
 *
 * COMPOSITOR: witness_ritual / Stellar / morning / knowing / observe / 1045
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType } from '@/app/design-system/navicue-blueprint';
import { useNaviCueLabContext } from '../NaviCueLabContext';

interface Props { data?: any; onComplete?: () => void; }

export default function Refractor_BlindSpot({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Stellar',
        chrono: 'morning',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1045,
        isSeal: false,
      }}
      arrivalText="Something in the periphery."
      prompt="You cannot fix what you cannot see. The danger is always in the shadow. Check the shoulder. What are you ignoring?"
      resonantText="Shadow work. The blind spot is not empty. It is full of the things you chose not to look at. Turning your head is the entire act."
      afterglowCoda="Check the shoulder."
      onComplete={onComplete}
    >
      {(verse) => <BlindSpotInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function BlindSpotInteraction({ verse }: { verse: any }) {
  const { isLabMode } = useNaviCueLabContext();
  const [awareness, setAwareness] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Awareness builds passively (observe pattern)
  useEffect(() => {
    if (revealed) return;
    const cycles = isLabMode ? 1 : 3;
    const ms = (isLabMode ? 1200 : 4000) / 100;
    const iv = setInterval(() => {
      setAwareness(prev => {
        if (prev >= 100) {
          clearInterval(iv);
          return 100;
        }
        return prev + (100 / (cycles * (1000 / ms)));
      });
    }, ms);
    return () => clearInterval(iv);
  }, [revealed, isLabMode]);

  useEffect(() => {
    if (awareness >= 100 && !revealed) {
      setRevealed(true);
      setTimeout(() => verse.advance(), 2500);
    }
  }, [awareness, revealed, verse]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Driving view with blind spot */}
      <div style={{
        width: 200,
        height: 130,
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
        border: `1px solid ${verse.palette.primaryFaint}`,
      }}>
        {/* Road ahead */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${verse.palette.primaryFaint} 0%, transparent 40%, ${verse.palette.primaryFaint} 100%)`,
        }} />

        {/* Center line */}
        <div style={{
          position: 'absolute',
          width: 2,
          height: '100%',
          left: '50%',
          background: `repeating-linear-gradient(to bottom, ${verse.palette.textFaint} 0px, ${verse.palette.textFaint} 8px, transparent 8px, transparent 20px)`,
          opacity: 0.2,
        }} />

        {/* Blind spot warning */}
        <motion.div
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 24,
            height: 24,
            borderRadius: 4,
            border: `1.5px solid hsla(0, 60%, 50%, ${0.3 + awareness * 0.005})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          animate={{
            opacity: revealed ? 0 : [0.3, 0.7, 0.3],
            borderColor: `hsla(0, 60%, 50%, ${0.3 + awareness * 0.005})`,
          }}
          transition={{ duration: 1.5, repeat: revealed ? 0 : Infinity }}
        >
          <span style={{ fontSize: 11, color: 'hsla(0, 60%, 55%, 0.7)' }}>!</span>
        </motion.div>

        {/* Hidden element (revealed) */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 0.5, x: 0 }}
              style={{
                position: 'absolute',
                right: 8,
                top: '45%',
                width: 30,
                height: 18,
                borderRadius: 4,
                border: `1px solid ${verse.palette.accent}`,
                background: verse.palette.primaryFaint,
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Awareness arc */}
      <svg width="80" height="44" viewBox="0 0 80 44">
        <path
          d="M 8 40 A 36 36 0 0 1 72 40"
          fill="none"
          stroke={verse.palette.primaryFaint}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <motion.path
          d="M 8 40 A 36 36 0 0 1 72 40"
          fill="none"
          stroke={verse.palette.primary}
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: awareness / 100 }}
          transition={{ duration: 0.3 }}
        />
      </svg>

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint }}>
        {revealed ? 'seen' : 'noticing...'}
      </div>
    </div>
  );
}
