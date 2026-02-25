/**
 * ECONOMIST #4 -- 1344. The Supply and Demand
 * "Scarcity creates value. Become rare."
 * INTERACTION: Time (common, low value bar). Invest in Rare Skill (high value bar).
 * STEALTH KBE: Skill Acquisition -- Differentiation (K)
 *
 * COMPOSITOR: poetic_precision / Lattice / work / knowing / tap / 1344
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

export default function Economist_SupplyAndDemand({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Lattice',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1344,
        isSeal: false,
      }}
      arrivalText="You have time. Everyone does."
      prompt="Scarcity creates value. If you want to be worth more, become rare. Develop the skill that no one else has."
      resonantText="Skill acquisition. You invested in the rare skill and your value rose. Differentiation: time is abundant and therefore cheap. Mastery is scarce and therefore priceless."
      afterglowCoda="Become rare."
      onComplete={onComplete}
    >
      {(verse) => <SupplyAndDemandInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SupplyAndDemandInteraction({ verse }: { verse: any }) {
  const [invested, setInvested] = useState(false);
  const [done, setDone] = useState(false);

  const handleInvest = () => {
    if (invested) return;
    setInvested(true);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }, 1500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;
  const CX = W / 2;

  // Bar chart positions
  const BAR_W = 50, BAR_MAX_H = 100;
  const BAR_Y = 15;
  const LEFT_X = CX - 55;
  const RIGHT_X = CX + 15;
  const BOTTOM = BAR_Y + BAR_MAX_H;

  const timeSupply = 0.85; // very common
  const timeValue = 0.15;
  const skillSupply = invested ? 0.1 : 0.5;
  const skillValue = invested ? 0.9 : 0.3;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>your value</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? 'rare' : invested ? 'rising...' : 'common'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* TIME column */}
          <g>
            <text x={LEFT_X + BAR_W / 2} y={BOTTOM + 15} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '8px' }} opacity={0.3}>
              time
            </text>

            {/* Supply bar (how common) */}
            <rect x={LEFT_X} y={BOTTOM - timeSupply * BAR_MAX_H}
              width={BAR_W / 2 - 2} height={timeSupply * BAR_MAX_H} rx={2}
              fill={verse.palette.primary} opacity={safeOpacity(0.08)} />
            <text x={LEFT_X + BAR_W / 4} y={BOTTOM - timeSupply * BAR_MAX_H - 4}
              textAnchor="middle" fill={verse.palette.textFaint}
              style={{ fontSize: '6px' }} opacity={0.2}>
              supply
            </text>

            {/* Value bar (how valuable) */}
            <rect x={LEFT_X + BAR_W / 2 + 2} y={BOTTOM - timeValue * BAR_MAX_H}
              width={BAR_W / 2 - 2} height={timeValue * BAR_MAX_H} rx={2}
              fill={verse.palette.shadow} opacity={safeOpacity(0.1)} />
            <text x={LEFT_X + BAR_W * 3 / 4} y={BOTTOM - timeValue * BAR_MAX_H - 4}
              textAnchor="middle" fill={verse.palette.shadow}
              style={{ fontSize: '6px' }} opacity={0.2}>
              value
            </text>

            {/* Common label */}
            <text x={LEFT_X + BAR_W / 2} y={BOTTOM - timeSupply * BAR_MAX_H / 2 + 3}
              textAnchor="middle" fill={verse.palette.textFaint}
              style={{ fontSize: '7px' }} opacity={0.15}>
              everyone
            </text>
          </g>

          {/* SKILL column */}
          <g>
            <text x={RIGHT_X + BAR_W / 2} y={BOTTOM + 15} textAnchor="middle"
              fill={invested ? verse.palette.accent : verse.palette.textFaint}
              style={{ fontSize: '8px' }} opacity={invested ? 0.5 : 0.3}>
              rare skill
            </text>

            {/* Supply bar */}
            <motion.rect
              x={RIGHT_X} width={BAR_W / 2 - 2} rx={2}
              fill={verse.palette.primary}
              animate={{
                y: BOTTOM - skillSupply * BAR_MAX_H,
                height: skillSupply * BAR_MAX_H,
                opacity: safeOpacity(0.08),
              }}
              transition={{ duration: 0.6 }}
            />
            <text x={RIGHT_X + BAR_W / 4}
              y={BOTTOM - 0.5 * BAR_MAX_H - 4}
              textAnchor="middle" fill={verse.palette.textFaint}
              style={{ fontSize: '6px' }} opacity={0.2}>
              supply
            </text>

            {/* Value bar */}
            <motion.rect
              x={RIGHT_X + BAR_W / 2 + 2} width={BAR_W / 2 - 2} rx={2}
              fill={invested ? verse.palette.accent : verse.palette.primary}
              animate={{
                y: BOTTOM - skillValue * BAR_MAX_H,
                height: skillValue * BAR_MAX_H,
                opacity: safeOpacity(invested ? 0.25 : 0.1),
              }}
              transition={{ duration: 0.6 }}
            />
            <text x={RIGHT_X + BAR_W * 3 / 4}
              y={BOTTOM - 0.3 * BAR_MAX_H - 4}
              textAnchor="middle"
              fill={invested ? verse.palette.accent : verse.palette.textFaint}
              style={{ fontSize: '6px' }} opacity={invested ? 0.4 : 0.2}>
              value
            </text>

            {/* Rare label */}
            {invested && (
              <motion.text
                x={RIGHT_X + BAR_W / 2}
                y={BOTTOM - skillValue * BAR_MAX_H / 2 + 3}
                textAnchor="middle" fill={verse.palette.accent}
                style={{ fontSize: '7px' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
              >
                scarce
              </motion.text>
            )}
          </g>

          {/* Inverse relationship indicator */}
          {invested && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 0.3 }}
            >
              <text x={CX} y={BAR_Y + 5} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '7px' }}>
                low supply = high value
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {!invested && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleInvest}>
          invest in rare skill
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'scarce. valuable. differentiated.'
          : invested ? 'supply drops. value rises.'
            : 'time is abundant. value is low.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          differentiation
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'skill acquisition' : 'become rare'}
      </div>
    </div>
  );
}
