/**
 * HACKER #9 — The "Should" Deleter
 * "'Should' is a bug in the code. 'Could' is a feature."
 * INTERACTION: A text editor with "should" statements highlighted
 * red. Tap each to auto-correct "Should" → "Could." Watch the
 * emotional weight lift with each correction.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'embodying', 'Circuit');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SHOULDS = [
  { before: 'I should be further along.', after: 'I could be further along.' },
  { before: 'I should have known better.', after: 'I could have known better.' },
  { before: 'I should feel grateful.', after: 'I could feel grateful.' },
  { before: 'I should be stronger.', after: 'I could be stronger.' },
  { before: 'I should want less.', after: 'I could want less.' },
];

export default function Hacker_ShouldDeleter({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [corrected, setCorrected] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleCorrect = (i: number) => {
    if (stage !== 'active' || corrected.includes(i)) return;
    const next = [...corrected, i];
    setCorrected(next);
    if (next.length >= SHOULDS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="embodying" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Bugs in the code.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>"Should" is a bug. "Could" is a feature.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each line to auto-correct</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%', maxWidth: '300px' }}>
            {/* Editor chrome */}
            <div style={{ width: '100%', padding: '6px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: `${radius.sm} ${radius.sm} 0 0`, display: 'flex', gap: '4px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'hsla(0, 50%, 50%, 0.3)' }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'hsla(45, 50%, 50%, 0.3)' }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'hsla(120, 50%, 50%, 0.3)' }} />
            </div>
            {/* Lines */}
            <div style={{ width: '100%', border: `1px solid ${palette.primaryFaint}`, borderRadius: `0 0 ${radius.sm} ${radius.sm}`, overflow: 'hidden' }}>
              {SHOULDS.map((s, i) => {
                const isCorrected = corrected.includes(i);
                return (
                  <motion.button key={i} onClick={() => handleCorrect(i)}
                    animate={{ opacity: isCorrected ? 0.7 : 0.45 }}
                    whileHover={!isCorrected ? { opacity: 0.65, backgroundColor: 'rgba(255,255,255,0.02)' } : undefined}
                    style={{ width: '100%', padding: '14px 14px', backgroundColor: 'rgba(0,0,0,0)', border: 'none', borderBottom: i < SHOULDS.length - 1 ? `1px solid rgba(255,255,255,0.03)` : 'none', cursor: isCorrected ? 'default' : 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', fontFamily: 'monospace', opacity: 0.3, width: '16px' }}>{i + 1}</span>
                    <AnimatePresence mode="wait">
                      {!isCorrected ? (
                        <motion.span key="b" exit={{ opacity: 0 }}
                          style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '11px', fontFamily: 'monospace' }}>
                          {s.before.split('should').map((part, pi, arr) => (
                            <span key={pi}>
                              {part}
                              {pi < arr.length - 1 && <span style={{ color: 'hsla(0, 60%, 55%, 0.7)', fontWeight: 600 }}>should</span>}
                            </span>
                          ))}
                        </motion.span>
                      ) : (
                        <motion.span key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.7 }}
                          style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontFamily: 'monospace' }}>
                          {s.after.split('could').map((part, pi, arr) => (
                            <span key={pi}>
                              {part}
                              {pi < arr.length - 1 && <span style={{ color: palette.accent, fontWeight: 600 }}>could</span>}
                            </span>
                          ))}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '4px' }}>{corrected.length} of {SHOULDS.length} patched</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>All bugs patched. The code runs lighter.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>"Could" opens a door. "Should" builds a wall.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Ship the patch.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}