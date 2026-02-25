/**
 * OMEGA POINT #1 — The Dot Connector
 * "Creativity is just connecting things. Synthesize."
 * INTERACTION: Three dots labeled with disparate domains float
 * disconnected. Each tap draws a line between two — until all three
 * connect forming a perfect triangle. The pattern emerges.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const DOTS = [
  { cx: 110, cy: 35, label: 'Biology' },
  { cx: 50, cy: 125, label: 'Art' },
  { cx: 170, cy: 125, label: 'Code' },
];
const EDGES = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 0 },
];

export default function OmegaPoint_DotConnector({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [connected, setConnected] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const connect = () => {
    if (stage !== 'active' || connected >= EDGES.length) return;
    const next = connected + 1;
    setConnected(next);
    if (next >= EDGES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const t = connected / EDGES.length;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Three dots appear...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Creativity is just connecting things. Synthesize. What is the pattern?</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to draw a connection</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={connect}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: connected >= EDGES.length ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '165px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(270, 10%, 7%, 0.25)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 165" style={{ position: 'absolute', inset: 0 }}>
                {/* Edges — drawn progressively */}
                {EDGES.slice(0, connected).map((e, i) => {
                  const a = DOTS[e.from]; const b = DOTS[e.to];
                  return (
                    <motion.line key={`e${i}`} x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy}
                      stroke={`hsla(${45 + i * 30}, 40%, 55%, ${0.25 + i * 0.1})`}
                      strokeWidth="1.5" strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.5 }}
                      transition={{ duration: 0.8 }}
                    />
                  );
                })}
                {/* Triangle fill — appears when complete */}
                {connected >= EDGES.length && (
                  <motion.polygon
                    points={DOTS.map(d => `${d.cx},${d.cy}`).join(' ')}
                    fill="hsla(45, 35%, 55%, 0.04)"
                    stroke="hsla(45, 40%, 55%, 0.12)"
                    strokeWidth="0.5"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.1 }}
                    transition={{ duration: 1.5 }}
                  />
                )}
                {/* Center point — synthesis */}
                {connected >= EDGES.length && (
                  <motion.circle cx="110" cy="95" r="4"
                    fill="hsla(45, 50%, 60%, 0.3)"
                    initial={{ r: 0, opacity: 0 }} animate={{ r: 4, opacity: 0.4 }}
                    transition={{ delay: 0.5, duration: 1 }}
                  />
                )}
                {/* Dots */}
                {DOTS.map((d, i) => {
                  const isConnected = EDGES.slice(0, connected).some(e => e.from === i || e.to === i);
                  return (
                    <g key={i}>
                      {/* Glow */}
                      <circle cx={d.cx} cy={d.cy} r={isConnected ? 14 : 10}
                        fill={`hsla(${260 + i * 40}, 30%, 55%, ${isConnected ? 0.06 : 0.02})`} />
                      {/* Dot */}
                      <motion.circle cx={d.cx} cy={d.cy} r="5"
                        fill={`hsla(${260 + i * 40}, 35%, ${45 + (isConnected ? 12 : 0)}%, ${0.3 + (isConnected ? 0.2 : 0)})`}
                        animate={{ r: isConnected ? 6 : 5 }}
                        transition={{ type: 'spring' }}
                      />
                      {/* Label */}
                      <text x={d.cx} y={d.cy + (i === 0 ? -14 : 20)} textAnchor="middle" fontSize="11" fontFamily="monospace"
                        fill={`hsla(${260 + i * 40}, 20%, 50%, ${isConnected ? 0.4 : 0.2})`}>
                        {d.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <motion.div key={connected} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {connected === 0 ? 'Three dots. No connection yet.' : connected < EDGES.length ? `${connected}/${EDGES.length} connections drawn.` : 'Triangle complete. Pattern found.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {EDGES.map((_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i < connected ? `hsla(${45 + i * 30}, 40%, 55%, 0.5)` : palette.primaryFaint, opacity: i < connected ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Three random points. One perfect triangle. Creativity is connecting things others can't see.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Integrative complexity. The ability to see connections between disparate domains.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Dots. Lines. Pattern.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}