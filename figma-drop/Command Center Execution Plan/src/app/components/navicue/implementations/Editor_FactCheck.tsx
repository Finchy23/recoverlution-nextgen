/**
 * EDITOR #6 — The Fact Check
 * "That is an opinion, not a fact. Check your sources."
 * ARCHETYPE: Pattern A (Tap) — Stamp "VERIFY" on a statement → "INSUFFICIENT DATA"
 * ENTRY: Cold open — assumption text appears
 * STEALTH KBE: Acknowledging insufficient data = Reality Testing (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { EDITOR_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'knowing', 'Storm');
type Stage = 'arriving' | 'active' | 'verified' | 'resonant' | 'afterglow';

export default function Editor_FactCheck({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const verify = () => {
    if (stage !== 'active') return;
    console.log(`[KBE:K] FactCheck verifyAccepted=true epistemicHumility=confirmed`);
    setStage('verified');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="knowing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: palette.textFaint, fontStyle: 'italic', textAlign: 'center' }}>
            "They are ignoring me."
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Is this a fact or a feeling? Check your sources.
            </div>
            <div style={{ padding: '14px 20px', borderRadius: radius.md,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
              <span style={{ ...navicueType.texture, color: palette.text, fontStyle: 'italic' }}>
                "They are ignoring me."
              </span>
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={verify}
              style={{ padding: '14px 20px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `2px dashed ${themeColor(TH.accentHSL, 0.15, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15), letterSpacing: '0.1em' }}>VERIFY</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'verified' && (
          <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ padding: '10px 16px', borderRadius: radius.sm,
              background: themeColor(TH.accentHSL, 0.04, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.35, 12), letterSpacing: '0.08em', fontSize: '11px' }}>
                INSUFFICIENT DATA
              </span>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Not enough evidence to confirm. It{"'"}s a feeling, not a fact.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Epistemic humility. Reality testing is the ability to distinguish between assumptions and evidence. Acknowledging "insufficient data" instead of doubling down is the mark of a rigorous mind.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Verified.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}