/**
 * DIPLOMAT #3 -- 1263. The Aikido Blend (Redirection)
 * "Do not stop their energy. Steer it where you want it to go."
 * INTERACTION: Drag with the arrow to redirect it past you
 * STEALTH KBE: Non-Resistance -- Conflict De-escalation (E)
 *
 * COMPOSITOR: sensory_cinema / Drift / work / embodying / drag / 1263
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

export default function Diplomat_AikidoBlend({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Drift',
        chrono: 'work',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1263,
        isSeal: false,
      }}
      arrivalText="An attack approaches."
      prompt="If you block, you crash. If you blend, you control. Do not stop their energy. Steer it where you want it to go."
      resonantText="Non-resistance. You did not block the force. You guided it past you. Conflict de-escalation is aikido for the mind. The energy was never yours to absorb. It was yours to redirect."
      afterglowCoda="Blend, do not block."
      onComplete={onComplete}
    >
      {(verse) => <AikidoBlendInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function AikidoBlendInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'ready' | 'dragging' | 'redirected' | 'done'>('ready');
  const [arrowAngle, setArrowAngle] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 260, H = 180;
  const CENTER_X = W / 2, CENTER_Y = H / 2;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (phase !== 'ready') return;
    setPhase('dragging');
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [phase]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (phase !== 'dragging') return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - CENTER_X;
    const y = e.clientY - rect.top - CENTER_Y;
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    setArrowAngle(angle);
  }, [phase]);

  const handlePointerUp = useCallback(() => {
    if (phase !== 'dragging') return;
    // Success if arrow is steered away (angle > 45 degrees from straight left-to-right)
    const deviation = Math.abs(arrowAngle);
    if (deviation > 35) {
      setPhase('redirected');
      setTimeout(() => {
        setPhase('done');
        setTimeout(() => verse.advance(), 2800);
      }, 1500);
    } else {
      setPhase('ready');
      setArrowAngle(0);
    }
  }, [phase, arrowAngle, verse]);

  // Arrow path: comes from left, curves based on user redirection
  const arrowEndX = phase === 'redirected' || phase === 'done'
    ? CENTER_X + 100 * Math.cos(arrowAngle * Math.PI / 180)
    : W - 30;
  const arrowEndY = phase === 'redirected' || phase === 'done'
    ? CENTER_Y + 100 * Math.sin(arrowAngle * Math.PI / 180)
    : CENTER_Y;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{
        ...navicueInteraction.tapZone,
        width: W, height: H,
        cursor: phase === 'ready' ? 'grab' : phase === 'dragging' ? 'grabbing' : 'default',
        touchAction: 'none',
      }}>
        <svg ref={svgRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* You (center circle) */}
          <motion.circle
            cx={CENTER_X} cy={CENTER_Y} r={16}
            fill={verse.palette.accent}
            animate={{
              opacity: safeOpacity(phase === 'done' ? 0.2 : 0.1),
            }}
          />
          <circle cx={CENTER_X} cy={CENTER_Y} r={16}
            fill="none" stroke={verse.palette.accent}
            strokeWidth={0.5} opacity={safeOpacity(0.3)} />
          <text x={CENTER_X} y={CENTER_Y + 4} textAnchor="middle"
            fill={verse.palette.accent} style={navicueType.micro} opacity={0.5}>
            you
          </text>

          {/* Attack arrow */}
          <motion.g>
            {/* Arrow line */}
            <motion.line
              x1={20} y1={CENTER_Y}
              stroke={phase === 'redirected' || phase === 'done' ? verse.palette.accent : verse.palette.shadow}
              strokeWidth={2}
              strokeLinecap="round"
              animate={{
                x2: arrowEndX,
                y2: arrowEndY,
                opacity: safeOpacity(phase === 'done' ? 0.15 : 0.35),
              }}
              transition={{ duration: phase === 'dragging' ? 0.05 : 0.4 }}
            />

            {/* Arrow head */}
            <motion.path
              fill={phase === 'redirected' || phase === 'done' ? verse.palette.accent : verse.palette.shadow}
              animate={{
                d: (() => {
                  const rad = (arrowAngle || 0) * Math.PI / 180;
                  const tipX = arrowEndX;
                  const tipY = arrowEndY;
                  const sz = 8;
                  const backAngle1 = rad + 2.6;
                  const backAngle2 = rad - 2.6;
                  return `M ${tipX},${tipY} L ${tipX + sz * Math.cos(backAngle1)},${tipY + sz * Math.sin(backAngle1)} L ${tipX + sz * Math.cos(backAngle2)},${tipY + sz * Math.sin(backAngle2)} Z`;
                })(),
                opacity: safeOpacity(phase === 'done' ? 0.15 : 0.3),
              }}
              transition={{ duration: phase === 'dragging' ? 0.05 : 0.4 }}
            />

            {/* Curved redirect trail */}
            {(phase === 'redirected' || phase === 'done') && (
              <motion.path
                d={`M 20,${CENTER_Y} Q ${CENTER_X - 20},${CENTER_Y} ${CENTER_X},${CENTER_Y} Q ${CENTER_X + 20},${CENTER_Y + arrowAngle * 0.3} ${arrowEndX},${arrowEndY}`}
                fill="none"
                stroke={verse.palette.accent}
                strokeWidth={1}
                strokeDasharray="4 3"
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.2) }}
              />
            )}
          </motion.g>

          {/* Step-aside motion hint */}
          {phase === 'ready' && (
            <motion.g
              animate={{ opacity: [0.15, 0.3, 0.15] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <path
                d={`M ${CENTER_X + 25},${CENTER_Y - 15} Q ${CENTER_X + 40},${CENTER_Y} ${CENTER_X + 25},${CENTER_Y + 15}`}
                fill="none" stroke={verse.palette.textFaint}
                strokeWidth={0.8} strokeDasharray="3 2" />
            </motion.g>
          )}

          {/* Flow label */}
          {phase === 'done' && (
            <motion.text
              x={CENTER_X} y={CENTER_Y + 40}
              textAnchor="middle"
              fill={verse.palette.accent}
              style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
            >
              flow
            </motion.text>
          )}
        </svg>
      </div>

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'done' ? 'the force passed through'
          : phase === 'redirected' ? 'redirected...'
            : phase === 'dragging' ? 'guide the arrow past you'
              : 'drag to blend with the attack'}
      </span>

      {phase === 'done' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          conflict de-escalation
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'done' ? 'non-resistance' : 'blend, do not block'}
      </div>
    </div>
  );
}
