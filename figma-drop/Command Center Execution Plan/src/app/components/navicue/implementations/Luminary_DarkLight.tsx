/**
 * LUMINARY #9 — The Dark Light
 * "Your darkest moment became your brightest gift."
 * INTERACTION: Dark experiences listed. Tap each to transform it —
 * revealing how it became a gift you now offer others.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Self-Compassion', 'embodying', 'Probe');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const TRANSFORMS = [
  { dark: 'The loneliness.', light: 'Taught you to hold space for others.' },
  { dark: 'The failure.', light: 'Gave you compassion for those who stumble.' },
  { dark: 'The loss.', light: 'Made you treasure what remains.' },
  { dark: 'The shame.', light: 'Became your tenderness toward the imperfect.' },
];

export default function Luminary_DarkLight({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [transformed, setTransformed] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleTransform = (i: number) => {
    if (stage !== 'active' || transformed.includes(i)) return;
    const next = [...transformed, i];
    setTransformed(next);
    if (next.length >= TRANSFORMS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Self-Compassion" kbe="embodying" form="Probe" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Darkness carries light.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Your darkest moment became your brightest gift.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each darkness to find its light</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '300px' }}>
            {TRANSFORMS.map((t, i) => {
              const isTrans = transformed.includes(i);
              return (
                <motion.button key={i} onClick={() => handleTransform(i)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: isTrans ? 0.8 : 0.35, y: 0 }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  whileHover={!isTrans ? { opacity: 0.5, scale: 1.02 } : undefined}
                  style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.01)', border: `1px solid ${isTrans ? palette.accent : palette.primaryFaint}`, borderRadius: radius.md, cursor: isTrans ? 'default' : 'pointer', textAlign: 'left' }}>
                  <div style={{ ...navicueType.texture, color: isTrans ? palette.textFaint : palette.text, fontSize: '12px', fontStyle: 'italic', textDecoration: isTrans ? 'line-through' : 'none', opacity: isTrans ? 0.3 : 0.6 }}>{t.dark}</div>
                  {isTrans && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 0.6, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
                      style={{ ...navicueType.texture, color: palette.accent, fontSize: '11px', marginTop: '6px' }}>{t.light}</motion.div>
                  )}
                </motion.button>
              );
            })}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '4px' }}>{transformed.length} of {TRANSFORMS.length} transformed</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The wound became the gift.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Your suffering is not wasted. It's currency.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Light from darkness.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}