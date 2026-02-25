/**
 * CONDUCTOR #3 -- 1213. The Circuit Breaker (Overload)
 * "The darkness is a safety feature."
 * INTERACTION: Tap to unplug tasks, then reset the breaker
 * STEALTH KBE: Capacity Management -- Burnout Prevention (K)
 *
 * COMPOSITOR: pattern_glitch / Circuit / work / knowing / tap / 1213
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const DEVICES = [
  { label: 'perfectionism', load: 35 },
  { label: 'people-pleasing', load: 25 },
  { label: 'overcommitment', load: 30 },
  { label: 'doom-scrolling', load: 20 },
];

const CAPACITY = 60;

export default function Conductor_CircuitBreaker({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1213,
        isSeal: false,
      }}
      arrivalText="Lights flickering."
      prompt="The darkness is a safety feature. You drew too much power. Do not force the switch back up. Unplug some devices first."
      resonantText="Capacity management. The breaker tripped because you asked one circuit to carry four circuits of load. Burnout prevention is not weakness. It is engineering."
      afterglowCoda="Unplug first."
      onComplete={onComplete}
    >
      {(verse) => <BreakerInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function BreakerInteraction({ verse }: { verse: any }) {
  const [tripped, setTripped] = useState(false);
  const [unplugged, setUnplugged] = useState<Set<number>>(new Set());
  const [flickering, setFlickering] = useState(true);
  const [reset, setReset] = useState(false);
  const [done, setDone] = useState(false);

  const totalLoad = DEVICES.reduce((sum, d, i) =>
    unplugged.has(i) ? sum : sum + d.load, 0);
  const isOverloaded = totalLoad > CAPACITY;
  const canReset = tripped && !isOverloaded;

  // Initial trip
  const handleTrip = () => {
    if (tripped) return;
    setTripped(true);
    setFlickering(false);
  };

  const handleUnplug = (idx: number) => {
    if (reset) return;
    setUnplugged(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleReset = () => {
    if (!canReset || done) return;
    setReset(true);
    setDone(true);
    setTimeout(() => verse.advance(), 2500);
  };

  const btn = immersiveTapButton(verse.palette);
  const resetBtn = immersiveTapButton(verse.palette, canReset ? 'accent' : 'faint');

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Light bulb */}
      <div style={{
        position: 'relative', width: 60, height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <motion.div
          animate={{
            opacity: reset
              ? safeOpacity(0.6)
              : tripped
                ? safeOpacity(0.05)
                : flickering
                  ? [0.6, 0.15, 0.5, 0.1, 0.6]
                  : safeOpacity(0.6),
            scale: reset ? [1, 1.05, 1] : 1,
          }}
          transition={flickering ? { repeat: Infinity, duration: 0.6 } : { duration: 0.3 }}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: `radial-gradient(circle at 40% 35%, ${verse.palette.accent}, transparent 70%)`,
            boxShadow: reset ? `0 0 30px ${verse.palette.accentGlow}` : 'none',
          }}
        />
      </div>

      {/* Status */}
      <motion.span
        animate={{ opacity: 0.7 }}
        style={{
          ...navicueType.data,
          color: tripped && !reset ? verse.palette.shadow : verse.palette.text,
        }}
      >
        {reset ? 'system online' : tripped ? 'system offline' : 'system overload'}
      </motion.span>

      {/* Trip button (initial state) */}
      {!tripped && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ ...navicueType.data, color: verse.palette.shadow }}>
            load: {totalLoad}W / {CAPACITY}W
          </span>
          <motion.button
            style={btn.base}
            whileTap={btn.active}
            onClick={handleTrip}
          >
            click
          </motion.button>
        </div>
      )}

      {/* Device list (after trip) */}
      {tripped && !done && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 240 }}>
          <span style={{ ...navicueType.micro, color: verse.palette.textFaint, textAlign: 'center' }}>
            unplug devices below {CAPACITY}W
          </span>
          {DEVICES.map((device, i) => {
            const isOut = unplugged.has(i);
            return (
              <motion.button
                key={device.label}
                onClick={() => handleUnplug(i)}
                whileTap={{ scale: 0.97 }}
                style={{
                  ...btn.base,
                  width: '100%',
                  justifyContent: 'space-between',
                  opacity: isOut ? 0.3 : 0.8,
                  textDecoration: isOut ? 'line-through' : 'none',
                  padding: '10px 16px',
                }}
              >
                <span>{device.label}</span>
                <span style={{ ...navicueType.data, color: verse.palette.textFaint }}>
                  {device.load}W
                </span>
              </motion.button>
            );
          })}

          {/* Load indicator */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
            <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>load</span>
            <div style={{ width: 80, height: 3, borderRadius: 2, background: verse.palette.primaryFaint }}>
              <motion.div
                animate={{ width: `${Math.min(100, (totalLoad / CAPACITY) * 100)}%` }}
                style={{
                  height: '100%', borderRadius: 2,
                  background: isOverloaded ? verse.palette.shadow : verse.palette.accent,
                  opacity: 0.6,
                }}
              />
            </div>
            <span style={{
              ...navicueType.data,
              color: isOverloaded ? verse.palette.shadow : verse.palette.accent,
            }}>
              {totalLoad}/{CAPACITY}
            </span>
          </div>

          {/* Reset button */}
          <motion.button
            style={{
              ...resetBtn.base,
              marginTop: 8,
              opacity: canReset ? 1 : 0.3,
              cursor: canReset ? 'pointer' : 'not-allowed',
            }}
            whileTap={canReset ? resetBtn.active : {}}
            onClick={handleReset}
          >
            {canReset ? 'reset breaker' : 'still overloaded'}
          </motion.button>
        </div>
      )}

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          burnout prevention
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'capacity management' : tripped ? 'unplug first' : 'overloaded'}
      </div>
    </div>
  );
}
