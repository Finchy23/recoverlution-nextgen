/**
 * KINETICIST #7 -- 1117. The Vector Addition
 * "Aim into the wind."
 * INTERACTION: Drag arrow to compensate for crosswind drift -- arrow must point NW to travel N
 * STEALTH KBE: Strategic Adjustment -- adaptive planning (K)
 *
 * COMPOSITOR: poetic_precision / Storm / social / knowing / drag / 1117
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Kineticist_VectorAddition({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Storm',
        chrono: 'social',
        kbe: 'k',
        hook: 'drag',
        specimenSeed: 1117,
        isSeal: false,
      }}
      arrivalText="Wind blowing East. Goal is North."
      prompt="The world will push you sideways. Compensate. If you aim directly at the goal, you will miss. Aim into the wind."
      resonantText="Strategic Adjustment. You did not fight the wind. You calculated it. The path looked wrong, but the destination was right. Adaptive planning is the geometry of wisdom."
      afterglowCoda="Compensated."
      onComplete={onComplete}
    >
      {(verse) => <VectorAdditionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function VectorAdditionInteraction({ verse }: { verse: any }) {
  const [aimAngle, setAimAngle] = useState(-90); // degrees, -90 = straight up (North)
  const [locked, setLocked] = useState(false);
  const [holdTime, setHoldTime] = useState(0);
  const WIND_ANGLE = 25; // degrees eastward
  const TARGET_AIM = -90 - WIND_ANGLE; // must aim NW to compensate
  const TOLERANCE = 8;
  const HOLD_TARGET = 2.5;

  const cx = 90, cy = 90;
  const arrowLen = 50;
  const inZone = Math.abs(aimAngle - TARGET_AIM) < TOLERANCE;

  // Resulting vector (aim + wind)
  const resultAngle = aimAngle + WIND_ANGLE;
  const resultRad = (resultAngle * Math.PI) / 180;
  const aimRad = (aimAngle * Math.PI) / 180;
  const windRad = (0 * Math.PI) / 180; // wind blows East (0 degrees)

  // Track hold in zone
  useEffect(() => {
    if (locked) return;
    if (!inZone) { setHoldTime(0); return; }
    const interval = setInterval(() => {
      setHoldTime(prev => {
        const next = prev + 0.1;
        if (next >= HOLD_TARGET) {
          setLocked(true);
          clearInterval(interval);
          setTimeout(() => verse.advance(), 2000);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [inZone, locked, verse]);

  const handleDrag = useCallback((_: any, info: any) => {
    if (locked) return;
    setAimAngle(prev => prev + info.delta.x * -0.5);
  }, [locked]);

  const resultNorth = Math.abs(resultAngle + 90) < TOLERANCE + 5;

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 180 / 180)}>
        <svg viewBox="0 0 180 180" style={navicueStyles.heroSvg}>
          {/* Compass circle */}
          <circle
            cx={cx} cy={cy}
            r={65}
            stroke="hsla(0, 0%, 0%, 0.15)"
            strokeWidth={1}
            fill="none"
          />

          {/* N marker */}
          <text
            x={cx} y={cy - 75}
            fill={resultNorth ? verse.palette.accent : verse.palette.textFaint}
            fontSize={10}
            textAnchor="middle"
            opacity={resultNorth ? 0.8 : 0.3}
          >
            N
          </text>

          {/* Wind arrow (East) */}
          <line
            x1={cx} y1={cy}
            x2={cx + 30} y2={cy}
            stroke="hsla(40, 50%, 55%, 0.3)"
            strokeWidth={1.5}
            markerEnd="url(#windHead)"
          />
          <defs>
            <marker id="windHead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="hsla(40, 50%, 55%, 0.3)" />
            </marker>
          </defs>
          <text
            x={cx + 35} y={cy - 6}
            fill="hsla(40, 50%, 55%, 0.4)"
            fontSize={8}
            textAnchor="start"
          >
            wind
          </text>

          {/* Aim arrow (draggable) */}
          <line
            x1={cx} y1={cy}
            x2={cx + Math.cos(aimRad) * arrowLen}
            y2={cy + Math.sin(aimRad) * arrowLen}
            stroke={inZone ? verse.palette.accent : verse.palette.textFaint}
            strokeWidth={2}
            opacity={0.6}
          />

          {/* Result arrow */}
          <line
            x1={cx} y1={cy}
            x2={cx + Math.cos(resultRad) * 35}
            y2={cy + Math.sin(resultRad) * 35}
            stroke={resultNorth ? 'hsla(120, 30%, 50%, 0.5)' : 'hsla(0, 30%, 50%, 0.3)'}
            strokeWidth={1.5}
            strokeDasharray="4,3"
          />

          {/* Drag handle */}
          {!locked && (
            <motion.circle
              drag="x"
              dragConstraints={{ left: -80, right: 80 }}
              dragElastic={0}
              dragMomentum={false}
              onDrag={handleDrag}
              cx={cx + Math.cos(aimRad) * arrowLen}
              cy={cy + Math.sin(aimRad) * arrowLen}
              r={10}
              fill="none"
              stroke={inZone ? verse.palette.accent : verse.palette.primaryGlow}
              strokeWidth={1}
              cursor="grab"
              touchAction="none"
              opacity={0.4}
            />
          )}
        </svg>
      </div>

      {/* Status */}
      {locked ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}
        >
          on target
        </motion.div>
      ) : (
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
          {inZone ? 'hold this angle...' : 'aim into the wind'}
        </span>
      )}

      {inZone && !locked && (
        <div style={{ width: 60, height: 2, borderRadius: 1, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${(holdTime / HOLD_TARGET) * 100}%` }}
            style={{ height: '100%', background: verse.palette.accent, borderRadius: 1 }}
          />
        </div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {locked ? 'adaptive planning' : resultNorth ? 'heading north' : 'drifting'}
      </div>
    </div>
  );
}