/**
 * WEAVER #9 — The Witness Weave
 * "You are the witness and the weaver."
 * INTERACTION: Observe patterns in your life from above — threads
 * appear showing recurring themes. Tap to acknowledge each pattern,
 * then trace a new thread of intention.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Metacognition', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PATTERNS = [
  { thread: 'You keep choosing safety over growth.', witness: 'Seen.' },
  { thread: 'You give more than you receive.', witness: 'Noticed.' },
  { thread: 'You leave before you\'re left.', witness: 'Acknowledged.' },
  { thread: 'You create meaning from chaos.', witness: 'Honored.' },
];

export default function Weaver_WitnessWeave({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [witnessed, setWitnessed] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleWitness = (i: number) => {
    if (stage !== 'active' || witnessed.includes(i)) return;
    if (i !== witnessed.length) return;
    const next = [...witnessed, i];
    setWitnessed(next);
    if (next.length >= PATTERNS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Look down. See the weave.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are the witness and the weaver.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each pattern to acknowledge it</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '300px' }}>
            {PATTERNS.map((p, i) => {
              const isWit = witnessed.includes(i);
              const isNext = i === witnessed.length;
              return (
                <motion.button key={i} onClick={() => handleWitness(i)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isWit ? 0.7 : isNext ? 0.35 : 0.1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  whileHover={isNext ? { opacity: 0.55 } : undefined}
                  style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.01)', border: `1px solid ${isWit ? palette.accent : palette.primaryFaint}`, borderRadius: radius.md, cursor: isNext ? 'pointer' : 'default', textAlign: 'left' }}>
                  <div style={{ ...navicueType.texture, color: palette.text, fontSize: '12px', fontStyle: 'italic' }}>{p.thread}</div>
                  {isWit && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.3 }}
                      style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px', marginTop: '6px', textAlign: 'right' }}>
                      {p.witness}
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '4px' }}>{witnessed.length} of {PATTERNS.length} witnessed</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Now you see the weave. Now you can choose the next thread.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Awareness is the loom.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Witness. Weave. Repeat.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}