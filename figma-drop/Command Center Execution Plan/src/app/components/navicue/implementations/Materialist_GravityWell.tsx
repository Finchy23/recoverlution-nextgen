/**
 * MATERIALIST #3 -- 1033. The Gravity Well
 * "Increase your mass. Let the orbits adjust to you."
 * INTERACTION: A central planet with orbiting asteroids. Drag a slider
 * to increase gravitational mass. As mass grows, scattered elements
 * tighten their orbits and align. The system organizes around you.
 * STEALTH KBE: B (Believing) -- Self-Worth as Gravitational Mass
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueQuickstart,
  navicueType,
  safeOpacity,
  immersiveTapButton,
} from '@/app/design-system/navicue-blueprint';
import { useDragInteraction } from '../interactions/useDragInteraction';

interface Props { data?: any; onComplete?: () => void; }

const ORBITS = [
  { id: 'a', baseR: 70, speed: 1.0, offset: 0,    size: 3 },
  { id: 'b', baseR: 55, speed: 1.4, offset: 120,  size: 2 },
  { id: 'c', baseR: 85, speed: 0.7, offset: 240,  size: 2.5 },
  { id: 'd', baseR: 45, speed: 1.8, offset: 60,   size: 1.5 },
  { id: 'e', baseR: 65, speed: 1.2, offset: 180,  size: 2 },
];

export default function Materialist_GravityWell({ onComplete }: Props) {
  const [mass, setMass] = useState(0.15);
  const [locked, setLocked] = useState(false);

  const drag = useDragInteraction({
    axis: 'x',
    sticky: false,
    onThreshold: (p) => {
      if (locked) return;
      setMass(0.15 + p * 0.85);
    },
  });

  const handleLock = useCallback((advance: () => void) => {
    setLocked(true);
    setTimeout(() => advance(), 2000);
  }, []);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Ember',
        chrono: 'social',
        kbe: 'believing',
        hook: 'drag',
        specimenSeed: 1033,
        isSeal: false,
      }}
      arrivalText="Objects drift in space..."
      prompt="Drag to increase your gravitational mass. Watch the orbits tighten."
      resonantText="Increase your mass. The orbits adjust to you."
      afterglowCoda="Gravity."
      onComplete={onComplete}
      mechanism="Self-Gravitation"
    >
      {(verse) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
          {/* Orbital field */}
          <div style={navicueStyles.heroScene(verse.palette, 220 / 220)}>
            <svg viewBox="0 0 220 220" style={navicueStyles.heroSvg}>
              {/* Gravity well rings */}
              {[0.3, 0.5, 0.7, 0.9].map((r, i) => (
                <motion.circle
                  key={i}
                  cx={110} cy={110}
                  fill="none" stroke={verse.palette.primary} strokeWidth={0.3}
                  animate={{
                    r: r * 100 * (1 - mass * 0.4),
                    opacity: safeOpacity(0.03 + mass * 0.04),
                  }}
                  transition={{ duration: 0.5 }}
                />
              ))}

              {/* Central mass */}
              <motion.circle
                cx={110} cy={110}
                fill={verse.palette.accent}
                animate={{
                  r: 5 + mass * 12,
                  opacity: 0.1 + mass * 0.15,
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Orbiting bodies */}
              {ORBITS.map((orb) => {
                const orbitR = orb.baseR * (1 - mass * 0.5); // Tightens with mass
                return (
                  <motion.circle
                    key={orb.id}
                    r={orb.size}
                    fill={verse.palette.primary}
                    animate={{
                      cx: [
                        110 + Math.cos((orb.offset) * Math.PI / 180) * orbitR,
                        110 + Math.cos((orb.offset + 180) * Math.PI / 180) * orbitR,
                        110 + Math.cos((orb.offset + 360) * Math.PI / 180) * orbitR,
                      ],
                      cy: [
                        110 + Math.sin((orb.offset) * Math.PI / 180) * orbitR * 0.6,
                        110 + Math.sin((orb.offset + 180) * Math.PI / 180) * orbitR * 0.6,
                        110 + Math.sin((orb.offset + 360) * Math.PI / 180) * orbitR * 0.6,
                      ],
                      opacity: 0.1 + mass * 0.15,
                    }}
                    transition={{
                      cx: { duration: 8 / orb.speed, repeat: Infinity, ease: 'linear' },
                      cy: { duration: 8 / orb.speed, repeat: Infinity, ease: 'linear' },
                      opacity: { duration: 0.3 },
                    }}
                  />
                );
              })}
            </svg>
          </div>

          {/* Mass slider */}
          {!locked && (
            <div
              {...drag.dragProps}
              style={{
                ...drag.dragProps.style,
                width: '100%', maxWidth: 260, height: 44,
                borderRadius: 22,
                background: verse.palette.primaryFaint,
                border: `1px solid ${verse.palette.primaryGlow}`,
                position: 'relative', overflow: 'hidden',
              }}
            >
              <motion.div
                animate={{ width: `${mass * 100}%` }}
                style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  background: verse.palette.primaryGlow,
                  borderRadius: 22, opacity: 0.3,
                }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...navicueType.data, color: verse.palette.textFaint,
              }}>
                mass: {Math.round(mass * 100)}%
              </div>
            </div>
          )}

          {!locked && mass >= 0.9 && (
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              onClick={() => handleLock(verse.advance)}
              whileTap={{ scale: 0.95 }}
              style={{
                ...immersiveTapButton,
                ...navicueType.hint,
                color: verse.palette.text,
                cursor: 'pointer',
              }}
            >
              Hold this gravity
            </motion.button>
          )}

          {locked && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
              style={{ ...navicueType.texture, color: verse.palette.textFaint, fontStyle: 'italic' }}
            >
              Everything orbits the heaviest object.
            </motion.div>
          )}
        </div>
      )}
    </NaviCueVerse>
  );
}