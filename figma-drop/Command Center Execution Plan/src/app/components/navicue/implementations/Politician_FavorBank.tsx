/**
 * POLITICIAN #3 -- 1353. The Favor Bank (Reciprocity)
 * "Dig the well before you are thirsty."
 * INTERACTION: Tap to do favors. Coins fill vault. Spend later for a "Yes."
 * STEALTH KBE: Generosity -- Social Capital (E)
 *
 * COMPOSITOR: witness_ritual / Circuit / morning / embodying / tap / 1353
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

export default function Politician_FavorBank({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Circuit',
        chrono: 'morning',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1353,
        isSeal: false,
      }}
      arrivalText="An empty vault."
      prompt="Dig the well before you are thirsty. Do favors when you do not need them. Fill the vault. Withdraw when the winter comes."
      resonantText="Generosity. You filled the vault with unasked favors and when winter came, you had capital to spend. Social capital: the richest person in the room is not the one with money. It is the one who is owed."
      afterglowCoda="Fill the vault."
      onComplete={onComplete}
    >
      {(verse) => <FavorBankInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FavorBankInteraction({ verse }: { verse: any }) {
  const [coins, setCoins] = useState(0);
  const [spent, setSpent] = useState(false);
  const [done, setDone] = useState(false);
  const TARGET = 5;

  const handleFavor = () => {
    if (coins >= TARGET || spent) return;
    setCoins(c => c + 1);
  };

  const handleSpend = () => {
    if (coins < TARGET || spent) return;
    setSpent(true);
    setDone(true);
    setTimeout(() => verse.advance(), 3000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 200, H = 150;
  const CX = W / 2;

  // Vault dimensions
  const VAULT_X = CX - 40, VAULT_Y = 25;
  const VAULT_W = 80, VAULT_H = 90;

  // Coin positions inside vault (stack from bottom)
  const coinPositions = Array.from({ length: TARGET }).map((_, i) => ({
    x: CX,
    y: VAULT_Y + VAULT_H - 15 - i * 16,
  }));

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>capital</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent
            : coins >= TARGET ? verse.palette.text : verse.palette.shadow,
        }}>
          {done ? 'yes' : `${coins} / ${TARGET}`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Vault */}
          <rect x={VAULT_X} y={VAULT_Y} width={VAULT_W} height={VAULT_H} rx={4}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
          <rect x={VAULT_X} y={VAULT_Y} width={VAULT_W} height={VAULT_H} rx={4}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={1} opacity={safeOpacity(0.15)} />

          {/* Vault lock */}
          <circle cx={VAULT_X + VAULT_W - 12} cy={VAULT_Y + VAULT_H / 2} r={5}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.8} opacity={safeOpacity(0.12)} />
          <circle cx={VAULT_X + VAULT_W - 12} cy={VAULT_Y + VAULT_H / 2} r={1.5}
            fill={verse.palette.primary} opacity={safeOpacity(0.1)} />

          {/* Vault label */}
          <text x={CX} y={VAULT_Y - 5} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
            political capital
          </text>

          {/* Coins */}
          {coinPositions.slice(0, coins).map((pos, i) => (
            <motion.g key={i}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Coin body */}
              <ellipse cx={pos.x} cy={pos.y} rx={22} ry={6}
                fill={done ? verse.palette.primary : verse.palette.accent}
                opacity={safeOpacity(done ? 0.04 : 0.12)} />
              <ellipse cx={pos.x} cy={pos.y} rx={22} ry={6}
                fill="none"
                stroke={done ? verse.palette.primary : verse.palette.accent}
                strokeWidth={0.8}
                opacity={safeOpacity(done ? 0.08 : 0.25)} />

              {/* Coin edge (3D effect) */}
              <ellipse cx={pos.x} cy={pos.y + 3} rx={22} ry={6}
                fill="none"
                stroke={done ? verse.palette.primary : verse.palette.accent}
                strokeWidth={0.3}
                opacity={safeOpacity(done ? 0.04 : 0.1)} />
            </motion.g>
          ))}

          {/* Spent indicator */}
          {done && (
            <motion.g
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <text x={CX} y={VAULT_Y + VAULT_H / 2 + 4} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.choice}
                opacity={0.5}>
                withdrawn
              </text>

              {/* The "Yes" that was purchased */}
              <text x={CX} y={VAULT_Y + VAULT_H + 18} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '11px' }}
                opacity={0.5}>
                "yes"
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {!spent && coins < TARGET && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleFavor}>
          do an unasked favor
        </motion.button>
      )}

      {coins >= TARGET && !spent && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleSpend}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          withdraw (get the yes)
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the vault was full. the yes was easy.'
          : coins >= TARGET ? 'vault full. winter comes. spend now.'
            : coins > 0 ? 'dig the well before you are thirsty.'
              : 'an empty vault. no capital.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          social capital
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'generosity' : 'fill the vault'}
      </div>
    </div>
  );
}
