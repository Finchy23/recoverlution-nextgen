/**
 * ECONOMIST #5 -- 1345. The Asymmetric Bet
 * "Downside known. Upside uncapped. Take the shot."
 * INTERACTION: Boring bet ($1->$2) vs Asymmetric bet ($1->$100). Choose asymmetric.
 * STEALTH KBE: Risk Taking -- Convexity (B)
 *
 * COMPOSITOR: pattern_glitch / Arc / work / believing / tap / 1345
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

export default function Economist_AsymmetricBet({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Arc',
        chrono: 'work',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1345,
        isSeal: false,
      }}
      arrivalText="Two bets. Same stake."
      prompt="Look for the trade where the downside is known and low, and the upside is uncapped. Take the shot."
      resonantText="Risk taking. You took the asymmetric bet. Convexity: the most powerful position is one where you cannot lose much but can gain everything. Capped risk, uncapped reward."
      afterglowCoda="Take the shot."
      onComplete={onComplete}
    >
      {(verse) => <AsymmetricBetInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function AsymmetricBetInteraction({ verse }: { verse: any }) {
  const [chosen, setChosen] = useState<null | 'boring' | 'asymmetric'>(null);
  const [done, setDone] = useState(false);

  const handleChoose = (choice: 'boring' | 'asymmetric') => {
    if (chosen) return;
    setChosen(choice);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }, 1500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 160;
  const CX = W / 2;
  const LEFT_X = 55, RIGHT_X = 185;
  const BASE_Y = H - 25;

  // Bar heights
  const boringDown = 15, boringUp = 30;
  const asymDown = 15, asymUp = 120;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>position</span>
        <motion.span style={{
          ...navicueType.data,
          color: done && chosen === 'asymmetric' ? verse.palette.accent
            : done ? verse.palette.text : verse.palette.textFaint,
        }}>
          {done ? (chosen === 'asymmetric' ? 'convex' : 'linear') : 'open'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Boring bet */}
          <g opacity={chosen === 'asymmetric' ? 0.3 : 1}>
            {/* Risk (down) */}
            <rect x={LEFT_X - 15} y={BASE_Y}
              width={30} height={boringDown} rx={2}
              fill={verse.palette.shadow} opacity={safeOpacity(0.12)} />
            <text x={LEFT_X} y={BASE_Y + boringDown + 10} textAnchor="middle"
              fill={verse.palette.shadow} style={{ fontSize: '7px' }} opacity={0.25}>
              -$1
            </text>

            {/* Reward (up) */}
            <motion.rect x={LEFT_X - 15} width={30} rx={2}
              fill={verse.palette.primary}
              animate={{
                y: BASE_Y - boringUp,
                height: boringUp,
                opacity: safeOpacity(0.1),
              }}
            />
            <text x={LEFT_X} y={BASE_Y - boringUp - 5} textAnchor="middle"
              fill={verse.palette.text} style={{ fontSize: '7px' }} opacity={0.25}>
              +$2
            </text>

            {/* Label */}
            <text x={LEFT_X} y={15} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '8px' }} opacity={0.2}>
              boring
            </text>

            {/* Baseline */}
            <line x1={LEFT_X - 20} y1={BASE_Y} x2={LEFT_X + 20} y2={BASE_Y}
              stroke={verse.palette.primary} strokeWidth={0.5}
              opacity={safeOpacity(0.1)} />
          </g>

          {/* Center divider */}
          <line x1={CX} y1={20} x2={CX} y2={BASE_Y + 20}
            stroke={verse.palette.primary} strokeWidth={0.3}
            strokeDasharray="3 4" opacity={safeOpacity(0.06)} />
          <text x={CX} y={BASE_Y + 18} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '6px' }} opacity={0.15}>
            vs
          </text>

          {/* Asymmetric bet */}
          <g opacity={chosen === 'boring' ? 0.3 : 1}>
            {/* Risk (down, same) */}
            <rect x={RIGHT_X - 15} y={BASE_Y}
              width={30} height={asymDown} rx={2}
              fill={verse.palette.shadow} opacity={safeOpacity(0.12)} />
            <text x={RIGHT_X} y={BASE_Y + asymDown + 10} textAnchor="middle"
              fill={verse.palette.shadow} style={{ fontSize: '7px' }} opacity={0.25}>
              -$1
            </text>

            {/* Reward (up, massive) */}
            <motion.rect x={RIGHT_X - 15} width={30} rx={2}
              fill={chosen === 'asymmetric' ? verse.palette.accent : verse.palette.primary}
              animate={{
                y: BASE_Y - asymUp,
                height: asymUp,
                opacity: safeOpacity(chosen === 'asymmetric' ? 0.15 : 0.08),
              }}
              transition={{ duration: 0.5 }}
            />
            <text x={RIGHT_X} y={BASE_Y - asymUp - 5} textAnchor="middle"
              fill={chosen === 'asymmetric' ? verse.palette.accent : verse.palette.text}
              style={{ fontSize: '7px' }}
              opacity={chosen === 'asymmetric' ? 0.5 : 0.25}>
              +$100
            </text>

            {/* Uncapped arrow */}
            <motion.line x1={RIGHT_X} x2={RIGHT_X}
              stroke={verse.palette.accent} strokeWidth={0.5}
              strokeDasharray="2 2"
              animate={{
                y1: BASE_Y - asymUp,
                y2: BASE_Y - asymUp - 15,
                opacity: safeOpacity(chosen === 'asymmetric' ? 0.3 : 0.1),
              }}
            />

            {/* Label */}
            <text x={RIGHT_X} y={15} textAnchor="middle"
              fill={chosen === 'asymmetric' ? verse.palette.accent : verse.palette.textFaint}
              style={{ fontSize: '8px' }} opacity={chosen === 'asymmetric' ? 0.5 : 0.2}>
              asymmetric
            </text>

            {/* Baseline */}
            <line x1={RIGHT_X - 20} y1={BASE_Y} x2={RIGHT_X + 20} y2={BASE_Y}
              stroke={verse.palette.primary} strokeWidth={0.5}
              opacity={safeOpacity(0.1)} />
          </g>

          {/* Ratio indicator (after choice) */}
          {done && chosen === 'asymmetric' && (
            <motion.text
              x={RIGHT_X} y={BASE_Y - asymUp / 2} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
            >
              100:1
            </motion.text>
          )}
        </svg>
      </div>

      {!chosen && (
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            style={{ ...btn.base, opacity: 0.5, padding: '8px 12px' }}
            whileTap={btn.active}
            onClick={() => handleChoose('boring')}
          >
            $1 to win $2
          </motion.button>
          <motion.button
            style={{ ...btn.base, padding: '8px 12px' }}
            whileTap={btn.active}
            onClick={() => handleChoose('asymmetric')}
          >
            $1 to win $100
          </motion.button>
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? (chosen === 'asymmetric'
          ? 'capped risk. uncapped reward.'
          : 'safe. but the upside was capped.')
          : 'same downside. different upside.'}
      </span>

      {done && chosen === 'asymmetric' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          convexity
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'risk taking' : 'find the asymmetry'}
      </div>
    </div>
  );
}
