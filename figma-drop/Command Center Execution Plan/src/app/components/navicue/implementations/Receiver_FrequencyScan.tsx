/**
 * RECEIVER #2 -- 1172. The Frequency Scan
 * "Slow down the dial. Lock onto the channel."
 * INTERACTION: Scanning across static. Drag dial slowly to lock onto clear voice.
 * STEALTH KBE: Patience -- attunement (E)
 *
 * COMPOSITOR: sensory_cinema / Pulse / morning / embodying / drag / 1172
 */
import { useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Receiver_FrequencyScan({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Pulse',
        chrono: 'morning',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1172,
        isSeal: false,
      }}
      arrivalText="Scanning... static..."
      prompt="The answer is on a specific frequency. If you are frantic, you are scanning too fast. Slow down the dial. Lock onto the channel."
      resonantText="Patience. You swept past the signal three times before you slowed down enough to hear it. The channel was narrow. Attunement requires deceleration. Slow the dial."
      afterglowCoda="Found it."
      onComplete={onComplete}
    >
      {(verse) => <FrequencyScanInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FrequencyScanInteraction({ verse }: { verse: any }) {
  const [freq, setFreq] = useState(88.0);
  const [locked, setLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  const [done, setDone] = useState(false);
  const lastDragSpeed = useRef(0);
  const TARGET_FREQ = 103.7;
  const LOCK_RANGE = 1.2;
  const LOCK_NEEDED = 12; // ticks in range to lock

  const isInRange = Math.abs(freq - TARGET_FREQ) < LOCK_RANGE;
  const signalStrength = isInRange ? 1 - Math.abs(freq - TARGET_FREQ) / LOCK_RANGE : 0;

  const handleDrag = useCallback((_: any, info: any) => {
    if (done) return;
    const speed = Math.abs(info.delta.x);
    lastDragSpeed.current = speed;

    // Too fast = skip
    if (speed > 8) {
      setFreq(prev => {
        const next = prev + info.delta.x * 0.3;
        return Math.max(88, Math.min(108, next));
      });
      setLockTime(0);
      return;
    }

    setFreq(prev => {
      const next = prev + info.delta.x * 0.15;
      return Math.max(88, Math.min(108, next));
    });

    if (Math.abs(freq - TARGET_FREQ) < LOCK_RANGE && speed < 4) {
      setLockTime(prev => {
        const next = prev + 1;
        if (next >= LOCK_NEEDED) {
          setLocked(true);
          setDone(true);
          setTimeout(() => verse.advance(), 2200);
        }
        return next;
      });
    } else {
      setLockTime(0);
    }
  }, [done, freq, verse]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      {/* Frequency display */}
      <div style={navicueStyles.heroScene(verse.palette, 160 / 80)}>
        <svg viewBox="0 0 160 80" style={navicueStyles.heroSvg}>
          {/* Frequency band */}
          <rect x={10} y={25} width={140} height={30} rx={3}
            fill="none" stroke={verse.palette.primaryGlow} strokeWidth={0.5} opacity={0.15} />

          {/* Scale markers */}
          {[88, 92, 96, 100, 104, 108].map(f => {
            const x = 10 + ((f - 88) / 20) * 140;
            return (
              <g key={f}>
                <line x1={x} y1={55} x2={x} y2={60} stroke={verse.palette.textFaint} strokeWidth={0.5} opacity={0.2} />
                <text x={x} y={68} textAnchor="middle"
                  style={{ ...navicueType.micro }}
                  fill={verse.palette.textFaint} opacity={0.25}>
                  {f}
                </text>
              </g>
            );
          })}

          {/* Target zone (invisible to user until close) */}
          {isInRange && (
            <rect
              x={10 + ((TARGET_FREQ - LOCK_RANGE - 88) / 20) * 140}
              y={26} width={(LOCK_RANGE * 2 / 20) * 140} height={28} rx={2}
              fill={locked ? verse.palette.accent : 'hsla(120, 30%, 40%, 0.1)'}
              opacity={locked ? 0.15 : signalStrength * 0.15}
            />
          )}

          {/* Needle */}
          <motion.line
            x1={10 + ((freq - 88) / 20) * 140}
            y1={24}
            x2={10 + ((freq - 88) / 20) * 140}
            y2={56}
            stroke={locked ? verse.palette.accent : 'hsla(0, 30%, 55%, 0.6)'}
            strokeWidth={1.5}
          />

          {/* Static visualization */}
          {!locked && Array.from({ length: 20 }).map((_, i) => {
            const x = 15 + i * 7;
            const h = isInRange ? (1 - signalStrength) * 8 + Math.random() * 4 : Math.random() * 12;
            return (
              <line key={i} x1={x} y1={40 - h} x2={x} y2={40 + h}
                stroke="hsla(0, 0%, 50%, 0.15)" strokeWidth={1} />
            );
          })}

          {/* Clear signal visualization */}
          {signalStrength > 0.3 && (
            <path
              d={Array.from({ length: 30 }).map((_, i) => {
                const x = 40 + i * 3;
                const y = 40 + Math.sin(i * 0.5) * 6 * signalStrength;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke={locked ? verse.palette.accent : 'hsla(200, 30%, 55%, 0.4)'}
              strokeWidth={1}
              opacity={signalStrength}
            />
          )}

          {/* Frequency readout */}
          <text x={80} y={18} textAnchor="middle"
            style={{ ...navicueType.micro }}
            fill={locked ? verse.palette.accent : verse.palette.textFaint}
            opacity={0.5}>
            {freq.toFixed(1)} MHz
          </text>
        </svg>
      </div>

      {/* Dial */}
      {!done ? (
        <motion.div
          drag="x"
          dragConstraints={{ left: -60, right: 60 }}
          dragElastic={0.05}
          dragMomentum={false}
          onDrag={handleDrag}
          style={{
            ...immersiveTapButton(verse.palette).base,
            cursor: 'grab',
            touchAction: 'none',
          }}
          whileTap={immersiveTapButton(verse.palette).active}
        >
          <span style={{ ...navicueType.hint, fontSize: 11 }}>
            {isInRange ? 'slow... hold...' : 'scan'}
          </span>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          locked
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'attunement' : isInRange ? `locking... ${Math.round((lockTime / LOCK_NEEDED) * 100)}%` : 'find the channel'}
      </div>
    </div>
  );
}