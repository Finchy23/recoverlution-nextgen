/**
 * RESONATOR #1 -- 1021. The Noise Cancellation
 * "Cancel the noise. Create the vacuum."
 * INTERACTION: Hold to engage ANC -- jagged waveforms flatten to silence
 * STEALTH KBE: Auditory Exclusion -- boundary enforcement (E)
 *
 * COMPOSITOR: sensory_cinema / Ocean / work / embodying / hold / 1021
 */
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { useHoldInteraction } from '../interactions/useHoldInteraction';
import { navicueType, navicueInteraction } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Resonator_NoiseCancellation({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Ocean',
        chrono: 'work',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1021,
        isSeal: false,
      }}
      arrivalText="Static everywhere."
      prompt="The world is screaming static. You cannot hear your own signal. Cancel the noise. Create the vacuum."
      resonantText="Auditory exclusion. Under sustained focus, the brain literally attenuates irrelevant sensory channels. You did not block the noise. You redirected attention until the noise lost its power."
      afterglowCoda="The vacuum holds."
      onComplete={onComplete}
    >
      {(verse) => <NoiseCancellationInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function NoiseCancellationInteraction({ verse }: { verse: any }) {
  const hold = useHoldInteraction({
    maxDuration: 6000,
    onComplete: () => verse.advance(),
  });
  const h = hold.tension;
  const amp = verse.breathAmplitude;
  const waveCount = 5;

  // Generate waveform paths -- chaos decreases as hold increases
  const waves = useMemo(() => {
    return Array.from({ length: waveCount }, (_, i) => {
      const chaos = 1 - h;
      const freq = 2 + i * 1.5;
      const amplitude = (8 + i * 6) * chaos;
      const points = Array.from({ length: 56 }, (_, x) => {
        const px = x * 5;
        const py = 50 + Math.sin(px * freq / 100 + i) * amplitude * (0.5 + amp * 0.5);
        return `${x === 0 ? 'M' : 'L'} ${px} ${py}`;
      }).join(' ');
      return { d: points, opacity: 0.08 + (1 - chaos) * 0.06, i };
    });
  }, [h, amp]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Waveform visualization */}
      <svg width="280" height="100" viewBox="0 0 280 100" style={{ overflow: 'visible' }}>
        {waves.map(w => (
          <motion.path
            key={w.i}
            d={w.d}
            fill="none"
            stroke={verse.palette.primary}
            strokeWidth={0.5 + (1 - (1 - h)) * 0.5}
            animate={{ opacity: [w.opacity * 0.7, w.opacity] }}
            transition={{ duration: 1.5 + w.i * 0.3, repeat: Infinity, repeatType: 'reverse' }}
          />
        ))}
        {/* Center clarity line emerges with hold */}
        {h > 0.3 && (
          <motion.line x1="0" y1="50" x2="280" y2="50"
            stroke={verse.palette.accent}
            strokeWidth={0.5 + h * 1}
            initial={{ opacity: 0 }}
            animate={{ opacity: [h * 0.15, h * 0.3] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
          />
        )}
      </svg>

      {/* Hold zone */}
      <div {...hold.holdProps}
        style={{
          ...hold.holdProps.style,
          ...navicueInteraction.holdZone,
          width: 140, height: 52, borderRadius: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${verse.palette.primaryFaint}`,
          border: `1px solid ${verse.palette.primaryGlow}`,
        }}>
        <span style={{ ...navicueType.hint, color: verse.palette.text }}>
          {h > 0.9 ? 'silence' : h > 0.5 ? 'quieting...' : h > 0.1 ? 'holding...' : 'ANC'}
        </span>
      </div>
      {!hold.completed && (
        <div style={{ ...navicueType.hint, color: verse.palette.textFaint }}>
          {hold.isHolding ? 'let the noise fall away...' : 'hold to cancel'}
        </div>
      )}
    </div>
  );
}
