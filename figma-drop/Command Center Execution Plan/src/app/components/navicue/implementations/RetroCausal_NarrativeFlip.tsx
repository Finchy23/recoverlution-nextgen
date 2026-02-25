/**
 * RETRO-CAUSAL #5 — The Narrative Flip
 * "It was not the end. It was the inciting incident."
 * ARCHETYPE: Pattern D (Type) — Type the new title over the old one
 * ENTRY: Instruction as Poetry — book title waiting to be renamed
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { RETROCAUSAL_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'active' | 'resonant' | 'afterglow';

export default function RetroCausal_NarrativeFlip({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    minLength: 5,
    onAccept: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '160px', height: '200px', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 5)}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
              padding: '20px',
            }}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 0.5 }}
                style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, letterSpacing: '0.1em' }}>
                THE TRAGEDY OF
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 1 }}
                style={{ width: '80px', height: '1px', background: palette.textFaint }} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>
              the title is wrong
            </motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              This book is called {'\u201C'}The Tragedy.{'\u201D'} Erase that. It was not the end. It was the inciting incident, Act 1 of a story that is still being written. Rename the book.
            </div>
            <div style={{
              width: '180px', padding: '16px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.05, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 5)}`,
              display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center',
            }}>
              <div style={{
                fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, opacity: 0.3,
                textDecoration: 'line-through',
              }}>
                THE TRAGEDY OF
              </div>
              <input
                type="text"
                value={typeInt.value}
                onChange={e => typeInt.onChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && typeInt.submit()}
                placeholder="the origin story of\u2026"
                style={{
                  width: '100%', padding: '6px 8px', borderRadius: radius.xs,
                  background: themeColor(TH.primaryHSL, 0.03, 2),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.06, 5)}`,
                  color: palette.text, fontFamily: 'serif', fontSize: '14px',
                  textAlign: 'center', outline: 'none',
                }} />
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Renamed. The story is the same, every scene, every wound. But the genre changed. Tragedy became origin story. The difficult chapter became the inciting incident. Redemptive narrative: when bad leads to good, the brain heals differently.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Retitled.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}