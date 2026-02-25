/**
 * WEAVER PATTERN #2 -- 1282. The Knot (Loosening)
 * "Force tightens the knot. Patience loosens it."
 * INTERACTION: Hold gently (not too hard) to wiggle the knot open
 * STEALTH KBE: Gentleness -- Non-Forcing (E)
 *
 * COMPOSITOR: witness_ritual / Pulse / morning / embodying / hold / 1282
 */
import { useState, useRef, useCallback } from 'react';
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

export default function WeaverPattern_Knot({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Pulse',
        chrono: 'morning',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1282,
        isSeal: false,
      }}
      arrivalText="A tight knot."
      prompt="Force tightens the knot. Patience loosens it. Do not pull on the snag. Massage the tension until it gives."
      resonantText="Gentleness. You did not force. You wiggled. And the knot released. Non-forcing is the paradox of tension: the harder you pull, the tighter it gets. Patience is the only solvent."
      afterglowCoda="Massage the tension."
      onComplete={onComplete}
    >
      {(verse) => <KnotInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function KnotInteraction({ verse }: { verse: any }) {
  const [done, setDone] = useState(false);

  const hold = useHoldInteraction({
    maxDuration: 6000,
    onComplete: () => {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    },
  });

  const btn = immersiveHoldButton(verse.palette, 90, 26);
  const W = 220, H = 160;
  const CX = W / 2, CY = 75;

  // Knot tightness: 1 = tight, 0 = loose
  const tightness = 1 - hold.tension;

  // Knot geometry: gets simpler/wider as it loosens
  const knotR = 15 + tightness * 10;
  const loopSpread = 20 + (1 - tightness) * 40;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Tension readout */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>tension</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? 'released' : `${Math.round(tightness * 100)}%`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Left rope */}
          <motion.path
            fill="none" stroke={verse.palette.primary}
            strokeLinecap="round"
            animate={{
              d: `M 15,${CY} Q ${CX - loopSpread - 10},${CY - 5 * tightness} ${CX - knotR},${CY}`,
              strokeWidth: 2 + tightness,
              opacity: safeOpacity(0.25),
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Right rope */}
          <motion.path
            fill="none" stroke={verse.palette.primary}
            strokeLinecap="round"
            animate={{
              d: `M ${CX + knotR},${CY} Q ${CX + loopSpread + 10},${CY + 5 * tightness} ${W - 15},${CY}`,
              strokeWidth: 2 + tightness,
              opacity: safeOpacity(0.25),
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Knot loops */}
          {/* Upper loop */}
          <motion.path
            fill="none"
            stroke={tightness < 0.3 ? verse.palette.accent : verse.palette.primary}
            strokeLinecap="round"
            animate={{
              d: `M ${CX - knotR},${CY} Q ${CX - knotR * 0.5},${CY - loopSpread * 0.8} ${CX},${CY - loopSpread * 0.5} Q ${CX + knotR * 0.5},${CY - loopSpread * 0.2} ${CX + knotR * 0.3},${CY}`,
              strokeWidth: 2 + tightness * 0.5,
              opacity: safeOpacity(tightness < 0.3 ? 0.35 : 0.2),
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Lower loop */}
          <motion.path
            fill="none"
            stroke={tightness < 0.3 ? verse.palette.accent : verse.palette.primary}
            strokeLinecap="round"
            animate={{
              d: `M ${CX - knotR * 0.3},${CY} Q ${CX - knotR * 0.5},${CY + loopSpread * 0.2} ${CX},${CY + loopSpread * 0.5} Q ${CX + knotR * 0.5},${CY + loopSpread * 0.8} ${CX + knotR},${CY}`,
              strokeWidth: 2 + tightness * 0.5,
              opacity: safeOpacity(tightness < 0.3 ? 0.35 : 0.2),
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Cross-over in center */}
          <motion.path
            fill="none"
            stroke={verse.palette.primary}
            strokeLinecap="round"
            animate={{
              d: `M ${CX - knotR * 0.3},${CY - 3} Q ${CX},${CY} ${CX + knotR * 0.3},${CY + 3}`,
              strokeWidth: 1.5 + tightness,
              opacity: safeOpacity(tightness > 0.1 ? 0.15 : 0),
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Tension lines (tight state) */}
          {tightness > 0.5 && (
            <motion.g animate={{ opacity: safeOpacity(tightness * 0.15) }}>
              {[-1, 1].map(dir => (
                <motion.g key={dir}>
                  {[0, 1, 2].map(i => (
                    <line key={i}
                      x1={CX + dir * (knotR + 5 + i * 8)}
                      y1={CY - 3}
                      x2={CX + dir * (knotR + 10 + i * 8)}
                      y2={CY + 3}
                      stroke={verse.palette.shadow}
                      strokeWidth={0.5} />
                  ))}
                </motion.g>
              ))}
            </motion.g>
          )}

          {/* Release glow */}
          {done && (
            <motion.circle
              cx={CX} cy={CY} r={30}
              fill={verse.palette.accent}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: safeOpacity(0.1), scale: 1 }}
              transition={{ duration: 0.8 }}
            />
          )}

          {/* Label */}
          <motion.text
            x={CX} y={H - 15}
            textAnchor="middle"
            fill={done ? verse.palette.accent : verse.palette.textFaint}
            style={navicueType.micro}
            animate={{ opacity: 0.4 }}
          >
            {done ? 'open' : tightness > 0.7 ? 'tight' : tightness > 0.3 ? 'loosening...' : 'almost...'}
          </motion.text>
        </svg>
      </div>

      {/* Hold button */}
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
            {hold.isHolding ? 'gently...' : 'hold gently'}
          </div>
        </motion.div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'patience loosened it'
          : hold.isHolding ? 'the knot is responding...'
            : 'do not force. hold gently.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          non-forcing
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'gentleness' : 'massage the tension'}
      </div>
    </div>
  );
}
