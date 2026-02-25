/**
 * ETHICIST #3 — The Hard Right (The Dilemma)
 * "The easy path is a circle. The hard path is a spiral up."
 * ARCHETYPE: Pattern A (Tap) — Choose Hard Right over Easy Wrong
 * ENTRY: Scene-first — fork in the road
 * STEALTH KBE: Selecting hard path = Moral Courage / Ethical Decision Making (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';
import { ETHICIST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'fork' | 'chosen' | 'resonant' | 'afterglow';

export default function Ethicist_HardRight({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'right' | 'left' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('fork'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const choose = (c: 'right' | 'left') => {
    if (stage !== 'fork') return;
    setChoice(c);
    console.log(`[KBE:B] HardRight choice=${c} moralCourage=${c === 'right'} ethicalDecision=${c === 'right'}`);
    setStage('chosen');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <svg width="40" height="20" viewBox="0 0 40 20">
              <path d="M20,20 L10,5" fill="none" stroke={themeColor(TH.primaryHSL, 0.06, 3)} strokeWidth="1.5" />
              <path d="M20,20 L30,5" fill="none" stroke={themeColor(TH.accentHSL, 0.06, 3)} strokeWidth="1.5" />
            </svg>
          </motion.div>
        )}
        {stage === 'fork' && (
          <motion.div key="fo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A fork in the road. Left: Easy Wrong. Right: Hard Right. The right path is steep and rocky.
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => choose('left')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: palette.textFaint }}>Easy Wrong</div>
                  <div style={{ fontSize: '11px', color: palette.textFaint, marginTop: '2px' }}>← smooth</div>
                </div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => choose('right')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 10) }}>Hard Right</div>
                  <div style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.25, 8), marginTop: '2px' }}>steep →</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'chosen' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {choice === 'right'
              ? 'The hard path. Steep and rocky. But the easy path is a circle — it brings you back to the same place. The hard path is a spiral up. Do the hard thing. The view is better. Moral courage is a muscle.'
              : 'The smooth path. Comfortable. But circles end where they began. The easy wrong feels good now and costs later. The hard right costs now and compounds forever. Which path builds the person you want to be?'}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Moral courage. West Point{"'"}s motto: "Choose the harder right over the easier wrong." Neuroscience: ethical decision-making activates the anterior cingulate cortex (conflict monitoring) and the ventromedial PFC (value computation). Each time you choose the hard right, you strengthen these neural pathways, making future ethical choices slightly more automatic. Character is habit.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Chosen.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}