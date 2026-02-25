/**
 * TENSEGRITY #10 -- 1160. The Tensegrity Seal (The Proof)
 * "Tension + Integrity = Tensegrity."
 * INTERACTION: Observe -- geodesic sphere -- gets proportionally stronger as it gets larger
 * STEALTH KBE: Biotensegrity -- we float in our own connective tissue (E)
 *
 * COMPOSITOR: science_x_soul / Lattice / night / embodying / observe / 1160
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Tensegrity_TensegritySeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Lattice',
        chrono: 'night',
        kbe: 'e',
        hook: 'observe',
        specimenSeed: 1160,
        isSeal: true,
      }}
      arrivalText="A geodesic sphere. Growing."
      prompt="Tension + Integrity = Tensegrity."
      resonantText="Biotensegrity. The body is a tensegrity structure. Bones as struts, fascia as tension. Not a stack of bricks. We float in our own connective tissue. The only man-made structure that gets proportionally stronger as it gets larger."
      afterglowCoda="Float."
      onComplete={onComplete}
    >
      {(verse) => <TensegritySealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function TensegritySealInteraction({ verse }: { verse: any }) {
  const [observeTime, setObserveTime] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(0.7);
  const OBSERVE_TARGET = 7;

  // Slow rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => prev + 0.4);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Grow as user observes
  useEffect(() => {
    if (revealed) return;
    const interval = setInterval(() => {
      setObserveTime(prev => {
        const next = prev + 0.1;
        setScale(0.7 + (next / OBSERVE_TARGET) * 0.5);
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

  // Geodesic dome vertices (icosahedron-like projection)
  const R = 40 * scale;
  const cx = 80, cy = 50;
  const verts: [number, number][] = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + rotation * 0.02;
    const ring = i < 5 ? 0 : i < 10 ? 1 : 2;
    const r = ring === 2 ? R * 0.2 : ring === 1 ? R * 0.85 : R;
    const yOff = ring === 0 ? -R * 0.3 : ring === 1 ? R * 0.25 : R * 0.5;
    verts.push([cx + Math.cos(angle) * r, cy + yOff + Math.sin(angle) * r * 0.3]);
  }

  // Edges (triangulated connections)
  const edges: [number, number][] = [];
  for (let i = 0; i < 5; i++) {
    edges.push([i, (i + 1) % 5]); // top ring
    edges.push([i + 5, ((i + 1) % 5) + 5]); // bottom ring
    edges.push([i, i + 5]); // verticals
    edges.push([i, ((i + 1) % 5) + 5]); // cross-braces
    edges.push([i, 10 + (i < 3 ? 0 : 1)]); // to poles
    edges.push([i + 5, 10 + (i < 3 ? 1 : 0)]); // to poles
  }

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Geodesic sphere */}
      <div style={navicueStyles.heroScene(verse.palette, 160 / 110)}>
        <svg viewBox="0 0 160 110" style={navicueStyles.heroSvg}>
          {/* Edges */}
          {edges.map(([a, b], i) => {
            if (!verts[a] || !verts[b]) return null;
            return (
              <line key={i}
                x1={verts[a][0]} y1={verts[a][1]}
                x2={verts[b][0]} y2={verts[b][1]}
                stroke={revealed ? verse.palette.accent : 'hsla(180, 25%, 50%, 0.25)'}
                strokeWidth={revealed ? 1.2 : 0.8}
                opacity={0.15 + progressPct * 0.2}
              />
            );
          })}

          {/* Vertices */}
          {verts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={revealed ? 2.5 : 1.5}
              fill={revealed ? verse.palette.accent : 'hsla(180, 25%, 50%, 0.4)'}
              opacity={0.3 + progressPct * 0.2}
            />
          ))}

          {/* Scale label */}
          {progressPct > 0.3 && (
            <text x={cx} y={cy + R + 15} textAnchor="middle"
              style={{ ...navicueType.micro }}
              fill={verse.palette.textFaint} opacity={progressPct * 0.4}>
              {`${Math.round(scale * 100)}% size / ${Math.round(scale * 120)}% strength`}
            </text>
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
            <span style={navicueStyles.interactionHint(verse.palette)}>
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
            <span style={{ ...navicueType.hint, color: verse.palette.accent }}>
              tension + integrity
            </span>
            <span style={navicueStyles.annotation(verse.palette)}>
              we float in our own connective tissue
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}