/**
 * VECTOR #9 -- 1189. The Field Line
 * "Follow the field line. The path of least resistance."
 * INTERACTION: You are a particle. Follow the invisible curve of the field. Flow.
 * STEALTH KBE: Intuition -- flow (B)
 *
 * COMPOSITOR: witness_ritual / Drift / morning / believing / drag / 1189
 */
import { useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

// Field line path points (curve)
const FIELD_PATH = [
  { x: 20, y: 75 }, { x: 35, y: 60 }, { x: 55, y: 50 },
  { x: 75, y: 42 }, { x: 95, y: 38 }, { x: 110, y: 30 },
  { x: 125, y: 20 }, { x: 140, y: 15 },
];

export default function Vector_FieldLine({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Drift',
        chrono: 'morning',
        kbe: 'b',
        hook: 'drag',
        specimenSeed: 1189,
        isSeal: false,
      }}
      arrivalText="A field. Invisible curves."
      prompt="Do not fight the geometry of the space. Follow the field line. It is the path of least resistance."
      resonantText="Intuition. The straight line looked shorter but fought the field. The curve was longer but effortless. Flow is not the shortest path. It is the path the universe already carved."
      afterglowCoda="Flow."
      onComplete={onComplete}
    >
      {(verse) => <FieldLineInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FieldLineInteraction({ verse }: { verse: any }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const handleDrag = useCallback((_: any, info: any) => {
    if (done) return;
    const fwd = info.delta.x > 0 ? info.delta.x : 0;
    setProgress(prev => {
      const next = Math.min(1, prev + fwd * 0.008);
      if (next >= 1) {
        setDone(true);
        setTimeout(() => verse.advance(), 2200);
      }
      return next;
    });
  }, [done, verse]);

  // Current particle position along path
  const idx = Math.min(FIELD_PATH.length - 2, Math.floor(progress * (FIELD_PATH.length - 1)));
  const t = (progress * (FIELD_PATH.length - 1)) - idx;
  const px = FIELD_PATH[idx].x + (FIELD_PATH[Math.min(idx + 1, FIELD_PATH.length - 1)].x - FIELD_PATH[idx].x) * t;
  const py = FIELD_PATH[idx].y + (FIELD_PATH[Math.min(idx + 1, FIELD_PATH.length - 1)].y - FIELD_PATH[idx].y) * t;

  // Build SVG path string
  const pathD = FIELD_PATH.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 90)}>
        <svg viewBox="0 0 160 90" style={navicueStyles.heroSvg}>
          {/* Field lines (background curves) */}
          {[-15, 0, 15].map((offset, i) => (
            <path key={i}
              d={FIELD_PATH.map((p, j) =>
                `${j === 0 ? 'M' : 'L'} ${p.x} ${p.y + offset}`
              ).join(' ')}
              fill="none"
              stroke={i === 1
                ? (done ? verse.palette.accent : 'hsla(200, 25%, 50%, 0.2)')
                : verse.palette.primaryGlow}
              strokeWidth={i === 1 ? 1 : 0.5}
              opacity={i === 1 ? (done ? 0.4 : 0.2) : 0.08}
              strokeDasharray={i === 1 ? 'none' : '2 4'}
            />
          ))}

          {/* Small directional arrows along field */}
          {FIELD_PATH.filter((_, i) => i % 2 === 1).map((p, i) => {
            const next = FIELD_PATH[Math.min(FIELD_PATH.indexOf(p) + 1, FIELD_PATH.length - 1)];
            const angle = Math.atan2(next.y - p.y, next.x - p.x);
            return (
              <path key={`arr${i}`}
                d={`M ${p.x - Math.cos(angle) * 3 - Math.sin(angle) * 2} ${p.y - Math.sin(angle) * 3 + Math.cos(angle) * 2} L ${p.x} ${p.y} L ${p.x - Math.cos(angle) * 3 + Math.sin(angle) * 2} ${p.y - Math.sin(angle) * 3 - Math.cos(angle) * 2}`}
                fill="none" stroke={verse.palette.primaryGlow} strokeWidth={0.8}
                opacity={0.12}
              />
            );
          })}

          {/* Particle */}
          <motion.circle
            cx={px} cy={py} r={4}
            fill={done ? verse.palette.accent : 'hsla(200, 30%, 55%, 0.5)'}
            opacity={0.6}
          />

          {/* Trail */}
          <path
            d={FIELD_PATH.slice(0, idx + 2).map((p, i) =>
              `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
            ).join(' ')}
            fill="none"
            stroke={done ? verse.palette.accent : 'hsla(200, 30%, 55%, 0.3)'}
            strokeWidth={2}
            opacity={0.3}
            strokeDasharray={`${progress * 200} 200`}
          />
        </svg>
      </div>

      {!done ? (
        <motion.div
          drag="x"
          dragConstraints={{ left: -40, right: 40 }}
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
          follow the field
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          flow
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'flow' : 'path of least resistance'}
      </div>
    </div>
  );
}