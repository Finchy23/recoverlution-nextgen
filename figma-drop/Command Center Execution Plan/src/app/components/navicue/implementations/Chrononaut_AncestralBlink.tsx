/**
 * CHRONONAUT #8 — The Ancestral Blink
 * "You are a vessel for 10,000 survivals."
 * INTERACTION: A double helix DNA strand. Tap each rung to
 * reveal an ancestor's survival — each one survived worse than this.
 * The strength is inherited. Activate it.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Probe');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ANCESTORS = [
  { gen: 'Great-grandmother', survived: 'Crossed an ocean with nothing.' },
  { gen: 'Great-grandfather', survived: 'Built a life from ashes.' },
  { gen: 'Their parents', survived: 'Endured a war and chose hope.' },
  { gen: 'Their grandparents', survived: 'Survived famine. Kept walking.' },
  { gen: '10,000 generations', survived: 'Every single one survived. You are the proof.' },
];

export default function Chrononaut_AncestralBlink({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [revealed, setRevealed] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleReveal = (i: number) => {
    if (stage !== 'active' || revealed.includes(i) || i !== revealed.length) return;
    const next = [...revealed, i];
    setRevealed(next);
    if (next.length >= ANCESTORS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Probe" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Tracing the helix...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are a vessel for 10,000 survivals.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each rung to meet them</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%', maxWidth: '300px' }}>
            {/* DNA helix visualization */}
            {ANCESTORS.map((a, i) => {
              const isRevealed = revealed.includes(i);
              const isNext = i === revealed.length;
              const offset = i % 2 === 0 ? -20 : 20;
              return (
                <motion.div key={i} style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative' }}>
                  {/* Helix strand connectors */}
                  <div style={{ position: 'absolute', left: '50%', top: '50%', width: '60%', height: '1px', background: isRevealed ? palette.accent : palette.primaryFaint, opacity: isRevealed ? 0.2 : 0.06, transform: `translate(-50%, -50%) rotate(${i % 2 === 0 ? -8 : 8}deg)` }} />
                  {/* Rung button */}
                  <motion.button onClick={() => handleReveal(i)}
                    animate={{ x: isRevealed ? 0 : offset, opacity: isRevealed ? 0.8 : isNext ? 0.4 : 0.15 }}
                    whileHover={isNext ? { opacity: 0.6, scale: 1.02 } : undefined}
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.01)', border: `1px solid ${isRevealed ? palette.accent : isNext ? palette.primaryFaint : 'transparent'}`, borderRadius: radius.md, cursor: isNext ? 'pointer' : 'default', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    {!isRevealed ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: palette.primaryFaint }} />
                        <span style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.4 }}>{a.gen}</span>
                      </div>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px', opacity: 0.5 }}>{a.gen}</span>
                        <span style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>{a.survived}</span>
                      </motion.div>
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '8px' }}>{revealed.length} of {ANCESTORS.length} revealed</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>They survived worse. The strength is inherited.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Activate it. You are the proof that it works.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            10,000 survivals. Still here.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}