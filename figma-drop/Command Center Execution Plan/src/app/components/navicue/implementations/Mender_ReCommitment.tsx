/**
 * MENDER #10 — The Re-Commitment
 * "Not a new promise. A renewed one. Knowing what you now know."
 * INTERACTION: An old vow appears, weathered and faded. You don't
 * replace it — you trace over it with fresh ink. Same words,
 * deeper meaning. The renewed vow glows brighter than the original.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Values Clarification', 'embodying', 'IdentityKoan');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const VOW_FRAGMENTS = [
  'I will show up',
  'even when it\'s hard',
  'I will be honest',
  'with myself first',
  'I will keep going',
];

export default function Mender_ReCommitment({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [traced, setTraced] = useState<number[]>([]);
  const [sealed, setSealed] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleTrace = (i: number) => {
    if (stage !== 'active' || traced.includes(i) || sealed) return;
    if (i !== traced.length) return; // enforce order
    const next = [...traced, i];
    setTraced(next);
  };

  const handleSeal = () => {
    if (traced.length < VOW_FRAGMENTS.length || sealed) return;
    setSealed(true);
    addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
  };

  const allTraced = traced.length >= VOW_FRAGMENTS.length;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Values Clarification" kbe="embodying" form="IdentityKoan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            An old promise waits.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Not a new promise. A renewed one.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>trace each line to re-commit</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            {/* Vow lines */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px 0' }}>
              {VOW_FRAGMENTS.map((line, i) => {
                const isTraced = traced.includes(i);
                const isNext = i === traced.length;
                return (
                  <motion.button key={i}
                    onClick={() => handleTrace(i)}
                    whileHover={isNext ? { scale: 1.02 } : undefined}
                    animate={{ opacity: isTraced ? 1 : isNext ? 0.3 : 0.12 }}
                    style={{ background: 'none', border: 'none', cursor: isNext ? 'pointer' : 'default', padding: '4px 12px', position: 'relative' }}>
                    {/* Faded original */}
                    <div style={{ ...navicueType.texture, color: palette.textFaint, opacity: isTraced ? 0 : 0.25, fontSize: '15px', fontStyle: 'italic', transition: 'opacity 0.8s' }}>
                      {line}
                    </div>
                    {/* Fresh ink overlay */}
                    {isTraced && (
                      <motion.div
                        initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
                        animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...navicueType.prompt, color: sealed ? palette.accent : palette.text, fontSize: '15px', textShadow: sealed ? `0 0 12px ${palette.accentGlow}` : 'none', transition: 'color 1s, text-shadow 1s' }}>
                        {line}
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
            {/* Seal button */}
            {allTraced && !sealed && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                onClick={handleSeal}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ padding: '10px 28px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${palette.primaryGlow}`, borderRadius: radius.sm, cursor: 'pointer', ...navicueType.hint, color: palette.text }}>
                seal the renewal
              </motion.button>
            )}
            {!allTraced && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
                {traced.length} of {VOW_FRAGMENTS.length} lines traced
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Renewed. Knowing what you now know.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The vow is stronger the second time. It has scars.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Same words. Deeper ink.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}