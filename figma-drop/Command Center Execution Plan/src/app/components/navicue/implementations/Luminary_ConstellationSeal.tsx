/**
 * LUMINARY #10 — The Constellation Seal
 * "You are one star in a constellation of light."
 * INTERACTION: Stars scattered in darkness. Tap to connect them
 * into a constellation — each connection revealing a relationship.
 * You find your place among the lights.
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('witness_ritual', 'Connection', 'embodying', 'IdentityKoan');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const STARS = [
  { x: 30, y: 20, label: 'A friend' },
  { x: 70, y: 15, label: 'A teacher' },
  { x: 50, y: 45, label: 'You' },
  { x: 20, y: 60, label: 'A stranger' },
  { x: 80, y: 55, label: 'A love' },
  { x: 45, y: 80, label: 'A child' },
];

const EDGES = [
  { a: 0, b: 2 }, { a: 1, b: 2 }, { a: 2, b: 3 },
  { a: 2, b: 4 }, { a: 2, b: 5 },
];

export default function Luminary_ConstellationSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [connected, setConnected] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleConnect = () => {
    if (stage !== 'active') return;
    const next = connected.length;
    if (next < EDGES.length) {
      setConnected([...connected, next]);
      if (next + 1 >= EDGES.length) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
      }
    }
  };

  const connectedStars = useMemo(() => {
    const s = new Set<number>();
    connected.forEach(ci => { s.add(EDGES[ci].a); s.add(EDGES[ci].b); });
    return s;
  }, [connected]);

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Connection" kbe="embodying" form="IdentityKoan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Stars in the dark.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are one star in a constellation.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to connect the lights</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleConnect}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <svg width="280" height="260" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
              {/* Edges */}
              {connected.map(ci => {
                const e = EDGES[ci];
                return (
                  <motion.g key={`e${ci}`} initial={{ opacity: 0 }} animate={{ opacity: 0.25 }}
                    transition={{ duration: 1 }}>
                    <line x1={STARS[e.a].x} y1={STARS[e.a].y} x2={STARS[e.b].x} y2={STARS[e.b].y}
                    stroke={palette.accent} strokeWidth="0.4" />
                  </motion.g>
                );
              })}
              {/* Stars */}
              {STARS.map((s, i) => {
                const isConn = connectedStars.has(i);
                const isYou = s.label === 'You';
                return (
                  <g key={i}>
                    <motion.circle cx={s.x} cy={s.y} r={isYou ? 3.5 : 2.5}
                      initial={{ opacity: 0.12 }}
                      animate={{ opacity: isConn ? 0.7 : 0.12 }}
                      fill={isConn ? palette.accent : palette.primaryFaint}
                      style={{ filter: isConn && isYou ? `drop-shadow(0 0 6px ${palette.accentGlow})` : 'none' }} />
                    {isConn && (
                      <motion.text initial={{ opacity: 0 }} animate={{ opacity: 0.35 }}
                        x={s.x} y={s.y + (isYou ? 7 : 6)} textAnchor="middle" fill={palette.textFaint} fontSize={isYou ? '3.5' : '2.8'}>
                        {s.label}
                      </motion.text>
                    )}
                  </g>
                );
              })}
            </svg>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{connected.length} of {EDGES.length} connections</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You were never alone. You were a constellation.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>One star in a sky of purpose. Enough. Luminous.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Shine.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}