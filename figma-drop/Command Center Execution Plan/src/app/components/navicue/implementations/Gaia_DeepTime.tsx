/**
 * GAIA #5 — The Deep Time (The Rock)
 * "The mountains are moving like waves. Just very slowly."
 * Pattern B (Drag) — Swipe to erode; 1,000 years per swipe
 * STEALTH KBE: Swiping through eons = Long-Term Perspective / Temporal Scale (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GAIA_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Systems Thinking', 'knowing', 'Canopy');
type Stage = 'arriving' | 'eroding' | 'ancient' | 'resonant' | 'afterglow';

export default function Gaia_DeepTime({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'x', sticky: true,
    onComplete: () => {
      console.log(`[KBE:K] DeepTime longTermPerspective=confirmed temporalScale=true`);
      setStage('ancient');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('eroding'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const years = Math.round(drag.progress * 1000000);
  const rockH = 40 * (1 - drag.progress * 0.7);
  const rockW = 50 + drag.progress * 30;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Systems Thinking" kbe="knowing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '24px', height: '18px', borderRadius: '4px 6px 2px 2px',
              background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'eroding' && (
          <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A rock. Drag to erode it. 1,000 years pass per swipe. Patience is just a matter of scale.
            </div>
            {/* Rock */}
            <motion.div
              style={{ width: `${rockW}px`, height: `${rockH}px`,
                borderRadius: `${4 + drag.progress * 8}px`,
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
                transition: 'all 0.2s' }} />
            <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 8) }}>
              {years.toLocaleString()} years
            </span>
            <div ref={drag.containerRef} style={{ width: '120px', height: '12px', borderRadius: '6px',
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.08 + drag.progress * 0.04, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
                  position: 'absolute', top: '-6px', left: '2px' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>Erode →</div>
          </motion.div>
        )}
        {stage === 'ancient' && (
          <motion.div key="an" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            One million years. The rock became sand. It will become stone again. The mountains are moving like waves — just very slowly. Slow down your clock. What feels permanent to you is a blink to the rock. Your urgency is a human invention. The earth has patience measured in epochs. Adopt geological time and your anxiety dissolves.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Deep time. John McPhee coined the term for geological timescales. The Earth is 4.5 billion years old; humans have existed for ~300,000 years (0.007%). "Cathedral thinking" — starting projects whose completion you will never see — requires temporal perspective-taking. Research on "temporal discounting": people who can psychologically access longer time horizons make better environmental, financial, and health decisions. Deep time is a cognitive tool, not just a fact.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Ancient.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}