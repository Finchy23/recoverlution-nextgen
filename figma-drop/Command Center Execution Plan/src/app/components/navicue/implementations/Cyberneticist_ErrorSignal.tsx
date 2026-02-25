/**
 * CYBERNETICIST #1 -- 1091. The Error Signal
 * "The error is not a failure. It is data."
 * INTERACTION: Drag the off-center dot directly back toward the crosshairs
 * STEALTH KBE: Data Neutrality -- objective analysis (K)
 *
 * COMPOSITOR: witness_ritual / Circuit / morning / knowing / drag / 1091
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Cyberneticist_ErrorSignal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Circuit',
        chrono: 'morning',
        kbe: 'k',
        hook: 'drag',
        specimenSeed: 1091,
        isSeal: false,
      }}
      arrivalText="Off-center. Red."
      prompt="The error is not a failure. It is data. The plane flies by correcting the error 100 times a minute. Thank the error."
      resonantText="Data Neutrality. The signal was never punishment. It was navigation. Red means information, not judgment. You corrected by accepting the data."
      afterglowCoda="Thank the error."
      onComplete={onComplete}
    >
      {(verse) => <ErrorSignalInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ErrorSignalInteraction({ verse }: { verse: any }) {
  const [offset, setOffset] = useState({ x: 60, y: -40 });
  const [corrections, setCorrections] = useState(0);
  const [centered, setCentered] = useState(false);
  const THRESHOLD = 10;

  const handleDrag = useCallback((_: any, info: any) => {
    if (centered) return;
    setOffset(prev => {
      const next = {
        x: prev.x + info.delta.x,
        y: prev.y + info.delta.y,
      };
      const dist = Math.sqrt(next.x * next.x + next.y * next.y);
      setCorrections(c => c + 1);
      if (dist < THRESHOLD) {
        setCentered(true);
        setTimeout(() => verse.advance(), 1800);
        return { x: 0, y: 0 };
      }
      return next;
    });
  }, [centered, verse]);

  const dist = Math.sqrt(offset.x * offset.x + offset.y * offset.y);
  const maxDist = 80;
  const redAmount = Math.min(1, dist / maxDist);
  const dotColor = centered
    ? 'hsla(140, 50%, 55%, 0.9)'
    : `hsla(${Math.round(140 - 140 * redAmount)}, 50%, ${Math.round(55 - 10 * redAmount)}%, 0.9)`;

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Target ring -- the whole field is context */}
      <div style={{
        position: 'relative',
        width: 200,
        height: 200,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Subtle outer ring */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `1px solid ${verse.palette.primary}`,
          opacity: 0.08,
        }} />

        {/* Crosshairs */}
        <div style={{ position: 'absolute', width: '100%', height: 1, background: verse.palette.primary, opacity: 0.08 }} />
        <div style={{ position: 'absolute', width: 1, height: '100%', background: verse.palette.primary, opacity: 0.08 }} />

        {/* Center target ring */}
        <div style={{
          position: 'absolute',
          width: 20, height: 20, borderRadius: '50%',
          border: `1px solid ${verse.palette.primary}`,
          opacity: centered ? 0.3 : 0.12,
          transition: 'opacity 0.5s',
        }} />

        {/* The dot -- drag target */}
        <motion.div
          drag={!centered}
          dragMomentum={false}
          dragElastic={0}
          onDrag={handleDrag}
          animate={{ x: offset.x, y: offset.y }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          whileDrag={{ scale: 1.2 }}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: dotColor,
            boxShadow: `0 0 ${centered ? 20 : 12}px ${dotColor}`,
            cursor: centered ? 'default' : 'grab',
            touchAction: 'none',
            zIndex: 2,
          }}
        />

        {/* Error distance indicator */}
        {!centered && (
          <svg width={200} height={200} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <motion.line
              x1={100} y1={100}
              x2={100 + offset.x} y2={100 + offset.y}
              stroke={dotColor}
              strokeWidth={0.5}
              strokeDasharray="4 4"
              animate={{ opacity: 0.2 }}
            />
          </svg>
        )}
      </div>

      {/* Status */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <AnimatePresence mode="wait">
          {centered ? (
            <motion.span
              key="done"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 0.7, y: 0 }}
              style={{ ...navicueType.hint, color: 'hsla(140, 50%, 55%, 0.8)' }}
            >
              centered
            </motion.span>
          ) : (
            <motion.span
              key="hint"
              style={{ ...navicueInteraction.tapHint, color: verse.palette.textFaint }}
            >
              drag the dot to center
            </motion.span>
          )}
        </AnimatePresence>

        <span style={{ ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.35, fontSize: 11 }}>
          {centered ? `${corrections} corrections` : `error: ${Math.round(dist)}px`}
        </span>
      </div>
    </div>
  );
}