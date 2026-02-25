/**
 * FIELD ARCHITECT #10 -- 1110. The Field Seal (The Proof)
 * "The invisible holds the visible together."
 * INTERACTION: Observe -- Earth's magnetic field deflecting solar winds
 * STEALTH KBE: Social Field Theory -- node influence (E)
 *
 * COMPOSITOR: science_x_soul / Stellar / night / embodying / observe / 1110
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, safeOpacity } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function FieldArchitect_FieldSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Stellar',
        chrono: 'night',
        kbe: 'e',
        hook: 'observe',
        specimenSeed: 1110,
        isSeal: true,
      }}
      arrivalText="Earth. Surrounded by invisible force."
      prompt="The invisible holds the visible together."
      resonantText="Social Field Theory. Emotions and behaviors spread through social networks like magnetic fields. You are a node that influences the local cluster. Your field is real. It is just invisible."
      afterglowCoda="You are the field."
      onComplete={onComplete}
    >
      {(verse) => <FieldSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FieldSealInteraction({ verse }: { verse: any }) {
  const [observeTime, setObserveTime] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const OBSERVE_TARGET = 6;

  // Solar wind particles
  const [windParticles, setWindParticles] = useState<{ id: number; x: number; y: number; vx: number }[]>([]);

  useEffect(() => {
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      // Spawn new particle from the left
      if (frame % 4 === 0) {
        const id = frame;
        const y = 30 + Math.random() * 100;
        setWindParticles(prev => [...prev.slice(-20), { id, x: -10, y, vx: 2 + Math.random() }]);
      }
      // Move particles
      setWindParticles(prev =>
        prev.map(p => {
          let nx = p.x + p.vx;
          let ny = p.y;
          // Deflect around the magnetosphere (center at 100, 80)
          const dx = nx - 100;
          const dy = ny - 80;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 55 && dist > 20) {
            // Push outward
            const angle = Math.atan2(dy, dx);
            ny += Math.sin(angle) * 1.5;
            nx += 0.5; // keep moving right
          }
          return { ...p, x: nx, y: ny };
        }).filter(p => p.x < 220)
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Observe timer
  useEffect(() => {
    if (revealed) return;
    const interval = setInterval(() => {
      setObserveTime(prev => {
        const next = prev + 0.1;
        if (next >= OBSERVE_TARGET) {
          setRevealed(true);
          clearInterval(interval);
          setTimeout(() => verse.advance(), 3000);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [revealed, verse]);

  const progressPct = Math.min(1, observeTime / OBSERVE_TARGET);

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 200 / 160)}>
        {/* Solar wind particles */}
        {windParticles.map(p => (
          <motion.div
            key={p.id}
            style={{
              position: 'absolute',
              left: p.x, top: p.y,
              width: 2, height: 2, borderRadius: '50%',
              background: 'hsla(40, 60%, 60%, 0.5)',
            }}
          />
        ))}

        {/* Magnetosphere field lines */}
        <motion.div
          animate={{ opacity: 0.1 + progressPct * 0.2 }}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 100, height: 100,
            borderRadius: '40% 60% 60% 40%',
            border: `1px solid ${verse.palette.accent}`,
            transform: 'translate(-50%, -50%) rotate(-10deg)',
          }}
        />
        <motion.div
          animate={{ opacity: safeOpacity(0.05 + progressPct * 0.15) }}
          style={{
            position: 'absolute',
            top: '50%', left: '48%',
            width: 130, height: 130,
            borderRadius: '35% 65% 65% 35%',
            border: `1px solid ${verse.palette.accent}`,
            transform: 'translate(-50%, -50%) rotate(-10deg)',
          }}
        />

        {/* Earth */}
        <motion.div
          animate={{
            boxShadow: revealed
              ? `0 0 24px ${verse.palette.accent}`
              : `0 0 8px ${verse.palette.primaryGlow}`,
          }}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 24, height: 24, borderRadius: '50%',
            background: `radial-gradient(circle at 40% 40%, hsla(210, 50%, 50%, 0.6), hsla(140, 40%, 35%, 0.4))`,
            border: `1px solid ${verse.palette.accent}`,
            transform: 'translate(-50%, -50%)',
            opacity: 0.7 + progressPct * 0.3,
          }}
        />

        {/* Solar wind label */}
        <motion.span
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ repeat: Infinity, duration: 3 }}
          style={{
            position: 'absolute', top: 8, left: 8,
            ...navicueType.hint, color: 'hsla(40, 50%, 55%, 0.5)', fontSize: 9,
          }}
        >
          solar wind
        </motion.span>
      </div>

      {/* Status */}
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="observing"
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
              observe
            </span>
            <div style={{ width: 60, height: 2, borderRadius: 1, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${progressPct * 100}%` }}
                style={{ height: '100%', background: verse.palette.accent, borderRadius: 1 }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <span style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 12 }}>
              invisible but vital
            </span>
            <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 10, opacity: 0.4 }}>
              the invisible holds the visible together
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}