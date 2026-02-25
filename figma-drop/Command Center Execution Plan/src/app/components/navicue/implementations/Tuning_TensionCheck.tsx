/**
 * TUNING #1 -- 1191. The Tension Check
 * "Find the tension that sings. Tune it up."
 * INTERACTION: Guitar string. Too loose = flabby. Too tight = snap. Just right = note.
 * STEALTH KBE: Regulation -- optimal arousal (E)
 *
 * COMPOSITOR: sensory_cinema / Echo / morning / embodying / tap / 1191
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const TENSION_STATES = [
  { label: 'slack', sound: 'flabby', color: 'hsla(0, 0%, 45%, 0.25)', sag: 20, ok: false },
  { label: 'loose', sound: 'dull', color: 'hsla(30, 15%, 45%, 0.3)', sag: 12, ok: false },
  { label: 'tuned', sound: 'note', color: '', sag: 3, ok: true },
  { label: 'tight', sound: 'sharp', color: 'hsla(0, 25%, 45%, 0.3)', sag: 0, ok: false },
  { label: 'over', sound: 'snap', color: 'hsla(0, 35%, 45%, 0.35)', sag: -1, ok: false },
];

export default function Tuning_TensionCheck({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Echo',
        chrono: 'morning',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1191,
        isSeal: false,
      }}
      arrivalText="A string. Slack."
      prompt="Slack creates no music. Panic breaks the string. Find the tension that sings. Tune it up."
      resonantText="Regulation. Too loose and there is no sound. Too tight and the string breaks. The note lives in a narrow band of tension. Optimal arousal: enough pressure to vibrate, not enough to snap."
      afterglowCoda="Note."
      onComplete={onComplete}
    >
      {(verse) => <TensionCheckInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function TensionCheckInteraction({ verse }: { verse: any }) {
  const [tensionIdx, setTensionIdx] = useState(0);
  const [done, setDone] = useState(false);

  const tighten = useCallback(() => {
    if (done) return;
    setTensionIdx(prev => {
      const next = Math.min(TENSION_STATES.length - 1, prev + 1);
      if (TENSION_STATES[next].ok) {
        setDone(true);
        setTimeout(() => verse.advance(), 2200);
      }
      return next;
    });
  }, [done, verse]);

  const loosen = useCallback(() => {
    if (done) return;
    setTensionIdx(prev => Math.max(0, prev - 1));
  }, [done]);

  const state = TENSION_STATES[tensionIdx];
  const stateColor = state.ok ? verse.palette.accent : state.color;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 80)}>
        <svg viewBox="0 0 160 80" style={navicueStyles.heroSvg}>
          {/* Tuning pegs */}
          <circle cx={15} cy={40} r={4}
            fill="none" stroke={verse.palette.primaryGlow} strokeWidth={1} opacity={0.2} />
          <circle cx={145} cy={40} r={4}
            fill="none" stroke={verse.palette.primaryGlow} strokeWidth={1} opacity={0.2} />

          {/* String */}
          {state.sag >= 0 ? (
            <path
              d={`M 20 40 Q 80 ${40 + state.sag} 140 40`}
              fill="none"
              stroke={stateColor}
              strokeWidth={state.ok ? 1.5 : 1}
              opacity={0.5}
            />
          ) : (
            /* Snapped string */
            <>
              <line x1={20} y1={40} x2={65} y2={48}
                stroke="hsla(0, 35%, 45%, 0.3)" strokeWidth={1} />
              <line x1={95} y1={48} x2={140} y2={40}
                stroke="hsla(0, 35%, 45%, 0.3)" strokeWidth={1} />
            </>
          )}

          {/* Vibration visualization */}
          {state.ok && (
            <>
              {[1, 2, 3].map(i => (
                <motion.path key={i}
                  d={`M 20 40 Q 80 ${40 + i * 2} 140 40`}
                  fill="none" stroke={verse.palette.accent}
                  strokeWidth={0.5} opacity={0.15}
                  animate={{ d: [`M 20 40 Q 80 ${40 + i * 2} 140 40`, `M 20 40 Q 80 ${40 - i * 2} 140 40`] }}
                  transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.15 * i }}
                />
              ))}
            </>
          )}

          {/* Sound label */}
          <text x={80} y={70} textAnchor="middle"
            style={{ ...navicueType.micro }}
            fill={stateColor} opacity={0.5}>
            {state.sound}
          </text>

          {/* Tension meter */}
          <text x={80} y={18} textAnchor="middle"
            style={{ ...navicueType.micro }}
            fill={stateColor} opacity={0.4}>
            {state.label}
          </text>
        </svg>
      </div>

      {!done ? (
        <div style={{ display: 'flex', gap: 12 }}>
          {tensionIdx > 0 && (
            <motion.button onClick={loosen}
              style={immersiveTapButton(verse.palette).base}
              whileTap={immersiveTapButton(verse.palette).active}>
              loosen
            </motion.button>
          )}
          {tensionIdx < TENSION_STATES.length - 1 && (
            <motion.button onClick={tighten}
              style={immersiveTapButton(verse.palette).base}
              whileTap={immersiveTapButton(verse.palette).active}>
              tighten
            </motion.button>
          )}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          note
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'optimal arousal' : 'find the tension that sings'}
      </div>
    </div>
  );
}