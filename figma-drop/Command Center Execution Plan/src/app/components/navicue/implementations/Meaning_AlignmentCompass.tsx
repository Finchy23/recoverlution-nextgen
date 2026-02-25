/**
 * MEANING MAKER #8 — The Alignment Compass
 * "The vibration is your conscience. Listen to the buzz."
 * ARCHETYPE: Pattern B (Drag) — Drag to steer compass, stay aligned
 * ENTRY: Scene-first — compass needle
 * STEALTH KBE: Quick correction = high Moral Sensitivity / Somatic Integrity (E)
 * WEB ADAPTATION: Phone vibration → visual shake + red warning
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MEANING_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'walking' | 'aligned' | 'resonant' | 'afterglow';

export default function Meaning_AlignmentCompass({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'y', sticky: true,
    onComplete: () => {
      console.log(`[KBE:E] AlignmentCompass somaticIntegrity=confirmed moralSensitivity=high`);
      setStage('aligned');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('walking'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const deviation = Math.abs(0.5 - drag.progress) * 2;
  const isOff = deviation > 0.4 && drag.progress < 0.4;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '30px', height: '30px', borderRadius: '50%',
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '2px', height: '12px', background: themeColor(TH.primaryHSL, 0.08, 4),
              borderRadius: '1px' }} />
          </motion.div>
        )}
        {stage === 'walking' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Walk True North. Stay aligned with your values.
            </div>
            {/* Compass */}
            <motion.div animate={isOff ? { x: [-2, 2, -2, 2, 0] } : {}}
              transition={{ duration: 0.3, repeat: isOff ? Infinity : 0 }}
              style={{ width: '60px', height: '60px', borderRadius: '50%',
                border: `2px solid ${isOff
                  ? 'hsla(0, 20%, 30%, 0.12)'
                  : themeColor(TH.accentHSL, 0.1 + drag.progress * 0.1, 5)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', transition: 'border-color 0.3s' }}>
              <div style={{ fontSize: '7px', position: 'absolute', top: '4px', color: palette.textFaint }}>N</div>
              {/* Needle */}
              <div style={{ width: '2px', height: '24px', borderRadius: '1px',
                background: `linear-gradient(to bottom, ${themeColor(TH.accentHSL, 0.15 + drag.progress * 0.1, 8)}, ${themeColor(TH.primaryHSL, 0.06, 3)})`,
                transform: `rotate(${-40 + drag.progress * 80}deg)`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s' }} />
            </motion.div>
            <div style={{ ...navicueType.texture, fontStyle: 'italic', textAlign: 'center',
              color: isOff ? 'hsla(0, 15%, 35%, 0.25)' : themeColor(TH.accentHSL, 0.25 + drag.progress * 0.15, 8) }}>
              {isOff ? 'Off course. Correct before you\'re lost.' : drag.progress > 0.8 ? 'True North.' : 'Steering...'}
            </div>
            <div ref={drag.containerRef} style={{ width: '12px', height: '80px', borderRadius: radius.sm,
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
        {stage === 'aligned' && (
          <motion.div key="al" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Aligned. True North. The compass needle points to your values — and every deviation registers as a buzz, a discomfort, a quiet wrongness. That{"'"}s your conscience. Quick correction signals high moral sensitivity. Listen to the buzz.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Somatic integrity. Research on moral reasoning shows that most ethical decisions are felt before they{"'"}re thought — the body signals misalignment through discomfort, tension, or unease (Damasio{"'"}s somatic marker hypothesis). The compass isn{"'"}t in your head; it{"'"}s in your gut. The vibration is your conscience. Correct course before you{"'"}re lost.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>True North.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}