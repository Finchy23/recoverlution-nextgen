/**
 * FULCRUM #4 -- 1204. The Gear Ratio (Torque)
 * "Speed kills on the climb. Drop the gear."
 * INTERACTION: Drag down to shift from 5th (stall) to 1st (climb)
 * STEALTH KBE: Pacing -- Adaptive Intensity (E)
 *
 * COMPOSITOR: poetic_precision / Circuit / morning / embodying / drag / 1204
 */
import { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTap,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const GEARS = [
  { label: '5th', torque: 0.1, speed: 1.0 },
  { label: '4th', torque: 0.25, speed: 0.8 },
  { label: '3rd', torque: 0.45, speed: 0.6 },
  { label: '2nd', torque: 0.7, speed: 0.4 },
  { label: '1st', torque: 1.0, speed: 0.2 },
];

export default function Fulcrum_GearRatio({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Circuit',
        chrono: 'morning',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1204,
        isSeal: false,
      }}
      arrivalText="A steep hill. You are in 5th gear."
      prompt="Speed kills on the climb. Drop the gear. Trade velocity for torque. Go slow to go up."
      resonantText="Pacing. The hill did not flatten. Your gear ratio changed. Adaptive intensity means matching your output to the terrain, not to your ego."
      afterglowCoda="Go slow to go up."
      onComplete={onComplete}
    >
      {(verse) => <GearInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function GearInteraction({ verse }: { verse: any }) {
  const [gearIdx, setGearIdx] = useState(0); // 0 = 5th (fast/weak)
  const [climbing, setClimbing] = useState(false);
  const [stalled, setStalled] = useState(false);
  const [climbProgress, setClimbProgress] = useState(0);
  const [done, setDone] = useState(false);
  const isDragging = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const gear = GEARS[gearIdx];
  const isLowEnough = gearIdx >= 3; // 2nd or 1st

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (done) return;
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [done]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || done) return;
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const y = (e.clientY - rect.top) / rect.height;
    const idx = Math.max(0, Math.min(GEARS.length - 1, Math.floor(y * GEARS.length)));
    setGearIdx(idx);
    setStalled(false);
  }, [done]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    if (done) return;

    if (!isLowEnough && gearIdx < 3) {
      setStalled(true);
      setTimeout(() => setStalled(false), 1500);
    } else if (isLowEnough && !climbing) {
      setClimbing(true);
      // Simulate climbing
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.05;
        setClimbProgress(progress);
        if (progress >= 1) {
          clearInterval(interval);
          setDone(true);
          setTimeout(() => verse.advance(), 2200);
        }
      }, 80);
    }
  }, [gearIdx, isLowEnough, climbing, done, verse]);

  const SCENE_W = 240;
  const SCENE_H = 150;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Hill + car scene */}
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Hill slope */}
          <path
            d={`M 10 ${SCENE_H - 10} L ${SCENE_W - 40} 30 L ${SCENE_W - 10} 30 L ${SCENE_W - 10} ${SCENE_H - 10} Z`}
            fill={verse.palette.primaryFaint}
            stroke={verse.palette.primary}
            strokeWidth={0.8}
            opacity={safeOpacity(0.15)}
          />

          {/* Vehicle position on slope */}
          {(() => {
            const t = climbing ? climbProgress : 0;
            const cx = 30 + t * (SCENE_W - 80);
            const cy = SCENE_H - 20 - t * (SCENE_H - 60);
            return (
              <motion.g
                animate={{ x: cx - 20, y: cy - 10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Vehicle body */}
                <rect
                  x={0} y={0} width={18} height={10} rx={3}
                  fill={verse.palette.accent}
                  opacity={safeOpacity(0.4 + climbProgress * 0.3)}
                />
                {/* Wheels */}
                <circle cx={4} cy={12} r={3} fill={verse.palette.primary} opacity={0.3} />
                <circle cx={14} cy={12} r={3} fill={verse.palette.primary} opacity={0.3} />
              </motion.g>
            );
          })()}

          {/* Stall indicator */}
          {stalled && (
            <motion.text
              x={40} y={SCENE_H - 35}
              fill={verse.palette.shadow}
              style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6, x: [38, 42, 38] }}
              transition={{ duration: 0.3, repeat: 2 }}
            >
              stall
            </motion.text>
          )}
        </svg>
      </div>

      {/* Gear shifter */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            ...immersiveTap(verse.palette).zone,
            width: 48,
            height: 120,
            position: 'relative',
            flexDirection: 'column',
            border: `1px solid ${verse.palette.primaryGlow}`,
            borderRadius: 8,
          }}
        >
          {/* Gear positions */}
          {GEARS.map((g, i) => (
            <div key={g.label} style={{
              position: 'absolute',
              top: `${(i / (GEARS.length - 1)) * 100}%`,
              left: -28,
              transform: 'translateY(-50%)',
              ...navicueType.micro,
              color: i === gearIdx ? verse.palette.accent : verse.palette.textFaint,
              opacity: i === gearIdx ? 0.8 : 0.3,
            }}>
              {g.label}
            </div>
          ))}

          {/* Shifter knob */}
          <motion.div
            animate={{ top: `${(gearIdx / (GEARS.length - 1)) * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 20, height: 20, borderRadius: '50%',
              background: verse.palette.accent,
              opacity: safeOpacity(0.5),
              cursor: 'ns-resize',
            }}
          />
        </div>

        {/* Torque / Speed readout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ ...navicueType.micro, color: verse.palette.textFaint, width: 50 }}>torque</span>
            <div style={{ width: 60, height: 3, borderRadius: 2, background: verse.palette.primaryFaint }}>
              <motion.div
                animate={{ width: `${gear.torque * 100}%` }}
                style={{ height: '100%', borderRadius: 2, background: verse.palette.accent, opacity: 0.6 }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ ...navicueType.micro, color: verse.palette.textFaint, width: 50 }}>speed</span>
            <div style={{ width: 60, height: 3, borderRadius: 2, background: verse.palette.primaryFaint }}>
              <motion.div
                animate={{ width: `${gear.speed * 100}%` }}
                style={{ height: '100%', borderRadius: 2, background: verse.palette.primary, opacity: 0.4 }}
              />
            </div>
          </div>
        </div>
      </div>

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'summit'
          : stalled
            ? 'engine stalls in high gear'
            : climbing
              ? `climbing ${Math.round(climbProgress * 100)}%`
              : 'drag down to shift gear'}
      </span>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'adaptive intensity' : 'shift the gear'}
      </div>
    </div>
  );
}
