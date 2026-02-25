/**
 * TUNING #2 -- 1192. The Dissonance Resolve
 * "Do not avoid the clash. Move through it to the harmony."
 * INTERACTION: Clashing chord. Hold it. Slide one note. Resolves to major chord.
 * STEALTH KBE: Conflict Resolution -- resilience (B)
 *
 * COMPOSITOR: sacred_ordinary / Echo / work / believing / tap / 1192
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Tuning_DissonanceResolve({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Echo',
        chrono: 'work',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1192,
        isSeal: false,
      }}
      arrivalText="A clashing chord. Tension."
      prompt="Dissonance is not a mistake. It is a question. The resolution is the answer. Do not avoid the clash. Move through it to the harmony."
      resonantText="Conflict Resolution. The chord clashed because one note was half a step from home. You did not run from the tension. You slid the note and the clash became a major chord. Resilience is staying in the dissonance long enough to find the resolution."
      afterglowCoda="Resolved."
      onComplete={onComplete}
    >
      {(verse) => <DissonanceInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function DissonanceInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'clash' | 'holding' | 'sliding' | 'resolved'>('clash');

  const holdChord = useCallback(() => {
    if (phase !== 'clash') return;
    setPhase('holding');
  }, [phase]);

  const slideNote = useCallback(() => {
    if (phase !== 'holding') return;
    setPhase('sliding');
    setTimeout(() => {
      setPhase('resolved');
      setTimeout(() => verse.advance(), 2200);
    }, 1000);
  }, [phase, verse]);

  // Chord notes visual positions (y = pitch)
  const notes = [
    { x: 50, y: 55, label: 'C', fixed: true },
    { x: 80, y: phase === 'resolved' || phase === 'sliding' ? 38 : 40, label: phase === 'resolved' ? 'E' : 'Eb', fixed: false },
    { x: 110, y: 28, label: 'G', fixed: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 90)}>
        <svg viewBox="0 0 160 90" style={navicueStyles.heroSvg}>
          {/* Staff lines */}
          {[25, 35, 45, 55, 65].map(y => (
            <line key={y} x1={20} y1={y} x2={140} y2={y}
              stroke={verse.palette.primaryGlow} strokeWidth={0.5} opacity={0.08} />
          ))}

          {/* Notes */}
          {notes.map((n, i) => (
            <g key={i}>
              <motion.ellipse
                cx={n.x} cy={n.y}
                animate={{ cx: n.x, cy: n.y }}
                rx={6} ry={4}
                fill={n.fixed
                  ? (phase === 'resolved' ? verse.palette.accent : 'hsla(0, 0%, 50%, 0.3)')
                  : (phase === 'resolved' ? verse.palette.accent :
                     phase === 'clash' || phase === 'holding' ? 'hsla(0, 25%, 50%, 0.4)' :
                     'hsla(45, 30%, 50%, 0.4)')
                }
                opacity={0.5}
                transition={{ type: 'spring', stiffness: 80 }}
              />
              <motion.text
                x={n.x} y={n.y - 8}
                animate={{ x: n.x, y: n.y - 8 }}
                textAnchor="middle"
                style={{ ...navicueType.micro }}
                fill={verse.palette.textFaint} opacity={0.3}>
                {n.label}
              </motion.text>
            </g>
          ))}

          {/* Dissonance indicator */}
          {(phase === 'clash' || phase === 'holding') && (
            <motion.text
              x={80} y={72} textAnchor="middle"
              style={{ ...navicueType.hint, fontSize: 8 }}
              fill="hsla(0, 25%, 50%, 0.3)"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              dissonance
            </motion.text>
          )}

          {/* Resolution indicator */}
          {phase === 'resolved' && (
            <motion.text
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              x={80} y={72} textAnchor="middle"
              style={{ ...navicueType.hint, fontSize: 8 }}
              fill={verse.palette.accent}>
              major
            </motion.text>
          )}

          {/* Clash waves */}
          {(phase === 'clash' || phase === 'holding') && (
            <>
              {[1, 2].map(i => (
                <motion.path key={i}
                  d={`M 35 ${40 + i * 3} Q 60 ${38 + i * 3} 80 ${40 + i * 3} Q 100 ${42 + i * 3} 125 ${40 + i * 3}`}
                  fill="none" stroke="hsla(0, 20%, 50%, 0.15)" strokeWidth={0.8}
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.15 }}
                />
              ))}
            </>
          )}
        </svg>
      </div>

      {phase === 'clash' && (
        <motion.button onClick={holdChord}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          hold the chord
        </motion.button>
      )}
      {phase === 'holding' && (
        <motion.button onClick={slideNote}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          slide the note
        </motion.button>
      )}
      {phase === 'sliding' && (
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 10, opacity: 0.5 }}>
          resolving...
        </span>
      )}
      {phase === 'resolved' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          resolved
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {phase === 'resolved' ? 'resilience' : 'move through the dissonance'}
      </div>
    </div>
  );
}