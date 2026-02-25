/**
 * LUMINARY #1 — The Torch Pass
 * "What light can you carry forward?"
 * INTERACTION: Receive a torch (glowing dot). Carry it through
 * darkness by tapping waypoints. At the end, pass it on.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sacred_ordinary', 'Connection', 'believing', 'Mirror');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const WAYPOINTS = [
  { x: 15, y: 50, label: 'Receive the light.' },
  { x: 30, y: 35, label: 'Carry it through doubt.' },
  { x: 50, y: 55, label: 'Carry it through darkness.' },
  { x: 70, y: 40, label: 'Carry it through fatigue.' },
  { x: 85, y: 50, label: 'Pass it forward.' },
];

export default function Luminary_TorchPass({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [reached, setReached] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleReach = () => {
    if (stage !== 'active') return;
    const next = reached.length;
    if (next < WAYPOINTS.length) {
      setReached([...reached, next]);
      if (next + 1 >= WAYPOINTS.length) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
      }
    }
  };

  const currentIdx = reached.length > 0 ? reached[reached.length - 1] : -1;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Connection" kbe="believing" form="Mirror" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A light in the dark.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>What light can you carry forward?</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to carry the torch</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleReach}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
            <svg width="300" height="160" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
              {/* Path */}
              {WAYPOINTS.map((w, i) => {
                if (i === 0) return null;
                const prev = WAYPOINTS[i - 1];
                const isLit = reached.includes(i);
                return (
                  <motion.line key={`p${i}`}
                    x1={prev.x} y1={prev.y} x2={w.x} y2={w.y}
                    stroke={isLit ? palette.accent : palette.primaryFaint}
                    strokeWidth={isLit ? 0.8 : 0.3}
                    initial={{ opacity: 0.1 }}
                    animate={{ opacity: isLit ? 0.4 : 0.1 }} />
                );
              })}
              {/* Waypoint dots */}
              {WAYPOINTS.map((w, i) => {
                const isReached = reached.includes(i);
                const isCurrent = i === currentIdx;
                return (
                  <g key={i}>
                    <motion.circle cx={w.x} cy={w.y} r={isCurrent ? 4 : 2.5}
                      initial={{ opacity: 0.1 }}
                      animate={{ opacity: isReached ? 0.7 : 0.1 }}
                      fill={isReached ? palette.accent : palette.primaryFaint}
                      style={{ filter: isCurrent ? `drop-shadow(0 0 6px ${palette.accentGlow})` : 'none' }} />
                  </g>
                );
              })}
            </svg>
            {currentIdx >= 0 && (
              <motion.div key={currentIdx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 0.5, y: 0 }}
                style={{ ...navicueType.texture, color: palette.text, fontSize: '12px', fontStyle: 'italic', textAlign: 'center' }}>
                {WAYPOINTS[currentIdx].label}
              </motion.div>
            )}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{reached.length} of {WAYPOINTS.length}</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The torch is passed. The light continues.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>You were not the source. You were the carrier.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Light moves through those who carry it.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}