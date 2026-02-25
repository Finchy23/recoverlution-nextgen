/**
 * RECEIVER #9 -- 1179. The Broadcast Power
 * "Stop whispering your life. Transmit with authority."
 * INTERACTION: Whispering. Hold "Transmit" button. Visual wave expands. "I AM HERE."
 * STEALTH KBE: Voice Projection -- assertiveness (E)
 *
 * COMPOSITOR: witness_ritual / Pulse / morning / embodying / hold / 1179
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction, immersiveTapButton, immersiveHoldButton } from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function Receiver_BroadcastPower({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Pulse',
        chrono: 'morning',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1179,
        isSeal: false,
      }}
      arrivalText="A whisper. Can anyone hear me?"
      prompt="Stop whispering your life. If you want the universe to answer, you must transmit with authority. Crank the power."
      resonantText="Voice Projection. The whisper traveled nowhere. You held the button, cranked the power, and the wave expanded past the horizon. Assertiveness is not volume. It is commitment to being heard."
      afterglowCoda="I am here."
      onComplete={onComplete}
    >
      {(verse) => <BroadcastPowerInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function BroadcastPowerInteraction({ verse }: { verse: any }) {
  const [done, setDone] = useState(false);

  const hold = useHoldInteraction({
    maxDuration: 2667, // ~100 / 1.5 * 40ms
    onComplete: () => {
      setDone(true);
      setTimeout(() => verse.advance(), 2400);
    },
  });

  const pct = hold.tension;
  const waveRadius = pct * 40;
  const messageSize = 8 + pct * 6;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 100)}>
        <svg viewBox="0 0 160 100" style={navicueStyles.heroSvg}>
          {/* Expanding broadcast waves */}
          {[1, 2, 3].map(i => {
            const r = waveRadius * (0.5 + i * 0.3);
            if (r < 3) return null;
            return (
              <motion.circle key={i}
                cx={80} cy={50} r={r}
                fill="none"
                stroke={done ? verse.palette.accent : 'hsla(200, 25%, 50%, 0.3)'}
                strokeWidth={0.8}
                opacity={Math.max(0, 0.4 - i * 0.1)}
                animate={hold.isHolding ? { opacity: [0.2, 0.4, 0.2] } : {}}
                transition={hold.isHolding ? { repeat: Infinity, duration: 0.8, delay: i * 0.15 } : {}}
              />
            );
          })}

          {/* Center transmitter */}
          <circle cx={80} cy={50} r={4}
            fill={hold.isHolding || done ? verse.palette.accent : 'hsla(0, 0%, 50%, 0.2)'}
            opacity={hold.isHolding ? 0.5 : done ? 0.6 : 0.3}
          />

          {/* Message text -- grows with power */}
          <text x={80} y={50 + 3} textAnchor="middle"
            style={{ ...navicueType.hint, fontSize: Math.round(messageSize) }}
            fill={done ? verse.palette.accent : verse.palette.textFaint}
            opacity={pct > 0.1 ? Math.min(0.6, pct) : 0.15}>
            {done ? 'I AM HERE' : pct > 0.5 ? 'i am here' : 'can anyone...'}
          </text>

          {/* Power meter */}
          <rect x={20} y={88} width={120} height={3} rx={1.5}
            fill={verse.palette.primaryGlow} opacity={0.15} />
          <rect x={20} y={88} width={120 * pct} height={3} rx={1.5}
            fill={done ? verse.palette.accent : 'hsla(200, 25%, 50%, 0.4)'} />
          <text x={80} y={86} textAnchor="middle"
            style={{ ...navicueType.micro }}
            fill={verse.palette.textFaint} opacity={0.3}>
            transmit power
          </text>
        </svg>
      </div>

      {/* Hold button */}
      {!done ? (() => {
        const btn = immersiveHoldButton(verse.palette);
        return (
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
            <div style={btn.label}>{hold.isHolding ? 'transmitting...' : 'hold to transmit'}</div>
          </motion.div>
        );
      })() : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          broadcast
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'assertiveness' : `power: ${Math.round(pct * 100)}%`}
      </div>
    </div>
  );
}