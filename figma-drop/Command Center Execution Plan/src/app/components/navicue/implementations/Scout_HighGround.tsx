/**
 * SCOUT #3 -- 1273. The High Ground
 * "Elevation restores orientation. Climb."
 * INTERACTION: Drag upward to climb -- view shifts from jungle chaos to clear top-down map
 * STEALTH KBE: Perspective -- Macro-Thinking (E)
 *
 * COMPOSITOR: witness_ritual / Arc / work / embodying / drag / 1273
 */
import { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  navicueInteraction,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Scout_HighGround({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Arc',
        chrono: 'work',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1273,
        isSeal: false,
      }}
      arrivalText="Jungle. Chaos. No direction."
      prompt="The weeds are confusing. Get above the problem. Elevation restores orientation. Climb."
      resonantText="Perspective. You climbed above the tangle and the exit appeared. Macro-thinking is the discipline of altitude. The weeds are only confusing at ground level."
      afterglowCoda="Climb."
      onComplete={onComplete}
    >
      {(verse) => <HighGroundInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function HighGroundInteraction({ verse }: { verse: any }) {
  const [elevation, setElevation] = useState(0); // 0 = ground, 1 = top
  const [done, setDone] = useState(false);
  const dragging = useRef(false);
  const startY = useRef(0);

  const W = 260, H = 200;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (done) return;
    dragging.current = true;
    startY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [done]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || done) return;
    const dy = startY.current - e.clientY; // Positive = dragging up
    const newElev = Math.max(0, Math.min(1, dy / 150));
    setElevation(newElev);
  }, [done]);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
    if (elevation > 0.8) {
      setElevation(1);
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    } else {
      setElevation(0);
    }
  }, [elevation, verse]);

  // Interpolations
  const treeScale = 1 - elevation * 0.7;
  const mapOpacity = elevation;
  const chaosOpacity = 1 - elevation;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>altitude</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? 'summit' : `${Math.round(elevation * 100)}%`}
        </motion.span>
      </div>

      <div style={{
        ...navicueInteraction.tapZone,
        width: W, height: H,
        cursor: done ? 'default' : 'grab',
        touchAction: 'none',
      }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Ground-level chaos: tangled lines (jungle) */}
          <motion.g animate={{ opacity: chaosOpacity * 0.3 }}>
            {Array.from({ length: 15 }).map((_, i) => {
              const x = 20 + (i % 5) * 50;
              const y = 30 + Math.floor(i / 5) * 55;
              return (
                <motion.path key={i}
                  d={`M ${x},${y + 20} Q ${x + 10},${y - 10} ${x + 5},${y - 20} Q ${x + 15},${y - 30} ${x + 20},${y - 15}`}
                  fill="none"
                  stroke={verse.palette.primary}
                  strokeWidth={1.5}
                  animate={{ scale: treeScale }}
                  style={{ transformOrigin: `${x + 10}px ${y}px` }}
                />
              );
            })}
          </motion.g>

          {/* "Lost" marker at ground level */}
          <motion.text
            x={W / 2} y={H / 2 + 10}
            textAnchor="middle"
            fill={verse.palette.shadow}
            style={navicueType.choice}
            animate={{ opacity: chaosOpacity * 0.4 }}
          >
            {elevation < 0.3 ? 'lost in the weeds' : ''}
          </motion.text>

          {/* Top-down map (fades in at elevation) */}
          <motion.g animate={{ opacity: mapOpacity }}>
            {/* Grid */}
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={`gh-${i}`}
                x1={30} y1={30 + i * 28} x2={W - 30} y2={30 + i * 28}
                stroke={verse.palette.accent} strokeWidth={0.3}
                opacity={safeOpacity(0.15)} />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={`gv-${i}`}
                x1={30 + i * 40} y1={30} x2={30 + i * 40} y2={H - 30}
                stroke={verse.palette.accent} strokeWidth={0.3}
                opacity={safeOpacity(0.15)} />
            ))}

            {/* "You" marker */}
            <circle cx={W / 2} cy={H / 2} r={4}
              fill={verse.palette.accent} opacity={safeOpacity(0.4)} />

            {/* Exit path */}
            <path
              d={`M ${W / 2},${H / 2} L ${W / 2 + 20},${H / 2 - 15} L ${W / 2 + 50},${H / 2 - 40} L ${W - 35},${35}`}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={1.5} strokeDasharray="5 3"
              opacity={safeOpacity(0.35)} />

            {/* North indicator */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: mapOpacity > 0.5 ? 0.5 : 0 }}
            >
              <line x1={W - 30} y1={45} x2={W - 30} y2={25}
                stroke={verse.palette.accent} strokeWidth={1} />
              <path d={`M ${W - 33},30 L ${W - 30},22 L ${W - 27},30`}
                fill={verse.palette.accent} opacity={0.5} />
              <text x={W - 30} y={55} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.micro} opacity={0.4}>
                N
              </text>
            </motion.g>

            {/* Exit marker */}
            <motion.circle
              cx={W - 35} cy={35} r={6}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={1}
              animate={{
                opacity: mapOpacity > 0.7 ? [safeOpacity(0.2), safeOpacity(0.4), safeOpacity(0.2)] : 0,
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </motion.g>

          {/* Drag hint */}
          {!done && elevation < 0.1 && (
            <motion.g
              animate={{ opacity: [0.15, 0.3, 0.15], y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <line x1={W / 2} y1={H - 20} x2={W / 2} y2={H - 35}
                stroke={verse.palette.textFaint} strokeWidth={1} />
              <path d={`M ${W / 2 - 4},${H - 32} L ${W / 2},${H - 38} L ${W / 2 + 4},${H - 32}`}
                fill={verse.palette.textFaint} />
            </motion.g>
          )}
        </svg>
      </div>

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the exit was always there'
          : elevation > 0.3 ? 'the map is forming...'
            : 'drag upward to climb'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          macro-thinking
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'perspective' : 'get above the problem'}
      </div>
    </div>
  );
}
