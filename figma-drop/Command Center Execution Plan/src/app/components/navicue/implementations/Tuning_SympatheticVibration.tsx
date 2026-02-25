/**
 * TUNING #4 -- 1194. The Sympathetic Vibration
 * "If you ring true, the right people will ring back."
 * INTERACTION: Silent room. Hold to sing a note. Glass across the room rings back. Connection.
 * STEALTH KBE: Vocal Resonance -- authenticity (E)
 *
 * COMPOSITOR: witness_ritual / Echo / social / embodying / hold / 1194
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueInteraction, navicueStyles, immersiveTapButton, immersiveHoldButton } from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function Tuning_SympatheticVibration({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Echo',
        chrono: 'social',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1194,
        isSeal: false,
      }}
      arrivalText="A silent room."
      prompt="You do not need to touch them. You just need to be true. If you ring true, the right people will ring back."
      resonantText="Vocal Resonance. You sang and something across the room answered. Not because you reached for it. Because you vibrated at the right frequency. Authenticity is a broadcast. The right things resonate."
      afterglowCoda="Connection."
      onComplete={onComplete}
    >
      {(verse) => <SympatheticInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SympatheticInteraction({ verse }: { verse: any }) {
  const [glassRinging, setGlassRinging] = useState(false);
  const [done, setDone] = useState(false);

  const hold = useHoldInteraction({
    maxDuration: 2667, // ~100 / 1.5 * 40ms
    onComplete: () => {
      setGlassRinging(true);
      setTimeout(() => {
        setDone(true);
        setTimeout(() => verse.advance(), 2000);
      }, 1200);
    },
  });

  const pct = hold.tension;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 90)}>
        <svg viewBox="0 0 160 90" style={navicueStyles.heroSvg}>
          {/* You (left) */}
          <circle cx={35} cy={50} r={6}
            fill={hold.isHolding || done ? verse.palette.accent : 'hsla(0, 0%, 50%, 0.2)'}
            opacity={hold.isHolding ? 0.5 : 0.3}
          />

          {/* Sound waves emanating from you */}
          {pct > 0.1 && [1, 2, 3].map(i => {
            const r = 10 + i * 10 * pct;
            if (r > 50) return null;
            return (
              <motion.path key={i}
                d={`M ${35 + r * 0.7} ${50 - r * 0.5} Q ${35 + r} ${50} ${35 + r * 0.7} ${50 + r * 0.5}`}
                fill="none"
                stroke={done ? verse.palette.accent : 'hsla(200, 25%, 50%, 0.3)'}
                strokeWidth={0.8}
                opacity={0.2 * (1 - i * 0.2)}
                animate={hold.isHolding ? { opacity: [0.1, 0.3, 0.1] } : {}}
                transition={hold.isHolding ? { repeat: Infinity, duration: 0.6, delay: i * 0.15 } : {}}
              />
            );
          })}

          {/* Glass (right) */}
          <path
            d="M 115 60 Q 115 40 120 35 L 120 32 L 130 32 L 130 35 Q 135 40 135 60 Z"
            fill="none"
            stroke={glassRinging || done ? verse.palette.accent : 'hsla(0, 0%, 50%, 0.2)'}
            strokeWidth={1}
            opacity={0.3}
          />

          {/* Glass ringing waves */}
          {glassRinging && [1, 2].map(i => (
            <motion.circle key={`g${i}`}
              cx={125} cy={45} r={8 + i * 6}
              fill="none"
              stroke={verse.palette.accent}
              strokeWidth={0.8}
              animate={{ opacity: [0.3, 0, 0.3], r: [8 + i * 6, 12 + i * 8, 8 + i * 6] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.3 }}
            />
          ))}

          {/* Labels */}
          <text x={35} y={70} textAnchor="middle"
            style={{ ...navicueType.micro }}
            fill={verse.palette.textFaint} opacity={0.3}>
            you
          </text>
          <text x={125} y={72} textAnchor="middle"
            style={{ ...navicueType.micro }}
            fill={verse.palette.textFaint} opacity={0.3}>
            glass
          </text>

          {/* Connection line when ringing */}
          {done && (
            <motion.line
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              x1={42} y1={50} x2={115} y2={50}
              stroke={verse.palette.accent}
              strokeWidth={0.5} strokeDasharray="3 3"
            />
          )}
        </svg>
      </div>

      {!glassRinging && !done ? (() => {
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
            <div style={btn.label}>{hold.isHolding ? 'singing...' : 'hold to sing'}</div>
          </motion.div>
        );
      })() : glassRinging && !done ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}
        >
          ringing...
        </motion.span>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          connection
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'authenticity' : `resonance: ${Math.round(pct * 100)}%`}
      </div>
    </div>
  );
}