/**
 * WAYFINDER #5 -- 1165. The Cloud Stack
 * "Look for the stillness in the moving sky."
 * INTERACTION: Flat horizon. Clouds drift. One stays still. Identify it. Land beneath.
 * STEALTH KBE: Pattern Recognition -- insight (K)
 *
 * COMPOSITOR: pattern_glitch / Compass / work / knowing / tap / 1165
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Wayfinder_CloudStack({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Compass',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1165,
        isSeal: false,
      }}
      arrivalText="Flat horizon. Clouds moving."
      prompt="The land holds the heat. The heat holds the cloud. Look for the stillness in the moving sky."
      resonantText="Pattern Recognition. All the clouds drifted. One stayed. The heat of the land pinned it in place. Insight is seeing the still point in a moving world."
      afterglowCoda="Beneath."
      onComplete={onComplete}
    >
      {(verse) => <CloudStackInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CloudStackInteraction({ verse }: { verse: any }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [time, setTime] = useState(0);
  const STATIONARY_IDX = 2;

  useEffect(() => {
    const interval = setInterval(() => setTime(prev => prev + 0.02), 30);
    return () => clearInterval(interval);
  }, []);

  const clouds = useMemo(() => [
    { baseX: 20, y: 15, w: 35, speed: 0.4 },
    { baseX: 90, y: 22, w: 28, speed: 0.3 },
    { baseX: 55, y: 10, w: 32, speed: 0 }, // stationary
    { baseX: 120, y: 18, w: 30, speed: 0.5 },
    { baseX: 10, y: 28, w: 25, speed: 0.35 },
  ], []);

  const selectCloud = useCallback((idx: number) => {
    if (done) return;
    setSelected(idx);
    if (idx === STATIONARY_IDX) {
      setDone(true);
      setTimeout(() => verse.advance(), 2200);
    } else {
      setTimeout(() => setSelected(null), 800);
    }
  }, [done, verse]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 100)}>
        <svg viewBox="0 0 160 100" style={navicueStyles.heroSvg}>
          {/* Horizon */}
          <line x1={0} y1={65} x2={160} y2={65}
            stroke={verse.palette.primaryGlow} strokeWidth={1} opacity={0.12} />

          {/* Clouds */}
          {clouds.map((c, i) => {
            const xOffset = c.speed > 0 ? Math.sin(time * c.speed) * 15 + time * c.speed * 3 : 0;
            const x = ((c.baseX + xOffset) % 180) - 10;
            const isStationary = i === STATIONARY_IDX;
            const isSelected = selected === i;

            return (
              <g key={i} onClick={() => selectCloud(i)} style={{ cursor: done ? 'default' : 'pointer' }}>
                <ellipse cx={x} cy={c.y} rx={c.w / 2} ry={6}
                  fill={done && isStationary ? verse.palette.accent :
                    isSelected && !isStationary ? 'hsla(0, 25%, 50%, 0.15)' :
                    'hsla(0, 0%, 60%, 0.12)'}
                  stroke={isStationary && done ? verse.palette.accent : 'none'}
                  strokeWidth={0.5}
                  opacity={isStationary ? 0.4 : 0.2}
                />
                <ellipse cx={x + 5} cy={c.y - 3} rx={c.w / 3} ry={4}
                  fill={done && isStationary ? verse.palette.accent : 'hsla(0, 0%, 60%, 0.08)'}
                  opacity={isStationary ? 0.3 : 0.15}
                />
              </g>
            );
          })}

          {/* Land indicator under stationary cloud */}
          {done && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
              <path d="M 40 63 Q 55 55 70 60 Q 78 57 85 63"
                fill="none" stroke={verse.palette.accent} strokeWidth={1.5} />
              <line x1={55} y1={10} x2={55} y2={55}
                stroke={verse.palette.accent} strokeWidth={0.5}
                strokeDasharray="2 3" opacity={0.3} />
            </motion.g>
          )}

          {/* Wrong selection */}
          {selected !== null && selected !== STATIONARY_IDX && (
            <text x={80} y={50} textAnchor="middle"
              style={{ ...navicueType.hint, fontSize: 8 }}
              fill="hsla(0, 30%, 50%, 0.4)">
              that one is moving
            </text>
          )}
        </svg>
      </div>

      {/* Status */}
      {!done ? (
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
          find the still cloud
        </span>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          land beneath
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'insight' : 'stillness in motion'}
      </div>
    </div>
  );
}