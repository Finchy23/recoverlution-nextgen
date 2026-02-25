/**
 * RECEIVER #1 -- 1171. The Signal-to-Noise Ratio
 * "Stop consuming (Noise). Start selecting (Signal). Boost the ratio."
 * INTERACTION: Static covers music. Turn "Boost Signal" and "Cut Noise" knobs.
 * STEALTH KBE: Selective Attention -- focus (K)
 *
 * COMPOSITOR: science_x_soul / Pulse / work / knowing / tap / 1171
 */
import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Receiver_SignalToNoiseRatio({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Pulse',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1171,
        isSeal: false,
      }}
      arrivalText="Static. Somewhere underneath, music."
      prompt="You are drowning in data but starving for wisdom. Stop consuming. Start selecting. Boost the ratio."
      resonantText="Selective Attention. The music was always playing. The static was louder. You did not add signal. You subtracted noise. Focus is not intensity. It is filtration."
      afterglowCoda="Clear."
      onComplete={onComplete}
    >
      {(verse) => <SNRInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SNRInteraction({ verse }: { verse: any }) {
  const [signal, setSignal] = useState(0.2);
  const [noise, setNoise] = useState(0.8);
  const [done, setDone] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.06), 30);
    return () => clearInterval(interval);
  }, []);

  const boostSignal = useCallback(() => {
    if (done) return;
    setSignal(prev => {
      const next = Math.min(1, prev + 0.15);
      if (next >= 0.8 && noise <= 0.3) {
        setDone(true);
        setTimeout(() => verse.advance(), 2200);
      }
      return next;
    });
  }, [done, noise, verse]);

  const cutNoise = useCallback(() => {
    if (done) return;
    setNoise(prev => {
      const next = Math.max(0, prev - 0.15);
      if (signal >= 0.8 && next <= 0.3) {
        setDone(true);
        setTimeout(() => verse.advance(), 2200);
      }
      return next;
    });
  }, [done, signal, verse]);

  const ratio = noise > 0.05 ? signal / noise : signal / 0.05;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      {/* Waveform display */}
      <div style={navicueStyles.heroScene(verse.palette, 160 / 80)}>
        <svg viewBox="0 0 160 80" style={navicueStyles.heroSvg}>
          {/* Noise wave (static) */}
          {Array.from({ length: 40 }).map((_, i) => {
            const x = i * 4;
            const noiseY = 40 + (Math.random() - 0.5) * 30 * noise;
            return (
              <line key={`n${i}`}
                x1={x} y1={40} x2={x} y2={noiseY}
                stroke="hsla(0, 0%, 50%, 0.25)" strokeWidth={1.5}
                opacity={noise * 0.5}
              />
            );
          })}

          {/* Signal wave (music -- clean sine) */}
          <path
            d={Array.from({ length: 80 }).map((_, i) => {
              const x = i * 2;
              const y = 40 + Math.sin((x + time * 20) * 0.08) * 15 * signal;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke={done ? verse.palette.accent : 'hsla(200, 35%, 55%, 0.5)'}
            strokeWidth={1.5}
            opacity={signal}
          />

          {/* S/N ratio label */}
          <text x={80} y={12} textAnchor="middle"
            style={{ ...navicueType.hint, fontSize: 8 }}
            fill={done ? verse.palette.accent : verse.palette.textFaint}
            opacity={0.4}>
            S/N: {ratio.toFixed(1)}
          </text>
        </svg>
      </div>

      {/* Knobs */}
      <div style={{ display: 'flex', gap: 16 }}>
        {!done && (
          <>
            <motion.button onClick={boostSignal}
              style={immersiveTapButton(verse.palette).base}
              whileTap={immersiveTapButton(verse.palette).active}>
              boost signal
            </motion.button>
            <motion.button onClick={cutNoise}
              style={immersiveTapButton(verse.palette, 'faint').base}
              whileTap={immersiveTapButton(verse.palette, 'faint').active}>
              cut noise
            </motion.button>
          </>
        )}
        {done && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
            clear
          </motion.div>
        )}
      </div>

      {/* Meters */}
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ width: 40, height: 3, borderRadius: 2, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
            <div style={{ width: `${signal * 100}%`, height: '100%', background: done ? verse.palette.accent : 'hsla(200, 35%, 55%, 0.5)', borderRadius: 2 }} />
          </div>
          <span style={{ ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.3 }}>signal</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ width: 40, height: 3, borderRadius: 2, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
            <div style={{ width: `${noise * 100}%`, height: '100%', background: 'hsla(0, 25%, 50%, 0.4)', borderRadius: 2 }} />
          </div>
          <span style={{ ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.3 }}>noise</span>
        </div>
      </div>

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'focus' : 'boost the ratio'}
      </div>
    </div>
  );
}