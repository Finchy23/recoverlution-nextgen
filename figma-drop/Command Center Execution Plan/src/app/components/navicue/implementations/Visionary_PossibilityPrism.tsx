/**
 * VISIONARY #3 — The Possibility Prism
 * "One reality, infinite angles."
 * INTERACTION: A single event at center. Tap to refract it through
 * a prism — each angle reveals a different possible interpretation.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Probe');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const EVENT = 'Something ended.';
const REFRACTIONS = [
  { angle: 'Loss', color: 'hsla(220, 40%, 55%, 0.6)', reading: 'You lost something real.' },
  { angle: 'Release', color: 'hsla(280, 35%, 55%, 0.6)', reading: 'You were set free.' },
  { angle: 'Redirection', color: 'hsla(340, 35%, 55%, 0.6)', reading: 'The path changed.' },
  { angle: 'Growth', color: 'hsla(160, 35%, 50%, 0.6)', reading: 'You outgrew it.' },
  { angle: 'Mystery', color: 'hsla(45, 40%, 55%, 0.6)', reading: 'You don\'t know yet. And that\'s okay.' },
];

export default function Visionary_PossibilityPrism({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [refracted, setRefracted] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleRefract = () => {
    if (stage !== 'active') return;
    const next = refracted.length;
    if (next < REFRACTIONS.length) {
      setRefracted([...refracted, next]);
      if (next + 1 >= REFRACTIONS.length) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
      }
    }
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Probe" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            One event. Many truths.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>One reality, infinite angles.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to refract</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleRefract}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: 'pointer' }}>
            {/* Event */}
            <div style={{ ...navicueType.texture, color: palette.text, fontSize: '14px', fontStyle: 'italic', opacity: 0.6 }}>"{EVENT}"</div>
            {/* Prism refractions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '260px' }}>
              {REFRACTIONS.map((r, i) => {
                const isShown = refracted.includes(i);
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: isShown ? 0.7 : 0, x: isShown ? 0 : -20 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ ...navicueType.hint, color: r.color, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{r.angle}</div>
                      <div style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '11px', fontStyle: 'italic' }}>{r.reading}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{refracted.length} of {REFRACTIONS.length} angles</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>All of these are true. None are the whole truth.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Reality is a prism. You choose which light to follow.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Choose your angle.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}