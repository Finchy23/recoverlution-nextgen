/**
 * STRATEGIST #7 -- 1307. The Endgame (Simplification)
 * "When you are ahead, simplify. Clear the board and run the pawn."
 * INTERACTION: Tap to trade pieces one by one -- board clears, pawn promotes
 * STEALTH KBE: Clarification -- Focus (K)
 *
 * COMPOSITOR: poetic_precision / Arc / work / knowing / tap / 1307
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const TRADES = [
  { yours: 'Q', theirs: 'Q', label: 'queen for queen' },
  { yours: 'R', theirs: 'R', label: 'rook for rook' },
  { yours: 'B', theirs: 'N', label: 'bishop for knight' },
];

export default function Strategist_Endgame({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Arc',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1307,
        isSeal: false,
      }}
      arrivalText="A messy board. Too many pieces."
      prompt="When you are ahead, simplify. Trade the complications for clarity. Clear the board and run the pawn."
      resonantText="Clarification. You traded piece for piece until the board was clear. Focus is the endgame technique of removing noise until only the essential remains. Then the pawn becomes a queen."
      afterglowCoda="Clear the board."
      onComplete={onComplete}
    >
      {(verse) => <EndgameInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function EndgameInteraction({ verse }: { verse: any }) {
  const [traded, setTraded] = useState(0);
  const [promoted, setPromoted] = useState(false);
  const [done, setDone] = useState(false);

  const handleTrade = () => {
    if (traded >= TRADES.length || promoted) return;
    const next = traded + 1;
    setTraded(next);
    if (next >= TRADES.length) {
      setTimeout(() => {
        setPromoted(true);
        setDone(true);
        setTimeout(() => verse.advance(), 3000);
      }, 1000);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;

  // Remaining pieces
  const allPieces = [
    { type: 'Q', x: 40, y: 45, side: 'w' },
    { type: 'R', x: 65, y: 70, side: 'w' },
    { type: 'B', x: 50, y: 95, side: 'w' },
    { type: 'P', x: 90, y: 110, side: 'w' }, // the hero pawn
    { type: 'Q', x: 170, y: 55, side: 'b' },
    { type: 'R', x: 155, y: 80, side: 'b' },
    { type: 'N', x: 175, y: 100, side: 'b' },
    { type: 'K', x: 180, y: 40, side: 'b' },
  ];

  // Which pieces are removed after trades
  const removedW = TRADES.slice(0, traded).map(t => t.yours);
  const removedB = TRADES.slice(0, traded).map(t => t.theirs);
  const visiblePieces = allPieces.filter(p => {
    if (p.type === 'P' || p.type === 'K') return true;
    if (p.side === 'w') return !removedW.includes(p.type);
    return !removedB.includes(p.type);
  });

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Complexity readout */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>complexity</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? 'clear' : `${allPieces.length - traded * 2} pieces`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <rect x={10} y={10} width={W - 20} height={H - 20} rx={6}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />

          {/* Visible pieces */}
          <AnimatePresence>
            {visiblePieces.map((p, i) => {
              const isPawn = p.type === 'P';
              const isW = p.side === 'w';
              const col = isW ? verse.palette.accent : verse.palette.shadow;
              const pawnY = promoted ? 30 : p.y;

              return (
                <motion.g key={`${p.side}-${p.type}-${p.x}`}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.circle
                    cx={p.x} r={isPawn ? 8 : 10}
                    fill={col} opacity={safeOpacity(isW ? 0.12 : 0.06)}
                    animate={{ cy: isPawn ? pawnY : p.y }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <motion.circle
                    cx={p.x} r={isPawn ? 8 : 10}
                    fill="none" stroke={col}
                    strokeWidth={isPawn && promoted ? 1.5 : 0.8}
                    opacity={safeOpacity(isW ? 0.35 : 0.2)}
                    animate={{ cy: isPawn ? pawnY : p.y }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <motion.text
                    x={p.x} textAnchor="middle"
                    fill={col}
                    style={{ fontSize: isPawn ? '10px' : '11px' }}
                    opacity={isW ? 0.5 : 0.35}
                    animate={{ y: (isPawn ? pawnY : p.y) + 4 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {isPawn && promoted ? 'Q' : p.type}
                  </motion.text>
                </motion.g>
              );
            })}
          </AnimatePresence>

          {/* Pawn path (arrow to promotion square) */}
          {traded >= TRADES.length && !promoted && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.2) }}
            >
              <line x1={90} y1={105} x2={90} y2={35}
                stroke={verse.palette.accent} strokeWidth={0.5}
                strokeDasharray="3 2" />
              <path d="M 87,38 L 90,30 L 93,38"
                fill={verse.palette.accent} opacity={0.3} />
            </motion.g>
          )}

          {/* Promotion flash */}
          {promoted && (
            <motion.circle
              cx={90} cy={30} r={20}
              fill={verse.palette.accent}
              initial={{ opacity: 0.2, scale: 0.5 }}
              animate={{ opacity: safeOpacity(0.06), scale: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Trade log */}
          {traded > 0 && (
            <motion.g>
              {TRADES.slice(0, traded).map((t, i) => (
                <text key={i} x={W - 15} y={25 + i * 14} textAnchor="end"
                  fill={verse.palette.textFaint} style={{ fontSize: '8px' }} opacity={0.3}>
                  {t.label}
                </text>
              ))}
            </motion.g>
          )}

          {promoted && (
            <motion.text
              x={W / 2} y={H - 10} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.choice}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
            >
              promotion
            </motion.text>
          )}
        </svg>
      </div>

      {traded < TRADES.length && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleTrade}>
          trade {TRADES[traded].label}
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'clarity. the pawn became a queen.'
          : traded >= TRADES.length ? 'the board is clear. run the pawn.'
            : 'simplify. trade the complications.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          focus
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'clarification' : 'clear the board'}
      </div>
    </div>
  );
}
