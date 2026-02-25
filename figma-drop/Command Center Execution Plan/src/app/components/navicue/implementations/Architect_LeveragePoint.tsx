/**
 * ARCHITECT #4 -- 1324. The Leverage Point
 * "Small shift in the right place moves the whole system."
 * INTERACTION: Push the side (nothing). Find and tap the tiny button (it starts).
 * STEALTH KBE: Leverage -- High-Leverage Action (K)
 *
 * COMPOSITOR: poetic_precision / Lattice / work / knowing / tap / 1324
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

export default function Architect_LeveragePoint({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Lattice',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1324,
        isSeal: false,
      }}
      arrivalText="A complex machine. Motionless."
      prompt="Do not push the wall. Find the keystone. Small shift in the right place moves the whole system."
      resonantText="Leverage. You found the tiny button in the center and the entire machine started. High-leverage action is the trim tab effect: the smallest input at the highest-order point creates the largest output."
      afterglowCoda="Find the keystone."
      onComplete={onComplete}
    >
      {(verse) => <LeveragePointInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function LeveragePointInteraction({ verse }: { verse: any }) {
  const [pushes, setPushes] = useState(0);
  const [found, setFound] = useState(false);
  const [running, setRunning] = useState(false);

  const handlePush = () => {
    if (found) return;
    setPushes(p => p + 1);
  };

  const handleButton = () => {
    if (found) return;
    setFound(true);
    setRunning(true);
    setTimeout(() => verse.advance(), 3500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 180;
  const CX = W / 2, CY = H / 2;

  // Machine parts (gears, lines, nodes)
  const gears = [
    { x: 60, y: 55, r: 22 },
    { x: 120, y: 45, r: 15 },
    { x: 165, y: 70, r: 18 },
    { x: 80, y: 110, r: 16 },
    { x: 140, y: 120, r: 20 },
  ];

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>system</span>
        <motion.span style={{
          ...navicueType.data,
          color: running ? verse.palette.accent : verse.palette.text,
        }}>
          {running ? 'running' : pushes > 0 ? `pushed ${pushes}x (nothing)` : 'idle'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Machine frame */}
          <rect x={15} y={15} width={W - 30} height={H - 30} rx={6}
            fill={verse.palette.primary} opacity={safeOpacity(0.03)} />

          {/* Connecting rods */}
          {gears.map((g, i) => {
            const next = gears[(i + 1) % gears.length];
            return (
              <line key={`rod-${i}`}
                x1={g.x} y1={g.y} x2={next.x} y2={next.y}
                stroke={verse.palette.primary}
                strokeWidth={0.5} opacity={safeOpacity(0.08)} />
            );
          })}

          {/* Gears */}
          {gears.map((g, i) => (
            <motion.g key={i}
              animate={running ? {
                rotate: [0, i % 2 === 0 ? 360 : -360],
              } : {}}
              transition={running ? {
                repeat: Infinity,
                duration: 3 + i * 0.5,
                ease: 'linear',
              } : {}}
              style={{ transformOrigin: `${g.x}px ${g.y}px` }}
            >
              {/* Gear body */}
              <circle cx={g.x} cy={g.y} r={g.r}
                fill={verse.palette.primary}
                opacity={safeOpacity(running ? 0.08 : 0.04)} />
              <circle cx={g.x} cy={g.y} r={g.r}
                fill="none" stroke={running ? verse.palette.accent : verse.palette.primary}
                strokeWidth={0.8}
                opacity={safeOpacity(running ? 0.2 : 0.1)} />

              {/* Gear teeth (notches) */}
              {Array.from({ length: 8 }).map((_, t) => {
                const angle = (t / 8) * Math.PI * 2;
                return (
                  <line key={t}
                    x1={g.x + Math.cos(angle) * (g.r - 3)}
                    y1={g.y + Math.sin(angle) * (g.r - 3)}
                    x2={g.x + Math.cos(angle) * (g.r + 3)}
                    y2={g.y + Math.sin(angle) * (g.r + 3)}
                    stroke={running ? verse.palette.accent : verse.palette.primary}
                    strokeWidth={1.5}
                    opacity={safeOpacity(running ? 0.15 : 0.06)} />
                );
              })}

              {/* Center dot */}
              <circle cx={g.x} cy={g.y} r={2}
                fill={running ? verse.palette.accent : verse.palette.primary}
                opacity={safeOpacity(running ? 0.3 : 0.1)} />
            </motion.g>
          ))}

          {/* The tiny button (keystone) -- center of the machine */}
          {!found && (
            <motion.g
              style={{ cursor: 'pointer' }}
              onClick={handleButton}
              animate={{
                opacity: pushes >= 2 ? [0.3, 0.6, 0.3] : 0.15,
              }}
              transition={pushes >= 2 ? { repeat: Infinity, duration: 1.5 } : {}}
            >
              <circle cx={CX} cy={CY + 5} r={5}
                fill={verse.palette.accent} opacity={safeOpacity(0.2)} />
              <circle cx={CX} cy={CY + 5} r={5}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.5} opacity={safeOpacity(0.3)} />
            </motion.g>
          )}

          {/* Button activated flash */}
          {found && (
            <motion.circle
              cx={CX} cy={CY + 5}
              fill={verse.palette.accent}
              initial={{ r: 5, opacity: 0.4 }}
              animate={{ r: 40, opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          )}

          {/* Push indicator (side) */}
          {pushes > 0 && !found && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
            >
              <text x={W - 20} y={CY} textAnchor="end"
                fill={verse.palette.shadow} style={{ fontSize: '8px' }}>
                nothing
              </text>
            </motion.g>
          )}

          {/* Running energy lines */}
          {running && (
            <motion.g>
              {gears.map((g, i) => (
                <motion.circle key={`energy-${i}`}
                  cx={g.x} cy={g.y} r={g.r + 5}
                  fill="none" stroke={verse.palette.accent}
                  strokeWidth={0.5}
                  animate={{
                    opacity: [safeOpacity(0.05), safeOpacity(0.12), safeOpacity(0.05)],
                  }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.15 }}
                />
              ))}
            </motion.g>
          )}
        </svg>
      </div>

      {!found && (
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            style={{ ...btn.base, padding: '8px 14px' }}
            whileTap={btn.active}
            onClick={handlePush}
          >
            push the side
          </motion.button>
          {pushes >= 2 && (
            <motion.button
              style={{ ...btn.base, padding: '8px 14px' }}
              whileTap={btn.active}
              onClick={handleButton}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              tiny button
            </motion.button>
          )}
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {running ? 'small shift. whole system moved.'
          : pushes >= 2 ? 'look closer. find the keystone.'
            : pushes > 0 ? 'force does not work. look deeper.'
              : 'the machine is idle'}
      </span>

      {running && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          high-leverage action
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {running ? 'leverage' : 'find the trim tab'}
      </div>
    </div>
  );
}
