/**
 * RESONATOR #2 -- 1022. The Carrier Wave
 * "Hope is a weak signal. Conviction is a carrier wave."
 * INTERACTION: Type to boost signal -- rewrite "I hope" as "I am"
 * STEALTH KBE: Assertiveness -- identity shift (B)
 *
 * COMPOSITOR: poetic_precision / Ocean / morning / believing / type / 1022
 */
import { useMemo } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { useTypeInteraction } from '../interactions/useTypeInteraction';
import { navicueType, navicueInteraction } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Resonator_CarrierWave({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Ocean',
        chrono: 'morning',
        kbe: 'b',
        hook: 'type',
        specimenSeed: 1022,
        isSeal: false,
      }}
      arrivalText="A faint pulse in the static."
      prompt="Hope is a weak signal. It gets lost in the static. Conviction is a carrier wave. Boost the gain. Broadcast the intent."
      resonantText="Self-affirmation theory. When you state an identity rather than a wish, the brain activates neural networks associated with self-concept rather than desire. The signal changes from seeking to declaring."
      afterglowCoda="Broadcast clear."
      onComplete={onComplete}
    >
      {(verse) => <CarrierWaveInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CarrierWaveInteraction({ verse }: { verse: any }) {
  const typeHook = useTypeInteraction({
    minLength: 4,
    onAccept: () => verse.advance(),
  });
  const strength = Math.min(1, (typeHook.value.length || 0) / 12);

  // Wave path that strengthens with input
  const wavePath = useMemo(() => {
    return Array.from({ length: 48 }, (_, x) => {
      const px = x * 5;
      const amplitude = 3 + strength * 22;
      const py = 30 + Math.sin(px * 0.08) * amplitude;
      return `${x === 0 ? 'M' : 'L'} ${px} ${py}`;
    }).join(' ');
  }, [strength]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
      {/* Signal strength waveform */}
      <svg width="240" height="60" viewBox="0 0 240 60">
        <motion.path
          d={wavePath}
          fill="none"
          stroke={verse.palette.accent}
          strokeWidth={0.5 + strength * 1.5}
          animate={{ opacity: [0.4 + strength * 0.3, 0.7 + strength * 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
        />
      </svg>

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint }}>
        rewrite "I hope..." as "I am..."
      </div>

      <input
        value={typeHook.value}
        onChange={e => typeHook.onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && typeHook.submit()}
        placeholder="I am..."
        style={{
          ...navicueType.input,
          width: 260, padding: 10, textAlign: 'center',
          background: verse.palette.primaryFaint,
          border: `1px solid ${verse.palette.primaryGlow}`,
          borderRadius: 9999, color: verse.palette.text, outline: 'none',
        }}
      />

      <div style={{ ...navicueType.hint, color: verse.palette.accent }}>
        {strength > 0.8 ? 'broadcasting' : strength > 0.3 ? 'signal rising' : 'weak signal'}
      </div>
    </div>
  );
}
