/**
 * RETRO-CAUSAL #4 — The Color Grade
 * "Trauma fades the color. Put the saturation back."
 * ARCHETYPE: Pattern B (Drag) — Drag saturation slider from sepia to vivid
 * ENTRY: Scene First — sepia image already visible, slider emerges
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { RETROCAUSAL_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'scene' | 'active' | 'resonant' | 'afterglow';

export default function RetroCausal_ColorGrade({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'x',
    sticky: true,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2400);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const progress = drag.progress;
  const saturation = 5 + progress * 40;
  const lightness = 18 + progress * 12;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '200px', height: '130px', borderRadius: radius.sm,
              background: 'hsla(30, 5%, 18%, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'hsla(30, 8%, 40%, 0.4)' }}>
                sepia {'\u00B7'} faded {'\u00B7'} grey
              </div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>the color has been drained</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              Trauma fades the color. It leaves everything in sepia. But the rain was real. The cold was real. Put the saturation back. Make the memory vivid again. Smell it, feel it, see the color that was always there.
            </div>
            <motion.div style={{
              width: '200px', height: '100px', borderRadius: radius.sm,
              background: `hsla(${200 + progress * 40}, ${saturation}%, ${lightness}%, 0.15)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid hsla(${200 + progress * 40}, ${saturation}%, ${lightness + 10}%, 0.1)`,
              transition: 'background 0.2s, border 0.2s',
            }}>
              {/* Color blocks appearing */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {[0, 120, 200, 340].map((hue, i) => (
                  <motion.div key={i} style={{
                    width: '20px', height: '20px', borderRadius: '3px',
                    background: `hsla(${hue}, ${saturation * 1.5}%, ${35 + progress * 15}%, ${0.1 + progress * 0.3})`,
                  }} />
                ))}
              </div>
            </motion.div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, opacity: 0.3 }}>sepia</div>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, opacity: 0.3 }}>vivid</div>
            </div>
            <div {...drag.dragProps} style={{ ...drag.dragProps.style, width: '200px', height: '36px', borderRadius: radius.full, position: 'relative',
              background: `linear-gradient(to right, hsla(30, 5%, 18%, 0.1), hsla(200, 30%, 35%, 0.15))` }}>
              <motion.div
                style={{
                  position: 'absolute', top: '3px', left: `${5 + progress * 155}px`,
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: `hsla(${200 + progress * 40}, ${saturation}%, ${lightness + 10}%, ${0.15 + progress * 0.2})`,
                  pointerEvents: 'none',
                }} />
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Color restored. The memory breathes again. Increasing the sensory vividness of non-threatening details integrates fragmented memories into a coherent narrative. The grey day was always alive. You just needed to turn the saturation back up.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Vivid.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}