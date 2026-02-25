/**
 * EDITOR #2 — The Headline Rewrite
 * "The amygdala writes clickbait. The prefrontal cortex writes the news."
 * ARCHETYPE: Pattern A (Tap) — Tap pen icon to rewrite sensational headline
 * ENTRY: Cold open — tabloid headline flashes
 * STEALTH KBE: Accepting neutral headline = Affective Labeling (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { EDITOR_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'knowing', 'Storm');
type Stage = 'arriving' | 'active' | 'rewritten' | 'resonant' | 'afterglow';

export default function Editor_HeadlineRewrite({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const rewrite = () => {
    if (stage !== 'active') return;
    console.log(`[KBE:K] HeadlineRewrite rewriteAccepted=true affectiveLabeling=confirmed`);
    setStage('rewritten');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="knowing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.8, 0.3] }} transition={{ duration: 1.5 }}
            exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: 'hsla(0, 40%, 45%, 0.5)', textAlign: 'center', fontSize: '14px', fontWeight: '700' }}>
            CATASTROPHE LOOMS!
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Edit the headline. De-sensationalize.
            </div>
            <div style={{ padding: '12px 18px', borderRadius: radius.sm,
              background: 'hsla(0, 15%, 25%, 0.04)',
              border: '1px solid hsla(0, 15%, 30%, 0.1)' }}>
              <span style={{ ...navicueType.texture, color: 'hsla(0, 35%, 42%, 0.6)', fontWeight: '700', fontSize: '13px' }}>
                CATASTROPHE LOOMS!
              </span>
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={rewrite}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
                display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px' }}>{'\u270e'}</span>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15) }}>Rewrite</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'rewritten' && (
          <motion.div key="rw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ padding: '12px 18px', borderRadius: radius.sm,
              background: themeColor(TH.accentHSL, 0.04, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}` }}>
              <span style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.35, 12), fontSize: '13px' }}>
                Change is coming.
              </span>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Same facts. Different framing. The news is clearer without the clickbait.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Affective labeling. The amygdala writes clickbait; the prefrontal cortex writes the news. Rewriting the emotional headline to a neutral one reduces limbic arousal and engages rational processing.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Rewritten.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}