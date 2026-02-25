/**
 * SOVEREIGN #4 -- 1374. The Border (Boundaries)
 * "A kingdom without borders is a common land."
 * INTERACTION: Open border. Invaders enter. Build wall with gate. Close to toxic. Safe.
 * STEALTH KBE: Boundary Setting -- Self-Protection (B)
 *
 * COMPOSITOR: koan_paradox / Pulse / night / believing / tap / 1374
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

export default function Sovereign_Border({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Pulse',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1374,
        isSeal: false,
      }}
      arrivalText="Open border. No wall."
      prompt="A kingdom without borders is a common land. Define where you end and they begin. Man the gate."
      resonantText="Boundary setting. You built the wall with a gate and closed it to the toxic request. Self-protection: the gate is not cruelty. It is sovereignty. Open to friends. Closed to enemies."
      afterglowCoda="Man the gate."
      onComplete={onComplete}
    >
      {(verse) => <BorderInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function BorderInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'open' | 'invaded' | 'building' | 'gate' | 'closed'>('open');

  useEffect(() => {
    if (phase === 'open') {
      const t = setTimeout(() => setPhase('invaded'), 2500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleBuild = () => {
    if (phase !== 'invaded') return;
    setPhase('building');
    setTimeout(() => setPhase('gate'), 1000);
  };

  const handleClose = () => {
    if (phase !== 'gate') return;
    setPhase('closed');
    setTimeout(() => verse.advance(), 3000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;
  const CX = W / 2;

  // Wall line (horizontal, dividing inside from outside)
  const WALL_Y = H / 2 + 5;
  const WALL_X1 = 25, WALL_X2 = W - 25;
  const GATE_X = CX, GATE_W = 30;

  const hasWall = phase === 'building' || phase === 'gate' || phase === 'closed';
  const gateClosed = phase === 'closed';

  // Invaders (outside, above wall)
  const invaders = [
    { x: 50, y: 35, toxic: true },
    { x: 100, y: 25, toxic: false },
    { x: 150, y: 30, toxic: true },
    { x: 180, y: 40, toxic: false },
  ];

  // Kingdom (below wall)
  const KINGDOM_Y = WALL_Y + 25;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>border</span>
        <motion.span style={{
          ...navicueType.data,
          color: gateClosed ? verse.palette.accent
            : phase === 'invaded' ? verse.palette.shadow : verse.palette.text,
        }}>
          {gateClosed ? 'secured'
            : phase === 'gate' ? 'gate open'
              : hasWall ? 'building...'
                : phase === 'invaded' ? 'invaded'
                  : 'open'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Kingdom area */}
          <rect x={WALL_X1} y={WALL_Y} width={WALL_X2 - WALL_X1} height={H - WALL_Y - 10} rx={3}
            fill={gateClosed ? verse.palette.accent : verse.palette.primary}
            opacity={safeOpacity(gateClosed ? 0.04 : 0.02)} />
          <text x={CX} y={KINGDOM_Y + 15} textAnchor="middle"
            fill={gateClosed ? verse.palette.accent : verse.palette.textFaint}
            style={{ fontSize: '8px' }}
            opacity={gateClosed ? 0.3 : 0.15}>
            your kingdom
          </text>

          {/* Wall */}
          {hasWall && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Left wall segment */}
              <line x1={WALL_X1} y1={WALL_Y}
                x2={GATE_X - GATE_W / 2} y2={WALL_Y}
                stroke={verse.palette.primary} strokeWidth={4}
                strokeLinecap="round"
                opacity={safeOpacity(0.15)} />
              {/* Right wall segment */}
              <line x1={GATE_X + GATE_W / 2} y1={WALL_Y}
                x2={WALL_X2} y2={WALL_Y}
                stroke={verse.palette.primary} strokeWidth={4}
                strokeLinecap="round"
                opacity={safeOpacity(0.15)} />

              {/* Gate */}
              <motion.rect
                x={GATE_X - GATE_W / 2} y={WALL_Y - 8}
                width={GATE_W} height={16} rx={2}
                fill={gateClosed ? verse.palette.accent : verse.palette.primary}
                stroke={gateClosed ? verse.palette.accent : verse.palette.primary}
                strokeWidth={1}
                animate={{
                  opacity: safeOpacity(gateClosed ? 0.2 : 0.06),
                }}
              />
              <text x={GATE_X} y={WALL_Y + 3} textAnchor="middle"
                fill={gateClosed ? verse.palette.accent : verse.palette.text}
                style={{ fontSize: '7px' }}
                opacity={gateClosed ? 0.5 : 0.2}>
                {gateClosed ? 'closed' : 'gate'}
              </text>
            </motion.g>
          )}

          {/* Invaders/visitors */}
          {invaders.map((inv, i) => {
            const blocked = gateClosed && inv.toxic;
            const allowed = gateClosed && !inv.toxic;
            return (
              <motion.g key={i}
                animate={{
                  y: allowed ? WALL_Y + 15 - inv.y : 0,
                  x: blocked ? (i < 2 ? -30 : 30) : 0,
                  opacity: blocked ? 0.15 : 1,
                }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <circle cx={inv.x} cy={inv.y} r={8}
                  fill={inv.toxic ? verse.palette.shadow : verse.palette.primary}
                  opacity={safeOpacity(
                    blocked ? 0.03 : allowed ? 0.12 : phase === 'invaded' ? 0.1 : 0.06
                  )} />
                <circle cx={inv.x} cy={inv.y} r={8}
                  fill="none"
                  stroke={inv.toxic ? verse.palette.shadow : verse.palette.primary}
                  strokeWidth={0.5}
                  opacity={safeOpacity(
                    blocked ? 0.05 : allowed ? 0.2 : 0.1
                  )} />
                <text x={inv.x} y={inv.y + 18} textAnchor="middle"
                  fill={inv.toxic ? verse.palette.shadow : verse.palette.textFaint}
                  style={{ fontSize: '6px' }}
                  opacity={gateClosed ? 0.3 : 0.15}>
                  {inv.toxic ? 'toxic' : 'friend'}
                </text>
              </motion.g>
            );
          })}

          {/* Invasion arrows (phase: invaded, no wall) */}
          {phase === 'invaded' && (
            <motion.g
              animate={{ opacity: [0.05, 0.15, 0.05] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
            >
              {invaders.filter(i => i.toxic).map((inv, i) => (
                <line key={`arr-${i}`}
                  x1={inv.x} y1={inv.y + 8}
                  x2={inv.x} y2={KINGDOM_Y}
                  stroke={verse.palette.shadow} strokeWidth={0.8}
                  strokeDasharray="3 3" />
              ))}
            </motion.g>
          )}

          {/* Safe indicator */}
          {gateClosed && (
            <motion.text
              x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
            >
              open to friends. closed to enemies.
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'invaded' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleBuild}>
          build the wall (with a gate)
        </motion.button>
      )}

      {phase === 'gate' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleClose}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          close to toxic
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {gateClosed ? 'the gate is not cruelty. it is sovereignty.'
          : phase === 'gate' ? 'wall built. the gate is open. who enters?'
            : hasWall ? 'building...'
              : phase === 'invaded' ? 'no borders. anyone walks in.'
                : 'open land. no definition.'}
      </span>

      {gateClosed && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          self-protection
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {gateClosed ? 'boundary setting' : 'define where you end'}
      </div>
    </div>
  );
}
