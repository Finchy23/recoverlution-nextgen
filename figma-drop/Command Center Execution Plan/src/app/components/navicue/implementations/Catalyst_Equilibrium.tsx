/**
 * CATALYST #10 -- 1070. The Equilibrium (Dynamic Balance)
 * "The reaction runs both ways. Balance is not stillness. It is equal motion."
 * INTERACTION: Slide to find the ratio where forward = reverse rate
 * STEALTH KBE: Dynamic acceptance -- flux as stability (E)
 *
 * COMPOSITOR: koan_paradox / Glacier / social / embodying / drag / 1070
 */
import { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Catalyst_Equilibrium({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Glacier',
        chrono: 'social',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1070,
        isSeal: false,
      }}
      arrivalText="A reaction. Running in both directions."
      prompt="The reaction runs both ways. Forward and reverse. Balance is not stillness. It is equal motion in opposite directions."
      resonantText="Dynamic acceptance. You will never arrive at a point where nothing is changing. Equilibrium is the state where change cancels itself out. Not peace. Poise."
      afterglowCoda="Equal motion."
      onComplete={onComplete}
    >
      {(verse) => <EquilibriumInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function EquilibriumInteraction({ verse }: { verse: any }) {
  const [ratio, setRatio] = useState(0.5);
  const [locked, setLocked] = useState(false);
  const [balanced, setBalanced] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const BALANCE_ZONE = 0.03; // within 3% of center counts as balanced

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (locked) return;
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const clamped = Math.max(0, Math.min(1, x));
    setRatio(clamped);
  }, [locked]);

  const handleLock = useCallback(() => {
    if (Math.abs(ratio - 0.5) <= BALANCE_ZONE) {
      setLocked(true);
      setBalanced(true);
      setTimeout(() => verse.advance(), 2500);
    }
  }, [ratio, verse]);

  const forwardRate = ratio;
  const reverseRate = 1 - ratio;
  const isNearBalance = Math.abs(ratio - 0.5) <= BALANCE_ZONE;

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Rate visualisation */}
      <div style={{
        display: 'flex',
        gap: 16,
        alignItems: 'flex-end',
        height: 80,
      }}>
        {/* Forward rate bar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <motion.div
            style={{
              width: 36,
              borderRadius: 4,
              border: `1px solid ${verse.palette.primaryGlow}`,
              background: `${verse.palette.primary}20`,
            }}
            animate={{ height: Math.max(8, forwardRate * 70) }}
            transition={{ duration: 0.15 }}
          />
          <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>
            forward
          </span>
        </div>

        {/* Balance indicator */}
        <motion.div
          style={{
            width: 2,
            height: 70,
            background: isNearBalance ? verse.palette.accent : verse.palette.primaryFaint,
            borderRadius: 1,
          }}
          animate={{ opacity: isNearBalance ? 1 : 0.3 }}
        />

        {/* Reverse rate bar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <motion.div
            style={{
              width: 36,
              borderRadius: 4,
              border: `1px solid ${verse.palette.primaryGlow}`,
              background: `${verse.palette.accent}20`,
            }}
            animate={{ height: Math.max(8, reverseRate * 70) }}
            transition={{ duration: 0.15 }}
          />
          <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>
            reverse
          </span>
        </div>
      </div>

      {/* Slider track */}
      {!locked && (
        <div
          ref={trackRef}
          onPointerMove={handlePointerMove}
          style={{
            width: 200,
            height: 28,
            borderRadius: 14,
            border: `1px solid ${verse.palette.primaryGlow}`,
            position: 'relative',
            cursor: 'pointer',
            touchAction: 'none',
          }}
        >
          {/* Thumb */}
          <motion.div
            style={{
              position: 'absolute',
              top: 4,
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: `1px solid ${isNearBalance ? verse.palette.accent : verse.palette.primary}`,
              background: isNearBalance ? `${verse.palette.accent}30` : 'transparent',
            }}
            animate={{ left: `calc(${ratio * 100}% - 10px)` }}
            transition={{ duration: 0.05 }}
          />

          {/* Center mark */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 6,
            bottom: 6,
            width: 1,
            background: verse.palette.textFaint,
            opacity: 0.3,
            transform: 'translateX(-50%)',
          }} />
        </div>
      )}

      {/* State label */}
      {!locked && (
        <div style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 9 }}>
          {isNearBalance ? 'equilibrium found' : 'find the balance point'}
        </div>
      )}

      {/* Lock / confirm */}
      {!locked && (
        <motion.button
          onClick={handleLock}
          whileTap={isNearBalance ? immersiveTapButton(verse.palette, 'accent').active : {}}
          style={{
            ...immersiveTapButton(verse.palette, isNearBalance ? 'accent' : 'faint').base,
            opacity: isNearBalance ? 0.7 : 0.3,
            transition: 'all 0.3s ease',
          }}
        >
          {isNearBalance ? 'hold here' : 'find the balance point'}
        </motion.button>
      )}

      {/* Balanced state */}
      {balanced && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          equal motion
        </motion.div>
      )}
    </div>
  );
}