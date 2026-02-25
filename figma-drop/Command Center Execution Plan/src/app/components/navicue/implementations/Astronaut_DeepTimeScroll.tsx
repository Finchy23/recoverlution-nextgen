/**
 * ASTRONAUT #2 -- The Deep Time Scroll
 * "You are a blink of an eye. This problem is a micro-second. Relax."
 * ARCHETYPE: Pattern B (Drag) -- Horizontal drag through geological time
 * ENTRY: Scene-first -- timeline from today backward
 * STEALTH KBE: Depth of scroll = depth of Perspective (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ASTRONAUT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'knowing', 'Stellar');
type Stage = 'arriving' | 'active' | 'deep' | 'resonant' | 'afterglow';

const ERAS = [
  { label: 'Today', time: '0' },
  { label: 'Industrial Revolution', time: '250 years' },
  { label: 'Rome', time: '2,000 years' },
  { label: 'Ice Age', time: '20,000 years' },
  { label: 'Dinosaurs', time: '66 million years' },
  { label: 'Stardust', time: '13.8 billion years' },
];

export default function Astronaut_DeepTimeScroll({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'x', sticky: true,
    onComplete: () => {
      console.log(`[KBE:K] DeepTimeScroll temporalDistancing=confirmed depthReached=stardust`);
      setStage('deep');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const eraIdx = Math.min(ERAS.length - 1, Math.floor(drag.progress * ERAS.length));
  const era = ERAS[eraIdx];

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="knowing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ width: '80px', height: '2px', background: themeColor(TH.accentHSL, 0.08, 4), borderRadius: '1px' }} />
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Scroll backward through time. Keep going.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <motion.div key={era.label} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.3 + drag.progress * 0.15, 10),
                  textAlign: 'center', fontStyle: 'italic', fontSize: '13px' }}>
                {era.label}
              </motion.div>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>{era.time}</div>
            </div>
            {/* Era dots */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {ERAS.map((e, i) => (
                <div key={i} style={{ width: i <= eraIdx ? '8px' : '4px', height: i <= eraIdx ? '8px' : '4px',
                  borderRadius: '50%', transition: 'all 0.3s',
                  background: i <= eraIdx
                    ? themeColor(TH.accentHSL, 0.15 + i * 0.04, 6 + i * 2)
                    : themeColor(TH.primaryHSL, 0.05, 3) }} />
              ))}
            </div>
            <div ref={drag.containerRef} style={{ width: '200px', height: '12px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.12, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.16, 8)}`,
                  position: 'absolute', top: '-6px', left: '3px' }} />
            </div>
          </motion.div>
        )}
        {stage === 'deep' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.3, 10), textAlign: 'center',
              fontStyle: 'italic', maxWidth: '260px' }}>
              Stardust. 13.8 billion years. Your problem is a micro-second. The mountain does not care.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Temporal distancing. You are a blink in deep time. Today → Industrial Revolution → Rome → Ice Age → Dinosaurs → Stardust. At every scale, your problem shrinks. The geological perspective doesn{"'"}t minimize your pain -- it contextualizes it. You{"'"}re made of stardust that{"'"}s been around for 13.8 billion years. Relax. The mountain does not care.
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