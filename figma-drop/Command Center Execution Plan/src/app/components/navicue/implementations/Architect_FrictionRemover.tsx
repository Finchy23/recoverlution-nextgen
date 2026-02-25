/**
 * ARCHITECT #6 -- The Friction Remover
 * "Design for laziness. Make the right choice the easiest choice."
 * INTERACTION: A tangled knot. Swipe/tap to untie it. Each untangling
 * represents removing one friction point from tomorrow.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('poetic_precision', 'Behavioral Activation', 'knowing', 'Key');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

export default function Architect_FrictionRemover({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [untangled, setUntangled] = useState(0);
  const [paths, setPaths] = useState(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      cx: 50 + Math.sin(i * 1.2) * 25,
      cy: 30 + i * 10,
      tangled: true,
    }))
  );
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleUntangle = (idx: number) => {
    if (stage !== 'active' || !paths[idx].tangled) return;
    const newPaths = [...paths];
    newPaths[idx] = { ...newPaths[idx], tangled: false };
    setPaths(newPaths);
    const next = untangled + 1;
    setUntangled(next);
    if (next >= 5) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 1500);
    }
  };

  // Generate tangled SVG path
  const knotPath = (tangled: boolean, cy: number) => {
    if (tangled) {
      return `M 10,${cy} Q 30,${cy - 15} 40,${cy + 10} T 60,${cy - 5} Q 75,${cy + 12} 90,${cy}`;
    }
    return `M 10,${cy} L 90,${cy}`;
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Behavioral Activation" kbe="knowing" form="Key" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something is tangled.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>What is making tomorrow hard?</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>untangle each line</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <svg viewBox="0 0 100 80" style={{ width: '280px', height: '200px' }}>
              {paths.map((p, i) => (
                <motion.path
                  key={p.id}
                  d={knotPath(p.tangled, 10 + i * 15)}
                  fill="none"
                  stroke={p.tangled ? palette.primary : palette.accent}
                  strokeWidth={p.tangled ? 1 : 0.5}
                  opacity={p.tangled ? 0.6 : 0.3}
                  style={{ cursor: p.tangled ? 'pointer' : 'default' }}
                  onClick={() => handleUntangle(i)}
                  initial={{ d: knotPath(p.tangled, 10 + i * 15) }}
                  animate={{ d: knotPath(p.tangled, 10 + i * 15) }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              ))}
            </svg>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{untangled} of 5 untangled</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The path is clear.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Tomorrow just got easier.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Make the right choice the easy choice.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}