/**
 * BIOGRAPHER #7 — The Future Memoir (Prospective Hindsight)
 * "Read the history you haven't written yet. You solved this."
 * ARCHETYPE: Pattern D (Type) — Write from the future solving today's problem
 * ENTRY: Instruction-as-poetry — book from 2030 opens
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BIOGRAPHER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Theater');
type Stage = 'arriving' | 'active' | 'written' | 'resonant' | 'afterglow';

export default function Biographer_FutureMemoir({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [memoir, setMemoir] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const type = useTypeInteraction({
    minLength: 10,
    onAccept: (text: string) => {
      setMemoir(text);
      setStage('written');
      t(() => setStage('resonant'), 6000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '10px 20px', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.08, 4),
              border: `1px solid ${themeColor(TH.accentHSL, 0.04, 3)}` }}>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em',
                color: themeColor(TH.accentHSL, 0.15, 6) }}>MEMOIR \u2014 2030</div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.2, fontStyle: 'italic' }}>
              Chapter 10
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The year is 2030. Open to Chapter 10. How did you solve the problem you're carrying right now?
            </div>
            <div style={{ padding: '14px', borderRadius: radius.sm, width: '250px',
              background: themeColor(TH.primaryHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` }}>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: themeColor(TH.accentHSL, 0.15, 6),
                marginBottom: '8px' }}>CHAPTER 10: THE TURNING POINT</div>
              <textarea value={type.value} onChange={(e) => type.onChange(e.target.value)}
                placeholder="Looking back, I solved it by..."
                style={{ width: '100%', minHeight: '80px', padding: '0', borderRadius: '0', resize: 'none',
                  background: 'transparent', border: 'none', outline: 'none',
                  color: palette.text, fontSize: '13px', fontFamily: 'serif', fontStyle: 'italic' }} />
            </div>
            {type.value.length >= 10 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={type.submit}
                style={{ padding: '12px 22px', borderRadius: radius.full, cursor: 'pointer' }}>
                <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.35, 15) }}>publish the chapter</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'written' && (
          <motion.div key="wr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '280px' }}>
            <div style={{ padding: '16px', borderRadius: radius.sm, width: '100%',
              background: themeColor(TH.primaryHSL, 0.08, 4),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}` }}>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: themeColor(TH.accentHSL, 0.2, 8),
                marginBottom: '8px' }}>CHAPTER 10: THE TURNING POINT</div>
              <div style={{ fontSize: '13px', fontFamily: 'serif', fontStyle: 'italic',
                color: themeColor(TH.accentHSL, 0.4, 15), lineHeight: 1.6 }}>
                {memoir}
              </div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>you already know the way</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Prospective Hindsight. Imagining that a problem has already been solved increases the brain's ability to generate concrete solutions. You read the chapter. You already wrote the answer.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Already solved.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}