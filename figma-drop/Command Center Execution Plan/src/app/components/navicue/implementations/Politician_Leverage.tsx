/**
 * POLITICIAN #7 -- 1357. The Leverage (The Veto)
 * "Your power to stop the machine makes you a player."
 * INTERACTION: Cannot say Yes. Hold the Veto card. Play it. System stops. They listen.
 * STEALTH KBE: Boundary -- Negative Power (E)
 *
 * COMPOSITOR: witness_ritual / Pulse / night / embodying / tap / 1357
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

export default function Politician_Leverage({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Pulse',
        chrono: 'night',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1357,
        isSeal: false,
      }}
      arrivalText="You cannot say yes."
      prompt="If you cannot lead the parade, block the road. Your power to stop the machine makes you a player. Use the No."
      resonantText="Boundary. You played the veto and the machine stopped. Negative power: you do not need permission to act. You need the courage to refuse. The No is the ultimate leverage."
      afterglowCoda="Use the No."
      onComplete={onComplete}
    >
      {(verse) => <LeverageInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function LeverageInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'running' | 'veto' | 'stopped' | 'listen'>('running');

  useEffect(() => {
    if (phase === 'running') {
      const t = setTimeout(() => setPhase('veto'), 2500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleVeto = () => {
    if (phase !== 'veto') return;
    setPhase('stopped');
    setTimeout(() => {
      setPhase('listen');
      setTimeout(() => verse.advance(), 3000);
    }, 1500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;
  const CX = W / 2, CY = H / 2;

  // Gear/machine elements
  const gears = [
    { x: CX - 40, y: CY - 15, r: 22 },
    { x: CX + 25, y: CY + 5, r: 18 },
    { x: CX - 10, y: CY + 30, r: 15 },
  ];

  const isStopped = phase === 'stopped' || phase === 'listen';

  // Gear teeth
  const gearPath = (cx: number, cy: number, r: number, teeth: number) => {
    const inner = r * 0.7;
    let d = '';
    for (let i = 0; i < teeth; i++) {
      const a1 = (i / teeth) * Math.PI * 2;
      const a2 = ((i + 0.3) / teeth) * Math.PI * 2;
      const a3 = ((i + 0.5) / teeth) * Math.PI * 2;
      const a4 = ((i + 0.8) / teeth) * Math.PI * 2;
      d += `${i === 0 ? 'M' : 'L'} ${cx + Math.cos(a1) * inner},${cy + Math.sin(a1) * inner} `;
      d += `L ${cx + Math.cos(a2) * r},${cy + Math.sin(a2) * r} `;
      d += `L ${cx + Math.cos(a3) * r},${cy + Math.sin(a3) * r} `;
      d += `L ${cx + Math.cos(a4) * inner},${cy + Math.sin(a4) * inner} `;
    }
    d += 'Z';
    return d;
  };

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>machine</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'listen' ? verse.palette.accent
            : isStopped ? verse.palette.shadow : verse.palette.text,
        }}>
          {phase === 'listen' ? 'they listen'
            : isStopped ? 'stopped'
              : phase === 'veto' ? 'your move'
                : 'running'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Machine gears */}
          {gears.map((g, i) => (
            <motion.g key={i}
              animate={{
                rotate: isStopped ? 0 : [0, 360],
              }}
              transition={isStopped ? {} : {
                repeat: Infinity,
                duration: 3 + i,
                ease: 'linear',
              }}
              style={{ transformOrigin: `${g.x}px ${g.y}px` }}
            >
              <path
                d={gearPath(g.x, g.y, g.r, 8 + i * 2)}
                fill={isStopped ? verse.palette.shadow : verse.palette.primary}
                opacity={safeOpacity(isStopped ? 0.04 : 0.06)}
              />
              <circle cx={g.x} cy={g.y} r={g.r * 0.3}
                fill="none"
                stroke={isStopped ? verse.palette.shadow : verse.palette.primary}
                strokeWidth={1}
                opacity={safeOpacity(0.1)} />
            </motion.g>
          ))}

          {/* Veto card (appears when ready) */}
          {(phase === 'veto' || isStopped) && (
            <motion.g
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <rect x={CX + 50} y={CY - 25} width={50} height={30} rx={3}
                fill={isStopped ? verse.palette.accent : verse.palette.primary}
                opacity={safeOpacity(isStopped ? 0.12 : 0.06)} />
              <rect x={CX + 50} y={CY - 25} width={50} height={30} rx={3}
                fill="none"
                stroke={isStopped ? verse.palette.accent : verse.palette.primary}
                strokeWidth={1}
                opacity={safeOpacity(isStopped ? 0.3 : 0.15)} />
              <text x={CX + 75} y={CY - 7} textAnchor="middle"
                fill={isStopped ? verse.palette.accent : verse.palette.text}
                style={{ fontSize: '11px' }}
                opacity={isStopped ? 0.5 : 0.3}>
                NO
              </text>
            </motion.g>
          )}

          {/* Stop indicator */}
          {isStopped && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* Impact lines from the veto */}
              {[0, 1, 2].map(i => (
                <motion.line key={i}
                  x1={CX + 48} y1={CY - 10 + i * 10}
                  x2={CX + 35 - i * 3} y2={CY - 10 + i * 10}
                  stroke={verse.palette.accent} strokeWidth={0.8}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1, opacity: safeOpacity(0.2) }}
                  transition={{ delay: i * 0.1 }}
                />
              ))}
            </motion.g>
          )}

          {/* "They listen" indicators */}
          {phase === 'listen' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.5 }}
            >
              {/* Attention arrows pointing at veto holder */}
              {gears.map((g, i) => (
                <line key={`att-${i}`}
                  x1={g.x} y1={g.y}
                  x2={CX + 60} y2={CY - 10}
                  stroke={verse.palette.accent} strokeWidth={0.5}
                  strokeDasharray="3 3" opacity={safeOpacity(0.12)} />
              ))}
              <text x={CX} y={H - 5} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.micro}>
                the No made you a player
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {phase === 'veto' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleVeto}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          play the veto
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'listen' ? 'the power to stop made them listen.'
          : isStopped ? 'the machine stopped.'
            : phase === 'veto' ? 'you cannot say yes. but you can say no.'
              : 'the machine runs without you.'}
      </span>

      {phase === 'listen' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          negative power
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'listen' ? 'boundary' : 'block the road'}
      </div>
    </div>
  );
}
