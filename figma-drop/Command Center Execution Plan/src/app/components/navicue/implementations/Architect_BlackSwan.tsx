/**
 * ARCHITECT #9 -- 1329. The Black Swan
 * "The impossible happens. Keep a reserve for the Black Swan."
 * INTERACTION: 1000 white swans confirm the theory. 1 black swan destroys it. Reserve survives.
 * STEALTH KBE: Antifragility -- Taleb's Logic (B)
 *
 * COMPOSITOR: koan_paradox / Pulse / night / believing / tap / 1329
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

export default function Architect_BlackSwan({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Pulse',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1329,
        isSeal: false,
      }}
      arrivalText="1,000 white swans."
      prompt="Do not bet everything on the past. The impossible happens. Keep a reserve for the Black Swan."
      resonantText="Antifragility. The black swan appeared and the theory shattered, but the reserve held. Taleb's logic: the absence of evidence is not evidence of absence. Keep the reserve."
      afterglowCoda="The impossible happens."
      onComplete={onComplete}
    >
      {(verse) => <BlackSwanInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function BlackSwanInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'counting' | 'confident' | 'reserve' | 'shock' | 'survived'>('counting');
  const [count, setCount] = useState(0);
  const [hasReserve, setHasReserve] = useState(false);

  useEffect(() => {
    if (phase !== 'counting') return;
    const interval = setInterval(() => {
      setCount(c => {
        const next = c + 50;
        if (next >= 1000) {
          setPhase('confident');
          clearInterval(interval);
          return 1000;
        }
        return next;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [phase]);

  const handleReserve = () => {
    if (phase !== 'confident') return;
    setHasReserve(true);
    setPhase('reserve');
    setTimeout(() => {
      setPhase('shock');
      setTimeout(() => {
        setPhase('survived');
        setTimeout(() => verse.advance(), 3000);
      }, 2000);
    }, 1200);
  };

  const handleNoReserve = () => {
    if (phase !== 'confident') return;
    setPhase('reserve');
    setTimeout(() => {
      setPhase('shock');
      setTimeout(() => {
        setPhase('survived');
        setTimeout(() => verse.advance(), 3000);
      }, 2000);
    }, 800);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 160;
  const CX = W / 2;

  // White swan positions (scattered)
  const whiteSwans = Array.from({ length: Math.min(Math.floor(count / 50), 20) }).map((_, i) => ({
    x: 25 + (i % 5) * 45 + ((i * 17) % 20),
    y: 25 + Math.floor(i / 5) * 32 + ((i * 13) % 12),
  }));

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>observed</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'shock' ? verse.palette.shadow
            : phase === 'survived' ? verse.palette.accent : verse.palette.text,
        }}>
          {phase === 'shock' ? 'black swan' : phase === 'survived' ? (hasReserve ? 'survived' : 'lesson learned') : `${count} white`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* White swans */}
          {whiteSwans.map((s, i) => (
            <motion.g key={i}
              animate={phase === 'shock' ? {
                opacity: 0.05,
              } : {}}
            >
              {/* Simple bird shape */}
              <path d={`M ${s.x - 5},${s.y} Q ${s.x - 2},${s.y - 5} ${s.x},${s.y - 2} Q ${s.x + 2},${s.y - 5} ${s.x + 5},${s.y}`}
                fill="none" stroke={verse.palette.primary}
                strokeWidth={1} opacity={safeOpacity(0.15)} />
            </motion.g>
          ))}

          {/* Theory bar */}
          {count > 0 && (
            <g>
              <rect x={20} y={H - 20} width={W - 40} height={4} rx={2}
                fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
              <motion.rect
                x={20} y={H - 20} height={4} rx={2}
                fill={phase === 'shock' ? verse.palette.shadow : verse.palette.primary}
                animate={{
                  width: phase === 'shock' ? 0 : (count / 1000) * (W - 40),
                  opacity: safeOpacity(phase === 'shock' ? 0.1 : 0.15),
                }}
                transition={{ duration: phase === 'shock' ? 0.3 : 0.1 }}
              />
              <text x={CX} y={H - 6} textAnchor="middle"
                fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
                {phase === 'shock' ? 'theory destroyed' : 'all swans are white'}
              </text>
            </g>
          )}

          {/* Black swan */}
          {(phase === 'shock' || phase === 'survived') && (
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <path d={`M ${CX - 12},${H / 2 + 5} Q ${CX - 4},${H / 2 - 10} ${CX},${H / 2 - 3} Q ${CX + 4},${H / 2 - 10} ${CX + 12},${H / 2 + 5}`}
                fill="none" stroke={verse.palette.shadow}
                strokeWidth={2.5} opacity={0.5} />
              <circle cx={CX} cy={H / 2 - 6} r={4}
                fill={verse.palette.shadow} opacity={safeOpacity(0.2)} />
              <text x={CX} y={H / 2 + 22} textAnchor="middle"
                fill={verse.palette.shadow} style={{ fontSize: '9px' }} opacity={0.4}>
                black swan
              </text>
            </motion.g>
          )}

          {/* Reserve indicator */}
          {hasReserve && (phase === 'reserve' || phase === 'shock' || phase === 'survived') && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <rect x={W - 45} y={15} width={30} height={20} rx={3}
                fill={verse.palette.accent} opacity={safeOpacity(0.1)} />
              <rect x={W - 45} y={15} width={30} height={20} rx={3}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.5} opacity={safeOpacity(0.25)} />
              <text x={W - 30} y={28} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '7px' }} opacity={0.4}>
                reserve
              </text>
            </motion.g>
          )}

          {/* Shock wave */}
          {phase === 'shock' && (
            <motion.circle
              cx={CX} cy={H / 2}
              fill="none" stroke={verse.palette.shadow}
              strokeWidth={1}
              initial={{ r: 10, opacity: 0.3 }}
              animate={{ r: 100, opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          )}
        </svg>
      </div>

      {phase === 'confident' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button style={btn.base} whileTap={btn.active} onClick={handleReserve}>
            keep a reserve
          </motion.button>
          <motion.button
            style={{ ...btn.base, opacity: 0.5 }}
            whileTap={btn.active} onClick={handleNoReserve}
          >
            all in
          </motion.button>
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'survived'
          ? (hasReserve ? 'the reserve held. you survived.' : 'the shock hit. the lesson remains.')
          : phase === 'shock' ? 'theory destroyed in one observation'
            : phase === 'reserve' ? 'preparing...'
              : phase === 'confident' ? '1,000 confirmations. absolute certainty?'
                : `observing... ${count} white swans`}
      </span>

      {phase === 'survived' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          taleb's logic
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'survived' ? 'antifragility' : 'the impossible happens'}
      </div>
    </div>
  );
}
