/**
 * ANCESTOR #8 -- The Bone Wisdom
 * "Your mind is young. Your bones are old. Trust the bone."
 * ARCHETYPE: Pattern C (Hold) -- Grounding exercise: hold to feel the weight
 * ENTRY: Scene-first -- X-ray of glowing hand
 * STEALTH KBE: Completing grounding = Somatic Grounding (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ANCESTOR_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'embodying', 'Ember');
type Stage = 'arriving' | 'active' | 'grounded' | 'resonant' | 'afterglow';

export default function Ancestor_BoneWisdom({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    duration: 5000,
    onComplete: () => {
      console.log(`[KBE:E] BoneWisdom somaticGrounding=confirmed`);
      setStage('grounded');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="embodying" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg width="40" height="50" viewBox="0 0 40 50">
              {[10, 15, 20, 25, 30].map((x, i) => (
                <line key={i} x1={x} y1="10" x2={x} y2="40"
                  stroke={themeColor(TH.accentHSL, 0.08, 4)} strokeWidth="2" strokeLinecap="round" />
              ))}
            </svg>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Your bones are ancient. Feel their weight. Hold to ground.
            </div>
            <svg width="50" height="60" viewBox="0 0 50 60">
              {[12, 18, 24, 30, 36].map((x, i) => (
                <motion.line key={i} x1={x} y1="10" x2={x} y2="45"
                  stroke={themeColor(TH.accentHSL, 0.08 + hold.progress * 0.08, 4 + hold.progress * 4)}
                  strokeWidth="3" strokeLinecap="round"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: [0.5, 0.5 + hold.progress * 0.3] }} />
              ))}
            </svg>
            <div {...hold.holdProps}
              style={{ padding: '14px 32px', borderRadius: '9999px', cursor: 'pointer', userSelect: 'none',
                background: hold.isHolding ? themeColor(TH.accentHSL, 0.08, 5) : themeColor(TH.accentHSL, 0.05, 3),
                border: `2px solid ${themeColor(TH.accentHSL, hold.isHolding ? 0.14 : 0.08, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>
                {hold.isHolding ? `feeling... ${Math.round(hold.progress * 100)}%` : 'Hold to feel'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'grounded' && (
          <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
            Grounded. Your mind is young, but your bones are old. When you{"'"}re lost, trust the bone. It knows how to survive.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Somatic grounding. Your mind is young. Your bones are old, millions of years old. When the mind panics, the body knows. Trust the bone. It has survived ice ages, famines, and predators. It knows how to endure.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Grounded.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}