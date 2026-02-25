/**
 * FULCRUM #6 -- 1206. The Screw (The Spiral)
 * "Rotation is slow and irresistible."
 * INTERACTION: Circular drag gesture to turn the screw. It sinks deeper each turn.
 * STEALTH KBE: Consistency -- Iterative Progress (E)
 *
 * COMPOSITOR: witness_ritual / Echo / work / embodying / drag / 1206
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

export default function Fulcrum_Screw({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Echo',
        chrono: 'work',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1206,
        isSeal: false,
      }}
      arrivalText="A nail. A screw. A surface."
      prompt="Impact is violent and weak. Rotation is slow and irresistible. Do not hammer the problem. Screw it in. Turn by turn."
      resonantText="Consistency. Each turn went deeper than the last hammer blow ever could. Iterative progress is not glamorous. It is irresistible."
      afterglowCoda="Turn by turn."
      onComplete={onComplete}
    >
      {(verse) => <ScrewInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ScrewInteraction({ verse }: { verse: any }) {
  const [turns, setTurns] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [done, setDone] = useState(false);
  const [nailBounced, setNailBounced] = useState(false);
  const lastAngleRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const zoneRef = useRef<HTMLDivElement>(null);

  const TARGET_TURNS = 6;
  const depth = Math.min(1, turns / TARGET_TURNS);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (done) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const rect = zoneRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    lastAngleRef.current = Math.atan2(e.clientY - cy, e.clientX - cx);
  }, [done]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (done || lastAngleRef.current === null) return;
    const rect = zoneRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
    let delta = angle - lastAngleRef.current;

    // Normalize delta to [-PI, PI]
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;

    // Only count clockwise rotation (positive delta)
    if (delta > 0) {
      accumulatedRef.current += delta;
      setRotation(prev => prev + (delta * 180) / Math.PI);

      // Each full rotation (2PI) = one turn
      if (accumulatedRef.current >= Math.PI * 2) {
        accumulatedRef.current -= Math.PI * 2;
        setTurns(prev => {
          const next = prev + 1;
          if (next >= TARGET_TURNS) {
            setDone(true);
            setTimeout(() => verse.advance(), 2200);
          }
          return next;
        });
      }
    }

    lastAngleRef.current = angle;
  }, [done, verse]);

  const handlePointerUp = useCallback(() => {
    lastAngleRef.current = null;
  }, []);

  // Nail bounce comparison
  const handleNailTap = () => {
    if (done || nailBounced) return;
    setNailBounced(true);
    setTimeout(() => setNailBounced(false), 1500);
  };

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      <div style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
        {/* Nail (tap to try -- bounces) */}
        <div
          style={{
            ...immersiveTap(verse.palette).zone,
            flexDirection: 'column',
            gap: 4,
            opacity: turns > 0 ? 0.3 : 0.7,
            width: 60,
          }}
          onClick={handleNailTap}
        >
          <svg width={40} height={60} viewBox="0 0 40 60">
            {/* Nail */}
            <motion.g
              animate={nailBounced ? { y: [0, -8, 3, 0], rotate: [0, 15, -10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <rect x={17} y={5} width={6} height={10} rx={1}
                fill={verse.palette.primary} opacity={safeOpacity(0.3)} />
              <rect x={18} y={15} width={4} height={30} rx={0.5}
                fill={verse.palette.primary} opacity={safeOpacity(0.25)} />
              <polygon points="18,45 22,45 20,55"
                fill={verse.palette.primary} opacity={safeOpacity(0.2)} />
            </motion.g>
          </svg>
          <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>
            {nailBounced ? 'bends' : 'nail'}
          </span>
        </div>

        {/* Screw (drag to turn) */}
        <div
          ref={zoneRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            ...immersiveTap(verse.palette).zone,
            flexDirection: 'column',
            gap: 4,
            width: 100,
            height: 100,
            cursor: done ? 'default' : 'grab',
          }}
        >
          <svg width={80} height={80} viewBox="0 0 80 80">
            {/* Screw head (rotates) */}
            <motion.g
              animate={{ rotate: rotation }}
              transition={{ duration: 0 }}
              style={{ transformOrigin: '40px 40px' }}
            >
              <circle cx={40} cy={40} r={18}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={1.5} opacity={safeOpacity(0.4)} />
              {/* Cross slot */}
              <line x1={40} y1={26} x2={40} y2={54}
                stroke={verse.palette.accent} strokeWidth={1}
                opacity={safeOpacity(0.3)} />
              <line x1={26} y1={40} x2={54} y2={40}
                stroke={verse.palette.accent} strokeWidth={1}
                opacity={safeOpacity(0.3)} />
            </motion.g>

            {/* Depth indicator -- screw sinks */}
            <motion.circle
              cx={40} cy={40}
              r={18}
              fill="none"
              stroke={verse.palette.primary}
              strokeWidth={1}
              strokeDasharray={`${depth * 113} 113`}
              opacity={safeOpacity(0.2)}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px' }}
            />
          </svg>
          <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>
            screw
          </span>
        </div>
      </div>

      {/* Status */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <span style={{ ...navicueType.data, color: verse.palette.text }}>
          {turns > 0 ? `turn ${turns} of ${TARGET_TURNS}` : ''}
        </span>
        <span style={navicueStyles.interactionHint(verse.palette)}>
          {done
            ? 'irresistible'
            : turns === 0
              ? 'drag clockwise to turn the screw'
              : `depth ${Math.round(depth * 100)}%`}
        </span>
      </div>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          iterative progress
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'consistency' : 'turn by turn'}
      </div>
    </div>
  );
}
