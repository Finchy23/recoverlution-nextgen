/**
 * ETHICIST #9 — The Apology Script
 * "Ego defends. Character amends."
 * ARCHETYPE: Pattern A (Tap) — Select full apology vs non-apology
 * ENTRY: Scene-first — torn paper
 * STEALTH KBE: Selecting full apology = Relational Repair Skills (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ETHICIST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'knowing', 'Practice');
type Stage = 'arriving' | 'torn' | 'mended' | 'resonant' | 'afterglow';

export default function Ethicist_ApologyScript({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'full' | 'non' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('torn'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const choose = (c: 'full' | 'non') => {
    if (stage !== 'torn') return;
    setChoice(c);
    console.log(`[KBE:K] ApologyScript choice=${c} relationalRepair=${c === 'full'} fullApology=${c === 'full'}`);
    setStage('mended');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '2px' }}>
              <div style={{ width: '15px', height: '20px', background: themeColor(TH.primaryHSL, 0.04, 2),
                borderRadius: '2px 0 0 2px', clipPath: 'polygon(0 0, 100% 10%, 100% 90%, 0 100%)' }} />
              <div style={{ width: '15px', height: '20px', background: themeColor(TH.primaryHSL, 0.04, 2),
                borderRadius: '0 2px 2px 0', clipPath: 'polygon(0 10%, 100% 0, 100% 100%, 0 90%)' }} />
            </motion.div>
        )}
        {stage === 'torn' && (
          <motion.div key="to" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A torn paper. Tape it back together. Which script will you use?
            </div>
            {/* Torn paper visual */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{ width: '30px', height: '30px', background: themeColor(TH.primaryHSL, 0.03, 2),
                borderRadius: '3px 0 0 3px', clipPath: 'polygon(0 0, 100% 5%, 100% 95%, 0 100%)' }} />
              <div style={{ width: '30px', height: '30px', background: themeColor(TH.primaryHSL, 0.03, 2),
                borderRadius: '0 3px 3px 0', clipPath: 'polygon(0 5%, 100% 0, 100% 100%, 0 95%)' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => choose('full')}
                style={{ padding: '12px 18px', borderRadius: radius.md, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                  maxWidth: '120px' }}>
                <div style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.35, 12), textAlign: 'center' }}>
                  "I was wrong.<br/>How can I fix it?"
                </div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => choose('non')}
                style={{ padding: '12px 18px', borderRadius: radius.md, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
                  maxWidth: '120px' }}>
                <div style={{ fontSize: '11px', color: palette.textFaint, textAlign: 'center' }}>
                  "Sorry you<br/>felt that way"
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'mended' && (
          <motion.div key="me" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {choice === 'full'
              ? 'Mended. "I am sorry. I was wrong. How can I fix it?" — three sentences that take more strength than any defense. Ego defends. Character amends. The paper is taped. The relationship is stronger at the seam.'
              : '"Sorry you felt that way" is not an apology. It is a defense disguised as empathy. The real repair requires three elements: acknowledgment, responsibility, and a question — "How can I fix it?" The strongest words in the language are "I was wrong."'}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Relational repair. Gottman{"'"}s research on relationship "bids": couples who repair after conflict (vs. those who don{"'"}t) have 86% survival rates vs. 33%. The repair attempt is the single most important predictor of relationship success. A full apology has three components: acknowledgment ("I was wrong"), empathy ("I understand it hurt you"), and action ("How can I fix it?"). A non-apology lacks all three.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Mended.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}