/**
 * SCOUT #9 -- 1279. The Signal Fire
 * "Your fire tells others it is safe to come out."
 * INTERACTION: Tap to light fire, smoke rises, distant fire answers
 * STEALTH KBE: Visibility -- Community (E)
 *
 * COMPOSITOR: witness_ritual / Drift / night / embodying / tap / 1279
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

export default function Scout_SignalFire({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Drift',
        chrono: 'night',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1279,
        isSeal: false,
      }}
      arrivalText="Alone. Dark."
      prompt="You are not the only scout out here. Signal your presence. Your fire tells others it is safe to come out."
      resonantText="Visibility. You lit the fire and were answered. Community is the signal you send into the dark. Someone else is always out there, waiting for permission to be seen."
      afterglowCoda="Signal your presence."
      onComplete={onComplete}
    >
      {(verse) => <SignalFireInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SignalFireInteraction({ verse }: { verse: any }) {
  const [lit, setLit] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [done, setDone] = useState(false);

  const handleLight = () => {
    if (lit) return;
    setLit(true);
  };

  // After lighting, distant fire answers
  useEffect(() => {
    if (!lit) return;
    const t = setTimeout(() => {
      setAnswered(true);
      setDone(true);
      setTimeout(() => verse.advance(), 3200);
    }, 2500);
    return () => clearTimeout(t);
  }, [lit, verse]);

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 280, H = 180;

  // Fire colors warm amber
  const fireColor = '#f59e0b';

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Night sky */}
          <rect x={0} y={0} width={W} height={H} rx={8}
            fill={verse.palette.primary} opacity={safeOpacity(0.06)} />

          {/* Stars */}
          {[
            [30, 20], [80, 15], [140, 25], [200, 12], [240, 30],
            [55, 40], [170, 35], [220, 45], [110, 18],
          ].map(([x, y], i) => (
            <motion.circle key={i}
              cx={x} cy={y} r={1}
              fill={verse.palette.textFaint}
              animate={{ opacity: [safeOpacity(0.1), safeOpacity(0.25), safeOpacity(0.1)] }}
              transition={{ repeat: Infinity, duration: 2 + i * 0.3, delay: i * 0.2 }}
            />
          ))}

          {/* Horizon line */}
          <line x1={0} y1={120} x2={W} y2={120}
            stroke={verse.palette.primary} strokeWidth={0.5}
            opacity={safeOpacity(0.1)} />

          {/* Your campfire (foreground, left) */}
          <motion.g>
            {/* Fire base (logs) */}
            <line x1={55} y1={140} x2={85} y2={140}
              stroke={verse.palette.primary} strokeWidth={2}
              opacity={safeOpacity(0.15)} />
            <line x1={60} y1={138} x2={80} y2={142}
              stroke={verse.palette.primary} strokeWidth={1.5}
              opacity={safeOpacity(0.1)} />

            {/* Flames */}
            {lit && (
              <motion.g>
                {[0, 1, 2].map(i => (
                  <motion.path key={i}
                    d={`M ${66 + i * 5},140 Q ${64 + i * 6},${125 - i * 4} ${70 + i * 3},${120 - i * 3}`}
                    fill="none" stroke={fireColor}
                    strokeWidth={2}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: 1,
                      opacity: [safeOpacity(0.25), safeOpacity(0.4), safeOpacity(0.25)],
                    }}
                    transition={{
                      pathLength: { duration: 0.4 },
                      opacity: { repeat: Infinity, duration: 0.8, delay: i * 0.15 },
                    }}
                  />
                ))}

                {/* Fire glow */}
                <motion.circle
                  cx={70} cy={130} r={20}
                  fill={fireColor}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [safeOpacity(0.06), safeOpacity(0.1), safeOpacity(0.06)] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              </motion.g>
            )}

            {/* Smoke rising */}
            {lit && [0, 1, 2, 3].map(i => (
              <motion.circle key={`smoke-${i}`}
                cx={70 + i * 2} r={3 + i}
                fill={verse.palette.textFaint}
                animate={{
                  cy: [118, 60 - i * 15],
                  opacity: [safeOpacity(0.12), 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  delay: i * 0.6,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* "You" label */}
            <text x={70} y={155} textAnchor="middle"
              fill={verse.palette.textFaint} style={navicueType.micro}
              opacity={0.3}>
              you
            </text>
          </motion.g>

          {/* Distant answering fire (far right, smaller) */}
          {answered && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {/* Small distant flames */}
              {[0, 1].map(i => (
                <motion.path key={i}
                  d={`M ${210 + i * 3},120 Q ${209 + i * 3},${114 - i * 2} ${212 + i * 2},${112 - i * 2}`}
                  fill="none" stroke={fireColor}
                  strokeWidth={1}
                  animate={{
                    opacity: [safeOpacity(0.2), safeOpacity(0.35), safeOpacity(0.2)],
                  }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                />
              ))}

              {/* Distant glow */}
              <motion.circle
                cx={212} cy={116} r={8}
                fill={fireColor}
                animate={{ opacity: [safeOpacity(0.05), safeOpacity(0.08), safeOpacity(0.05)] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />

              {/* Distant smoke */}
              <motion.circle
                cx={213} r={2}
                fill={verse.palette.textFaint}
                animate={{
                  cy: [110, 80],
                  opacity: [safeOpacity(0.08), 0],
                }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeOut' }}
              />
            </motion.g>
          )}

          {/* Connection line between fires */}
          {answered && (
            <motion.line
              x1={85} y1={130} x2={205} y2={116}
              stroke={fireColor}
              strokeWidth={0.5}
              strokeDasharray="4 6"
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.15) }}
              transition={{ delay: 0.5 }}
            />
          )}
        </svg>
      </div>

      {!lit && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleLight}>
          light the fire
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'another fire answered'
          : lit ? 'smoke rises... waiting for a signal...'
            : 'you are alone in the dark'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          community
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'visibility' : 'signal your presence'}
      </div>
    </div>
  );
}
