/**
 * LUMINARY #5 — The Mentor Mirror
 * "Who showed you the way? Who are you showing?"
 * INTERACTION: A chain of lights — mentors who came before, you in
 * the middle, those who come after. Tap to illuminate the lineage.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Connection', 'believing', 'Probe');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LINEAGE = [
  { label: 'Someone who showed you kindness.', era: 'before' },
  { label: 'Someone who believed in you first.', era: 'before' },
  { label: 'You. Here. Now.', era: 'you' },
  { label: 'Someone watching how you live.', era: 'after' },
  { label: 'Someone you\'ll never meet.', era: 'after' },
];

export default function Luminary_MentorMirror({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [lit, setLit] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleLight = () => {
    if (stage !== 'active') return;
    const next = lit.length;
    if (next < LINEAGE.length) {
      setLit([...lit, next]);
      if (next + 1 >= LINEAGE.length) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
      }
    }
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Connection" kbe="believing" form="Probe" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            You are not the first light.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Who showed you the way?</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to illuminate the lineage</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleLight}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', width: '100%', maxWidth: '280px' }}>
            {LINEAGE.map((l, i) => {
              const isLit = lit.includes(i);
              const isYou = l.era === 'you';
              return (
                <motion.div key={i}
                  animate={{ opacity: isLit ? 0.8 : 0.08 }}
                  style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: radius.md, border: `1px solid ${isLit ? (isYou ? palette.accent : palette.primaryFaint) : 'transparent'}` }}>
                  <motion.div animate={{ scale: isLit ? 1 : 0.5 }}
                    style={{ width: isYou ? '12px' : '8px', height: isYou ? '12px' : '8px', borderRadius: '50%', background: isLit ? palette.accent : palette.primaryFaint, flexShrink: 0, boxShadow: isLit && isYou ? `0 0 10px ${palette.accentGlow}` : 'none' }} />
                  {isLit && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
                      style={{ ...navicueType.texture, color: isYou ? palette.accent : palette.text, fontSize: '11px', fontStyle: isYou ? 'normal' : 'italic' }}>
                      {l.label}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '4px' }}>{lit.length} of {LINEAGE.length}</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are a link in a chain of light.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>What was given to you is now yours to give.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The lineage continues through you.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}