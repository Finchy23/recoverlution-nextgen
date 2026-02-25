/**
 * TUNING #8 -- 1198. The Amplifier (Gain)
 * "Turn it down to clean it up."
 * INTERACTION: Weak signal. Crank gain. Distortion! Lower gain. Clean.
 * STEALTH KBE: Modulation -- restraint (K)
 *
 * COMPOSITOR: science_x_soul / Echo / work / knowing / tap / 1198
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const GAIN_STATES = [
  { label: 'low', gain: 0.2, distorted: false, status: 'weak' },
  { label: 'medium', gain: 0.5, distorted: false, status: 'building' },
  { label: 'high', gain: 0.8, distorted: false, status: 'loud' },
  { label: 'max', gain: 1.0, distorted: true, status: 'distorted' },
];

export default function Tuning_Amplifier({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Echo',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1198,
        isSeal: false,
      }}
      arrivalText="A weak signal."
      prompt="More volume is not more clarity. If you push too hard, you distort the message. Turn it down to clean it up."
      resonantText="Modulation. You cranked the gain and the signal became noise. Louder was not clearer. You turned it down and the message appeared. Restraint is an amplifier of meaning."
      afterglowCoda="Clean."
      onComplete={onComplete}
    >
      {(verse) => <AmplifierInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function AmplifierInteraction({ verse }: { verse: any }) {
  const [gainIdx, setGainIdx] = useState(0);
  const [hasDistorted, setHasDistorted] = useState(false);
  const [done, setDone] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.05), 30);
    return () => clearInterval(interval);
  }, []);

  const raiseGain = useCallback(() => {
    if (done) return;
    setGainIdx(prev => {
      const next = Math.min(GAIN_STATES.length - 1, prev + 1);
      if (GAIN_STATES[next].distorted) setHasDistorted(true);
      return next;
    });
  }, [done]);

  const lowerGain = useCallback(() => {
    if (done) return;
    setGainIdx(prev => {
      const next = Math.max(0, prev - 1);
      // Win: once distorted, lowering to medium = clean + clear
      if (hasDistorted && next === 1) {
        setDone(true);
        setTimeout(() => verse.advance(), 2200);
      }
      return next;
    });
  }, [done, hasDistorted, verse]);

  const state = GAIN_STATES[gainIdx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 80)}>
        <svg viewBox="0 0 160 80" style={navicueStyles.heroSvg}>
          {/* Waveform */}
          <path
            d={Array.from({ length: 80 }).map((_, i) => {
              const x = i * 2;
              let wave = Math.sin((x + time * 25) * 0.1) * 15 * state.gain;
              // Distortion: clip the wave
              if (state.distorted) {
                wave = Math.max(-10, Math.min(10, wave * 2));
                wave += (Math.random() - 0.5) * 4; // noise
              }
              // Clean win state
              if (done) {
                wave = Math.sin((x + time * 25) * 0.1) * 10;
              }
              return `${i === 0 ? 'M' : 'L'} ${x} ${40 + wave}`;
            }).join(' ')}
            fill="none"
            stroke={done ? verse.palette.accent :
              state.distorted ? 'hsla(0, 35%, 50%, 0.5)' :
              'hsla(200, 25%, 50%, 0.4)'}
            strokeWidth={1.5}
            opacity={0.5}
          />

          {/* Clip lines (distortion threshold) */}
          {state.distorted && (
            <>
              <line x1={0} y1={30} x2={160} y2={30}
                stroke="hsla(0, 30%, 50%, 0.2)" strokeWidth={0.5} strokeDasharray="3 3" />
              <line x1={0} y1={50} x2={160} y2={50}
                stroke="hsla(0, 30%, 50%, 0.2)" strokeWidth={0.5} strokeDasharray="3 3" />
            </>
          )}

          {/* Gain meter */}
          <g transform="translate(10, 10)">
            <rect x={0} y={0} width={30} height={6} rx={1}
              fill={verse.palette.primaryGlow} opacity={0.1} />
            <rect x={0} y={0} width={30 * state.gain} height={6} rx={1}
              fill={state.distorted ? 'hsla(0, 35%, 50%, 0.5)' :
                done ? verse.palette.accent : 'hsla(200, 25%, 50%, 0.4)'}
            />
            <text x={35} y={6} style={{ ...navicueType.micro }}
              fill={verse.palette.textFaint} opacity={0.3}>
              gain
            </text>
          </g>

          {/* Status */}
          <text x={80} y={72} textAnchor="middle"
            style={{ ...navicueType.hint, fontSize: 9 }}
            fill={done ? verse.palette.accent :
              state.distorted ? 'hsla(0, 30%, 50%, 0.4)' :
              verse.palette.textFaint}
            opacity={0.5}>
            {done ? 'clean' : state.status}
          </text>
        </svg>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {!done && (
          <>
            {gainIdx > 0 && (
              <motion.button onClick={lowerGain}
                style={immersiveTapButton(verse.palette).base}
                whileTap={immersiveTapButton(verse.palette).active}>
                turn down
              </motion.button>
            )}
            {gainIdx < GAIN_STATES.length - 1 && (
              <motion.button onClick={raiseGain}
                style={immersiveTapButton(verse.palette).base}
                whileTap={immersiveTapButton(verse.palette).active}>
                turn up
              </motion.button>
            )}
          </>
        )}
        {done && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
            clean
          </motion.div>
        )}
      </div>

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'restraint' : hasDistorted ? 'turn it down to clean it up' : 'find the right level'}
      </div>
    </div>
  );
}