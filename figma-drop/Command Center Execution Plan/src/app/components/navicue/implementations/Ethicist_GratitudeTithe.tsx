/**
 * ETHICIST #8 — The Gratitude Tithe
 * "If you hoard the harvest, it rots. Give back."
 * ARCHETYPE: Pattern B (Drag) — Drag fruits to community pile
 * ENTRY: Scene-first — full harvest basket
 * STEALTH KBE: Performing giving gesture = Generosity / Prosocial Embodiment (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ETHICIST_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'harvest' | 'given' | 'resonant' | 'afterglow';

export default function Ethicist_GratitudeTithe({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [warmGlow, setWarmGlow] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'x', sticky: true,
    onComplete: () => {
      console.log(`[KBE:E] GratitudeTithe generosity=confirmed prosocialEmbodiment=true`);
      setWarmGlow(true);
      setStage('given');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('harvest'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '24px', height: '20px', borderRadius: '0 0 6px 6px',
              background: themeColor(TH.accentHSL, 0.05, 3) }} />
        )}
        {stage === 'harvest' && (
          <motion.div key="ha" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The basket is full. Give 10% back. Drag to the community pile.
            </div>
            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
              {/* Your basket */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '30px', height: '24px', borderRadius: '0 0 8px 8px',
                  background: themeColor(TH.accentHSL, 0.06 - drag.progress * 0.02, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }} />
                <span style={{ fontSize: '11px', color: palette.textFaint }}>Yours</span>
              </div>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.15 + drag.progress * 0.1, 6) }}>→</span>
              {/* Community basket */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '30px', height: `${14 + drag.progress * 10}px`, borderRadius: '0 0 8px 8px',
                  background: themeColor(TH.accentHSL, 0.02 + drag.progress * 0.04, 2),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.04 + drag.progress * 0.06, 4)}`,
                  transition: 'all 0.2s' }} />
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.1 + drag.progress * 0.1, 6) }}>Community</span>
              </div>
            </div>
            <div ref={drag.containerRef} style={{ width: '120px', height: '12px', borderRadius: '6px',
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.1, 5),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                  position: 'absolute', top: '-12px', left: '2px' }} />
            </div>
          </motion.div>
        )}
        {stage === 'given' && (
          <motion.div key="gi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            {warmGlow && (
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 0.08 }}
                transition={{ duration: 1.5 }}
                style={{ width: '80px', height: '80px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.08, 6),
                  position: 'absolute' }} />
            )}
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Warm glow. If you hoard the harvest, it rots. Circulation keeps it fresh. Give credit. Give thanks. Give back. The tithe is not sacrifice — it{"'"}s circulation. The giving is what keeps the abundance flowing.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Prosocial behavior. The "warm glow" effect (James Andreoni): giving activates the ventral striatum (reward center) more reliably than receiving. Neuroscience of generosity: prosocial spending creates a feedback loop — giving → dopamine release → more giving. The tithe principle: regular, structured generosity transforms giving from an occasional act into a character trait.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Given.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}