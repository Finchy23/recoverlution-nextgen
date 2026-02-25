/**
 * RECEIVER #5 -- 1175. The Modulation (AM/FM)
 * "Switch from Logic (AM) to Emotion (FM). Can you hear it now?"
 * INTERACTION: Garbled AM signal. Switch to FM. Message becomes clear.
 * STEALTH KBE: Modality Shift -- cognitive flexibility (K)
 *
 * COMPOSITOR: koan_paradox / Pulse / work / knowing / tap / 1175
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Receiver_Modulation({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Pulse',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1175,
        isSeal: false,
      }}
      arrivalText="A garbled signal."
      prompt="The message is right, but the carrier wave is wrong. Switch from Logic to Emotion. Can you hear it now?"
      resonantText="Modality Shift. The message was always correct. The carrier wave was wrong. You switched modes and the static became song. Cognitive flexibility: sometimes the answer is not more data. It is a different way of listening."
      afterglowCoda="Clear."
      onComplete={onComplete}
    >
      {(verse) => <ModulationInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ModulationInteraction({ verse }: { verse: any }) {
  const [mode, setMode] = useState<'am' | 'fm'>('am');
  const [done, setDone] = useState(false);

  const switchMode = useCallback(() => {
    if (done) return;
    if (mode === 'am') {
      setMode('fm');
      setDone(true);
      setTimeout(() => verse.advance(), 2400);
    }
  }, [done, mode, verse]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 90)}>
        <svg viewBox="0 0 160 90" style={navicueStyles.heroSvg}>
          {/* Mode label */}
          <text x={80} y={12} textAnchor="middle"
            style={{ ...navicueType.hint, fontSize: 9 }}
            fill={done ? verse.palette.accent : verse.palette.textFaint}
            opacity={0.5}>
            {mode === 'am' ? 'AM (Logic)' : 'FM (Emotion)'}
          </text>

          {/* AM wave: amplitude modulated, garbled */}
          {mode === 'am' && (
            <g>
              {Array.from({ length: 50 }).map((_, i) => {
                const x = 10 + i * 3;
                const envelope = Math.sin(i * 0.15) * 15;
                const carrier = Math.sin(i * 1.2) * envelope;
                const noise = (Math.random() - 0.5) * 8;
                return (
                  <circle key={i} cx={x} cy={50 + carrier + noise} r={0.8}
                    fill="hsla(0, 20%, 50%, 0.3)" />
                );
              })}
              <text x={80} y={80} textAnchor="middle"
                style={{ ...navicueType.hint, fontSize: 8 }}
                fill="hsla(0, 20%, 50%, 0.3)">
                garbled
              </text>
            </g>
          )}

          {/* FM wave: frequency modulated, clean */}
          {mode === 'fm' && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <path
                d={Array.from({ length: 60 }).map((_, i) => {
                  const x = 10 + i * 2.5;
                  const freqMod = 0.3 + Math.sin(i * 0.1) * 0.15;
                  const y = 50 + Math.sin(i * freqMod) * 12;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke={verse.palette.accent}
                strokeWidth={1.5}
                opacity={0.6}
              />
              <text x={80} y={80} textAnchor="middle"
                style={{ ...navicueType.hint, fontSize: 8 }}
                fill={verse.palette.accent} opacity={0.5}>
                clear
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {/* Toggle */}
      {!done ? (
        <motion.button onClick={switchMode}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          switch to FM
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          can you hear it now
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'cognitive flexibility' : 'change the carrier wave'}
      </div>
    </div>
  );
}