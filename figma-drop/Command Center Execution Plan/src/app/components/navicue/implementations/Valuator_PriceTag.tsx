/**
 * VALUATOR #1 — The Price Tag
 * "If you are available to everyone, you are valuable to no one."
 * ARCHETYPE: Pattern B (Drag) — Swipe up to change "Free" → "Expensive"
 * ENTRY: Cold open — price tag hangs
 * STEALTH KBE: Hesitation latency before swiping = Self-Valuation (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { VALUATOR_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Circuit');
type Stage = 'arriving' | 'active' | 'priced' | 'resonant' | 'afterglow';

export default function Valuator_PriceTag({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const stageStart = useRef(0);

  const drag = useDragInteraction({
    axis: 'y',
    sticky: true,
    onComplete: () => {
      const latency = Date.now() - stageStart.current;
      console.log(`[KBE:B] PriceTag hesitationMs=${latency} selfValuation=${latency < 4000}`);
      setStage('priced');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => { setStage('active'); stageStart.current = Date.now(); }, 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const label = drag.progress < 0.3 ? 'Free' : drag.progress < 0.6 ? 'Cheap' : drag.progress < 0.9 ? 'Fair' : 'Expensive';

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '2px', height: '20px', background: themeColor(TH.primaryHSL, 0.1, 6) }} />
            <div style={{ padding: '6px 14px', borderRadius: radius.xs, background: themeColor(TH.primaryHSL, 0.05, 3),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
              <span style={{ ...navicueType.hint, color: palette.textFaint }}>Free</span>
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Raise the price of your "Yes."
            </div>
            <motion.div animate={{ backgroundColor: drag.progress > 0.8
              ? themeColor(TH.accentHSL, 0.12, 10)
              : themeColor(TH.primaryHSL, 0.05, 3) }}
              style={{ padding: '10px 20px', borderRadius: radius.sm,
                border: `1px solid ${themeColor(TH.accentHSL, 0.08 + drag.progress * 0.12, 6)}`,
                backgroundColor: 'rgba(0,0,0,0)' }}>
              <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.3 + drag.progress * 0.3, 12) }}>{label}</span>
            </motion.div>
            <div ref={drag.containerRef} style={{ width: '200px', height: '60px', touchAction: 'none' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '44px', height: '44px', borderRadius: '50%', cursor: 'grab', margin: '0 auto',
                  background: themeColor(TH.accentHSL, 0.06 + drag.progress * 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1 + drag.progress * 0.1, 8)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '14px' }}>{'\u2191'}</span>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'priced' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
              style={{ padding: '12px 24px', borderRadius: radius.sm,
                background: themeColor(TH.accentHSL, 0.12, 8),
                border: `1px solid ${themeColor(TH.accentHSL, 0.2, 12)}`,
                boxShadow: `0 0 16px ${themeColor(TH.accentHSL, 0.06, 8)}` }}>
              <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 15) }}>Expensive</span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              The background turns gold. Scarcity creates value.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Self-valuation. The hesitation before raising your price reveals your internal price tag. Quick action signals confident self-worth; delay signals the imposter. You teach the world how to treat you by the price you set.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Priced.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}