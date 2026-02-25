/**
 * ZENITH #6 — The Descent (The Danger)
 * "Most accidents happen on the way down."
 * ARCHETYPE: Pattern A (Tap) — Choose careful steps or celebrate
 * ENTRY: Scene-first — summit, path down
 * STEALTH KBE: Choosing caution = Humility / Prudence (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';
import { ZENITH_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'summit' | 'chosen' | 'resonant' | 'afterglow';

export default function Zenith_Descent({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'careful' | 'celebrate' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('summit'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const choose = (c: 'careful' | 'celebrate') => {
    if (stage !== 'summit') return;
    setChoice(c);
    console.log(`[KBE:B] Descent choice=${c} humility=${c === 'careful'} prudence=${c === 'careful'}`);
    setStage('chosen');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <div style={{ width: '30px', height: '3px', borderRadius: '1.5px',
              background: themeColor(TH.primaryHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'summit' && (
          <motion.div key="su" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You{"'"}re at the top. The goal is Home. The path down is steep. Most accidents happen on the descent.
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => choose('careful')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
                <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Careful Steps</span>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => choose('celebrate')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }}>
                <span style={{ ...navicueType.choice, color: palette.textFaint }}>Celebrate</span>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'chosen' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {choice === 'careful'
              ? 'Careful steps. Getting down requires more humility than going up. Success is dangerous; ego creates complacency. You won. Good. Now focus. The descent is where the discipline proves itself.'
              : 'You celebrated, and slipped. The euphoria of the summit is real, but it blinds you to the ice. Most mountaineering deaths occur during descent. Humility is the rappel that gets you home.'}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Prudence. 80% of mountaineering accidents occur during descent. The psychological parallel: post-success complacency. Hubris, the inflation that follows victory, is the most dangerous terrain. Andy Grove (Intel): "Only the paranoid survive." The summit is not the goal. Getting home is.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Descending.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}