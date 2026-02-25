/**
 * MYCELIUM #10 — The Mycelial Map (The Proof)
 * "You are not a dot. You are a node."
 * INTERACTION: A complex network graph. Breathe and nodes light up
 * one by one — you at the center, connections radiating outward.
 * Hold still and watch the network glow. Isolation is a cognitive error.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('witness_ritual', 'Values Clarification', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const NETWORK_NODES = [
  { x: 50, y: 50, label: 'you', size: 10, tier: 0 },
  { x: 30, y: 30, label: '', size: 5, tier: 1 },
  { x: 70, y: 25, label: '', size: 5, tier: 1 },
  { x: 25, y: 55, label: '', size: 5, tier: 1 },
  { x: 75, y: 60, label: '', size: 5, tier: 1 },
  { x: 50, y: 80, label: '', size: 5, tier: 1 },
  { x: 15, y: 15, label: '', size: 3, tier: 2 },
  { x: 85, y: 10, label: '', size: 3, tier: 2 },
  { x: 10, y: 70, label: '', size: 3, tier: 2 },
  { x: 90, y: 75, label: '', size: 3, tier: 2 },
  { x: 40, y: 10, label: '', size: 3, tier: 2 },
  { x: 60, y: 90, label: '', size: 3, tier: 2 },
  { x: 5, y: 40, label: '', size: 2, tier: 3 },
  { x: 95, y: 45, label: '', size: 2, tier: 3 },
  { x: 50, y: 5, label: '', size: 2, tier: 3 },
  { x: 35, y: 95, label: '', size: 2, tier: 3 },
];

const EDGES = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
  [1, 6], [2, 7], [3, 8], [4, 9], [5, 11],
  [1, 10], [6, 12], [7, 13], [10, 14], [11, 15],
  [1, 2], [3, 5], [4, 2], [8, 6], [9, 7],
];

export default function Mycelium_MycelialMap({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [breathing, setBreathing] = useState(false);
  const [litNodes, setLitNodes] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startBreathe = () => {
    if (breathing || stage !== 'active') return;
    setBreathing(true);
    setLitNodes([0]);
    let count = 1;
    intervalRef.current = window.setInterval(() => {
      count++;
      setLitNodes(prev => [...prev, count - 1]);
      if (count >= NETWORK_NODES.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setCompleted(true);
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
      }
    }, 500);
  };

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Values Clarification" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Mapping the network...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are connected to everything. Isolation is a cognitive error.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to breathe and watch the network light up</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={startBreathe}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: breathing ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            {/* Network graph */}
            <div style={{ position: 'relative', width: '220px', height: '220px' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
                {/* Edges */}
                {EDGES.map(([a, b], i) => {
                  const nA = NETWORK_NODES[a];
                  const nB = NETWORK_NODES[b];
                  const isLit = litNodes.includes(a) && litNodes.includes(b);
                  return (
                    <motion.line key={i}
                      x1={nA.x} y1={nA.y} x2={nB.x} y2={nB.y}
                      stroke={isLit ? palette.accent : palette.primaryFaint}
                      strokeWidth={isLit ? 0.6 : 0.3}
                      animate={{ opacity: isLit ? 0.4 : 0.06 }}
                      transition={{ duration: 0.5 }}
                    />
                  );
                })}
              </svg>
              {/* Nodes */}
              {NETWORK_NODES.map((node, i) => {
                const isLit = litNodes.includes(i);
                return (
                  <motion.div key={i}
                    animate={{
                      opacity: isLit ? (i === 0 ? 0.9 : 0.6) : 0.06,
                      scale: isLit ? 1 : 0.5,
                    }}
                    transition={{ duration: 0.4 }}
                    style={{ position: 'absolute', left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)', width: `${node.size}px`, height: `${node.size}px`, borderRadius: '50%', background: isLit ? palette.accent : palette.primaryFaint, boxShadow: isLit ? `0 0 ${node.size * 2}px ${palette.accentGlow}` : 'none' }}>
                    {i === 0 && (
                      <div style={{ position: 'absolute', top: `${node.size + 4}px`, left: '50%', transform: 'translateX(-50%)', ...navicueType.hint, color: palette.accent, fontSize: '11px', opacity: isLit ? 0.5 : 0.15, whiteSpace: 'nowrap' }}>you</div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <div style={{ ...navicueType.hint, color: breathing ? palette.accent : palette.textFaint, fontSize: '11px', opacity: breathing ? 0.5 : 0.3 }}>
              {completed ? 'you are a node' : breathing ? `${litNodes.length} of ${NETWORK_NODES.length} connected` : 'tap to breathe life into the network'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are not a dot. You are a node.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Connected to everything. We are one thing.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            One network. One organism.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}