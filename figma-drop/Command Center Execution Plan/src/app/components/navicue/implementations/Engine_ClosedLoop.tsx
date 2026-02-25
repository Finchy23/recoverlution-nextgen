/**
 * ENGINE #3 -- 1053. The Closed Loop
 * "You don't need more water. You need fewer holes."
 * INTERACTION: Tap to identify and patch leaks -- pressure builds
 * STEALTH KBE: Resource management -- systemic awareness (K)
 *
 * COMPOSITOR: pattern_glitch / Circuit / work / knowing / tap / 1053
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const LEAKS = [
  { id: 'distraction', label: 'distraction', x: 25, y: 40 },
  { id: 'overthinking', label: 'overthinking', x: 65, y: 30 },
  { id: 'comparison', label: 'comparison', x: 45, y: 70 },
];

export default function Engine_ClosedLoop({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1053,
        isSeal: false,
      }}
      arrivalText="A pipe leaking water."
      prompt="You do not need more water. You need fewer holes. Find the leak. Patch it. Watch the pressure rise."
      resonantText="Resource management. Energy is finite. Every leak is a choice you forgot you made. Name the drain. Seal it."
      afterglowCoda="Fewer holes."
      onComplete={onComplete}
    >
      {(verse) => <ClosedLoopInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ClosedLoopInteraction({ verse }: { verse: any }) {
  const [patched, setPatched] = useState<string[]>([]);
  const [allPatched, setAllPatched] = useState(false);

  const handlePatch = (id: string) => {
    if (patched.includes(id)) return;
    const next = [...patched, id];
    setPatched(next);
    if (next.length >= LEAKS.length) {
      setAllPatched(true);
      setTimeout(() => verse.advance(), 2500);
    }
  };

  const pressure = (patched.length / LEAKS.length) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Pipe system */}
      <div style={{
        width: 200,
        height: 120,
        position: 'relative',
        borderRadius: 8,
        border: `1px solid ${verse.palette.primaryFaint}`,
        overflow: 'hidden',
      }}>
        {/* Pipe path */}
        <svg width="200" height="120" viewBox="0 0 200 120" style={{ position: 'absolute', inset: 0 }}>
          <path
            d="M 10 60 L 50 60 L 50 30 L 130 30 L 130 70 L 90 70 L 90 90 L 190 90"
            fill="none"
            stroke={verse.palette.primaryGlow}
            strokeWidth={4}
            opacity={0.3}
          />
        </svg>

        {/* Leaks */}
        {LEAKS.map(leak => {
          const isPatched = patched.includes(leak.id);
          return (
            <motion.div
              key={leak.id}
              style={{
                position: 'absolute',
                left: `${leak.x}%`,
                top: `${leak.y}%`,
                transform: 'translate(-50%, -50%)',
                cursor: isPatched ? 'default' : 'pointer',
              }}
              onClick={() => handlePatch(leak.id)}
            >
              {/* Leak drops */}
              {!isPatched && (
                <motion.div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'hsla(200, 50%, 60%, 0.4)',
                  }}
                  animate={{
                    y: [0, 15],
                    opacity: [0.4, 0],
                    scale: [1, 0.5],
                  }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
              {/* Patch indicator */}
              {isPatched && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: verse.palette.accentGlow,
                    border: `1px solid ${verse.palette.accent}`,
                  }}
                />
              )}
              {/* Label */}
              <div style={{
                ...navicueType.micro,
                color: isPatched ? verse.palette.accent : verse.palette.textFaint,
                fontSize: 11,
                textAlign: 'center',
                marginTop: 2,
                whiteSpace: 'nowrap',
              }}>
                {leak.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pressure gauge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>pressure</span>
        <div style={{ width: 100, height: 4, background: verse.palette.primaryFaint, borderRadius: 2 }}>
          <motion.div
            style={{ height: '100%', borderRadius: 2, background: verse.palette.primary }}
            animate={{ width: `${pressure}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      {!allPatched && (
        <div style={{ ...navicueType.hint, color: verse.palette.textFaint }}>
          tap the leaks
        </div>
      )}

      {allPatched && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          sealed
        </motion.div>
      )}
    </div>
  );
}