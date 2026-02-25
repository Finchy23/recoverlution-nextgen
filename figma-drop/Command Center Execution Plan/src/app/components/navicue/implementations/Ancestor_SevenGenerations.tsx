/**
 * ANCESTOR #7 -- The Seven Generations
 * "Every decision ripples forward 200 years. Decide for your great-great-granddaughter."
 * ARCHETYPE: Pattern A (Tap) -- Choose Short Term Gain vs Long Term Legacy
 * ENTRY: Scene-first -- telescope forward
 * STEALTH KBE: Choosing Legacy = Cathedral Thinking (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ANCESTOR_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'knowing', 'Ember');
type Stage = 'arriving' | 'active' | 'decided' | 'resonant' | 'afterglow';

export default function Ancestor_SevenGenerations({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'short' | 'long' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const pick = (c: 'short' | 'long') => {
    if (stage !== 'active') return;
    setChoice(c);
    console.log(`[KBE:K] SevenGenerations choice=${c} cathedralThinking=${c === 'long'}`);
    setStage('decided');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="knowing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <motion.div key={i} animate={{ opacity: [0.1, 0.1 + i * 0.04, 0.1] }}
                transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                style={{ width: '6px', height: '18px', borderRadius: '2px',
                  background: themeColor(TH.primaryHSL, 0.05 + i * 0.01, 3) }} />
            ))}
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Through the telescope: 7 ghostly figures, your descendants. Don{"'"}t decide for Friday. Decide for them.
            </div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => pick('short')}
                style={{ padding: '14px 16px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
                <div style={{ ...navicueType.choice, color: palette.textFaint, fontSize: '11px' }}>Short-term gain</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => pick('long')}
                style={{ padding: '14px 16px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12), fontSize: '11px' }}>Long-term legacy</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'decided' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
            {choice === 'long'
              ? 'Cathedral thinking. Your great-great-granddaughter will feel this decision. 200 years of ripple.'
              : 'The gain is yours alone. It dies with Friday. The descendants felt nothing.'}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Cathedral thinking. Every decision you make ripples forward 200 years. Don{"'"}t decide for Friday. Decide for your great-great-granddaughter. The cathedral builders knew they{"'"}d never see the finished spires. Build for the ones who come after.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Legacy.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}