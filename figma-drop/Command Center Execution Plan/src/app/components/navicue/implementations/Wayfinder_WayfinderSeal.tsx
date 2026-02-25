/**
 * WAYFINDER #10 -- 1170. The Wayfinder Seal (The Proof)
 * "You are the center of the circle."
 * INTERACTION: Observe -- Star Compass (Sidereal Compass) -- horizon divided by rising/setting stars
 * STEALTH KBE: Cognitive Mapping -- spatial cognition (K)
 *
 * COMPOSITOR: science_x_soul / Compass / night / knowing / observe / 1170
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const STAR_NAMES = [
  'Polaris', 'Antares', 'Vega', 'Sirius', 'Canopus',
  'Arcturus', 'Rigel', 'Betelgeuse', 'Aldebaran', 'Spica',
  'Deneb', 'Fomalhaut',
];

export default function Wayfinder_WayfinderSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Compass',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1170,
        isSeal: true,
      }}
      arrivalText="A Star Compass. The horizon divided."
      prompt="You are the center of the circle."
      resonantText="Cognitive Mapping. The mental process of acquiring, coding, storing, recalling, and decoding information about relative locations. The Polynesian navigator carried no instruments. The compass was in the body. The map was in the mind. You are the center of the circle."
      afterglowCoda="Center."
      onComplete={onComplete}
    >
      {(verse) => <WayfinderSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function WayfinderSealInteraction({ verse }: { verse: any }) {
  const [observeTime, setObserveTime] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [rotation, setRotation] = useState(0);
  const OBSERVE_TARGET = 7;

  // Slow rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => prev + 0.15);
    }, 40);
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
  const cx = 80, cy = 55;
  const R = 40;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, minHeight: 260 }}>
      {/* Star Compass */}
      <div style={navicueStyles.heroScene(verse.palette, 160 / 115)}>
        <svg viewBox="0 0 160 115" style={navicueStyles.heroSvg}>
          {/* Outer ring (horizon) */}
          <circle cx={cx} cy={cy} r={R} fill="none"
            stroke={revealed ? verse.palette.accent : verse.palette.primaryGlow}
            strokeWidth={1} opacity={0.2 + progressPct * 0.15} />

          {/* Inner ring */}
          <circle cx={cx} cy={cy} r={R * 0.5} fill="none"
            stroke={verse.palette.primaryGlow} strokeWidth={0.5} opacity={0.1} />

          {/* Cardinal points */}
          {['N', 'E', 'S', 'W'].map((dir, i) => {
            const angle = (i * 90 - 90) * (Math.PI / 180);
            const x = cx + Math.cos(angle) * (R + 8);
            const y = cy + Math.sin(angle) * (R + 8);
            return (
              <text key={dir} x={x} y={y + 3} textAnchor="middle"
                style={{ ...navicueType.hint, fontSize: 8 }}
                fill={revealed ? verse.palette.accent : verse.palette.textFaint}
                opacity={0.3 + progressPct * 0.15}>
                {dir}
              </text>
            );
          })}

          {/* Star positions around the compass (rising and setting points) */}
          {STAR_NAMES.map((name, i) => {
            const angle = ((i / STAR_NAMES.length) * 360 + rotation) * (Math.PI / 180);
            const starR = R - 3;
            const x = cx + Math.cos(angle) * starR;
            const y = cy + Math.sin(angle) * starR;
            const isVisible = i <= Math.floor(progressPct * STAR_NAMES.length);

            return isVisible ? (
              <g key={i}>
                <motion.circle
                  cx={x} cy={y} r={1.5}
                  fill={revealed ? verse.palette.accent : 'hsla(45, 30%, 55%, 0.5)'}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 + i * 0.2, delay: i * 0.1 }}
                />
                {/* Star name (only show a few) */}
                {i % 3 === 0 && progressPct > 0.5 && (
                  <text
                    x={cx + Math.cos(angle) * (starR - 10)}
                    y={cy + Math.sin(angle) * (starR - 10) + 3}
                    textAnchor="middle"
                    style={{ ...navicueType.hint, fontSize: 5 }}
                    fill={verse.palette.textFaint}
                    opacity={0.25}
                  >
                    {name}
                  </text>
                )}
              </g>
            ) : null;
          })}

          {/* Radial lines (compass divisions) */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * 360 * (Math.PI / 180);
            return (
              <line key={i}
                x1={cx + Math.cos(angle) * (R - 8)}
                y1={cy + Math.sin(angle) * (R - 8)}
                x2={cx + Math.cos(angle) * R}
                y2={cy + Math.sin(angle) * R}
                stroke={revealed ? verse.palette.accent : verse.palette.primaryGlow}
                strokeWidth={0.5}
                opacity={0.1 + progressPct * 0.1}
              />
            );
          })}

          {/* Center point (You) */}
          <circle cx={cx} cy={cy} r={2}
            fill={revealed ? verse.palette.accent : 'hsla(0, 0%, 50%, 0.3)'}
            opacity={0.5} />
          {revealed && (
            <motion.circle
              initial={{ r: 2, opacity: 0.4 }}
              animate={{ r: 10, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
              cx={cx} cy={cy}
              fill="none" stroke={verse.palette.accent} strokeWidth={0.5}
            />
          )}
        </svg>
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
              you are the center of the circle
            </span>
            <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 10, opacity: 0.4 }}>
              the compass was in the body. the map was in the mind.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}