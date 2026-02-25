/**
 * EVOLUTIONIST #2 -- 1332. The Selection Pressure
 * "Comfort creates weakness. Pressure creates strength."
 * INTERACTION: Hold to endure the cold -- avatar strengthens
 * STEALTH KBE: Resilience -- Hormesis (E)
 *
 * COMPOSITOR: witness_ritual / Pulse / night / embodying / hold / 1332
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

export default function Evolutionist_SelectionPressure({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Pulse',
        chrono: 'night',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1332,
        isSeal: false,
      }}
      arrivalText="Soft environment. Weak creatures."
      prompt="Comfort creates weakness. Pressure creates strength. Do not curse the cold. It is forging you."
      resonantText="Resilience. You endured the cold and it forged you. Hormesis is the biological truth that sub-lethal stress creates super-adaptation. The pressure was the gift."
      afterglowCoda="Winter forges."
      onComplete={onComplete}
    >
      {(verse) => <SelectionPressureInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SelectionPressureInteraction({ verse }: { verse: any }) {
  const [done, setDone] = useState(false);

  const hold = useHoldInteraction({
    maxDuration: 5000,
    onComplete: () => {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    },
  });

  const btn = immersiveHoldButton(verse.palette, 90, 26);
  const W = 200, H = 160;
  const CX = W / 2, CY = H / 2;

  // Avatar grows with tension
  const avatarScale = 0.6 + hold.tension * 0.6;
  const avatarOpacity = 0.1 + hold.tension * 0.3;

  // Snow/pressure particles
  const snowflakes = Array.from({ length: 12 }).map((_, i) => ({
    startX: Math.random() * W,
    delay: i * 0.3,
  }));

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>pressure</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : hold.tension > 0.5 ? verse.palette.text : verse.palette.shadow,
        }}>
          {done ? 'forged' : hold.tension > 0 ? `${Math.round(hold.tension * 100)}%` : 'soft'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Environment gradient (warm -> cold) */}
          <motion.rect x={0} y={0} width={W} height={H} rx={6}
            fill={verse.palette.primary}
            animate={{
              opacity: safeOpacity(hold.tension * 0.06),
            }}
          />

          {/* Snow/pressure particles */}
          {hold.tension > 0.1 && snowflakes.map((s, i) => (
            <motion.circle key={i}
              r={1.5}
              fill={verse.palette.primary}
              animate={{
                cx: [s.startX, s.startX + (Math.random() - 0.5) * 30],
                cy: [-5, H + 5],
                opacity: [0, safeOpacity(hold.tension * 0.2), 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2 - hold.tension * 0.8,
                delay: s.delay,
              }}
            />
          ))}

          {/* Avatar (figure) */}
          <motion.g
            animate={{
              scale: avatarScale,
            }}
            style={{ transformOrigin: `${CX}px ${CY + 20}px` }}
          >
            {/* Head */}
            <motion.circle cx={CX} cy={CY - 15} r={10}
              fill={done ? verse.palette.accent : verse.palette.primary}
              animate={{ opacity: safeOpacity(avatarOpacity) }}
            />
            {/* Body */}
            <motion.rect x={CX - 8} y={CY - 5} width={16} height={30} rx={4}
              fill={done ? verse.palette.accent : verse.palette.primary}
              animate={{ opacity: safeOpacity(avatarOpacity) }}
            />
            {/* Arms */}
            <motion.line x1={CX - 8} y1={CY + 2} x2={CX - 20} y2={CY + 15}
              stroke={done ? verse.palette.accent : verse.palette.primary}
              strokeWidth={3} strokeLinecap="round"
              animate={{ opacity: safeOpacity(avatarOpacity) }}
            />
            <motion.line x1={CX + 8} y1={CY + 2} x2={CX + 20} y2={CY + 15}
              stroke={done ? verse.palette.accent : verse.palette.primary}
              strokeWidth={3} strokeLinecap="round"
              animate={{ opacity: safeOpacity(avatarOpacity) }}
            />
            {/* Legs */}
            <motion.line x1={CX - 5} y1={CY + 25} x2={CX - 10} y2={CY + 42}
              stroke={done ? verse.palette.accent : verse.palette.primary}
              strokeWidth={3} strokeLinecap="round"
              animate={{ opacity: safeOpacity(avatarOpacity) }}
            />
            <motion.line x1={CX + 5} y1={CY + 25} x2={CX + 10} y2={CY + 42}
              stroke={done ? verse.palette.accent : verse.palette.primary}
              strokeWidth={3} strokeLinecap="round"
              animate={{ opacity: safeOpacity(avatarOpacity) }}
            />
          </motion.g>

          {/* Strength aura */}
          {hold.tension > 0.5 && (
            <motion.circle cx={CX} cy={CY + 10}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.5}
              animate={{
                r: [20 * avatarScale, 35 * avatarScale],
                opacity: [safeOpacity(0.1), 0],
              }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            />
          )}

          {/* Winter label */}
          <text x={W - 15} y={20} textAnchor="end"
            fill={verse.palette.textFaint} style={{ fontSize: '7px' }}
            opacity={hold.tension > 0.3 ? 0.3 : 0.1}>
            winter
          </text>
        </svg>
      </div>

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
            {hold.isHolding ? 'enduring...' : 'endure the cold'}
          </div>
        </motion.div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the cold forged you'
          : hold.isHolding ? 'pressure creates strength...'
            : 'winter is coming'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          hormesis
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'resilience' : 'do not curse the cold'}
      </div>
    </div>
  );
}
