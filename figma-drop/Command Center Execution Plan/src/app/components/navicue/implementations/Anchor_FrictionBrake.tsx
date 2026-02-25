/**
 * ANCHOR #5 -- 1295. The Friction Brake (Slowing)
 * "Momentum can be a trap. Pull the brake. Embrace the heat."
 * INTERACTION: Hold to apply brake -- sparks fly, speed decreases, control returns
 * STEALTH KBE: Deceleration -- Stop-Think-Act (E)
 *
 * COMPOSITOR: pattern_glitch / Pulse / work / embodying / hold / 1295
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveHoldButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function Anchor_FrictionBrake({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Pulse',
        chrono: 'work',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1295,
        isSeal: false,
      }}
      arrivalText="Runaway. No brakes."
      prompt="Momentum can be a trap. If you are going fast in the wrong direction, friction is your friend. Pull the brake. Embrace the heat."
      resonantText="Deceleration. You pulled the brake and the sparks flew. Stop-think-act is the discipline of controlled friction. The heat is the cost of wisdom."
      afterglowCoda="Embrace the heat."
      onComplete={onComplete}
    >
      {(verse) => <FrictionBrakeInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FrictionBrakeInteraction({ verse }: { verse: any }) {
  const [done, setDone] = useState(false);

  const hold = useHoldInteraction({
    maxDuration: 5000,
    onComplete: () => {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    },
  });

  const btn = immersiveHoldButton(verse.palette, 90, 26);
  const W = 260, H = 130;

  // Speed: 100% at start, 0% when braked
  const speed = 1 - hold.tension;
  const sparking = hold.isHolding && hold.tension > 0.1;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Speed readout */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>speed</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : speed > 0.7 ? verse.palette.shadow : verse.palette.text,
        }}>
          {done ? 'control' : `${Math.round(speed * 100)}%`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Track */}
          <line x1={20} y1={95} x2={W - 20} y2={95}
            stroke={verse.palette.primary} strokeWidth={2}
            opacity={safeOpacity(0.1)} />
          <line x1={20} y1={97} x2={W - 20} y2={97}
            stroke={verse.palette.primary} strokeWidth={0.5}
            opacity={safeOpacity(0.06)} />

          {/* Speed lines (blur effect) */}
          {speed > 0.2 && Array.from({ length: Math.ceil(speed * 6) }).map((_, i) => (
            <motion.line key={i}
              y1={30 + i * 12} y2={30 + i * 12}
              stroke={verse.palette.primary}
              strokeWidth={0.8}
              animate={{
                x1: [W + 10, -30],
                x2: [W + 30 + speed * 40, -10],
                opacity: [0, safeOpacity(speed * 0.1), 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.3 + (1 - speed) * 0.5,
                delay: i * 0.08,
                ease: 'linear',
              }}
            />
          ))}

          {/* Train body */}
          <motion.g
            animate={{
              x: done ? 0 : [0, 2, -1, 3, 0],
            }}
            transition={done ? {} : { repeat: Infinity, duration: 0.2 }}
          >
            <rect x={W / 2 - 35} y={60} width={70} height={35} rx={4}
              fill={verse.palette.primary} opacity={safeOpacity(0.08)} />
            <rect x={W / 2 - 35} y={60} width={70} height={35} rx={4}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={1} opacity={safeOpacity(0.2)} />

            {/* Wheels */}
            {[-20, 0, 20].map(dx => (
              <motion.circle key={dx}
                cx={W / 2 + dx} cy={95} r={6}
                fill="none"
                stroke={verse.palette.primary}
                strokeWidth={1}
                opacity={safeOpacity(0.15)}
                animate={speed > 0.1 ? { rotate: 360 } : {}}
                transition={speed > 0.1 ? {
                  repeat: Infinity,
                  duration: 0.3 / speed,
                  ease: 'linear',
                } : {}}
              />
            ))}
          </motion.g>

          {/* Brake sparks */}
          {sparking && Array.from({ length: 5 }).map((_, i) => (
            <motion.circle key={`spark-${i}`}
              r={1.5}
              fill="#f59e0b"
              animate={{
                cx: [W / 2 - 20 + i * 5, W / 2 - 30 - i * 8 + Math.random() * 10],
                cy: [93, 80 - Math.random() * 20],
                opacity: [safeOpacity(0.5), 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.4,
                delay: i * 0.06,
              }}
            />
          ))}

          {/* Brake line (heat glow) */}
          {sparking && (
            <motion.line
              x1={W / 2 - 25} y1={96} x2={W / 2 + 25} y2={96}
              stroke="#f59e0b"
              strokeWidth={2}
              animate={{ opacity: [safeOpacity(0.15), safeOpacity(0.3), safeOpacity(0.15)] }}
              transition={{ repeat: Infinity, duration: 0.3 }}
            />
          )}

          {/* Stopped state */}
          {done && (
            <motion.text
              x={W / 2} y={50} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.choice}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.3 }}
            >
              control
            </motion.text>
          )}
        </svg>
      </div>

      {/* Hold brake */}
      {!done && (
        <motion.div
          {...hold.holdProps}
          animate={hold.isHolding ? btn.holding : {}}
          transition={{ duration: 0.2 }}
          style={{ ...hold.holdProps.style, ...btn.base }}
        >
          <svg viewBox="0 0 90 90" style={btn.progressRing.svg}>
            <circle {...btn.progressRing.track} />
            <circle {...btn.progressRing.fill(hold.tension)} />
          </svg>
          <div style={btn.label}>
            {hold.isHolding ? 'braking...' : 'pull brake'}
          </div>
        </motion.div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'you stopped before the wrong destination'
          : hold.isHolding ? 'friction is your friend...'
            : 'going fast in the wrong direction'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          stop-think-act
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'deceleration' : 'embrace the heat'}
      </div>
    </div>
  );
}
