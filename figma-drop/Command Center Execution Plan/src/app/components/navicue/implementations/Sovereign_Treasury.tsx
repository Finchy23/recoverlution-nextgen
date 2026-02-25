/**
 * SOVEREIGN #3 -- 1373. The Treasury (Energy)
 * "Do not squander the treasury on wars you cannot win."
 * INTERACTION: Gold bars = energy. Spend on worry (bankrupt) or invest in action (dividend).
 * STEALTH KBE: Resource Allocation -- Energy Management (E)
 *
 * COMPOSITOR: sacred_ordinary / Circuit / morning / embodying / tap / 1373
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

export default function Sovereign_Treasury({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Circuit',
        chrono: 'morning',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1373,
        isSeal: false,
      }}
      arrivalText="The treasury. Five gold bars."
      prompt="Your energy is the state currency. Do not squander the treasury on wars you cannot win. Invest in infrastructure."
      resonantText="Resource allocation. You invested in infrastructure and the treasury grew. Energy management: worry is a tax that produces nothing. Action is an investment that compounds."
      afterglowCoda="Invest in infrastructure."
      onComplete={onComplete}
    >
      {(verse) => <TreasuryInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

const INVESTMENTS = [
  { id: 'worry', label: 'worry', cost: 2, returns: -1, bad: true },
  { id: 'sleep', label: 'sleep', cost: 1, returns: 2, bad: false },
  { id: 'action', label: 'action', cost: 2, returns: 3, bad: false },
] as const;

function TreasuryInteraction({ verse }: { verse: any }) {
  const [gold, setGold] = useState(5);
  const [invested, setInvested] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const handleInvest = (inv: typeof INVESTMENTS[number]) => {
    if (done || gold < inv.cost) return;
    const newGold = gold - inv.cost + inv.returns;
    setGold(Math.max(0, newGold));
    setInvested(prev => [...prev, inv.id]);

    if (inv.bad || newGold <= 0) {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    } else if (invested.length >= 1 && !inv.bad) {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 150;
  const CX = W / 2;
  const MAX_BARS = 8;

  const bankrupt = gold <= 0;
  const grew = done && !bankrupt;

  // Bar positions
  const BAR_W = 18, BAR_H = 10, BAR_GAP = 3;
  const barsToShow = Math.min(gold, MAX_BARS);
  const startX = CX - (barsToShow * (BAR_W + BAR_GAP)) / 2;
  const BAR_Y = 55;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>treasury</span>
        <motion.span style={{
          ...navicueType.data,
          color: grew ? verse.palette.accent
            : bankrupt ? verse.palette.shadow : verse.palette.text,
        }}>
          {bankrupt ? 'bankrupt'
            : grew ? `${gold} bars (growing)`
              : `${gold} bars`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Vault frame */}
          <rect x={CX - 70} y={35} width={140} height={60} rx={4}
            fill={verse.palette.primary} opacity={safeOpacity(0.03)} />
          <rect x={CX - 70} y={35} width={140} height={60} rx={4}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.5} opacity={safeOpacity(0.08)} />
          <text x={CX} y={48} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.15}>
            energy reserves
          </text>

          {/* Gold bars */}
          {Array.from({ length: barsToShow }).map((_, i) => (
            <motion.rect key={i}
              x={startX + i * (BAR_W + BAR_GAP)}
              y={BAR_Y}
              width={BAR_W}
              height={BAR_H}
              rx={2}
              fill={grew ? verse.palette.accent : verse.palette.primary}
              initial={{ opacity: 0, y: -5 }}
              animate={{
                opacity: safeOpacity(grew ? 0.2 : 0.1),
                y: 0,
              }}
              transition={{ delay: i * 0.05 }}
            />
          ))}
          {Array.from({ length: barsToShow }).map((_, i) => (
            <motion.rect key={`s-${i}`}
              x={startX + i * (BAR_W + BAR_GAP)}
              y={BAR_Y}
              width={BAR_W}
              height={BAR_H}
              rx={2}
              fill="none"
              stroke={grew ? verse.palette.accent : verse.palette.primary}
              strokeWidth={0.5}
              animate={{
                opacity: safeOpacity(grew ? 0.3 : 0.15),
              }}
            />
          ))}

          {/* Stack second row if > 5 */}
          {barsToShow > 5 && Array.from({ length: barsToShow - 5 }).map((_, i) => (
            <motion.rect key={`r2-${i}`}
              x={startX + i * (BAR_W + BAR_GAP)}
              y={BAR_Y + BAR_H + 3}
              width={BAR_W} height={BAR_H} rx={2}
              fill={verse.palette.accent}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.15) }}
              transition={{ delay: 0.3 }}
            />
          ))}

          {/* Bankrupt indicator */}
          {bankrupt && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <text x={CX} y={BAR_Y + 8} textAnchor="middle"
                fill={verse.palette.shadow} style={{ fontSize: '11px' }} opacity={0.3}>
                empty
              </text>
              <text x={CX} y={H - 15} textAnchor="middle"
                fill={verse.palette.shadow} style={{ fontSize: '8px' }} opacity={0.2}>
                squandered on worry
              </text>
            </motion.g>
          )}

          {/* Investment log */}
          {invested.length > 0 && (
            <g>
              {invested.map((inv, i) => (
                <text key={i}
                  x={CX - 60 + i * 50} y={H - 20}
                  fill={inv === 'worry' ? verse.palette.shadow : verse.palette.accent}
                  style={{ fontSize: '7px' }}
                  opacity={0.25}>
                  {inv}
                </text>
              ))}
            </g>
          )}

          {/* Dividend indicator */}
          {grew && (
            <motion.text
              x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
            >
              invested wisely. the treasury compounds.
            </motion.text>
          )}
        </svg>
      </div>

      {!done && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {INVESTMENTS.map(inv => (
            <motion.button key={inv.id}
              style={{
                ...btn.base,
                opacity: inv.bad ? 0.4 : 1,
                padding: '6px 10px',
                fontSize: '12px',
              }}
              whileTap={btn.active}
              onClick={() => handleInvest(inv)}
              disabled={gold < inv.cost}
            >
              {inv.label} ({inv.cost})
            </motion.button>
          ))}
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {grew ? 'action compounds. worry taxes.'
          : bankrupt ? 'the treasury is empty. worry consumed it all.'
            : 'where will you spend your energy?'}
      </span>

      {grew && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          energy management
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {grew ? 'resource allocation' : 'invest in infrastructure'}
      </div>
    </div>
  );
}
