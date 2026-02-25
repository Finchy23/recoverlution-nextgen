/**
 * MENTAT #8 — The Devil's Advocate
 * "Your belief is weak because you haven't tested it."
 * ARCHETYPE: Pattern A (Tap) — Defend or Concede
 * ENTRY: Scene-first — debate stage
 * STEALTH KBE: Conceding to better argument = Intellectual Honesty / Epistemic Resilience (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MENTAT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('poetic_precision', 'Cognitive Enhancement', 'believing', 'Circuit');
type Stage = 'arriving' | 'debating' | 'resolved' | 'resonant' | 'afterglow';

export default function Mentat_DevilsAdvocate({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'defend' | 'concede' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('debating'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const respond = (c: 'defend' | 'concede') => {
    if (stage !== 'debating') return;
    setChoice(c);
    console.log(`[KBE:B] DevilsAdvocate response=${c} intellectualHonesty=${c === 'concede'} epistemicResilience=confirmed`);
    setStage('resolved');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Cognitive Enhancement" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '12px', height: '18px', borderRadius: '2px', background: themeColor(TH.accentHSL, 0.04, 2) }} />
              <div style={{ width: '12px', height: '18px', borderRadius: '2px', background: themeColor(TH.primaryHSL, 0.04, 2) }} />
            </motion.div>
        )}
        {stage === 'debating' && (
          <motion.div key="de" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A debate stage. Your belief stands at the podium. The opponent challenges: "Prove it."
            </div>
            {/* Debate visual */}
            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '20px', height: '26px', borderRadius: radius.xs,
                  background: themeColor(TH.accentHSL, 0.05, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }} />
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 8) }}>You</span>
              </div>
              <span style={{ fontSize: '11px', color: palette.textFaint }}>vs</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '20px', height: '26px', borderRadius: radius.xs,
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }} />
                <span style={{ fontSize: '11px', color: palette.textFaint }}>Doubt</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => respond('defend')}
                style={{ padding: '12px 18px', borderRadius: '14px', cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
                <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Defend</span>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => respond('concede')}
                style={{ padding: '12px 18px', borderRadius: '14px', cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }}>
                <span style={{ ...navicueType.choice, color: palette.textFaint }}>Concede</span>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'resolved' && (
          <motion.div key="re" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {choice === 'concede'
              ? 'Conceded. Intellectual honesty is the rarest form of courage. You let the better argument win. That is not weakness — it is epistemic strength. A belief that survives genuine challenge is stronger. A belief that doesn\'t deserve to be discarded. Either way, you win.'
              : 'Defended. You held your ground. But ask: did you defend because the evidence supported you, or because your ego required it? The strongest minds hold beliefs provisionally — willing to update when better evidence arrives. The debate is never over. Remain open.'}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Epistemic resilience. Karl Popper{"'"}s falsifiability principle: a belief is only scientific (meaningful) if it can be tested and potentially disproven. The strongest beliefs are those that have survived genuine attempts to destroy them. Charlie Munger: "I never allow myself to have an opinion on anything that I don{"'"}t know the other side{"'"}s argument better than they do." Intellectual humility — the willingness to concede — is a hallmark of high fluid intelligence.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Tested.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}