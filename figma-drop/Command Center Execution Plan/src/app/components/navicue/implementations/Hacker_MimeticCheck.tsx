/**
 * HACKER #4 — The Mimetic Check
 * "Do you want this? Or do you want it because they want it?"
 * INTERACTION: Desires presented with infinite mirror reflections.
 * For each desire, choose: "Mine" or "Borrowed." Break the mirror.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Values Clarification', 'believing', 'Circuit');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const DESIRES = [
  { want: 'A bigger title.' },
  { want: 'Their approval.' },
  { want: 'To be impressive.' },
  { want: 'More followers.' },
  { want: 'To be envied.' },
];

export default function Hacker_MimeticCheck({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [sorted, setSorted] = useState<Record<number, 'mine' | 'borrowed'>>({});
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleSort = (i: number, choice: 'mine' | 'borrowed') => {
    if (stage !== 'active' || sorted[i]) return;
    const next = { ...sorted, [i]: choice };
    setSorted(next);
    if (Object.keys(next).length >= DESIRES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const sortedCount = Object.keys(sorted).length;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Values Clarification" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Reflections of reflections.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Do you want this? Or do you want it because they want it?</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>sort each desire: yours or borrowed</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '300px' }}>
            {DESIRES.map((d, i) => {
              const s = sorted[i];
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: s ? 0.7 : 0.4, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  style={{ width: '100%', padding: '14px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${s ? (s === 'mine' ? palette.accent : palette.primaryFaint) : palette.primaryFaint}`, borderRadius: radius.md }}>
                  {!s ? (
                    <button onClick={() => handleSort(i, 'borrowed')}
                      style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4, padding: '12px 18px' }}>
                      borrowed
                    </button>
                  ) : s === 'borrowed' ? (
                    <span style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.3, textDecoration: 'line-through' }}>borrowed</span>
                  ) : <span style={{ width: '50px' }} />}
                  <span style={{ ...navicueType.texture, color: s === 'borrowed' ? palette.textFaint : palette.text, fontSize: '12px', flex: 1, textAlign: 'center', textDecoration: s === 'borrowed' ? 'line-through' : 'none', opacity: s === 'borrowed' ? 0.3 : 0.7 }}>{d.want}</span>
                  {!s ? (
                    <button onClick={() => handleSort(i, 'mine')}
                      style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, padding: '12px 18px' }}>
                      mine
                    </button>
                  ) : s === 'mine' ? (
                    <span style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px', opacity: 0.5 }}>mine</span>
                  ) : <span style={{ width: '50px' }} />}
                </motion.div>
              );
            })}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '4px' }}>{sortedCount} of {DESIRES.length} examined</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Your desire is a reflection. Break the mirror.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>What remains when you stop wanting what they want?</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Want what is yours.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}