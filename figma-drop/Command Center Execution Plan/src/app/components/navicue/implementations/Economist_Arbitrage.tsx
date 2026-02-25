/**
 * ECONOMIST #8 -- 1348. The Arbitrage
 * "Find the mismatch. Be the bridge."
 * INTERACTION: Buy confidence (low cost market). Move it. Sell (high value market). Profit.
 * STEALTH KBE: Value Transfer -- Market Awareness (K)
 *
 * COMPOSITOR: poetic_precision / Circuit / work / knowing / tap / 1348
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

export default function Economist_Arbitrage({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1348,
        isSeal: false,
      }}
      arrivalText="Two markets. Different prices."
      prompt="Find the mismatch. Take value from where it is abundant and move it to where it is scarce. Be the bridge."
      resonantText="Value transfer. You moved the asset between markets and captured the difference. Market awareness is seeing the gaps that others ignore: where value sits unrecognized, waiting to be moved."
      afterglowCoda="Be the bridge."
      onComplete={onComplete}
    >
      {(verse) => <ArbitrageInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ArbitrageInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'markets' | 'bought' | 'moved' | 'sold'>('markets');

  const handleBuy = () => {
    if (phase !== 'markets') return;
    setPhase('bought');
  };

  const handleMove = () => {
    if (phase !== 'bought') return;
    setPhase('moved');
    setTimeout(() => {
      setPhase('sold');
      setTimeout(() => verse.advance(), 3000);
    }, 1200);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 150;
  const CX = W / 2;
  const LEFT_X = 55, RIGHT_X = 185;
  const BOX_W = 70, BOX_H = 50;
  const BOX_Y = 35;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>profit</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'sold' ? verse.palette.accent : verse.palette.text,
        }}>
          {phase === 'sold' ? '+spread' : phase === 'moved' ? 'selling...' : phase === 'bought' ? 'in transit' : '$0'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Market A (abundant, low price) */}
          <g>
            <rect x={LEFT_X - BOX_W / 2} y={BOX_Y}
              width={BOX_W} height={BOX_H} rx={4}
              fill={verse.palette.primary} opacity={safeOpacity(0.05)} />
            <rect x={LEFT_X - BOX_W / 2} y={BOX_Y}
              width={BOX_W} height={BOX_H} rx={4}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={0.5} opacity={safeOpacity(0.12)} />

            <text x={LEFT_X} y={BOX_Y - 5} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '8px' }} opacity={0.3}>
              market A
            </text>

            {/* Abundance dots */}
            {Array.from({ length: 6 }).map((_, i) => (
              <circle key={i}
                cx={LEFT_X - 15 + (i % 3) * 15}
                cy={BOX_Y + 15 + Math.floor(i / 3) * 15}
                r={4}
                fill={verse.palette.primary}
                opacity={safeOpacity(phase === 'bought' || phase === 'moved' || phase === 'sold' ? 0.04 : 0.08)}
              />
            ))}

            <text x={LEFT_X} y={BOX_Y + BOX_H + 12} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
              abundant (low cost)
            </text>
          </g>

          {/* Market B (scarce, high value) */}
          <g>
            <rect x={RIGHT_X - BOX_W / 2} y={BOX_Y}
              width={BOX_W} height={BOX_H} rx={4}
              fill={phase === 'sold' ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(phase === 'sold' ? 0.06 : 0.05)} />
            <rect x={RIGHT_X - BOX_W / 2} y={BOX_Y}
              width={BOX_W} height={BOX_H} rx={4}
              fill="none"
              stroke={phase === 'sold' ? verse.palette.accent : verse.palette.primary}
              strokeWidth={0.5}
              opacity={safeOpacity(phase === 'sold' ? 0.2 : 0.12)} />

            <text x={RIGHT_X} y={BOX_Y - 5} textAnchor="middle"
              fill={phase === 'sold' ? verse.palette.accent : verse.palette.textFaint}
              style={{ fontSize: '8px' }} opacity={phase === 'sold' ? 0.5 : 0.3}>
              market B
            </text>

            {/* Scarcity (only 1 dot) */}
            <circle cx={RIGHT_X} cy={BOX_Y + BOX_H / 2}
              r={4}
              fill={verse.palette.primary}
              opacity={safeOpacity(0.06)} />

            <text x={RIGHT_X} y={BOX_Y + BOX_H + 12} textAnchor="middle"
              fill={phase === 'sold' ? verse.palette.accent : verse.palette.textFaint}
              style={{ fontSize: '7px' }} opacity={phase === 'sold' ? 0.4 : 0.2}>
              scarce (high value)
            </text>
          </g>

          {/* The moving asset */}
          {(phase === 'bought' || phase === 'moved') && (
            <motion.circle
              r={6}
              fill={verse.palette.accent}
              cy={BOX_Y + BOX_H / 2}
              animate={{
                cx: phase === 'moved' ? RIGHT_X : LEFT_X,
                opacity: safeOpacity(0.3),
              }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {/* Arrow bridge */}
          {(phase === 'bought' || phase === 'moved' || phase === 'sold') && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.15) }}
            >
              <line x1={LEFT_X + BOX_W / 2 + 5} y1={BOX_Y + BOX_H / 2}
                x2={RIGHT_X - BOX_W / 2 - 5} y2={BOX_Y + BOX_H / 2}
                stroke={verse.palette.accent} strokeWidth={0.5}
                strokeDasharray="4 3" />
              <text x={CX} y={BOX_Y + BOX_H / 2 - 5} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '7px' }}
                opacity={0.3}>
                bridge
              </text>
            </motion.g>
          )}

          {/* Profit indicator */}
          {phase === 'sold' && (
            <motion.g
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <text x={CX} y={H - 8} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.choice}
                opacity={0.5}>
                spread captured
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {phase === 'markets' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleBuy}>
          buy (low cost)
        </motion.button>
      )}

      {phase === 'bought' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleMove}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          move to market B
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'sold' ? 'abundant here. scarce there. you bridged the gap.'
          : phase === 'moved' ? 'selling at the higher price...'
            : phase === 'bought' ? 'acquired. now move it.'
              : 'two markets. same asset. different prices.'}
      </span>

      {phase === 'sold' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          market awareness
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'sold' ? 'value transfer' : 'find the mismatch'}
      </div>
    </div>
  );
}
