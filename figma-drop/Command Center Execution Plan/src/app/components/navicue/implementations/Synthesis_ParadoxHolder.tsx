/**
 * SYNTHESIS #1 — The Paradox Holder
 * "The small mind says 'OR'. The great mind says 'AND'."
 * ARCHETYPE: Pattern B (Drag) — Push opposing truths together until they merge
 * ENTRY: Scene-first — two repelling truths
 * STEALTH KBE: Speed of merging = Dialectical Synthesis capacity (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SYNTHESIS_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'repelling' | 'merged' | 'resonant' | 'afterglow';

export default function Synthesis_ParadoxHolder({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const startRef = useRef(Date.now());
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'y', sticky: true,
    onComplete: () => {
      const elapsed = ((Date.now() - startRef.current) / 1000).toFixed(1);
      console.log(`[KBE:K] ParadoxHolder dialecticalSynthesis=confirmed mergeTimeS=${elapsed}`);
      setStage('merged');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => { setStage('repelling'); startRef.current = Date.now(); }, 2200); return () => T.current.forEach(clearTimeout); }, []);

  const sep = 40 * (1 - drag.progress);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '30px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: themeColor(TH.primaryHSL, 0.06, 3) }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: themeColor(TH.primaryHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'repelling' && (
          <motion.div key="rep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Two truths repel each other. Push them together.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: `${sep}px`, transition: 'gap 0.15s' }}>
              <motion.div animate={{ x: drag.progress < 0.5 ? [-2, 2, -2] : 0 }}
                transition={{ duration: 0.3, repeat: drag.progress < 0.5 ? Infinity : 0 }}
                style={{ padding: '8px 14px', borderRadius: radius.md,
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.06 + drag.progress * 0.04, 4)}` }}>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>I am flawed</span>
              </motion.div>
              {drag.progress > 0.9 && (
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{ width: '20px', height: '20px', borderRadius: '50%',
                    background: themeColor(TH.accentHSL, 0.12, 6),
                    boxShadow: `0 0 12px ${themeColor(TH.accentHSL, 0.06, 4)}` }} />
              )}
              <motion.div animate={{ x: drag.progress < 0.5 ? [2, -2, 2] : 0 }}
                transition={{ duration: 0.3, repeat: drag.progress < 0.5 ? Infinity : 0 }}
                style={{ padding: '8px 14px', borderRadius: radius.md,
                  background: themeColor(TH.accentHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.06 + drag.progress * 0.04, 4)}` }}>
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.25, 8) }}>I am worthy</span>
              </motion.div>
            </div>
            <div ref={drag.containerRef} style={{ width: '12px', height: '80px', borderRadius: '6px',
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '24px', height: '24px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.1, 5),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                  position: 'absolute', left: '-6px', top: '2px' }} />
            </div>
          </motion.div>
        )}
        {stage === 'merged' && (
          <motion.div key="m" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 8 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <motion.div animate={{ boxShadow: [`0 0 8px ${themeColor(TH.accentHSL, 0.06, 4)}`, `0 0 16px ${themeColor(TH.accentHSL, 0.1, 8)}`, `0 0 8px ${themeColor(TH.accentHSL, 0.06, 4)}`] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '36px', height: '36px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.1, 5),
                border: `2px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.45, 14) }}>I am human</span>
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Fused. The small mind says "OR." The great mind says "AND." Flawed AND worthy. That{"'"}s not a contradiction: that{"'"}s the full picture.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Dialectical thinking. Marsha Linehan{"'"}s DBT is built on this: the capacity to hold two seemingly contradictory truths simultaneously. "I am doing the best I can, AND I need to do better." This is not cognitive dissonance; it{"'"}s cognitive maturity. The paradox dissolves when you stop forcing a choice. Hold the tension. The orb that forms is called wisdom.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Human.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}