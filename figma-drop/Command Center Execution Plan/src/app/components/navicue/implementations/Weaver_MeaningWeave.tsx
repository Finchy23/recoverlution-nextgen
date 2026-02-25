/**
 * WEAVER #5 — The Meaning Weave
 * "Weave meaning from fragments."
 * INTERACTION: Random life-moments float on screen. Tap each to
 * connect it to the center — your meaning. The web builds itself.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sacred_ordinary', 'Values Clarification', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const MOMENTS = [
  { label: 'a conversation that changed you', x: 18, y: 20 },
  { label: 'a meal you still remember', x: 78, y: 18 },
  { label: 'a stranger\'s kindness', x: 12, y: 75 },
  { label: 'a door that closed', x: 82, y: 72 },
  { label: 'a quiet morning', x: 50, y: 15 },
  { label: 'a risk that paid off', x: 22, y: 48 },
];

export default function Weaver_MeaningWeave({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [connected, setConnected] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleConnect = (i: number) => {
    if (stage !== 'active' || connected.includes(i)) return;
    const next = [...connected, i];
    setConnected(next);
    if (next.length >= MOMENTS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Values Clarification" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Scattered moments.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Weave meaning from fragments.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each moment to connect it</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <svg width="280" height="240" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
              {/* Center — meaning */}
              <circle cx="50" cy="50" r="3" fill={palette.accent} opacity="0.4" />
              <text x="50" y="55" textAnchor="middle" fill={palette.accent} fontSize="11" opacity="0.4">meaning</text>
              {/* Connection lines */}
              {MOMENTS.map((m, i) => connected.includes(i) && (
                <motion.g key={`l${i}`} initial={{ opacity: 0 }} animate={{ opacity: 0.2 }}>
                  <line x1="50" y1="50" x2={m.x} y2={m.y} stroke={palette.accent} strokeWidth="0.4" />
                </motion.g>
              ))}
              {/* Moment nodes */}
              {MOMENTS.map((m, i) => {
                const isConn = connected.includes(i);
                return (
                  <g key={i} onClick={() => handleConnect(i)} style={{ cursor: isConn ? 'default' : 'pointer' }}>
                    <circle cx={m.x} cy={m.y} r="6" fill="transparent" />
                    <motion.circle cx={m.x} cy={m.y} r={isConn ? 2.5 : 2}
                      initial={{ opacity: 0.2 }}
                      animate={{ opacity: isConn ? 0.7 : 0.2 }}
                      fill={isConn ? palette.accent : palette.primaryFaint} />
                    {isConn && (
                      <motion.text initial={{ opacity: 0 }} animate={{ opacity: 0.35 }}
                        x={m.x} y={m.y - 4} textAnchor="middle" fill={palette.textFaint} fontSize="11">
                        {m.label}
                      </motion.text>
                    )}
                  </g>
                );
              })}
            </svg>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{connected.length} of {MOMENTS.length} woven</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Nothing was random.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Meaning doesn't arrive. It weaves.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The web holds.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}