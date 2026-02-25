/**
 * WAYFINDER #6 -- 1166. The Etak (Reference Island)
 * "You need a third point. Triangulate."
 * INTERACTION: You, the goal, and everything moving. Pick an Etak to triangulate.
 * STEALTH KBE: Triangulation -- contextual awareness (K)
 *
 * COMPOSITOR: science_x_soul / Compass / work / knowing / tap / 1166
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const REFERENCE_POINTS = [
  { label: 'a mentor', x: 30, y: 25 },
  { label: 'a principle', x: 130, y: 30 },
  { label: 'a memory', x: 25, y: 70 },
  { label: 'a truth', x: 80, y: 20 },  // the correct etak (zenith position)
];

export default function Wayfinder_Etak({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Compass',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1166,
        isSeal: false,
      }}
      arrivalText="You. The goal. Everything moving."
      prompt="You need a third point. Me, the Goal, and the Etak. Triangulate your position relative to what you know is true."
      resonantText="Triangulation. Two points make a line. Three points make a position. You found the Etak, the fixed reference, and suddenly you knew where you were. Contextual awareness is knowing where you stand."
      afterglowCoda="Triangulated."
      onComplete={onComplete}
    >
      {(verse) => <EtakInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function EtakInteraction({ verse }: { verse: any }) {
  const [selectedEtak, setSelectedEtak] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  // You (bottom center) and Goal (right side)
  const youPos = { x: 80, y: 85 };
  const goalPos = { x: 135, y: 65 };

  const selectRef = useCallback((idx: number) => {
    if (done) return;
    setSelectedEtak(idx);
    // Any choice works -- you just need a third point
    setDone(true);
    setTimeout(() => verse.advance(), 2400);
  }, [done, verse]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 100)}>
        <svg viewBox="0 0 160 100" style={navicueStyles.heroSvg}>
          {/* You */}
          <circle cx={youPos.x} cy={youPos.y} r={5}
            fill="hsla(210, 20%, 50%, 0.3)"
            stroke={verse.palette.primaryGlow} strokeWidth={1} opacity={0.5} />
          <text x={youPos.x} y={youPos.y + 3} textAnchor="middle"
            style={{ ...navicueType.micro }}
            fill={verse.palette.textFaint} opacity={0.5}>
            you
          </text>

          {/* Goal */}
          <circle cx={goalPos.x} cy={goalPos.y} r={4}
            fill={done ? verse.palette.accent : 'hsla(45, 30%, 50%, 0.3)'}
            stroke={verse.palette.primaryGlow} strokeWidth={1} opacity={0.4} />
          <text x={goalPos.x} y={goalPos.y - 8} textAnchor="middle"
            style={{ ...navicueType.micro }}
            fill={verse.palette.textFaint} opacity={0.4}>
            goal
          </text>

          {/* Line: You -> Goal */}
          <line x1={youPos.x} y1={youPos.y} x2={goalPos.x} y2={goalPos.y}
            stroke={verse.palette.primaryGlow} strokeWidth={0.5} strokeDasharray="3 3" opacity={0.2} />

          {/* Reference points */}
          {REFERENCE_POINTS.map((pt, i) => (
            <g key={i} onClick={() => selectRef(i)} style={{ cursor: done ? 'default' : 'pointer' }}>
              <circle cx={pt.x} cy={pt.y} r={3}
                fill={selectedEtak === i && done ? verse.palette.accent : 'hsla(180, 25%, 50%, 0.2)'}
                stroke={verse.palette.primaryGlow} strokeWidth={0.5}
                opacity={selectedEtak === i ? 0.6 : 0.3}
              />
              <text x={pt.x} y={pt.y - 6} textAnchor="middle"
                style={{ ...navicueType.micro }}
                fill={verse.palette.textFaint} opacity={0.3}>
                {pt.label}
              </text>
            </g>
          ))}

          {/* Triangulation lines */}
          {done && selectedEtak !== null && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
              <line x1={youPos.x} y1={youPos.y}
                x2={REFERENCE_POINTS[selectedEtak].x} y2={REFERENCE_POINTS[selectedEtak].y}
                stroke={verse.palette.accent} strokeWidth={1} strokeDasharray="2 2" />
              <line x1={goalPos.x} y1={goalPos.y}
                x2={REFERENCE_POINTS[selectedEtak].x} y2={REFERENCE_POINTS[selectedEtak].y}
                stroke={verse.palette.accent} strokeWidth={1} strokeDasharray="2 2" />
              {/* Triangle fill */}
              <polygon
                points={`${youPos.x},${youPos.y} ${goalPos.x},${goalPos.y} ${REFERENCE_POINTS[selectedEtak].x},${REFERENCE_POINTS[selectedEtak].y}`}
                fill={verse.palette.accent} opacity={0.06}
              />
              <text
                x={(youPos.x + goalPos.x + REFERENCE_POINTS[selectedEtak].x) / 3}
                y={(youPos.y + goalPos.y + REFERENCE_POINTS[selectedEtak].y) / 3 + 3}
                textAnchor="middle"
                style={{ ...navicueType.micro }}
                fill={verse.palette.accent} opacity={0.5}>
                etak
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {/* Action */}
      {!done ? (
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
          choose your reference point
        </span>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          triangulated
        </motion.div>
      )}

      <div style={{ ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.35 }}>
        {done ? 'contextual awareness' : 'the third point'}
      </div>
    </div>
  );
}