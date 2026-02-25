/**
 * SOVEREIGN #9 -- 1379. The Rebellion (Shadow)
 * "Invite the shadow back to the table."
 * INTERACTION: Locked basement. Banging. Open the door. Invite them to dinner. Peace.
 * STEALTH KBE: Integration -- Wholeness (B)
 *
 * COMPOSITOR: witness_ritual / Arc / night / believing / tap / 1379
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Sovereign_Rebellion({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Arc',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1379,
        isSeal: false,
      }}
      arrivalText="The basement is locked. Something bangs."
      prompt="The exiled parts of the kingdom will turn into rebels. Invite the shadow back to the table. Give it a job."
      resonantText="Integration. You opened the door and invited the shadow to dinner. Wholeness: the parts of yourself you lock away do not disappear. They grow louder. The only peace is to set a place at the table."
      afterglowCoda="Set a place at the table."
      onComplete={onComplete}
    >
      {(verse) => <RebellionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function RebellionInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'locked' | 'opening' | 'shadow' | 'dinner' | 'peace'>('locked');

  const handleOpen = () => {
    if (phase !== 'locked') return;
    setPhase('opening');
    setTimeout(() => setPhase('shadow'), 800);
  };

  const handleInvite = () => {
    if (phase !== 'shadow') return;
    setPhase('dinner');
    setTimeout(() => {
      setPhase('peace');
      setTimeout(() => verse.advance(), 3000);
    }, 1500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;
  const CX = W / 2, CY = H / 2;

  // Basement door
  const DOOR_X = CX - 15, DOOR_Y = CY - 10;
  const DOOR_W = 30, DOOR_H = 45;

  // Table (appears for dinner)
  const TABLE_Y = CY + 5;

  const doorOpen = phase !== 'locked';
  const atTable = phase === 'dinner' || phase === 'peace';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>shadow</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'peace' ? verse.palette.accent
            : phase === 'shadow' ? verse.palette.shadow : verse.palette.text,
        }}>
          {phase === 'peace' ? 'integrated'
            : atTable ? 'at the table'
              : phase === 'shadow' ? 'exposed'
                : phase === 'opening' ? 'opening...'
                  : 'exiled'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Before dinner: basement scene */}
          {!atTable && (
            <g>
              {/* Basement area */}
              <rect x={CX - 50} y={CY - 20} width={100} height={70} rx={3}
                fill={verse.palette.primary} opacity={safeOpacity(0.03)} />

              {/* Door */}
              <motion.rect
                x={DOOR_X} y={DOOR_Y}
                width={DOOR_W} height={DOOR_H} rx={2}
                fill={verse.palette.primary}
                animate={{
                  opacity: safeOpacity(doorOpen ? 0.02 : 0.08),
                  scaleX: doorOpen ? 0.3 : 1,
                }}
                style={{ transformOrigin: `${DOOR_X}px ${DOOR_Y + DOOR_H / 2}px` }}
                transition={{ duration: 0.5 }}
              />
              <motion.rect
                x={DOOR_X} y={DOOR_Y}
                width={DOOR_W} height={DOOR_H} rx={2}
                fill="none" stroke={verse.palette.primary}
                strokeWidth={1}
                animate={{
                  opacity: safeOpacity(0.15),
                  scaleX: doorOpen ? 0.3 : 1,
                }}
                style={{ transformOrigin: `${DOOR_X}px ${DOOR_Y + DOOR_H / 2}px` }}
                transition={{ duration: 0.5 }}
              />

              {/* Door handle */}
              {!doorOpen && (
                <circle cx={DOOR_X + DOOR_W - 6} cy={DOOR_Y + DOOR_H / 2}
                  r={2} fill={verse.palette.primary} opacity={safeOpacity(0.1)} />
              )}

              {/* Banging animation (locked) */}
              {phase === 'locked' && (
                <motion.g
                  animate={{ x: [-2, 2, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 0.3, repeatDelay: 1 }}
                >
                  <text x={CX} y={DOOR_Y - 5} textAnchor="middle"
                    fill={verse.palette.shadow} style={{ fontSize: '8px' }} opacity={0.2}>
                    bang. bang.
                  </text>
                </motion.g>
              )}

              {/* Shadow figure (emerging from behind door) */}
              {phase === 'shadow' && (
                <motion.g
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <circle cx={CX} cy={CY + 5} r={10}
                    fill={verse.palette.shadow} opacity={safeOpacity(0.08)} />
                  <line x1={CX} y1={CY + 15} x2={CX} y2={CY + 30}
                    stroke={verse.palette.shadow} strokeWidth={2}
                    opacity={safeOpacity(0.08)} />
                  <text x={CX} y={CY + 42} textAnchor="middle"
                    fill={verse.palette.shadow} style={{ fontSize: '7px' }} opacity={0.2}>
                    the shadow
                  </text>
                </motion.g>
              )}

              {/* Stairs label */}
              <text x={CX} y={CY + 60} textAnchor="middle"
                fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.12}>
                basement
              </text>
            </g>
          )}

          {/* Dinner table scene */}
          {atTable && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Table */}
              <rect x={CX - 50} y={TABLE_Y} width={100} height={8} rx={2}
                fill={verse.palette.primary} opacity={safeOpacity(0.1)} />
              {/* Table legs */}
              <line x1={CX - 40} y1={TABLE_Y + 8} x2={CX - 40} y2={TABLE_Y + 25}
                stroke={verse.palette.primary} strokeWidth={2}
                opacity={safeOpacity(0.06)} />
              <line x1={CX + 40} y1={TABLE_Y + 8} x2={CX + 40} y2={TABLE_Y + 25}
                stroke={verse.palette.primary} strokeWidth={2}
                opacity={safeOpacity(0.06)} />

              {/* You (left of table) */}
              <circle cx={CX - 25} cy={TABLE_Y - 20} r={8}
                fill={verse.palette.primary} opacity={safeOpacity(0.1)} />
              <text x={CX - 25} y={TABLE_Y - 30} textAnchor="middle"
                fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
                you
              </text>

              {/* Shadow (right of table, joining) */}
              <motion.circle cx={CX + 25} cy={TABLE_Y - 20} r={8}
                fill={phase === 'peace' ? verse.palette.accent : verse.palette.shadow}
                animate={{
                  opacity: safeOpacity(phase === 'peace' ? 0.15 : 0.08),
                }}
              />
              <text x={CX + 25} y={TABLE_Y - 30} textAnchor="middle"
                fill={phase === 'peace' ? verse.palette.accent : verse.palette.shadow}
                style={{ fontSize: '7px' }}
                opacity={phase === 'peace' ? 0.3 : 0.2}>
                shadow
              </text>

              {/* Place settings */}
              {[-25, 25].map((dx, i) => (
                <g key={i}>
                  <circle cx={CX + dx} cy={TABLE_Y - 2} r={3}
                    fill="none"
                    stroke={i === 1 && phase === 'peace' ? verse.palette.accent : verse.palette.primary}
                    strokeWidth={0.5}
                    opacity={safeOpacity(0.12)} />
                </g>
              ))}

              {/* Connection line (peace) */}
              {phase === 'peace' && (
                <motion.line
                  x1={CX - 17} y1={TABLE_Y - 20}
                  x2={CX + 17} y2={TABLE_Y - 20}
                  stroke={verse.palette.accent} strokeWidth={0.8}
                  strokeDasharray="3 3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: safeOpacity(0.2) }}
                  transition={{ delay: 0.3 }}
                />
              )}

              {/* Peace text */}
              {phase === 'peace' && (
                <motion.text
                  x={CX} y={H - 10} textAnchor="middle"
                  fill={verse.palette.accent} style={navicueType.micro}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 0.5 }}
                >
                  a place at the table. the war ends.
                </motion.text>
              )}
            </motion.g>
          )}
        </svg>
      </div>

      {phase === 'locked' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleOpen}>
          open the door
        </motion.button>
      )}

      {phase === 'shadow' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleInvite}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          invite to dinner
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'peace' ? 'the exiled part has a seat. the internal war ends.'
          : atTable ? 'the shadow joins you at the table.'
            : phase === 'shadow' ? 'the shadow stands before you.'
              : phase === 'opening' ? 'the door opens...'
                : 'banging from below. something locked away.'}
      </span>

      {phase === 'peace' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          wholeness
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'peace' ? 'integration' : 'invite the shadow'}
      </div>
    </div>
  );
}
