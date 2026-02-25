/**
 * ZENITH #2 — The False Summit
 * "The mountain lies. Reset the goal. Keep stepping."
 * ARCHETYPE: Pattern A (Tap) — Choose "Continue" or "Camp"
 * ENTRY: Reverse reveal — confetti → mist clears → real peak higher
 * STEALTH KBE: Continue = Persistence / Grit (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ZENITH_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'celebration' | 'reveal' | 'chosen' | 'resonant' | 'afterglow';

export default function Zenith_FalseSummit({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'continue' | 'camp' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('celebration'), 1800);
    t(() => setStage('reveal'), 3800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const choose = (c: 'continue' | 'camp') => {
    if (stage !== 'reveal') return;
    setChoice(c);
    console.log(`[KBE:B] FalseSummit choice=${c} grit=${c === 'continue'} persistence=${c === 'continue'}`);
    setStage('chosen');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <div style={{ width: '30px', height: '40px', background: themeColor(TH.primaryHSL, 0.04, 2),
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
          </motion.div>
        )}
        {stage === 'celebration' && (
          <motion.div key="cel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px' }}>◇</span>
            <span style={{ ...navicueType.prompt, color: themeColor(TH.accentHSL, 0.3, 10) }}>You made it!</span>
          </motion.div>
        )}
        {stage === 'reveal' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '100px', height: '60px' }}>
              {/* False summit (lower) */}
              <div style={{ position: 'absolute', bottom: 0, left: '10px',
                width: '40px', height: '30px',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
              {/* Real peak (higher, behind) */}
              <div style={{ position: 'absolute', bottom: 0, left: '40px',
                width: '50px', height: '55px',
                background: themeColor(TH.accentHSL, 0.04, 2),
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
              <div style={{ position: 'absolute', top: '2px', left: '65px',
                width: '4px', height: '4px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.15, 8) }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The mist clears. That was just a ridge. The real peak is higher. Keep going?
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => choose('continue')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
                <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Continue ↑</span>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => choose('camp')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }}>
                <span style={{ ...navicueType.choice, color: palette.textFaint }}>Camp</span>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'chosen' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {choice === 'continue'
              ? 'You reset the goal. The mountain lies; it hides the real peak behind false ridges. Disappointment didn\'t break your legs. You adjusted and kept stepping. That\'s grit.'
              : 'You camped. Rest is not retreat. Sometimes the wise move is to consolidate before the final push. The peak will still be there tomorrow. Patience is its own form of grit.'}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Grit. Angela Duckworth{"'"}s research: grit is not just persistence; it{"'"}s persistence toward a long-term goal despite setbacks. The false summit is the most psychologically dangerous moment on a mountain because the disappointment hits hardest when you thought you were done. The metric isn{"'"}t whether you rest. It{"'"}s whether you resume.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Ascending.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}