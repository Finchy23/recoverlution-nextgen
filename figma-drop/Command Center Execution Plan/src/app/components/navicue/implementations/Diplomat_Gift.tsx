/**
 * DIPLOMAT #9 -- 1269. The Gift (Reciprocity)
 * "Unlock the deadlock with generosity."
 * INTERACTION: Tap to slide a gift under a locked door -- it unlocks
 * STEALTH KBE: Generosity -- Social Capital (B)
 *
 * COMPOSITOR: witness_ritual / Arc / morning / believing / tap / 1269
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

const GIFTS = [
  { id: 'listen', label: 'I hear you' },
  { id: 'acknowledge', label: 'you matter' },
  { id: 'concede', label: 'you were right about that' },
];

export default function Diplomat_Gift({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Arc',
        chrono: 'morning',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1269,
        isSeal: false,
      }}
      arrivalText="A locked door."
      prompt="The law of reciprocity is hardwired. If you give, they must give back. Unlock the deadlock with generosity."
      resonantText="Generosity. You slid the gift under the door and it opened from the inside. Social capital is the understanding that giving first is not losing. It is investing. The return always exceeds the cost."
      afterglowCoda="Give first."
      onComplete={onComplete}
    >
      {(verse) => <GiftInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function GiftInteraction({ verse }: { verse: any }) {
  const [gift, setGift] = useState<string | null>(null);
  const [sliding, setSliding] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [done, setDone] = useState(false);

  const handleGift = (id: string) => {
    if (gift) return;
    setGift(id);
    setSliding(true);
    setTimeout(() => {
      setSliding(false);
      setUnlocked(true);
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }, 1800);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 180;
  const DOOR_X = W / 2 - 30, DOOR_W = 60, DOOR_H = 120;
  const DOOR_Y = 20;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Door frame */}
          <rect x={DOOR_X - 5} y={DOOR_Y - 5}
            width={DOOR_W + 10} height={DOOR_H + 10} rx={4}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />

          {/* Door */}
          <motion.g>
            <motion.rect
              x={DOOR_X} y={DOOR_Y}
              width={DOOR_W} height={DOOR_H} rx={3}
              fill={verse.palette.primary}
              animate={{
                opacity: safeOpacity(unlocked ? 0.03 : 0.08),
                x: unlocked ? DOOR_X - 15 : DOOR_X,
                scaleX: unlocked ? 0.3 : 1,
              }}
              transition={{ duration: 0.6 }}
              style={{ transformOrigin: `${DOOR_X}px ${DOOR_Y + DOOR_H / 2}px` }}
            />
            <motion.rect
              x={DOOR_X} y={DOOR_Y}
              width={DOOR_W} height={DOOR_H} rx={3}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={1}
              animate={{
                opacity: safeOpacity(unlocked ? 0.08 : 0.2),
                x: unlocked ? DOOR_X - 15 : DOOR_X,
                scaleX: unlocked ? 0.3 : 1,
              }}
              transition={{ duration: 0.6 }}
              style={{ transformOrigin: `${DOOR_X}px ${DOOR_Y + DOOR_H / 2}px` }}
            />

            {/* Door handle */}
            {!unlocked && (
              <circle cx={DOOR_X + DOOR_W - 12} cy={DOOR_Y + DOOR_H / 2}
                r={3} fill={verse.palette.primary} opacity={safeOpacity(0.15)} />
            )}

            {/* Lock indicator */}
            {!unlocked && (
              <motion.g
                animate={{ opacity: sliding ? [0.3, 0.1, 0.3] : 0.3 }}
                transition={sliding ? { repeat: Infinity, duration: 0.5 } : {}}
              >
                <rect x={DOOR_X + DOOR_W - 18} y={DOOR_Y + DOOR_H / 2 - 12}
                  width={12} height={10} rx={2}
                  fill={verse.palette.shadow} opacity={safeOpacity(0.15)} />
                <path d={`M ${DOOR_X + DOOR_W - 15},${DOOR_Y + DOOR_H / 2 - 12} 
                  Q ${DOOR_X + DOOR_W - 15},${DOOR_Y + DOOR_H / 2 - 20} ${DOOR_X + DOOR_W - 12},${DOOR_Y + DOOR_H / 2 - 20}
                  Q ${DOOR_X + DOOR_W - 9},${DOOR_Y + DOOR_H / 2 - 20} ${DOOR_X + DOOR_W - 9},${DOOR_Y + DOOR_H / 2 - 12}`}
                  fill="none" stroke={verse.palette.shadow}
                  strokeWidth={1.5} opacity={safeOpacity(0.2)} />
              </motion.g>
            )}
          </motion.g>

          {/* Gap under door */}
          <rect x={DOOR_X} y={DOOR_Y + DOOR_H - 1}
            width={DOOR_W} height={3} rx={1}
            fill={verse.palette.primary} opacity={safeOpacity(0.1)} />

          {/* Gift envelope sliding under */}
          {sliding && (
            <motion.g
              initial={{ x: DOOR_X - 20, y: DOOR_Y + DOOR_H - 8 }}
              animate={{ x: DOOR_X + DOOR_W / 2 - 10, y: DOOR_Y + DOOR_H - 8 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <rect width={20} height={12} rx={2}
                fill={verse.palette.accent} opacity={safeOpacity(0.2)} />
              <path d="M 0,0 L 10,6 L 20,0" fill="none"
                stroke={verse.palette.accent} strokeWidth={0.5}
                opacity={safeOpacity(0.3)} />
            </motion.g>
          )}

          {/* Light from open door */}
          {unlocked && (
            <motion.rect
              x={DOOR_X + 5} y={DOOR_Y + 5}
              width={DOOR_W - 10} height={DOOR_H - 10} rx={2}
              fill={verse.palette.accent}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.08) }}
              transition={{ duration: 0.8 }}
            />
          )}

          {/* Gift label */}
          {gift && (
            <motion.text
              x={W / 2} y={H - 5}
              textAnchor="middle"
              fill={verse.palette.accent}
              style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: unlocked ? 0.5 : 0.3 }}
            >
              {GIFTS.find(g => g.id === gift)?.label}
            </motion.text>
          )}
        </svg>
      </div>

      {/* Gift options */}
      {!gift && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {GIFTS.map(g => (
            <motion.button key={g.id}
              style={{ ...btn.base, padding: '8px 12px' }}
              whileTap={btn.active}
              onClick={() => handleGift(g.id)}
            >
              {g.label}
            </motion.button>
          ))}
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the door opened from the inside'
          : sliding ? 'sliding under the door...'
            : 'choose what to give first'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          social capital
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'generosity' : 'unlock the deadlock'}
      </div>
    </div>
  );
}
