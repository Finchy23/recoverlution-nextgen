/**
 * VECTOR #5 -- 1185. The Dot Product (Projection)
 * "Align your vector. Maximize the projection."
 * INTERACTION: Sun overhead. Walking sideways. Shadow short. Turn toward sun. Shadow vanishes. Aligned.
 * STEALTH KBE: Alignment -- focus (B)
 *
 * COMPOSITOR: koan_paradox / Drift / work / believing / tap / 1185
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Vector_DotProduct({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Drift',
        chrono: 'work',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1185,
        isSeal: false,
      }}
      arrivalText="Walking sideways. The goal is overhead."
      prompt="Are you working toward the goal or just near the goal? Align your vector. Maximize the projection."
      resonantText="Alignment. Your shadow told the truth. Walking sideways, it was long: effort without alignment. Facing the goal, it vanished. Focus is not proximity. It is angle."
      afterglowCoda="Aligned."
      onComplete={onComplete}
    >
      {(verse) => <DotProductInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function DotProductInteraction({ verse }: { verse: any }) {
  const [angle, setAngle] = useState(75); // degrees off from goal
  const [done, setDone] = useState(false);
  const ANGLE_STEPS = [75, 50, 25, 0];
  const [stepIdx, setStepIdx] = useState(0);

  const align = useCallback(() => {
    if (done) return;
    const nextIdx = stepIdx + 1;
    if (nextIdx >= ANGLE_STEPS.length) {
      setAngle(0);
      setDone(true);
      setTimeout(() => verse.advance(), 2200);
    } else {
      setStepIdx(nextIdx);
      setAngle(ANGLE_STEPS[nextIdx]);
    }
  }, [done, stepIdx, verse]);

  const shadowLen = Math.sin((angle * Math.PI) / 180) * 35;
  const projPct = Math.cos((angle * Math.PI) / 180);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 100)}>
        <svg viewBox="0 0 160 100" style={navicueStyles.heroSvg}>
          {/* Sun (Goal) */}
          <circle cx={80} cy={12} r={6}
            fill={done ? verse.palette.accent : 'hsla(45, 40%, 55%, 0.3)'}
            opacity={0.4} />
          <text x={80} y={6} textAnchor="middle"
            style={{ ...navicueType.micro }}
            fill={verse.palette.textFaint} opacity={0.3}>
            goal
          </text>

          {/* Walking person */}
          <motion.g animate={{ x: 0 }}>
            {/* Body */}
            <circle cx={80} cy={55} r={3}
              fill={done ? verse.palette.accent : 'hsla(0, 0%, 50%, 0.3)'} opacity={0.4} />

            {/* Direction arrow (rotates with angle) */}
            <motion.line
              animate={{
                x1: 80, y1: 55,
                x2: 80 + Math.sin((angle * Math.PI) / 180) * 18,
                y2: 55 - Math.cos((angle * Math.PI) / 180) * 18,
              }}
              stroke={done ? verse.palette.accent : 'hsla(200, 30%, 55%, 0.4)'}
              strokeWidth={1.5} strokeLinecap="round"
            />
          </motion.g>

          {/* Shadow (perpendicular to goal direction) */}
          <motion.line
            animate={{
              x1: 80 - shadowLen, y1: 72,
              x2: 80 + shadowLen, y2: 72,
            }}
            stroke="hsla(0, 0%, 30%, 0.15)" strokeWidth={3} strokeLinecap="round"
          />
          {shadowLen > 5 && (
            <text x={80} y={82} textAnchor="middle"
              style={{ ...navicueType.micro }}
              fill={verse.palette.textFaint} opacity={0.25}>
              shadow
            </text>
          )}

          {/* Projection readout */}
          <text x={15} y={92}
            style={{ ...navicueType.hint, fontSize: 8 }}
            fill={done ? verse.palette.accent : verse.palette.textFaint} opacity={0.4}>
            projection: {(projPct * 100).toFixed(0)}%
          </text>

          {/* Angle readout */}
          <text x={145} y={92} textAnchor="end"
            style={{ ...navicueType.hint, fontSize: 8 }}
            fill={verse.palette.textFaint} opacity={0.3}>
            {angle}° off
          </text>
        </svg>
      </div>

      {!done ? (
        <motion.button onClick={align}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          align toward goal
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          aligned
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'focus' : 'maximize the projection'}
      </div>
    </div>
  );
}