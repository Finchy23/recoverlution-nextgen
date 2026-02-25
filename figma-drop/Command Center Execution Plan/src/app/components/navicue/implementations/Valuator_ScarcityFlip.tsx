/**
 * VALUATOR #8 — The Scarcity Flip
 * "Abundance is not having more. It is needing less."
 * ARCHETYPE: Pattern A (Tap) — Tap empty cup to invert it; fills with possibility
 * ENTRY: Cold open — empty cup
 * STEALTH KBE: Accepting the reframe = Cognitive Reframing (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { VALUATOR_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'knowing', 'Circuit');
type Stage = 'arriving' | 'empty' | 'flipped' | 'resonant' | 'afterglow';

export default function Valuator_ScarcityFlip({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('empty'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const flip = () => {
    if (stage !== 'empty') return;
    console.log(`[KBE:K] ScarcityFlip reframeAccepted=true cognitiveReframing=confirmed`);
    setStage('flipped');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '30px', height: '36px', borderRadius: '0 0 6px 6px',
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`, borderTop: 'none' }} />
          </motion.div>
        )}
        {stage === 'empty' && (
          <motion.div key="em" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, fontStyle: 'italic' }}>
              "I don{"'"}t have enough."
            </div>
            <div style={{ width: '40px', height: '48px', borderRadius: '0 0 8px 8px',
              border: `2px solid ${themeColor(TH.primaryHSL, 0.1, 6)}`, borderTop: 'none' }} />
            <motion.div whileTap={{ scale: 0.95 }} onClick={flip}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15) }}>Flip</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'flipped' && (
          <motion.div key="fl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.3, 10), fontStyle: 'italic' }}>
              "I have enough to start."
            </div>
            <motion.div initial={{ rotate: 0 }} animate={{ rotate: 180 }} transition={{ duration: 0.6 }}
              style={{ width: '40px', height: '48px', borderRadius: '0 0 8px 8px',
                border: `2px solid ${themeColor(TH.accentHSL, 0.15, 8)}`, borderTop: 'none',
                overflow: 'hidden', position: 'relative' }}>
              <motion.div initial={{ height: '0%' }} animate={{ height: '100%' }} transition={{ delay: 0.6, duration: 1.5 }}
                style={{ position: 'absolute', bottom: 0, width: '100%',
                  background: themeColor(TH.accentHSL, 0.1, 6) }} />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              The cup fills. You had the raw materials all along.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Cognitive reframing. Abundance is not having more; it is needing less. Flipping from complaint to inventory rewires the scarcity bias and reveals the resources already available.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Enough.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}