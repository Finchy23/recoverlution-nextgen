/**
 * WEAVER #1 — The Thread Map
 * "Every thread connects to something."
 * INTERACTION: Life-domain nodes scattered on screen. Tap pairs
 * to reveal the invisible threads between them. Everything connects.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const NODES = [
  { label: 'work', x: 20, y: 25 },
  { label: 'love', x: 75, y: 20 },
  { label: 'body', x: 15, y: 70 },
  { label: 'play', x: 80, y: 65 },
  { label: 'purpose', x: 50, y: 48 },
];

const CONNECTIONS = [
  { a: 0, b: 4, insight: 'What you build feeds what you believe.' },
  { a: 1, b: 4, insight: 'Love and purpose share a root.' },
  { a: 2, b: 4, insight: 'The body carries the mission.' },
  { a: 3, b: 4, insight: 'Play is not the opposite of purpose.' },
  { a: 0, b: 1, insight: 'How you work is how you love.' },
];

export default function Weaver_ThreadMap({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [revealed, setRevealed] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleNode = (i: number) => {
    if (stage !== 'active') return;
    if (selected === null) { setSelected(i); return; }
    if (selected === i) { setSelected(null); return; }
    const connIdx = CONNECTIONS.findIndex(c =>
      (c.a === selected && c.b === i) || (c.a === i && c.b === selected)
    );
    if (connIdx >= 0 && !revealed.includes(connIdx)) {
      const next = [...revealed, connIdx];
      setRevealed(next);
      if (next.length >= CONNECTIONS.length) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
      }
    }
    setSelected(null);
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Everything connects.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Every thread connects to something.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap two nodes to find their thread</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <svg width="280" height="220" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
              {CONNECTIONS.map((c, ci) => revealed.includes(ci) && (
                <motion.g key={`l${ci}`} initial={{ pathLength: 0, opacity: 0 }} animate={{ opacity: 0.3 }}
                  transition={{ duration: 1 }}>
                  <line x1={NODES[c.a].x} y1={NODES[c.a].y} x2={NODES[c.b].x} y2={NODES[c.b].y}
                  stroke={palette.accent} strokeWidth="0.6" />
                </motion.g>
              ))}
              {NODES.map((n, i) => (
                <g key={i} onClick={() => handleNode(i)} style={{ cursor: 'pointer' }}>
                  <circle cx={n.x} cy={n.y} r="8" fill="transparent" />
                  <motion.circle cx={n.x} cy={n.y} r={selected === i ? 4.5 : 3.5}
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: selected === i ? 0.9 : 0.4 }}
                    fill={selected === i ? palette.accent : palette.primaryFaint}
                    style={{ transition: 'fill 0.3s' }} />
                  <text x={n.x} y={n.y + 8} textAnchor="middle" fill={palette.textFaint} fontSize="11" opacity="0.4">{n.label}</text>
                </g>
              ))}
            </svg>
            {revealed.length > 0 && (
              <motion.div key={revealed.length} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.5, y: 0 }}
                style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '11px', fontStyle: 'italic', textAlign: 'center', maxWidth: '240px' }}>
                {CONNECTIONS[revealed[revealed.length - 1]].insight}
              </motion.div>
            )}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{revealed.length} of {CONNECTIONS.length} threads</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Nothing is separate. Everything weaves.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>You are the pattern.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The map was always there.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}