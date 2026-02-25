/**
 * WEAVER PATTERN #1 -- 1281. The Thread Pull (Systems)
 * "You cannot touch one thing without touching everything."
 * INTERACTION: Tap a thread to pull it -- the whole fabric bunches and ripples
 * STEALTH KBE: Causality -- Systems Thinking (K)
 *
 * COMPOSITOR: poetic_precision / Lattice / work / knowing / tap / 1281
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

const THREADS = [
  { id: 'sleep', label: 'sleep', x: 60, color: 'accent' as const },
  { id: 'mood', label: 'mood', x: 110, color: 'primary' as const },
  { id: 'work', label: 'work', x: 160, color: 'primary' as const },
  { id: 'body', label: 'body', x: 210, color: 'primary' as const },
];

export default function WeaverPattern_ThreadPull({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Lattice',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1281,
        isSeal: false,
      }}
      arrivalText="A fabric. Everything connected."
      prompt="You cannot touch one thing without touching everything. Your sleep affects your mood. Your mood affects your work. Respect the web."
      resonantText="Causality. You pulled one thread and the whole fabric moved. Systems thinking is the understanding that nothing exists in isolation. The thread you ignore is the one that unravels the cloth."
      afterglowCoda="Respect the web."
      onComplete={onComplete}
    >
      {(verse) => <ThreadPullInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ThreadPullInteraction({ verse }: { verse: any }) {
  const [pulled, setPulled] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handlePull = (id: string) => {
    if (pulled) return;
    setPulled(id);
    setDone(true);
    setTimeout(() => verse.advance(), 3200);
  };

  const W = 270, H = 180;
  const TOP = 25, BOT = 155;

  // How much each thread bunches when one is pulled
  const getBunch = (threadId: string) => {
    if (!pulled) return 0;
    const pulledIdx = THREADS.findIndex(t => t.id === pulled);
    const thisIdx = THREADS.findIndex(t => t.id === threadId);
    const dist = Math.abs(pulledIdx - thisIdx);
    if (threadId === pulled) return 20;
    return Math.max(0, 15 - dist * 5);
  };

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Horizontal weft lines */}
          {Array.from({ length: 8 }).map((_, i) => {
            const y = TOP + 10 + i * 16;
            return (
              <motion.path key={`h-${i}`}
                fill="none" stroke={verse.palette.primary}
                strokeWidth={0.5}
                animate={{
                  d: pulled
                    ? `M 30,${y} Q ${THREADS.find(t => t.id === pulled)!.x},${y + getBunch(pulled!) * 0.3 * (i % 2 === 0 ? 1 : -1)} ${W - 30},${y}`
                    : `M 30,${y} L ${W - 30},${y}`,
                  opacity: safeOpacity(0.08),
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            );
          })}

          {/* Vertical warp threads */}
          {THREADS.map((thread) => {
            const bunch = getBunch(thread.id);
            const isPulled = thread.id === pulled;
            const midY = (TOP + BOT) / 2;
            const col = thread.color === 'accent' ? verse.palette.accent : verse.palette.primary;

            return (
              <motion.g key={thread.id}>
                {/* Thread line */}
                <motion.path
                  fill="none"
                  stroke={col}
                  strokeLinecap="round"
                  animate={{
                    d: isPulled
                      ? `M ${thread.x},${TOP} Q ${thread.x},${midY - 10} ${thread.x},${midY + bunch} Q ${thread.x},${midY + bunch + 20} ${thread.x},${BOT + bunch}`
                      : bunch > 0
                        ? `M ${thread.x},${TOP} Q ${thread.x + bunch * 0.5},${midY} ${thread.x},${BOT}`
                        : `M ${thread.x},${TOP} L ${thread.x},${BOT}`,
                    strokeWidth: isPulled ? 2 : 1,
                    opacity: safeOpacity(isPulled ? 0.5 : 0.2),
                  }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Ripple rings on affected threads */}
                {pulled && bunch > 0 && !isPulled && (
                  <motion.circle
                    cx={thread.x} cy={midY}
                    fill="none" stroke={col}
                    strokeWidth={0.5}
                    initial={{ r: 2, opacity: 0.3 }}
                    animate={{ r: 12 + bunch, opacity: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                )}

                {/* Pull indicator */}
                {isPulled && (
                  <motion.path
                    d={`M ${thread.x - 4},${BOT + bunch - 5} L ${thread.x},${BOT + bunch + 5} L ${thread.x + 4},${BOT + bunch - 5}`}
                    fill={col}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: safeOpacity(0.3) }}
                  />
                )}

                {/* Label */}
                <motion.text
                  x={thread.x} textAnchor="middle"
                  fill={isPulled ? col : verse.palette.textFaint}
                  style={navicueType.micro}
                  animate={{
                    y: isPulled ? BOT + bunch + 20 : TOP - 8,
                    opacity: isPulled ? 0.6 : 0.35,
                  }}
                  transition={{ duration: 0.6 }}
                >
                  {thread.label}
                </motion.text>
              </motion.g>
            );
          })}

          {/* Connection arrows (appear when pulled) */}
          {pulled && done && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.2) }}
              transition={{ delay: 0.5 }}
            >
              {THREADS.filter(t => t.id !== pulled).map((thread) => {
                const src = THREADS.find(t => t.id === pulled)!;
                return (
                  <line key={`conn-${thread.id}`}
                    x1={src.x} y1={(TOP + BOT) / 2}
                    x2={thread.x} y2={(TOP + BOT) / 2}
                    stroke={verse.palette.accent}
                    strokeWidth={0.5} strokeDasharray="3 3" />
                );
              })}
            </motion.g>
          )}
        </svg>
      </div>

      {/* Thread selection */}
      {!pulled && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {THREADS.map(t => {
            const btn = immersiveTapButton(verse.palette, t.color === 'accent' ? 'accent' : 'accent');
            return (
              <motion.button key={t.id}
                style={{ ...btn.base, padding: '8px 12px' }}
                whileTap={btn.active}
                onClick={() => handlePull(t.id)}
              >
                pull {t.label}
              </motion.button>
            );
          })}
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'everything moved'
          : 'pull one thread. watch the rest.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          systems thinking
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'causality' : 'respect the web'}
      </div>
    </div>
  );
}
