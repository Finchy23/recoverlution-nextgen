/**
 * VISIONARY #9 — The Courage Map
 * "Map the territory between here and there."
 * INTERACTION: A path from "now" to "future." Tap to mark courage
 * points along the way — each one a step requiring bravery.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('science_x_soul', 'Self-Compassion', 'embodying', 'Probe');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const WAYPOINTS = [
  { label: 'Say it out loud.', x: 20 },
  { label: 'Ask for help.', x: 35 },
  { label: 'Risk being seen.', x: 50 },
  { label: 'Let go of the backup plan.', x: 65 },
  { label: 'Begin before you\'re ready.', x: 80 },
];

export default function Visionary_CourageMap({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [marked, setMarked] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleMark = () => {
    if (stage !== 'active') return;
    const next = marked.length;
    if (next < WAYPOINTS.length) {
      setMarked([...marked, next]);
      if (next + 1 >= WAYPOINTS.length) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
      }
    }
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Self-Compassion" kbe="embodying" form="Probe" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The path requires courage.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Map the territory between here and there.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to mark each courage point</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleMark}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: 'pointer' }}>
            {/* Path */}
            <div style={{ width: '300px', height: '120px', position: 'relative' }}>
              {/* Path line */}
              <div style={{ position: 'absolute', left: '8%', right: '8%', top: '40%', height: '1px', background: palette.primaryFaint, opacity: 0.2 }} />
              {/* Endpoints */}
              <div style={{ position: 'absolute', left: '3%', top: '40%', transform: 'translateY(-50%)', ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.3 }}>now</div>
              <div style={{ position: 'absolute', right: '0%', top: '40%', transform: 'translateY(-50%)', ...navicueType.hint, color: palette.accent, fontSize: '11px', opacity: 0.4 }}>there</div>
              {/* Waypoints */}
              {WAYPOINTS.map((w, i) => {
                const isMarked = marked.includes(i);
                return (
                  <g key={i}>
                    <motion.div
                      animate={{ opacity: isMarked ? 0.8 : 0.1 }}
                      style={{ position: 'absolute', left: `${w.x}%`, top: '40%', transform: 'translate(-50%, -50%)', width: '10px', height: '10px', borderRadius: '50%', background: isMarked ? palette.accent : palette.primaryFaint, boxShadow: isMarked ? `0 0 10px ${palette.accentGlow}` : 'none' }} />
                    {isMarked && (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 0.4, y: 0 }}
                        style={{ position: 'absolute', left: `${w.x}%`, top: '55%', transform: 'translateX(-50%)', ...navicueType.hint, color: palette.textFaint, fontSize: '11px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                        {w.label}
                      </motion.div>
                    )}
                  </g>
                );
              })}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{marked.length} of {WAYPOINTS.length} marked</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The map is drawn. The courage was always yours.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>You don't need to be fearless. Just willing.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            One brave step at a time.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}