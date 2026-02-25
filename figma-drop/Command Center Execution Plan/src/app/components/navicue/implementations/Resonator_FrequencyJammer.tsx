/**
 * RESONATOR #9 -- 1029. The Frequency Jammer
 * "Protect your frequency. If a hostile signal enters, jam it."
 * INTERACTION: Tap to activate the jammer -- red wave scatters into noise
 * STEALTH KBE: Boundary Logic -- attentional defense (K)
 *
 * COMPOSITOR: pattern_glitch / Ocean / work / knowing / tap / 1029
 */
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Resonator_FrequencyJammer({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Ocean',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1029,
        isSeal: false,
      }}
      arrivalText="A red wave approaches."
      prompt="Protect your frequency. If a hostile signal enters, jam it. Do not decode it. Block it."
      resonantText="Attentional gating. The thalamus acts as a relay station that can selectively block sensory inputs from reaching conscious awareness. You have a built-in jammer. The skill is knowing when to activate it."
      afterglowCoda="Frequency protected."
      onComplete={onComplete}
    >
      {(verse) => <FrequencyJammerInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FrequencyJammerInteraction({ verse }: { verse: any }) {
  const [jammed, setJammed] = useState(false);
  const [scatterPhase, setScatterPhase] = useState(0);

  const handleJam = () => {
    if (jammed) return;
    setJammed(true);
    // Scatter animation
    let phase = 0;
    const interval = setInterval(() => {
      phase += 0.1;
      setScatterPhase(phase);
      if (phase >= 1) {
        clearInterval(interval);
        setTimeout(() => verse.advance(), 2000);
      }
    }, 50);
  };

  // Red hostile wave
  const hostilePath = useMemo(() => {
    if (jammed) return '';
    return Array.from({ length: 50 }, (_, x) => {
      const px = x * 5;
      const py = 50 + Math.sin(px * 0.1) * 18;
      return `${x === 0 ? 'M' : 'L'} ${px} ${py}`;
    }).join(' ');
  }, [jammed]);

  // Scattered fragments when jammed
  const fragments = useMemo(() => {
    if (!jammed) return [];
    return Array.from({ length: 15 }, (_, i) => ({
      x: 20 + (i * 16) % 220,
      y: 20 + Math.sin(i * 2.3) * 25 + 25,
      length: 8 + (i % 4) * 5,
      angle: i * 37 + scatterPhase * 180,
      opacity: Math.max(0.06, 0.15 * (1 - scatterPhase)),
    }));
  }, [jammed, scatterPhase]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Wave / scatter visualization */}
      <svg width="250" height="100" viewBox="0 0 250 100">
        {!jammed && (
          <motion.path
            d={hostilePath}
            fill="none"
            stroke="hsla(0, 40%, 50%, 0.25)"
            strokeWidth={1.2}
            animate={{ opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        {/* White noise field after jamming */}
        {jammed && (
          <>
            {fragments.map((f, i) => (
              <motion.line
                key={i}
                x1={f.x} y1={f.y}
                x2={f.x + Math.cos(f.angle * Math.PI / 180) * f.length}
                y2={f.y + Math.sin(f.angle * Math.PI / 180) * f.length}
                stroke={verse.palette.primary}
                strokeWidth={0.5}
                initial={{ opacity: 0.2 }}
                animate={{ opacity: f.opacity }}
                transition={{ duration: 0.3 }}
              />
            ))}
            {/* Clean center zone */}
            <motion.circle cx="125" cy="50" r="25"
              fill="none"
              stroke={verse.palette.accent}
              strokeWidth={0.5}
              strokeDasharray="3 4"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.08, 0.15, 0.08] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </>
        )}
      </svg>

      {/* Jam button */}
      {!jammed ? (
        <motion.button
          onClick={handleJam}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}
        >
          activate jammer
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          {scatterPhase >= 1 ? 'signal blocked' : 'jamming...'}
        </motion.div>
      )}
    </div>
  );
}