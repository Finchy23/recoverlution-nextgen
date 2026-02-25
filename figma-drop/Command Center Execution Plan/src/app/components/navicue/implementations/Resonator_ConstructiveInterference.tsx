/**
 * RESONATOR #3 -- 1023. The Constructive Interference
 * "Find the flow. Align, and double your amplitude."
 * INTERACTION: Drag to phase-align two waves -- when peaks match, amplitude doubles
 * STEALTH KBE: Synergy -- resource alignment (K)
 *
 * COMPOSITOR: science_x_soul / Ocean / work / knowing / drag / 1023
 */
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { useDragInteraction } from '../interactions/useDragInteraction';
import { navicueType, navicueInteraction } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Resonator_ConstructiveInterference({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Ocean',
        chrono: 'work',
        kbe: 'k',
        hook: 'drag',
        specimenSeed: 1023,
        isSeal: false,
      }}
      arrivalText="Two waves, out of phase."
      prompt="If you fight the environment, you cancel your energy. If you align with it, you double your amplitude. Find the flow."
      resonantText="Constructive interference. When two waves align in phase, their amplitudes combine. The same principle applies to effort: alignment with circumstance does not halve the work. It doubles the output."
      afterglowCoda="Amplified."
      onComplete={onComplete}
    >
      {(verse) => <ConstructiveInterferenceInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ConstructiveInterferenceInteraction({ verse }: { verse: any }) {
  const [phaseOffset, setPhaseOffset] = useState(Math.PI); // start out of phase
  const [aligned, setAligned] = useState(false);
  const drag = useDragInteraction({
    axis: 'horizontal',
    onDragMove: (x) => {
      const newOffset = Math.PI * (1 - x); // 0 to PI based on drag
      setPhaseOffset(newOffset);
      // Check alignment -- within 10% of in-phase
      if (Math.abs(newOffset) < 0.3 && !aligned) {
        setAligned(true);
        setTimeout(() => verse.advance(), 1500);
      }
    },
  });

  const alignment = 1 - Math.abs(phaseOffset) / Math.PI;
  const combinedAmplitude = 1 + alignment; // 1x to 2x

  // Two wave paths
  const wave1 = useMemo(() => {
    return Array.from({ length: 60 }, (_, x) => {
      const px = x * 4;
      const py = 40 + Math.sin(px * 0.06) * 15;
      return `${x === 0 ? 'M' : 'L'} ${px} ${py}`;
    }).join(' ');
  }, []);

  const wave2 = useMemo(() => {
    return Array.from({ length: 60 }, (_, x) => {
      const px = x * 4;
      const py = 40 + Math.sin(px * 0.06 + phaseOffset) * 15;
      return `${x === 0 ? 'M' : 'L'} ${px} ${py}`;
    }).join(' ');
  }, [phaseOffset]);

  const combined = useMemo(() => {
    return Array.from({ length: 60 }, (_, x) => {
      const px = x * 4;
      const py = 40 + (Math.sin(px * 0.06) + Math.sin(px * 0.06 + phaseOffset)) * 7.5;
      return `${x === 0 ? 'M' : 'L'} ${px} ${py}`;
    }).join(' ');
  }, [phaseOffset]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Wave visualization */}
      <svg width="240" height="80" viewBox="0 0 240 80" style={{ overflow: 'visible' }}>
        {/* Wave A -- fixed */}
        <path d={wave1} fill="none" stroke={verse.palette.primary} strokeWidth={0.6} opacity={0.15} />
        {/* Wave B -- movable */}
        <path d={wave2} fill="none" stroke={verse.palette.accent} strokeWidth={0.6} opacity={0.15} />
        {/* Combined result */}
        <motion.path
          d={combined}
          fill="none"
          stroke={verse.palette.text}
          strokeWidth={0.5 + alignment * 1}
          animate={{ opacity: [0.1 + alignment * 0.15, 0.2 + alignment * 0.15] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
        />
      </svg>

      {/* Drag track */}
      <div
        {...drag.dragProps}
        style={{
          ...drag.dragProps.style,
          ...navicueInteraction.dragTrack,
          width: 240, height: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 9999,
          background: verse.palette.primaryFaint,
          border: `1px solid ${verse.palette.primaryGlow}`,
          position: 'relative',
        }}
      >
        {/* Drag indicator */}
        <motion.div
          style={{
            width: 20, height: 20, borderRadius: '50%',
            background: verse.palette.accent,
            opacity: 0.2 + alignment * 0.3,
            position: 'absolute',
            left: `${(1 - phaseOffset / Math.PI) * 80 + 10}%`,
          }}
        />
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, position: 'relative', zIndex: 1 }}>
          {aligned ? 'amplified' : alignment > 0.7 ? 'almost...' : 'slide to align'}
        </span>
      </div>

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint }}>
        amplitude: {combinedAmplitude.toFixed(1)}x
      </div>
    </div>
  );
}
