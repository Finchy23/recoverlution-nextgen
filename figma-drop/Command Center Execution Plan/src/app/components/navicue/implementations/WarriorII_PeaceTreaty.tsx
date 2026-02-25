/**
 * WARRIOR II #9 -- 1369. The Peace Treaty
 * "Do not humiliate the defeated."
 * INTERACTION: War is won. Execute survivors (rebellion). Feed survivors (peace).
 * STEALTH KBE: Mercy -- Magnanimity (B)
 *
 * COMPOSITOR: witness_ritual / Arc / night / believing / tap / 1369
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

export default function WarriorII_PeaceTreaty({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Arc',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1369,
        isSeal: false,
      }}
      arrivalText="The war is won. Survivors kneel."
      prompt="The war is easy. The peace is hard. Do not humiliate the defeated. Integrate them. A humiliated enemy is a future war."
      resonantText="Mercy. You fed the defeated and peace followed. Magnanimity: the true victory is not the conquest. It is the integration. A humiliated enemy never forgives. A respected one becomes an ally."
      afterglowCoda="Feed the defeated."
      onComplete={onComplete}
    >
      {(verse) => <PeaceTreatyInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PeaceTreatyInteraction({ verse }: { verse: any }) {
  const [choice, setChoice] = useState<null | 'execute' | 'feed'>(null);
  const [done, setDone] = useState(false);

  const handleChoice = (c: 'execute' | 'feed') => {
    if (choice) return;
    setChoice(c);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }, 2000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;
  const CX = W / 2, CY = H / 2;

  // Kneeling figures
  const survivors = [
    { x: CX - 30, y: CY + 10 },
    { x: CX, y: CY + 15 },
    { x: CX + 30, y: CY + 10 },
  ];

  const fed = choice === 'feed';
  const executed = choice === 'execute';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>aftermath</span>
        <motion.span style={{
          ...navicueType.data,
          color: done && fed ? verse.palette.accent
            : done && executed ? verse.palette.shadow : verse.palette.text,
        }}>
          {done ? (fed ? 'peace (lasting)' : 'rebellion (inevitable)')
            : 'the war is over'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Victory crown/banner */}
          <text x={CX} y={25} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '8px' }} opacity={0.2}>
            victory
          </text>
          <line x1={CX - 30} y1={30} x2={CX + 30} y2={30}
            stroke={verse.palette.primary} strokeWidth={0.5}
            opacity={safeOpacity(0.08)} />

          {/* Kneeling survivors */}
          {survivors.map((s, i) => (
            <motion.g key={i}
              animate={{
                opacity: executed && done ? 0.15 : 1,
              }}
            >
              {/* Head (slightly bowed) */}
              <circle cx={s.x} cy={s.y - 8} r={5}
                fill={fed && done ? verse.palette.accent : verse.palette.primary}
                opacity={safeOpacity(fed && done ? 0.15 : 0.08)} />
              {/* Body (kneeling) */}
              <line x1={s.x} y1={s.y - 3} x2={s.x} y2={s.y + 8}
                stroke={fed && done ? verse.palette.accent : verse.palette.primary}
                strokeWidth={1.5}
                opacity={safeOpacity(fed && done ? 0.2 : 0.1)} />
              {/* Knees */}
              <line x1={s.x} y1={s.y + 8} x2={s.x - 5} y2={s.y + 15}
                stroke={verse.palette.primary} strokeWidth={1}
                opacity={safeOpacity(0.08)} />
              <line x1={s.x} y1={s.y + 8} x2={s.x + 5} y2={s.y + 15}
                stroke={verse.palette.primary} strokeWidth={1}
                opacity={safeOpacity(0.08)} />

              {/* Fed indicator (small circle = bread/food) */}
              {fed && !done && (
                <motion.circle
                  cx={s.x + 8} cy={s.y}
                  r={3} fill={verse.palette.accent}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: safeOpacity(0.2), y: 0 }}
                  transition={{ delay: 0.3 + i * 0.2 }}
                />
              )}

              {/* Standing up (after being fed, done) */}
              {fed && done && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ delay: i * 0.2 }}
                >
                  {/* Arms extending (peace) */}
                  <line x1={s.x} y1={s.y} x2={s.x - 8} y2={s.y - 5}
                    stroke={verse.palette.accent} strokeWidth={1} />
                  <line x1={s.x} y1={s.y} x2={s.x + 8} y2={s.y - 5}
                    stroke={verse.palette.accent} strokeWidth={1} />
                </motion.g>
              )}
            </motion.g>
          ))}

          {/* Rebellion indicator (if executed) */}
          {executed && done && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {/* Fire symbols */}
              {survivors.map((s, i) => (
                <motion.text key={`fire-${i}`}
                  x={s.x} y={s.y - 20} textAnchor="middle"
                  fill={verse.palette.shadow} style={{ fontSize: '12px' }}
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.15 }}
                >
                  ~
                </motion.text>
              ))}
              <text x={CX} y={H - 10} textAnchor="middle"
                fill={verse.palette.shadow} style={{ fontSize: '8px' }} opacity={0.3}>
                humiliation breeds rebellion
              </text>
            </motion.g>
          )}

          {/* Peace indicator (if fed) */}
          {fed && done && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {/* Connection lines (integration) */}
              <line x1={survivors[0].x} y1={survivors[0].y}
                x2={survivors[1].x} y2={survivors[1].y}
                stroke={verse.palette.accent} strokeWidth={0.5}
                opacity={safeOpacity(0.15)} />
              <line x1={survivors[1].x} y1={survivors[1].y}
                x2={survivors[2].x} y2={survivors[2].y}
                stroke={verse.palette.accent} strokeWidth={0.5}
                opacity={safeOpacity(0.15)} />

              <text x={CX} y={H - 10} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.micro}
                opacity={0.5}>
                mercy creates lasting peace
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {!choice && (
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            style={{ ...btn.base, opacity: 0.5, padding: '8px 12px' }}
            whileTap={btn.active}
            onClick={() => handleChoice('execute')}
          >
            execute
          </motion.button>
          <motion.button
            style={{ ...btn.base, padding: '8px 12px' }}
            whileTap={btn.active}
            onClick={() => handleChoice('feed')}
          >
            feed the defeated
          </motion.button>
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? (fed
          ? 'you fed them. they became allies. peace lasts.'
          : 'you humiliated them. rebellion follows.')
          : fed ? 'feeding the defeated...'
            : executed ? 'executing...'
              : 'the war is won. what happens to the defeated?'}
      </span>

      {done && fed && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          magnanimity
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done && fed ? 'mercy' : 'the peace is hard'}
      </div>
    </div>
  );
}
