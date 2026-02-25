/**
 * COMPOSER #8 — The Ensemble Check
 * "Your Logic section is asleep. Wake them up. Balance the orchestra."
 * ARCHETYPE: Pattern B (Drag) — Balance faders for Strings (Emotions) vs Brass (Logic)
 * ENTRY: Scene-first — orchestra layout
 * STEALTH KBE: Balanced mix = Executive Control / Resource Allocation (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { COMPOSER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'knowing', 'Theater');
type Stage = 'arriving' | 'unbalanced' | 'balanced' | 'resonant' | 'afterglow';

export default function Composer_EnsembleCheck({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const brass = useDragInteraction({ axis: 'y', sticky: false, onComplete: () => {} });

  useEffect(() => { t(() => setStage('unbalanced'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    if (stage === 'unbalanced' && brass.progress > 0.55 && brass.progress < 0.75) {
      console.log(`[KBE:K] EnsembleCheck executiveControl=confirmed resourceAllocation=balanced brass=${brass.progress.toFixed(2)}`);
      setStage('balanced');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    }
  }, [brass.progress, stage]);

  const balance = brass.progress;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="knowing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: themeColor(TH.primaryHSL, 0.08, 4) }} />
              <div style={{ width: '4px', height: '8px', borderRadius: '2px', background: themeColor(TH.accentHSL, 0.03, 2) }} />
            </motion.div>
        )}
        {stage === 'unbalanced' && (
          <motion.div key="u" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Strings (Emotions) are drowning the Brass (Logic). Raise the Brass to balance.
            </div>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end' }}>
              {/* Strings (fixed high) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '24px', height: `${30 + (1 - balance * 0.3) * 20}px`, borderRadius: radius.xs,
                  background: themeColor(TH.primaryHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                  transition: 'height 0.2s' }} />
                <span style={{ fontSize: '11px', color: palette.textFaint }}>Strings</span>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>(Emotions)</span>
              </div>
              {/* Brass (adjustable) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '24px', height: `${10 + balance * 40}px`, borderRadius: radius.xs,
                  background: themeColor(TH.accentHSL, 0.04 + balance * 0.04, 2 + balance * 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.06 + balance * 0.06, 4 + balance * 3)}`,
                  transition: 'all 0.2s' }} />
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.15 + balance * 0.1, 6) }}>Brass</span>
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.15 + balance * 0.1, 6) }}>(Logic)</span>
              </div>
            </div>
            <div ref={brass.containerRef} style={{ width: '12px', height: '80px', borderRadius: '6px',
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...brass.dragProps}
                style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.1, 5),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                  position: 'absolute', left: '-6px', top: '2px' }} />
            </div>
          </motion.div>
        )}
        {stage === 'balanced' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Balanced. The horns support the strings. Neither drowns the other. You woke up the Logic section without silencing the Emotions. That{"'"}s conducting — not choosing sides, but balancing the orchestra.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Executive control. The prefrontal cortex acts as the conductor of the brain{"'"}s orchestra — allocating resources between the amygdala (emotional strings) and the dorsolateral PFC (logical brass). Neither section should dominate. The best decisions emerge from the balanced ensemble. Conduct the full orchestra.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Conducted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}