/**
 * REFRACTOR #8 -- 1048. The Laser (Coherence)
 * "Get your waves in phase. Coherence allows you to travel distance without loss."
 * INTERACTION: Drag three sliders (Mind, Body, Emotion) to alignment -- beam shoots
 * STEALTH KBE: Alignment -- integrated action (E)
 *
 * COMPOSITOR: science_x_soul / Stellar / work / embodying / drag / 1048
 */
import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const CHANNELS = [
  { key: 'mind', label: 'mind', initial: 0.3 },
  { key: 'body', label: 'body', initial: 0.7 },
  { key: 'emotion', label: 'emotion', initial: 0.5 },
];

export default function Refractor_Laser({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Stellar',
        chrono: 'work',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1048,
        isSeal: false,
      }}
      arrivalText="A light bulb. Warm but scattered."
      prompt="A bulb lights the room. A laser cuts the steel. Get your waves in phase. Coherence allows you to travel distance without loss."
      resonantText="Alignment. Coherent light has one wavelength, one direction, one phase. It loses nothing over distance. Your focus is the same."
      afterglowCoda="In phase."
      onComplete={onComplete}
    >
      {(verse) => <LaserInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function LaserInteraction({ verse }: { verse: any }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(CHANNELS.map(c => [c.key, c.initial]))
  );
  const [coherent, setCoherent] = useState(false);

  const handleDrag = useCallback((key: string, e: React.PointerEvent<HTMLDivElement>) => {
    if (coherent) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setValues(prev => ({ ...prev, [key]: x }));
  }, [coherent]);

  // Check coherence (all values within 0.08 of each other)
  useEffect(() => {
    if (coherent) return;
    const vals = Object.values(values);
    const spread = Math.max(...vals) - Math.min(...vals);
    if (spread < 0.08 && vals.every(v => v > 0.3 && v < 0.7)) {
      setCoherent(true);
      setTimeout(() => verse.advance(), 3000);
    }
  }, [values, coherent, verse]);

  const vals = Object.values(values);
  const spread = Math.max(...vals) - Math.min(...vals);
  const alignment = Math.max(0, 1 - spread * 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Beam visualization */}
      <svg width="220" height="60" viewBox="0 0 220 60">
        {/* Incoherent rays (bulb mode) */}
        {!coherent && Array.from({ length: 6 }, (_, i) => (
          <motion.line
            key={i}
            x1="20" y1="30"
            x2={60 + alignment * 160} y2={10 + i * 8 + (1 - alignment) * (i - 2.5) * 6}
            stroke={verse.palette.primary}
            strokeWidth={0.5 + alignment * 0.5}
            opacity={0.15 + alignment * 0.3}
          />
        ))}

        {/* Coherent beam (laser mode) */}
        {coherent && (
          <motion.line
            x1="20" y1="30" x2="220" y2="30"
            stroke={verse.palette.accent}
            strokeWidth={2}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 0.8 }}
          />
        )}

        {/* Source */}
        <circle cx="20" cy="30" r="6"
          fill={coherent ? verse.palette.accent : verse.palette.primaryGlow}
          opacity={0.4}
        />
      </svg>

      {/* Three sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 180 }}>
        {CHANNELS.map(ch => (
          <div key={ch.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ ...navicueType.micro, color: verse.palette.textFaint, width: 48, textAlign: 'right' }}>
              {ch.label}
            </span>
            <div
              style={{
                flex: 1,
                height: 24,
                position: 'relative',
                cursor: coherent ? 'default' : 'ew-resize',
                touchAction: 'none',
              }}
              onPointerMove={(e) => handleDrag(ch.key, e)}
            >
              <div style={{
                position: 'absolute',
                top: 10,
                left: 0,
                right: 0,
                height: 4,
                borderRadius: 2,
                background: verse.palette.primaryFaint,
              }} />
              <motion.div
                style={{
                  position: 'absolute',
                  top: 5,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: coherent ? verse.palette.accent : verse.palette.primaryGlow,
                  border: `1px solid ${verse.palette.primary}`,
                }}
                animate={{ left: values[ch.key] * (120 - 14) }}
                transition={{ duration: 0.05 }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...navicueType.hint, color: coherent ? verse.palette.accent : verse.palette.textFaint }}>
        {coherent ? 'coherent' : `alignment ${Math.round(alignment * 100)}%`}
      </div>
    </div>
  );
}
