/**
 * WEAVER #10 — The Tapestry Seal
 * "Your story is still being woven."
 * INTERACTION: A tapestry visualization fills in as you tap — each
 * tap adds a row. The pattern is incomplete but beautiful. The final
 * seal: you are mid-weave, and that's enough.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('relational_ghost', 'Values Clarification', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ROWS = [
  'Who you were',
  'Who you became',
  'Who you lost',
  'Who you found',
  'Who you are becoming',
  '...',
];

export default function Weaver_TapestrySeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [woven, setWoven] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleWeave = () => {
    if (stage !== 'active') return;
    const next = woven + 1;
    if (next < ROWS.length) {
      setWoven(next);
    } else {
      setWoven(next);
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Values Clarification" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Unfinished.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Your story is still being woven.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to add each row</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleWeave}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer', width: '100%', maxWidth: '280px' }}>
            {ROWS.map((row, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: i < woven ? 0.5 + (i / ROWS.length) * 0.3 : 0.05, scaleX: i < woven ? 1 : 0.3 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '100%', padding: '10px 16px', borderBottom: `1px solid ${i < woven ? palette.accent : palette.primaryFaint}`, textAlign: 'center', transformOrigin: 'left' }}>
                {i < woven && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                    style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                    {row}
                  </motion.div>
                )}
              </motion.div>
            ))}
            {woven < ROWS.length && (
              <motion.div animate={{ opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ ...navicueType.hint, color: palette.textFaint, marginTop: '8px' }}>
                tap to weave
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The tapestry is unfinished. And it's beautiful.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>You are mid-weave. That is enough.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The loom waits.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}