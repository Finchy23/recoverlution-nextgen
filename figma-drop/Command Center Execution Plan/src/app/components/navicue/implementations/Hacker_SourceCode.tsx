/**
 * HACKER #10 — The Source Code (The "I Am" Hack)
 * "The system accepts your input. Write the new code."
 * INTERACTION: A terminal interface. Old identity code runs.
 * Tap each line to overwrite it with a new self-definition.
 * The final command: I am free.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Values Clarification', 'embodying', 'Circuit');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const CODE_LINES = [
  { old: '> IDENTITY.role = "not_enough"', new: '> IDENTITY.role = "learning"' },
  { old: '> IDENTITY.worth = external_validation', new: '> IDENTITY.worth = self_defined' },
  { old: '> IDENTITY.future = fear_based', new: '> IDENTITY.future = open' },
  { old: '> IDENTITY.story = "broken"', new: '> IDENTITY.story = "rewriting"' },
  { old: '> RUN IDENTITY', new: '> I am free.' },
];

export default function Hacker_SourceCode({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [overwritten, setOverwritten] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleOverwrite = (i: number) => {
    if (stage !== 'active' || overwritten.includes(i)) return;
    if (i !== overwritten.length) return; // sequential
    const next = [...overwritten, i];
    setOverwritten(next);
    if (next.length >= CODE_LINES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Values Clarification" kbe="embodying" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center', fontFamily: 'monospace' }}>
            Compiling identity...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The system accepts your input.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each line to rewrite the code</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0', width: '100%', maxWidth: '320px' }}>
            {/* Terminal window */}
            <div style={{ width: '100%', background: 'rgba(0,0,0,0.3)', borderRadius: radius.md, overflow: 'hidden', border: `1px solid ${palette.primaryFaint}` }}>
              {/* Title bar */}
              <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'hsla(0, 50%, 50%, 0.3)' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'hsla(45, 50%, 50%, 0.3)' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'hsla(120, 50%, 50%, 0.3)' }} />
                <span style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', marginLeft: '8px', fontFamily: 'monospace', opacity: 0.3 }}>identity.sh</span>
              </div>
              {/* Code lines */}
              <div style={{ padding: '12px' }}>
                {CODE_LINES.map((line, i) => {
                  const isOW = overwritten.includes(i);
                  const isNext = i === overwritten.length;
                  return (
                    <motion.button key={i} onClick={() => handleOverwrite(i)}
                      animate={{ opacity: isOW ? 0.8 : isNext ? 0.4 : 0.15 }}
                      whileHover={isNext ? { opacity: 0.6 } : undefined}
                      style={{ display: 'block', width: '100%', padding: '6px 0', background: 'none', border: 'none', cursor: isNext ? 'pointer' : 'default', textAlign: 'left' }}>
                      <AnimatePresence mode="wait">
                        {!isOW ? (
                          <motion.div key="old" exit={{ opacity: 0 }}
                            style={{ fontFamily: 'monospace', fontSize: '11px', color: isNext ? 'hsla(0, 50%, 55%, 0.6)' : palette.textFaint, opacity: isNext ? 0.7 : 0.3 }}>
                            {line.old}
                          </motion.div>
                        ) : (
                          <motion.div key="new" initial={{ opacity: 0 }} animate={{ opacity: 0.8 }}
                            style={{ fontFamily: 'monospace', fontSize: '11px', color: i === CODE_LINES.length - 1 ? palette.accent : 'hsla(120, 40%, 55%, 0.7)' }}>
                            {line.new}
                            {i === CODE_LINES.length - 1 && (
                              <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity }}
                                style={{ color: palette.accent }}>█</motion.span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '12px' }}>{overwritten.length} of {CODE_LINES.length} rewritten</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>New code running.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Do not debug the old code. Write the new.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center', fontFamily: 'monospace' }}>
            &gt; I am free.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}