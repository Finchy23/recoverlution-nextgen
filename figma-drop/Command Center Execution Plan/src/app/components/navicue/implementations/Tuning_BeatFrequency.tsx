/**
 * TUNING #5 -- 1195. The Beat Frequency (Wobble)
 * "Make the micro-adjustment. Stop the wobble."
 * INTERACTION: Two notes almost in tune. Wah-wah wobble. Tiny adjustment. Pure tone.
 * STEALTH KBE: Fine Tuning -- precision (E)
 *
 * COMPOSITOR: pattern_glitch / Echo / morning / embodying / tap / 1195
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Tuning_BeatFrequency({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Echo',
        chrono: 'morning',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1195,
        isSeal: false,
      }}
      arrivalText="Two notes. Almost in tune. Almost."
      prompt="You are close, but the interference is draining you. Make the micro-adjustment. Stop the wobble."
      resonantText="Fine Tuning. The two notes were 98% aligned. But that 2% created a wobble that consumed all your attention. One micro-adjustment and the beat vanished. Precision is the last 2%."
      afterglowCoda="Pure."
      onComplete={onComplete}
    >
      {(verse) => <BeatFrequencyInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function BeatFrequencyInteraction({ verse }: { verse: any }) {
  const [detune, setDetune] = useState(4); // steps from perfect
  const [done, setDone] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.05), 30);
    return () => clearInterval(interval);
  }, []);

  const adjust = useCallback(() => {
    if (done) return;
    setDetune(prev => {
      const next = prev - 1;
      if (next <= 0) {
        setDone(true);
        setTimeout(() => verse.advance(), 2200);
        return 0;
      }
      return next;
    });
  }, [done, verse]);

  const wobbleSpeed = detune * 1.5;
  const wobbleAmp = detune * 3;
  const beatEnvelope = Math.cos(time * wobbleSpeed) * wobbleAmp;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 80)}>
        <svg viewBox="0 0 160 80" style={navicueStyles.heroSvg}>
          {/* Combined waveform with beat envelope */}
          <path
            d={Array.from({ length: 80 }).map((_, i) => {
              const x = i * 2;
              const wave1 = Math.sin((x + time * 30) * 0.12) * 12;
              const wave2 = Math.sin((x + time * 30) * (0.12 + detune * 0.003)) * 12;
              const combined = done ? wave1 : (wave1 + wave2) / 2;
              const y = 40 + combined;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke={done ? verse.palette.accent : 'hsla(200, 25%, 50%, 0.4)'}
            strokeWidth={1.5}
            opacity={done ? 0.6 : 0.4}
          />

          {/* Beat envelope visualization */}
          {!done && (
            <>
              <path
                d={Array.from({ length: 80 }).map((_, i) => {
                  const x = i * 2;
                  const env = Math.abs(Math.cos((x + time * 30) * detune * 0.003)) * 14;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${40 - env}`;
                }).join(' ')}
                fill="none" stroke="hsla(0, 20%, 50%, 0.15)" strokeWidth={0.8}
                strokeDasharray="2 3"
              />
              <path
                d={Array.from({ length: 80 }).map((_, i) => {
                  const x = i * 2;
                  const env = Math.abs(Math.cos((x + time * 30) * detune * 0.003)) * 14;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${40 + env}`;
                }).join(' ')}
                fill="none" stroke="hsla(0, 20%, 50%, 0.15)" strokeWidth={0.8}
                strokeDasharray="2 3"
              />
            </>
          )}

          {/* Wobble indicator */}
          <text x={80} y={12} textAnchor="middle"
            style={{ ...navicueType.micro }}
            fill={done ? verse.palette.accent : 'hsla(0, 20%, 50%, 0.4)'}
            opacity={0.5}>
            {done ? 'pure' : `wobble: ${detune}`}
          </text>
        </svg>
      </div>

      {!done ? (
        <motion.button onClick={adjust}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          micro-adjust
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          pure tone
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'precision' : 'stop the wobble'}
      </div>
    </div>
  );
}