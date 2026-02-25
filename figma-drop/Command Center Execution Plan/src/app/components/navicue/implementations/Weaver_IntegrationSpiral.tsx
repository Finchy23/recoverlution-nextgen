/**
 * WEAVER #6 — The Integration Spiral
 * "Growth is not linear. It spirals."
 * INTERACTION: A spiral path. Tap to walk it — each loop revisits
 * a theme at a deeper level. Same ground, different altitude.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LOOPS = [
  { theme: 'trust', depth: 'You learned to trust once. Shallowly.' },
  { theme: 'trust', depth: 'You learned to trust again. With scars.' },
  { theme: 'trust', depth: 'Now you trust from knowing, not hoping.' },
  { theme: 'trust', depth: 'Trust at this depth includes yourself.' },
];

export default function Weaver_IntegrationSpiral({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [loopIdx, setLoopIdx] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleStep = () => {
    if (stage !== 'active') return;
    const next = loopIdx + 1;
    if (next < LOOPS.length) {
      setLoopIdx(next);
    } else {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const progress = loopIdx / (LOOPS.length - 1);

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            You've been here before.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Growth is not linear. It spirals.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to walk the spiral deeper</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleStep}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', cursor: 'pointer' }}>
            {/* Spiral visualization */}
            <div style={{ width: '200px', height: '200px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {LOOPS.map((_, i) => {
                const r = 25 + i * 18;
                const isActive = i <= loopIdx;
                return (
                  <motion.div key={i}
                    animate={{ opacity: isActive ? 0.2 + i * 0.1 : 0.05, scale: 1 }}
                    style={{ position: 'absolute', width: `${r}%`, height: `${r}%`, borderRadius: '50%', border: `1px solid ${isActive ? palette.accent : palette.primaryFaint}`, borderTopColor: 'transparent' }} />
                );
              })}
              {/* Position dot */}
              <motion.div
                animate={{ scale: 0.7 + progress * 0.6, opacity: 0.5 + progress * 0.4 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '10px', height: '10px', borderRadius: '50%', background: palette.accent, boxShadow: `0 0 ${12 + progress * 12}px ${palette.accentGlow}`, zIndex: 1 }} />
            </div>
            <motion.div key={loopIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.6, y: 0 }}
              style={{ ...navicueType.texture, color: palette.text, textAlign: 'center', maxWidth: '250px', fontSize: '12px', fontStyle: 'italic' }}>
              {LOOPS[loopIdx].depth}
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>loop {loopIdx + 1} of {LOOPS.length}</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Same ground. Higher view.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>You're not going in circles. You're ascending.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The spiral continues.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}