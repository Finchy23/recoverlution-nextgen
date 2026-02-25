/**
 * VECTOR #4 -- 1184. The Cross Product (Torque)
 * "Apply the torque where it counts. Find the handle."
 * INTERACTION: Heavy door. Push near hinge = hard. Move push point to handle = easy. Door swings.
 * STEALTH KBE: Leverage -- strategic application (K)
 *
 * COMPOSITOR: pattern_glitch / Drift / work / knowing / tap / 1184
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const PUSH_POINTS = [
  { label: 'hinge', x: 30, effort: 'impossible' },
  { label: 'middle', x: 70, effort: 'hard' },
  { label: 'handle', x: 120, effort: 'easy' },
];

export default function Vector_CrossProduct({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Drift',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1184,
        isSeal: false,
      }}
      arrivalText="A heavy door."
      prompt="Force applied at the wrong point is wasted. Apply the torque where it counts. Find the handle."
      resonantText="Leverage. The force was the same. The position changed everything. Push at the hinge: nothing. Push at the handle: the world opens. Strategic application is about where, not how much."
      afterglowCoda="Open."
      onComplete={onComplete}
    >
      {(verse) => <CrossProductInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CrossProductInteraction({ verse }: { verse: any }) {
  const [pushIdx, setPushIdx] = useState(0);
  const [pushing, setPushing] = useState(false);
  const [done, setDone] = useState(false);

  const push = useCallback(() => {
    if (done || pushing) return;
    setPushing(true);

    if (pushIdx === 2) {
      // Handle -- door opens
      setDone(true);
      setTimeout(() => verse.advance(), 2200);
    } else {
      // Not enough leverage -- move to next point
      setTimeout(() => {
        setPushing(false);
        setPushIdx(prev => Math.min(2, prev + 1));
      }, 800);
    }
  }, [done, pushing, pushIdx, verse]);

  const currentPoint = PUSH_POINTS[pushIdx];
  const doorAngle = done ? 70 : pushing && pushIdx < 2 ? 3 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 90)}>
        <svg viewBox="0 0 160 90" style={navicueStyles.heroSvg}>
          {/* Hinge */}
          <circle cx={25} cy={45} r={3}
            fill={verse.palette.primaryGlow} opacity={0.2} />

          {/* Door (rotates from hinge) */}
          <motion.line
            x1={25} y1={45}
            x2={25 + Math.cos((doorAngle * Math.PI) / 180) * 110}
            y2={45 - Math.sin((doorAngle * Math.PI) / 180) * 110}
            animate={{
              x1: 25, y1: 45,
              x2: 25 + Math.cos((doorAngle * Math.PI) / 180) * 110,
              y2: 45 - Math.sin((doorAngle * Math.PI) / 180) * 110,
            }}
            stroke={done ? verse.palette.accent : 'hsla(30, 15%, 45%, 0.4)'}
            strokeWidth={6} strokeLinecap="round"
            transition={{ type: 'spring', stiffness: 60 }}
          />

          {/* Push point indicator */}
          {!done && (
            <motion.circle
              cx={currentPoint.x} cy={pushing ? 43 : 45}
              animate={{ cx: currentPoint.x, cy: pushing ? 43 : 45 }}
              r={4}
              fill={pushing ? 'hsla(0, 30%, 50%, 0.4)' : 'hsla(200, 30%, 55%, 0.4)'}
              stroke={verse.palette.primaryGlow} strokeWidth={0.5}
            />
          )}

          {/* Push arrow */}
          {!done && (
            <motion.path
              d={`M ${currentPoint.x} ${pushing ? 33 : 35} L ${currentPoint.x} ${pushing ? 28 : 30}`}
              animate={{
                d: `M ${currentPoint.x} ${pushing ? 33 : 35} L ${currentPoint.x} ${pushing ? 28 : 30}`,
              }}
              fill="none"
              stroke={pushing && pushIdx < 2 ? 'hsla(0, 30%, 50%, 0.4)' : 'hsla(200, 30%, 55%, 0.4)'}
              strokeWidth={2} strokeLinecap="round"
              markerEnd=""
            />
          )}

          {/* Labels */}
          {PUSH_POINTS.map((pt, i) => (
            <text key={i} x={pt.x} y={75} textAnchor="middle"
              style={{ ...navicueType.micro }}
              fill={i === pushIdx && !done ? verse.palette.textFaint : verse.palette.textFaint}
              opacity={i === pushIdx && !done ? 0.4 : 0.15}>
              {pt.label}
            </text>
          ))}

          {/* Torque readout */}
          <text x={140} y={15} textAnchor="end"
            style={{ ...navicueType.hint, fontSize: 8 }}
            fill={done ? verse.palette.accent : verse.palette.textFaint} opacity={0.4}>
            torque: {done ? 'max' : currentPoint.effort}
          </text>

          {/* Effort feedback */}
          {pushing && !done && pushIdx < 2 && (
            <text x={currentPoint.x} y={20} textAnchor="middle"
              style={{ ...navicueType.micro }}
              fill="hsla(0, 30%, 50%, 0.4)">
              {currentPoint.effort}
            </text>
          )}
        </svg>
      </div>

      {!done ? (
        <motion.button onClick={push}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          push at {currentPoint.label}
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          open
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'strategic application' : 'find the leverage point'}
      </div>
    </div>
  );
}