/**
 * ELEMENTALIST #4 — The Water Flow (Adaptation)
 * "The rock breaks. The water adapts. Surrender to the container."
 * ARCHETYPE: Pattern B (Drag) — Drag water to new container
 * ENTRY: Scene-first — water in square
 * STEALTH KBE: Accepting the new shape = Radical Acceptance (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ELEMENTALIST_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('sensory_cinema', 'Somatic Regulation', 'believing', 'Canopy');
type Stage = 'arriving' | 'flowing' | 'adapted' | 'resonant' | 'afterglow';

export default function Elementalist_WaterFlow({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'x', sticky: true,
    onComplete: () => {
      console.log(`[KBE:B] WaterFlow radicalAcceptance=confirmed adaptation=true`);
      setStage('adapted');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('flowing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const morphRadius = `${4 + drag.progress * 20}px`;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="believing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '24px', height: '24px', borderRadius: '2px', background: themeColor(TH.accentHSL, 0.04, 2) }} />
        )}
        {stage === 'flowing' && (
          <motion.div key="fl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Water in a square. Change the container. Watch it adapt.
            </div>
            {/* Morphing container with water */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: morphRadius,
                background: `linear-gradient(180deg, transparent 20%, ${themeColor(TH.accentHSL, 0.06 + drag.progress * 0.02, 3)} 80%)`,
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}`,
                transition: 'border-radius 0.3s' }}>
                <motion.div animate={{ y: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ width: '100%', height: '60%', marginTop: '40%', borderRadius: `0 0 ${morphRadius} ${morphRadius}`,
                    background: themeColor(TH.accentHSL, 0.08, 4), transition: 'border-radius 0.3s' }} />
              </div>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 6) }}>
                {drag.progress < 0.5 ? '□' : '○'}
              </span>
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
        {stage === 'adapted' && (
          <motion.div key="ad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            The water filled the new shape instantly. No resistance. No complaint. The rock breaks. The water adapts. Do not fight the shape of the day — fill it. Surrender to the container. Be the water.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Radical acceptance. Tara Brach and DBT{"'"}s core principle: fighting reality is the source of suffering, not reality itself. Water doesn{"'"}t resist its container — and neither should you resist circumstances you cannot change. Acceptance isn{"'"}t passive; it{"'"}s strategic. You accept the container, THEN you can choose how to fill it. Resistance wastes energy. Adaptation conserves it.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Adapted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}