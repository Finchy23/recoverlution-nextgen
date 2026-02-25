/**
 * HACKER #1 — The Label Peeler
 * "The weather is real. 'Bad' is a label you added."
 * INTERACTION: Sticky labels on raw experiences. Peel each label
 * to reveal the unfiltered data underneath. The map is not the territory.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Circuit');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LABELS = [
  { label: 'Bad Day', raw: 'Rain. A cancelled plan. Quiet.' },
  { label: 'Failure', raw: 'A thing you tried. A result you got.' },
  { label: 'Awkward', raw: 'Two humans. A silence. Nothing more.' },
  { label: 'Wasted Time', raw: 'Hours spent. Experience gained.' },
  { label: 'Broken', raw: 'Changed shape. Still here.' },
];

export default function Hacker_LabelPeeler({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [peeled, setPeeled] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handlePeel = (i: number) => {
    if (stage !== 'active' || peeled.includes(i)) return;
    const next = [...peeled, i];
    setPeeled(next);
    if (next.length >= LABELS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Labels everywhere.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The map is not the territory.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>peel each label to find the raw data</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '300px' }}>
            {LABELS.map((l, i) => {
              const isPeeled = peeled.includes(i);
              return (
                <motion.button key={i} onClick={() => handlePeel(i)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: isPeeled ? 0.8 : 0.4, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={!isPeeled ? { opacity: 0.6, scale: 1.02 } : undefined}
                  style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.01)', border: `1px solid ${isPeeled ? palette.accent : palette.primaryFaint}`, borderRadius: radius.md, cursor: isPeeled ? 'default' : 'pointer', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
                  <AnimatePresence mode="wait">
                    {!isPeeled ? (
                      <motion.div key="label" exit={{ opacity: 0, x: 30, scale: 0.9 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '2px', background: 'hsla(0, 50%, 55%, 0.5)', flexShrink: 0 }} />
                        <span style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '13px', fontWeight: 500 }}>"{l.label}"</span>
                      </motion.div>
                    ) : (
                      <motion.div key="raw" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 0.7, x: 0 }} transition={{ duration: 0.6 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: palette.accent, flexShrink: 0, opacity: 0.5 }} />
                        <span style={{ ...navicueType.texture, color: palette.text, fontSize: '12px', fontStyle: 'italic' }}>{l.raw}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '4px' }}>{peeled.length} of {LABELS.length} peeled</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Underneath every label: just data.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Experience the territory. Not the map.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Raw. Unfiltered. Free.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}