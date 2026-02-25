/**
 * VALUATOR #4 — The Inflation Check
 * "Fear inflates the risk. Deflate the projection. See actual market value."
 * ARCHETYPE: Pattern B (Drag) — Drag slider to shrink an inflated worry-balloon
 * ENTRY: Cold open — huge balloon labeled "The Worry"
 * STEALTH KBE: Stopping halfway = Residual Anxiety; full shrink = Reality Testing (B)
 * WEB ADAPTATION: Slider replaces pinch gesture for desktop compatibility
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';
import { VALUATOR_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Circuit');
type Stage = 'arriving' | 'active' | 'deflated' | 'resonant' | 'afterglow';

export default function Valuator_InflationCheck({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'x',
    sticky: true,
    onComplete: () => {
      console.log(`[KBE:B] InflationCheck fullyDeflated=true realityTesting=confirmed`);
      setStage('deflated');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const balloonSize = Math.max(12, 80 - drag.progress * 68);

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '80px', height: '80px', borderRadius: '50%',
                background: 'hsla(0, 25%, 40%, 0.08)', border: '1px solid hsla(0, 25%, 40%, 0.12)' }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Deflate the projection. See actual size.
            </div>
            <motion.div animate={{ width: `${balloonSize}px`, height: `${balloonSize}px` }}
              style={{ borderRadius: '50%', background: `hsla(0, ${25 - drag.progress * 20}%, ${40 + drag.progress * 15}%, ${0.1 - drag.progress * 0.04})`,
                border: `1px solid hsla(0, 20%, 40%, ${0.15 - drag.progress * 0.08})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'width 0.1s, height 0.1s' }}>
              <span style={{ fontSize: `${Math.max(7, 10 - drag.progress * 4)}px`,
                color: themeColor(TH.primaryHSL, 0.2, 8) }}>
                {drag.progress > 0.9 ? 'pea' : 'The Worry'}
              </span>
            </motion.div>
            <div ref={drag.containerRef} style={{ width: '220px', height: '40px', touchAction: 'none',
              background: themeColor(TH.primaryHSL, 0.03, 2), borderRadius: radius.xl,
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`, position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '32px', height: '32px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.1, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 10)}`,
                  position: 'absolute', top: '3px', left: '3px' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              drag to deflate: {Math.round(100 - drag.progress * 100)}% inflated
            </div>
          </motion.div>
        )}
        {stage === 'deflated' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%',
              background: themeColor(TH.accentHSL, 0.12, 8),
              border: `1px solid ${themeColor(TH.accentHSL, 0.15, 10)}` }} />
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>actual size</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Reality is usually small. Fear inflated the projection.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Inflation bias. The amygdala magnifies threats. Reality testing, actively shrinking the worry to its actual size, engages the prefrontal cortex and recalibrates the fear response.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Actual size.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}