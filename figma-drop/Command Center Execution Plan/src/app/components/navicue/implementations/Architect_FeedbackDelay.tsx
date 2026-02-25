/**
 * ARCHITECT #2 -- 1322. The Feedback Delay
 * "If you react to the lag, you oscillate."
 * INTERACTION: Drag knob -> overshoot (oscillate). Small adjust + wait -> stabilize
 * STEALTH KBE: Patience -- Systemic Patience (E)
 *
 * COMPOSITOR: pattern_glitch / Pulse / work / embodying / drag / 1322
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Architect_FeedbackDelay({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Pulse',
        chrono: 'work',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1322,
        isSeal: false,
      }}
      arrivalText="A shower knob. The water is cold."
      prompt="Systems have lag. If you react to the lag, you oscillate. Adjust. Wait. Measure. Then adjust again."
      resonantText="Patience. You adjusted slightly and waited. The temperature stabilized. Systemic patience is the discipline of trusting the delay: small input, wait for the signal, then adjust again."
      afterglowCoda="Adjust. Wait. Measure."
      onComplete={onComplete}
    >
      {(verse) => <FeedbackDelayInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FeedbackDelayInteraction({ verse }: { verse: any }) {
  const [knobAngle, setKnobAngle] = useState(0);       // 0-100 input
  const [actualTemp, setActualTemp] = useState(15);      // delayed response
  const [phase, setPhase] = useState<'cold' | 'adjusting' | 'stable'>('cold');
  const [history, setHistory] = useState<number[]>([15]);
  const [done, setDone] = useState(false);
  const stableCount = useRef(0);

  const TARGET = 38;
  const TOLERANCE = 3;

  useEffect(() => {
    const interval = setInterval(() => {
      setActualTemp(prev => {
        // Delayed approach toward knob setting
        const target = knobAngle * 0.6 + 10; // maps 0-100 -> 10-70
        const newTemp = prev + (target - prev) * 0.12; // slow lag
        setHistory(h => [...h.slice(-30), newTemp]);

        // Check stability
        if (Math.abs(newTemp - TARGET) < TOLERANCE && phase !== 'stable') {
          stableCount.current++;
          if (stableCount.current > 15) {
            setPhase('stable');
            setDone(true);
            setTimeout(() => verse.advance(), 3000);
          }
        } else if (Math.abs(newTemp - TARGET) >= TOLERANCE) {
          stableCount.current = 0;
        }
        return newTemp;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [knobAngle, phase, verse]);

  const handleKnobChange = (delta: number) => {
    if (done) return;
    setKnobAngle(prev => Math.max(0, Math.min(100, prev + delta)));
    if (phase === 'cold') setPhase('adjusting');
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 160;

  // Temperature color
  const tempColor = actualTemp < 30 ? verse.palette.primary
    : actualTemp > 45 ? verse.palette.shadow : verse.palette.accent;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>temp</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : tempColor,
        }}>
          {done ? 'perfect' : `${Math.round(actualTemp)}°`}
        </motion.span>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.3 }}>
          target: {TARGET}°
        </span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Target zone */}
          <rect x={20} y={H * (1 - (TARGET + TOLERANCE) / 70)}
            width={W - 40}
            height={H * (TOLERANCE * 2 / 70)}
            fill={verse.palette.accent} opacity={safeOpacity(0.04)} rx={2} />

          {/* Target line */}
          <line x1={20} y1={H * (1 - TARGET / 70)}
            x2={W - 20} y2={H * (1 - TARGET / 70)}
            stroke={verse.palette.accent} strokeWidth={0.5}
            strokeDasharray="4 3" opacity={safeOpacity(0.15)} />

          {/* Temperature history (sparkline) */}
          {history.length > 1 && (
            <motion.polyline
              points={history.map((t, i) => {
                const x = 20 + (i / 30) * (W - 40);
                const y = H * (1 - t / 70);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke={tempColor}
              strokeWidth={1.5}
              opacity={safeOpacity(0.4)}
            />
          )}

          {/* Current temp dot */}
          {history.length > 0 && (
            <motion.circle
              cx={20 + (Math.min(history.length - 1, 30) / 30) * (W - 40)}
              cy={H * (1 - actualTemp / 70)}
              r={4}
              fill={tempColor}
              opacity={safeOpacity(0.5)}
            />
          )}

          {/* Y-axis labels */}
          {[10, 25, 38, 50, 65].map(t => (
            <text key={t} x={15} y={H * (1 - t / 70) + 3}
              textAnchor="end" fill={t === 38 ? verse.palette.accent : verse.palette.textFaint}
              style={{ fontSize: '7px' }}
              opacity={t === 38 ? 0.4 : 0.15}>
              {t}°
            </text>
          ))}

          {/* Cold / hot zones */}
          <text x={W - 25} y={H - 8}
            fill={verse.palette.primary} style={{ fontSize: '7px' }} opacity={0.15}>
            cold
          </text>
          <text x={W - 25} y={15}
            fill={verse.palette.shadow} style={{ fontSize: '7px' }} opacity={0.15}>
            hot
          </text>

          {/* Lag indicator */}
          {phase === 'adjusting' && Math.abs(knobAngle * 0.6 + 10 - actualTemp) > 8 && (
            <motion.text
              x={W / 2} y={20} textAnchor="middle"
              fill={verse.palette.shadow} style={{ fontSize: '9px' }}
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              lag
            </motion.text>
          )}
        </svg>
      </div>

      {/* Knob controls */}
      {!done && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <motion.button
            style={{ ...btn.base, padding: '6px 12px' }}
            whileTap={btn.active}
            onClick={() => handleKnobChange(-15)}
          >
            cold
          </motion.button>
          <motion.button
            style={{ ...btn.base, padding: '6px 12px' }}
            whileTap={btn.active}
            onClick={() => handleKnobChange(-3)}
          >
            -
          </motion.button>

          {/* Knob readout */}
          <span style={{ ...navicueType.micro, color: verse.palette.textFaint, width: 35, textAlign: 'center' }}>
            {Math.round(knobAngle)}%
          </span>

          <motion.button
            style={{ ...btn.base, padding: '6px 12px' }}
            whileTap={btn.active}
            onClick={() => handleKnobChange(3)}
          >
            +
          </motion.button>
          <motion.button
            style={{ ...btn.base, padding: '6px 12px' }}
            whileTap={btn.active}
            onClick={() => handleKnobChange(15)}
          >
            hot
          </motion.button>
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'small adjust. wait. perfect.'
          : actualTemp > 50 ? 'scalding. overreaction.'
            : actualTemp < 20 ? 'cold. be patient with the lag.'
              : 'adjust slightly. wait for the system.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          systemic patience
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'patience' : 'respect the delay'}
      </div>
    </div>
  );
}
