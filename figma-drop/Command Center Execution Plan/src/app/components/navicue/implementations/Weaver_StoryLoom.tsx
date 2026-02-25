/**
 * WEAVER #2 — The Story Loom
 * "Your life is not a line. It's a tapestry."
 * INTERACTION: Narrative fragments appear scattered. Tap each to
 * place it on the loom. The pattern only emerges when all are placed.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const FRAGMENTS = [
  'The thing that broke you',
  'The person who stayed',
  'The choice that changed everything',
  'The silence that spoke',
  'The joy you almost missed',
];

export default function Weaver_StoryLoom({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [placed, setPlaced] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handlePlace = (i: number) => {
    if (stage !== 'active' || placed.includes(i)) return;
    const next = [...placed, i];
    setPlaced(next);
    if (next.length >= FRAGMENTS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Fragments, waiting.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Your life is not a line. It's a tapestry.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each fragment to weave it in</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '300px' }}>
            {FRAGMENTS.map((f, i) => {
              const isPlaced = placed.includes(i);
              return (
                <motion.button key={i} onClick={() => handlePlace(i)}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -15 : 15 }}
                  animate={{ opacity: isPlaced ? 0.8 : 0.35, x: 0 }}
                  transition={{ delay: i * 0.12, duration: 0.6 }}
                  whileHover={!isPlaced ? { opacity: 0.6, scale: 1.02 } : undefined}
                  style={{ width: '100%', padding: '14px 16px', background: isPlaced ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)', border: `1px solid ${isPlaced ? palette.accent : palette.primaryFaint}`, borderRadius: radius.md, cursor: isPlaced ? 'default' : 'pointer', textAlign: 'left', transition: 'border-color 0.6s' }}>
                  <div style={{ ...navicueType.texture, color: isPlaced ? palette.text : palette.textFaint, fontSize: '12px', fontStyle: 'italic' }}>{f}</div>
                  {isPlaced && (
                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1 }}
                      style={{ height: '1px', background: palette.accentGlow, marginTop: '8px', opacity: 0.3 }} />
                  )}
                </motion.button>
              );
            })}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '4px' }}>{placed.length} of {FRAGMENTS.length} woven</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The pattern was there all along.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Every fragment belongs.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The loom keeps weaving.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}