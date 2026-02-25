/**
 * CYBERNETICIST #8 -- 1098. The Oscillation (The Hunt)
 * "Stop swinging from 'All In' to 'Burnout'. Small moves."
 * INTERACTION: Steer a line center -- gentle movements keep it; jerky movements crash
 * STEALTH KBE: Fine Motor Control -- moderation (E)
 *
 * COMPOSITOR: witness_ritual / Circuit / work / embodying / drag / 1098
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Cyberneticist_Oscillation({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1098,
        isSeal: false,
      }}
      arrivalText="The line is hunting."
      prompt="You are over-correcting. Stop swinging from 'All In' to 'Burnout'. Small moves. Tighten the weave."
      resonantText="Fine Motor Control. The line is still weaving, but the amplitude is a whisper now. Moderation is not the absence of motion. It is the refinement of it."
      afterglowCoda="Tight weave."
      onComplete={onComplete}
    >
      {(verse) => <OscillationInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function OscillationInteraction({ verse }: { verse: any }) {
  const [position, setPosition] = useState(0); // -100 to 100
  const [trail, setTrail] = useState<number[]>([]);
  const [steadyCount, setSteadyCount] = useState(0);
  const [complete, setComplete] = useState(false);
  const TRAIL_LENGTH = 40;
  const STEADY_TARGET = 20;
  const frameRef = useRef<number>();
  const posRef = useRef(0);

  // Record trail
  useEffect(() => {
    const record = () => {
      setTrail(prev => {
        const next = [...prev, posRef.current].slice(-TRAIL_LENGTH);
        // Check if recent trail is "tight" (low amplitude)
        if (next.length >= 10) {
          const recent = next.slice(-10);
          const max = Math.max(...recent);
          const min = Math.min(...recent);
          const amplitude = max - min;
          if (amplitude < 25) {
            setSteadyCount(c => {
              const nc = c + 1;
              if (nc >= STEADY_TARGET && !complete) {
                setComplete(true);
                setTimeout(() => verse.advance(), 2000);
              }
              return nc;
            });
          } else {
            setSteadyCount(0);
          }
        }
        return next;
      });
      frameRef.current = requestAnimationFrame(record);
    };
    // Slower frame rate for trail
    const interval = setInterval(() => {
      record();
    }, 100);
    return () => clearInterval(interval);
  }, [complete, verse]);

  const handleDrag = useCallback((_: any, info: any) => {
    if (complete) return;
    setPosition(prev => {
      const next = Math.max(-100, Math.min(100, prev + info.delta.x * 0.5));
      posRef.current = next;
      return next;
    });
  }, [complete]);

  const progressPct = Math.min(1, steadyCount / STEADY_TARGET);

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Trail visualization */}
      <div style={{
        width: 200, height: 80,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Center line */}
        <div style={{
          position: 'absolute',
          top: '50%', left: 0, right: 0,
          height: 1,
          background: verse.palette.primaryGlow,
          opacity: 0.2,
        }} />
        {/* Trail path */}
        <svg width={200} height={80} style={{ position: 'absolute', top: 0, left: 0 }}>
          <polyline
            points={trail.map((y, i) => {
              const x = (i / TRAIL_LENGTH) * 200;
              const cy = 40 + y * 0.3;
              return `${x},${cy}`;
            }).join(' ')}
            fill="none"
            stroke={verse.palette.accent}
            strokeWidth={1.5}
            opacity={0.5}
          />
        </svg>
      </div>

      {/* Drag handle */}
      {!complete ? (
        <motion.div
          drag="x"
          dragConstraints={{ left: -90, right: 90 }}
          dragElastic={0.1}
          dragMomentum={false}
          onDrag={handleDrag}
          animate={{ x: position }}
          style={{
            width: 40, height: 20, borderRadius: 10,
            border: `1px solid ${verse.palette.primaryGlow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'grab', touchAction: 'none',
            background: `hsla(0, 0%, 50%, 0.05)`,
          }}
        >
          <div style={{
            width: 4, height: 4, borderRadius: '50%',
            background: verse.palette.accent, opacity: 0.6,
          }} />
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ ...navicueType.hint, color: 'hsla(140, 40%, 55%, 0.8)', fontSize: 11 }}
          >
            tight weave
          </motion.div>
        </AnimatePresence>
      )}

      {/* Progress */}
      <div style={{ width: 80, height: 3, borderRadius: 2, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${progressPct * 100}%` }}
          style={{ height: '100%', background: verse.palette.accent, borderRadius: 2 }}
        />
      </div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {complete ? 'moderation' : 'small moves'}
      </div>
    </div>
  );
}