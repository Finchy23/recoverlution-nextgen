/**
 * SAGE #2 — The Generational Lens
 * "You carry your grandmother's courage and your grandfather's wound."
 * INTERACTION: A family tree grows upward, each generation a ring.
 * Tap each ring to reveal a hidden gift or inherited pattern.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Connection', 'knowing', 'Probe');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const GENERATIONS = [
  { label: 'You', gift: 'The awareness to look back.' },
  { label: 'Your parents', gift: 'They survived so you could choose.' },
  { label: 'Their parents', gift: 'They carried what they could not name.' },
  { label: 'The ones before', gift: 'They dreamed you before you existed.' },
];

export default function Sage_GenerationalLens({ onComplete }: Props) {
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
    if (stage !== 'active' || revealed.includes(i)) return;
    const next = [...revealed, i];
    setRevealed(next);
    if (next.length >= GENERATIONS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Connection" kbe="knowing" form="Probe" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            You did not begin with you.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Who gave you the courage to be here?</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each ring to look back</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Tree rings — bottom up */}
            <div style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: '8px' }}>
              {GENERATIONS.map((gen, i) => {
                const isRevealed = revealed.includes(i);
                const ringSize = 60 + i * 40;
                return (
                  <motion.button key={i} onClick={() => handleReveal(i)}
                    whileHover={!isRevealed ? { scale: 1.05 } : undefined}
                    animate={{ opacity: isRevealed ? 1 : 0.4 }}
                    style={{ width: `${ringSize}px`, height: '50px', borderRadius: radius['2xl'], background: isRevealed ? palette.primaryGlow : 'transparent', border: `1px solid ${isRevealed ? palette.accent : palette.primaryFaint}`, cursor: isRevealed ? 'default' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', padding: '12px 18px', transition: 'all 0.5s' }}>
                    <span style={{ ...navicueType.hint, color: isRevealed ? palette.text : palette.textFaint, fontSize: '11px' }}>{gen.label}</span>
                    {isRevealed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', textAlign: 'center', lineHeight: 1.3 }}>
                        {gen.gift}
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
            {/* Trunk line */}
            <div style={{ width: '1px', height: '20px', background: palette.primaryFaint, opacity: 0.3 }} />
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {revealed.length} of {GENERATIONS.length} revealed
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You carry their courage and their wounds.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>What you heal, they heal through you.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The ancestors dreamed you before you existed.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}