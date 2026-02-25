/**
 * TENSEGRITY #3 -- 1153. The Load Distribution
 * "Let the whole system absorb the blow."
 * INTERACTION: Poke a brick wall (local). Poke a web (whole web shivers). Connect nodes.
 * STEALTH KBE: Social Support -- interdependence (B)
 *
 * COMPOSITOR: sacred_ordinary / Lattice / social / believing / tap / 1153
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const NODES = [
  { x: 80, y: 20 }, { x: 40, y: 45 }, { x: 120, y: 45 },
  { x: 25, y: 75 }, { x: 80, y: 75 }, { x: 135, y: 75 },
];

export default function Tensegrity_LoadDistribution({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Lattice',
        chrono: 'social',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1153,
        isSeal: false,
      }}
      arrivalText="A wall. A web. Two structures."
      prompt="Do not take the hit on one point. Distribute the shock. Let the whole system absorb the blow."
      resonantText="Social Support. The web held because every node shared the load. One point alone would break. Connected, the force dissolves across the whole. Interdependence is structural intelligence."
      afterglowCoda="Connected."
      onComplete={onComplete}
    >
      {(verse) => <LoadDistributionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function LoadDistributionInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'wall' | 'web' | 'done'>('wall');
  const [connected, setConnected] = useState<Set<number>>(new Set([0]));
  const [shivering, setShivering] = useState(false);

  const pokeWall = useCallback(() => {
    if (phase !== 'wall') return;
    setPhase('web');
  }, [phase]);

  const connectNode = useCallback((idx: number) => {
    if (phase !== 'web') return;
    setConnected(prev => {
      const next = new Set(prev);
      next.add(idx);
      if (next.size >= NODES.length) {
        setShivering(true);
        setTimeout(() => {
          setPhase('done');
          setTimeout(() => verse.advance(), 2000);
        }, 1200);
      }
      return next;
    });
  }, [phase, verse]);

  const connections: [number, number][] = [];
  const connArr = Array.from(connected);
  for (let i = 0; i < connArr.length; i++) {
    for (let j = i + 1; j < connArr.length; j++) {
      const a = NODES[connArr[i]], b = NODES[connArr[j]];
      const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
      if (dist < 80) connections.push([connArr[i], connArr[j]]);
    }
  }

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 160 / 100)}>
        {phase === 'wall' ? (
          /* Brick wall */
          <div style={{
            position: 'absolute', top: 20, left: 30, right: 30, bottom: 10,
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2,
          }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{
                background: verse.palette.primaryFaint,
                border: `1px solid ${verse.palette.primaryGlow}`,
                borderRadius: 1, height: 14,
                marginLeft: i >= 4 && i < 8 ? 8 : 0,
              }} />
            ))}
            <span style={{
              position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)',
              ...navicueStyles.annotation(verse.palette),
            }}>local force</span>
          </div>
        ) : (
          /* Web */
          <svg viewBox="0 0 160 100" style={navicueStyles.heroSvg}>
            {/* Connection lines */}
            {connections.map(([a, b], i) => (
              <motion.line key={`c${i}`}
                x1={NODES[a].x} y1={NODES[a].y}
                x2={NODES[b].x} y2={NODES[b].y}
                stroke={phase === 'done' ? verse.palette.accent : 'hsla(180, 25%, 50%, 0.3)'}
                strokeWidth={1}
                initial={{ opacity: 0 }} animate={{ opacity: shivering ? [0.2, 0.5, 0.2] : 0.3 }}
                transition={shivering ? { repeat: Infinity, duration: 0.3 } : { duration: 0.3 }}
              />
            ))}

            {/* Nodes */}
            {NODES.map((n, i) => (
              <motion.circle key={i}
                cx={n.x} cy={n.y} r={connected.has(i) ? 5 : 4}
                fill={connected.has(i)
                  ? (phase === 'done' ? verse.palette.accent : 'hsla(180, 30%, 50%, 0.5)')
                  : 'hsla(0, 0%, 50%, 0.15)'}
                stroke={connected.has(i) ? verse.palette.accent : verse.palette.primaryGlow}
                strokeWidth={1}
                opacity={connected.has(i) ? 0.6 : 0.3}
                style={{ cursor: connected.has(i) ? 'default' : 'pointer' }}
                onClick={() => connectNode(i)}
                animate={shivering && connected.has(i) ? {
                  cx: [n.x, n.x + 2, n.x - 2, n.x],
                  cy: [n.y, n.y - 1, n.y + 1, n.y],
                } : {}}
                transition={shivering ? { repeat: Infinity, duration: 0.2 } : {}}
              />
            ))}
          </svg>
        )}
      </div>

      {/* Action */}
      {phase === 'wall' && (
        <motion.button onClick={pokeWall}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          poke the wall
        </motion.button>
      )}
      {phase === 'web' && !shivering && (
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
          tap nodes to connect ({connected.size}/{NODES.length})
        </span>
      )}
      {phase === 'done' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          distributed
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'done' ? 'interdependence' : phase === 'wall' ? 'isolated' : 'connecting'}
      </div>
    </div>
  );
}