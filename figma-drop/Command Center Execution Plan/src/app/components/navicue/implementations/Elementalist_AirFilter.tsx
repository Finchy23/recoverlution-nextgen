/**
 * ELEMENTALIST #2 — The Air Filter (Clarity)
 * "Do not squint. Ventilate. One deep breath clears the room."
 * ARCHETYPE: Pattern B (Drag) — Swipe to open window
 * ENTRY: Scene-first — smoky room
 * STEALTH KBE: Opening window / clearing smoke = Physiological Reset (E)
 * WEB ADAPT: mic breath detection → drag slider to clear
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ELEMENTALIST_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('sensory_cinema', 'Somatic Regulation', 'embodying', 'Canopy');
type Stage = 'arriving' | 'smoky' | 'cleared' | 'resonant' | 'afterglow';

export default function Elementalist_AirFilter({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'x', sticky: true,
    onComplete: () => {
      console.log(`[KBE:E] AirFilter physiologicalReset=confirmed breathClarity=true`);
      setStage('cleared');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('smoky'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const smokeOpacity = (1 - drag.progress) * 0.12;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="embodying" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}
            style={{ width: '60px', height: '40px', borderRadius: '2px', background: themeColor(TH.primaryHSL, 0.03, 1) }} />
        )}
        {stage === 'smoky' && (
          <motion.div key="sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The room is full of smoke. You cannot see clearly. Swipe to open the window.
            </div>
            {/* Smoky room */}
            <div style={{ width: '120px', height: '70px', borderRadius: radius.xs, position: 'relative', overflow: 'hidden',
              background: themeColor(TH.primaryHSL, 0.025, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}` }}>
              {[0, 1, 2, 3].map(i => (
                <motion.div key={i} animate={{ x: [-5, 5, -5], opacity: [smokeOpacity, smokeOpacity * 0.7, smokeOpacity] }}
                  transition={{ duration: 2 + i * 0.5, repeat: Infinity }}
                  style={{ position: 'absolute', width: '40px', height: '20px', borderRadius: '10px',
                    top: `${10 + i * 14}px`, left: `${10 + i * 20}px`,
                    background: themeColor(TH.primaryHSL, smokeOpacity, 2) }} />
              ))}
              {/* Window (right edge) */}
              <motion.div animate={{ opacity: 0.2 + drag.progress * 0.3 }}
                style={{ position: 'absolute', right: 0, top: '10px', width: '12px', height: '50px',
                  borderRadius: '2px 0 0 2px',
                  background: themeColor(TH.accentHSL, 0.03 + drag.progress * 0.06, 3),
                  borderLeft: `1px solid ${themeColor(TH.accentHSL, 0.06 + drag.progress * 0.1, 5)}` }} />
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
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>Open window →</div>
          </motion.div>
        )}
        {stage === 'cleared' && (
          <motion.div key="cl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Clear. A breeze rushes in. The smoke vanishes instantly. The mind was smoky — you couldn{"'"}t see the answer. Don{"'"}t squint harder. Ventilate. One deep breath clears the room. You are biology, not technology. Use the air.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Physiological sigh. Andrew Huberman{"'"}s research: a double inhale through the nose followed by a long exhale through the mouth is the fastest known non-pharmacological way to reduce autonomic arousal. It works in a single breath cycle. The alveoli in the lungs reinflate, CO₂ is expelled, and the parasympathetic nervous system activates. You don{"'"}t need 10 minutes of meditation. You need one breath.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Cleared.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}