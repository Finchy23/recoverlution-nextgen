/**
 * ANCHOR #6 -- 1296. The Center of Mass (Gut)
 * "Drop your center to your hara. The lower you are, the harder you are to throw."
 * INTERACTION: Drag the center dot from head to belly -- stability increases
 * STEALTH KBE: Centering -- Embodiment (E)
 *
 * COMPOSITOR: sacred_ordinary / Pulse / morning / embodying / drag / 1296
 */
import { useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  navicueInteraction,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Anchor_CenterOfMass({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Pulse',
        chrono: 'morning',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1296,
        isSeal: false,
      }}
      arrivalText="Top-heavy. Overthinking."
      prompt="Get out of your head. It is too high up. Drop your center to your hara. The lower you are, the harder you are to throw."
      resonantText="Centering. You dragged the center down and became immovable. Embodiment is the art of sinking your awareness out of the spinning mind and into the still belly."
      afterglowCoda="Drop your center."
      onComplete={onComplete}
    >
      {(verse) => <CenterOfMassInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CenterOfMassInteraction({ verse }: { verse: any }) {
  const [centerY, setCenterY] = useState(0.2); // 0 = top (head), 1 = bottom (gut)
  const [done, setDone] = useState(false);
  const dragging = useRef(false);
  const containerRef = useRef<SVGSVGElement>(null);

  const W = 180, H = 240;
  const FIGURE_TOP = 30, FIGURE_BOT = 200;
  const CX = W / 2;

  // Figure proportions
  const HEAD_Y = 50;
  const BELLY_Y = 130;
  const FEET_Y = 195;

  // Center dot position
  const dotY = HEAD_Y + centerY * (BELLY_Y - HEAD_Y);

  // Tilt based on center height: high = wobbly, low = stable
  const wobble = Math.max(0, (1 - centerY) * 12);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (done) return;
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [done]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || done || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relY = (e.clientY - rect.top) / rect.height;
    const mapped = Math.max(0, Math.min(1, (relY - 0.15) / 0.45));
    setCenterY(mapped);
  }, [done]);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
    if (centerY > 0.85) {
      setCenterY(1);
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }
  }, [centerY, verse]);

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>center</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? 'hara' : centerY < 0.3 ? 'head' : centerY < 0.7 ? 'chest' : 'belly'}
        </motion.span>
      </div>

      <div style={{
        ...navicueInteraction.tapZone,
        width: W, height: H,
        cursor: done ? 'default' : 'grab',
        touchAction: 'none',
      }}>
        <svg ref={containerRef}
          width={W} height={H} viewBox={`0 0 ${W} ${H}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Floor */}
          <line x1={30} y1={FEET_Y + 5} x2={W - 30} y2={FEET_Y + 5}
            stroke={verse.palette.primary} strokeWidth={0.5}
            opacity={safeOpacity(0.1)} />

          {/* Figure -- wobbles when top-heavy */}
          <motion.g
            animate={{
              rotate: done ? 0 : wobble > 2 ? [0, wobble, -wobble * 0.8, wobble * 0.5, 0] : 0,
            }}
            transition={wobble > 2 ? { repeat: Infinity, duration: 1.5 } : {}}
            style={{ transformOrigin: `${CX}px ${FEET_Y}px` }}
          >
            {/* Head */}
            <circle cx={CX} cy={HEAD_Y} r={14}
              fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
            <circle cx={CX} cy={HEAD_Y} r={14}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={0.8} opacity={safeOpacity(0.15)} />

            {/* Torso */}
            <line x1={CX} y1={HEAD_Y + 14} x2={CX} y2={BELLY_Y + 20}
              stroke={verse.palette.primary} strokeWidth={2}
              opacity={safeOpacity(0.12)} strokeLinecap="round" />

            {/* Arms */}
            <line x1={CX - 25} y1={90} x2={CX + 25} y2={90}
              stroke={verse.palette.primary} strokeWidth={1.5}
              opacity={safeOpacity(0.1)} strokeLinecap="round" />

            {/* Legs */}
            <line x1={CX} y1={BELLY_Y + 20} x2={CX - 15} y2={FEET_Y}
              stroke={verse.palette.primary} strokeWidth={1.5}
              opacity={safeOpacity(0.1)} strokeLinecap="round" />
            <line x1={CX} y1={BELLY_Y + 20} x2={CX + 15} y2={FEET_Y}
              stroke={verse.palette.primary} strokeWidth={1.5}
              opacity={safeOpacity(0.1)} strokeLinecap="round" />

            {/* Center of mass dot */}
            <motion.g>
              <motion.circle
                cx={CX} r={18}
                fill={verse.palette.accent}
                animate={{
                  cy: dotY,
                  opacity: safeOpacity(done ? 0.1 : 0.06),
                }}
                transition={{ duration: 0.2 }}
              />
              <motion.circle
                cx={CX} r={7}
                fill={done ? verse.palette.accent : verse.palette.accent}
                animate={{
                  cy: dotY,
                  opacity: safeOpacity(done ? 0.4 : 0.25),
                }}
                transition={{ duration: 0.2 }}
              />
              <motion.circle
                cx={CX} r={7}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.5}
                animate={{
                  cy: dotY,
                  opacity: safeOpacity(0.4),
                }}
                transition={{ duration: 0.2 }}
              />
            </motion.g>

            {/* Stability indicator lines at feet */}
            {done && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.2) }}
                transition={{ delay: 0.3 }}
              >
                <line x1={CX - 30} y1={FEET_Y + 3} x2={CX + 30} y2={FEET_Y + 3}
                  stroke={verse.palette.accent} strokeWidth={2}
                  strokeLinecap="round" />
              </motion.g>
            )}
          </motion.g>

          {/* Zone labels */}
          <text x={W - 10} y={HEAD_Y + 4} textAnchor="end"
            fill={verse.palette.textFaint} style={navicueType.micro} opacity={0.2}>
            head
          </text>
          <text x={W - 10} y={BELLY_Y + 4} textAnchor="end"
            fill={done ? verse.palette.accent : verse.palette.textFaint}
            style={navicueType.micro} opacity={done ? 0.4 : 0.2}>
            hara
          </text>

          {/* Drag hint */}
          {!done && centerY < 0.3 && (
            <motion.g
              animate={{ opacity: [0.15, 0.3, 0.15], y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <line x1={CX + 25} y1={HEAD_Y + 20} x2={CX + 25} y2={BELLY_Y}
                stroke={verse.palette.textFaint} strokeWidth={0.5}
                strokeDasharray="2 2" />
              <path d={`M ${CX + 22},${BELLY_Y - 5} L ${CX + 25},${BELLY_Y} L ${CX + 28},${BELLY_Y - 5}`}
                fill={verse.palette.textFaint} />
            </motion.g>
          )}
        </svg>
      </div>

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'immovable'
          : centerY < 0.3 ? 'drag the center down'
            : 'lower... to the belly'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          embodiment
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'centering' : 'get out of your head'}
      </div>
    </div>
  );
}
