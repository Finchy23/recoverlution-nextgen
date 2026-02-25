/**
 * WEAVER #7 — The Complexity Breath
 * "Simple and complex can coexist."
 * INTERACTION: Breathe to oscillate between a simple circle and a
 * complex fractal pattern. Inhale = simplify. Exhale = complexify.
 * Find the rhythm where both feel true.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sensory_cinema', 'Somatic Regulation', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Weaver_ComplexityBreath({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [cycles, setCycles] = useState(0);
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleToggle = () => {
    if (stage !== 'active') return;
    if (phase === 'inhale') {
      setPhase('exhale');
    } else {
      setPhase('inhale');
      const next = cycles + 1;
      setCycles(next);
      if (next >= 3) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
      }
    }
  };

  const isSimple = phase === 'inhale';
  const rings = isSimple ? 1 : 5;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Simple. Complex. Both.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Simple and complex can coexist.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to breathe between them</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleToggle}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', cursor: 'pointer' }}>
            <div style={{ width: '200px', height: '200px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Array.from({ length: rings }, (_, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 0.15 + (i === 0 ? 0.2 : 0), scale: 1, rotate: i * 15 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  style={{ position: 'absolute', width: `${60 + i * 15}%`, height: `${60 + i * 15}%`, borderRadius: isSimple ? '50%' : `${30 + i * 5}%`, border: `1px solid ${i === 0 ? palette.accent : palette.primaryFaint}`, borderTopColor: i > 0 ? 'transparent' : undefined }} />
              ))}
              <motion.div
                animate={{ scale: isSimple ? 1.2 : 0.6, opacity: isSimple ? 0.6 : 0.3 }}
                transition={{ duration: 1.5 }}
                style={{ width: '12px', height: '12px', borderRadius: '50%', background: palette.accent, boxShadow: `0 0 16px ${palette.accentGlow}` }} />
            </div>
            <motion.div key={phase} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ ...navicueType.texture, color: palette.text, fontSize: '13px', fontStyle: 'italic' }}>
              {isSimple ? 'Inhale. Simplify.' : 'Exhale. Let complexity bloom.'}
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{cycles} of 3 cycles</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You contain multitudes.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Simple at the center. Complex at the edges. Whole.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Breathe the pattern.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}