/**
 * ANCHOR #1 -- 1291. The Heavy Stone (Gravity)
 * "Drop your awareness into your feet. Become the stone."
 * INTERACTION: Tap to transform feather into stone -- it drops with weight
 * STEALTH KBE: Grounding -- Somatic Grounding (E)
 *
 * COMPOSITOR: sensory_cinema / Pulse / morning / embodying / tap / 1291
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Anchor_HeavyStone({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Pulse',
        chrono: 'morning',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1291,
        isSeal: false,
      }}
      arrivalText="A feather. Drifting."
      prompt="Anxiety is light and fast. Reality is heavy and slow. Add weight. Drop your awareness into your feet. Become the stone."
      resonantText="Grounding. You dropped the feather and became the stone. Somatic grounding is the act of trading lightness for weight, trading drift for impact. The thud is the proof."
      afterglowCoda="Become the stone."
      onComplete={onComplete}
    >
      {(verse) => <HeavyStoneInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function HeavyStoneInteraction({ verse }: { verse: any }) {
  const [dropped, setDropped] = useState(false);
  const [landed, setLanded] = useState(false);

  const handleDrop = () => {
    if (dropped) return;
    setDropped(true);
    setTimeout(() => setLanded(true), 600);
    setTimeout(() => verse.advance(), 3500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 200;
  const CX = W / 2;
  const FLOOR_Y = 165;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* State readout */}
      <motion.span style={{
        ...navicueType.micro,
        color: landed ? verse.palette.accent : verse.palette.textFaint,
      }} animate={{ opacity: 0.5 }}>
        {landed ? 'grounded' : dropped ? 'falling...' : 'drifting'}
      </motion.span>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Floor line */}
          <line x1={30} y1={FLOOR_Y} x2={W - 30} y2={FLOOR_Y}
            stroke={verse.palette.primary} strokeWidth={0.5}
            opacity={safeOpacity(0.1)} />

          {/* FEATHER (before drop) */}
          {!dropped && (
            <motion.g
              animate={{
                y: [0, -8, 0, 5, 0],
                x: [-3, 4, -2, 3, -3],
                rotate: [-5, 5, -3, 4, -5],
              }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              style={{ transformOrigin: `${CX}px 70px` }}
            >
              {/* Feather shape */}
              <path
                d={`M ${CX},45 Q ${CX + 12},55 ${CX + 8},70 Q ${CX + 15},80 ${CX + 5},95
                    L ${CX},90 L ${CX - 5},95 Q ${CX - 15},80 ${CX - 8},70 Q ${CX - 12},55 ${CX},45`}
                fill={verse.palette.primary} opacity={safeOpacity(0.08)} />
              <path
                d={`M ${CX},45 Q ${CX + 12},55 ${CX + 8},70 Q ${CX + 15},80 ${CX + 5},95
                    L ${CX},90 L ${CX - 5},95 Q ${CX - 15},80 ${CX - 8},70 Q ${CX - 12},55 ${CX},45`}
                fill="none" stroke={verse.palette.primary}
                strokeWidth={0.5} opacity={safeOpacity(0.2)} />
              {/* Quill */}
              <line x1={CX} y1={45} x2={CX} y2={95}
                stroke={verse.palette.primary} strokeWidth={0.5}
                opacity={safeOpacity(0.15)} />
              {/* Vanes */}
              {[55, 65, 75, 85].map((y, i) => (
                <line key={i}
                  x1={CX} y1={y}
                  x2={CX + (i % 2 === 0 ? 10 : -10)} y2={y - 3}
                  stroke={verse.palette.primary} strokeWidth={0.3}
                  opacity={safeOpacity(0.1)} />
              ))}
            </motion.g>
          )}

          {/* STONE (after drop) */}
          {dropped && (
            <motion.g
              initial={{ y: -80 }}
              animate={{ y: 0 }}
              transition={{
                duration: 0.5,
                ease: [0.45, 0, 0.85, 0.35], // gravity curve
              }}
            >
              {/* Stone body */}
              <ellipse cx={CX} cy={FLOOR_Y - 18} rx={22} ry={16}
                fill={verse.palette.accent} opacity={safeOpacity(0.12)} />
              <ellipse cx={CX} cy={FLOOR_Y - 18} rx={22} ry={16}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={1} opacity={safeOpacity(0.3)} />

              {/* Stone texture lines */}
              <path d={`M ${CX - 12},${FLOOR_Y - 20} Q ${CX},${FLOOR_Y - 25} ${CX + 10},${FLOOR_Y - 18}`}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.3} opacity={safeOpacity(0.15)} />
              <path d={`M ${CX - 8},${FLOOR_Y - 14} Q ${CX + 5},${FLOOR_Y - 10} ${CX + 15},${FLOOR_Y - 15}`}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.3} opacity={safeOpacity(0.1)} />
            </motion.g>
          )}

          {/* Impact effect */}
          {landed && (
            <motion.g>
              {/* Dust particles */}
              {[-30, -18, -8, 8, 18, 30].map((dx, i) => (
                <motion.circle key={i}
                  cx={CX + dx} r={1.5}
                  fill={verse.palette.accent}
                  initial={{ cy: FLOOR_Y - 5, opacity: 0.3 }}
                  animate={{
                    cy: FLOOR_Y - 15 - Math.abs(dx) * 0.3,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.6, delay: i * 0.03 }}
                />
              ))}

              {/* Impact ring */}
              <motion.ellipse
                cx={CX} cy={FLOOR_Y}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.5}
                initial={{ rx: 5, ry: 2, opacity: 0.3 }}
                animate={{ rx: 50, ry: 8, opacity: 0 }}
                transition={{ duration: 0.8 }}
              />

              {/* Weight lines */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.15) }}
                transition={{ delay: 0.3 }}
              >
                {[0, 1, 2].map(i => (
                  <line key={i}
                    x1={CX} y1={FLOOR_Y - 35 - i * 12}
                    x2={CX} y2={FLOOR_Y - 30 - i * 12}
                    stroke={verse.palette.accent} strokeWidth={1}
                    strokeLinecap="round" />
                ))}
              </motion.g>

              {/* "Thud" text */}
              <motion.text
                x={CX} y={FLOOR_Y + 25}
                textAnchor="middle"
                fill={verse.palette.accent}
                style={navicueType.choice}
                initial={{ opacity: 0, scale: 1.3 }}
                animate={{ opacity: 0.5, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                thud.
              </motion.text>
            </motion.g>
          )}
        </svg>
      </div>

      {!dropped && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleDrop}>
          drop
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {landed ? 'you became the stone'
          : 'anxiety is light. reality is heavy.'}
      </span>

      {landed && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          somatic grounding
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {landed ? 'grounding' : 'add weight'}
      </div>
    </div>
  );
}
