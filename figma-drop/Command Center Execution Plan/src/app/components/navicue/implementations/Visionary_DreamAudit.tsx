/**
 * VISIONARY #5 — The Dream Audit
 * "Which dreams are yours? Which were given to you?"
 * INTERACTION: Dreams listed on screen. Tap to sort each into
 * "mine" or "inherited." Clarity comes from knowing the difference.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Values Clarification', 'believing', 'InventorySpark');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const DREAMS = [
  'Be successful.',
  'Be loved.',
  'Be safe.',
  'Be impressive.',
  'Be free.',
  'Be useful.',
];

export default function Visionary_DreamAudit({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [sorted, setSorted] = useState<Record<number, 'mine' | 'inherited'>>({});
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleSort = (i: number, type: 'mine' | 'inherited') => {
    if (stage !== 'active' || sorted[i]) return;
    const next = { ...sorted, [i]: type };
    setSorted(next);
    if (Object.keys(next).length >= DREAMS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const sortedCount = Object.keys(sorted).length;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Values Clarification" kbe="believing" form="InventorySpark" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Whose dreams are these?
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Which dreams are yours?</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>swipe left for inherited, right for yours</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '300px' }}>
            {DREAMS.map((d, i) => {
              const s = sorted[i];
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: s ? 0.7 : 0.4, y: 0, x: s === 'mine' ? 20 : s === 'inherited' ? -20 : 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  style={{ width: '100%', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${s ? (s === 'mine' ? palette.accent : palette.primaryFaint) : palette.primaryFaint}`, borderRadius: radius.md, opacity: s ? undefined : undefined }}>
                  {!s && (
                    <button onClick={() => handleSort(i, 'inherited')}
                      style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4, padding: '4px 8px' }}>
                      inherited
                    </button>
                  )}
                  {s === 'inherited' && (
                    <span style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.3 }}>inherited</span>
                  )}
                  <span style={{ ...navicueType.texture, color: s === 'mine' ? palette.accent : palette.text, fontSize: '12px', flex: 1, textAlign: 'center' }}>{d}</span>
                  {!s && (
                    <button onClick={() => handleSort(i, 'mine')}
                      style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, padding: '4px 8px' }}>
                      mine
                    </button>
                  )}
                  {s === 'mine' && (
                    <span style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px', opacity: 0.5 }}>mine</span>
                  )}
                </motion.div>
              );
            })}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '4px' }}>{sortedCount} of {DREAMS.length} sorted</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Not all dreams need to be kept.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The ones that are yours will feel lighter.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Dream your own dreams.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}