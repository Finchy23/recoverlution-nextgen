/**
 * INTUITION #8 — The Future Self Consult
 * "I am the one who has to live with this decision. Ask me."
 * Pattern A (Tap) — Select elder's reaction
 * STEALTH KBE: Temporal extension = Long-term Consequence Analysis (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { INTUITION_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('sacred_ordinary', 'Intuitive Intelligence', 'knowing', 'Practice');
type Stage = 'arriving' | 'mirror' | 'consulted' | 'resonant' | 'afterglow';

export default function Intuition_FutureSelfConsult({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [reaction, setReaction] = useState<'smiling' | 'away' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => { t(() => setStage('mirror'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const consult = (r: 'smiling' | 'away') => {
    if (stage !== 'mirror') return;
    setReaction(r);
    console.log(`[KBE:K] FutureSelfConsult elderReaction=${r} temporalExtension=confirmed consequenceAnalysis=true`);
    setStage('consulted');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Intuitive Intelligence" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '24px', height: '30px', borderRadius: radius.xs, background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }} />
          </motion.div>
        )}
        {stage === 'mirror' && (
          <motion.div key="mi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A misty mirror. Wipe it. An older version of you looks back. "Do we regret this?"
            </div>
            <div style={{ width: '50px', height: '60px', borderRadius: radius.xs,
              background: `linear-gradient(180deg, ${themeColor(TH.primaryHSL, 0.02, 1)}, ${themeColor(TH.accentHSL, 0.03, 2)})`,
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.05, 3) }} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => consult('smiling')}
                style={{ padding: '8px 16px', borderRadius: '14px', cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
                <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Smiling</span>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => consult('away')}
                style={{ padding: '8px 16px', borderRadius: '14px', cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }}>
                <span style={{ ...navicueType.choice, color: palette.textFaint }}>Looking away</span>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'consulted' && (
          <motion.div key="co" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {reaction === 'smiling'
              ? 'The elder is smiling. Do it. Your future self approves — they are the one who has to live with this decision, and they are at peace. When the imagined future self smiles, the deep mind is signaling: this aligns with your long-term values.'
              : 'The elder looks away. Reconsider. Your future self is uncomfortable — they carry the weight of this decision. When they can\'t meet your eye, something is misaligned. Don\'t ignore the elder. They know things you don\'t yet.'}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Temporal self-continuity. Hal Hershfield{"'"}s fMRI research: when people imagine their future selves, the medial prefrontal cortex activates — the same region used for self-reflection. People who feel more "connected" to their future selves save more money, make healthier choices, and behave more ethically. The mirror exercise bridges the temporal gap, making future consequences emotionally present now.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Consulted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}