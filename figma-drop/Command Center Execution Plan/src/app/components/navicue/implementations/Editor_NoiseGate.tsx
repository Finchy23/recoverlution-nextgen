/**
 * EDITOR #1 — The Noise Gate
 * "Raise your gate. Only let the high-quality signal through."
 * ARCHETYPE: Pattern B (Drag) — Turn a threshold dial to silence the noise
 * ENTRY: Cold open — chaotic waveform
 * STEALTH KBE: Finding sweet spot quickly = Attentional Control (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { EDITOR_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'embodying', 'Storm');
type Stage = 'arriving' | 'active' | 'gated' | 'resonant' | 'afterglow';

export default function Editor_NoiseGate({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const stageStart = useRef(0);

  const drag = useDragInteraction({
    axis: 'x',
    sticky: true,
    onComplete: () => {
      const elapsed = Date.now() - stageStart.current;
      console.log(`[KBE:E] NoiseGate tuneTimeMs=${elapsed} attentionalControl=${elapsed < 6000}`);
      setStage('gated');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => { setStage('active'); stageStart.current = Date.now(); }, 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const noiseLevel = 1 - drag.progress;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="embodying" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div key={i} animate={{ height: [4, 12 + Math.random() * 16, 4] }}
                transition={{ duration: 0.3 + Math.random() * 0.3, repeat: Infinity }}
                style={{ width: '3px', borderRadius: '2px', background: themeColor(TH.primaryHSL, 0.12, 6) }} />
            ))}
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Raise the gate. Silence the noise.
            </div>
            {/* Waveform */}
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center', height: '40px' }}>
              {Array.from({ length: 24 }).map((_, i) => {
                const isSignal = i >= 8 && i <= 15;
                const maxH = isSignal ? 30 : 20 * noiseLevel;
                return (
                  <motion.div key={i} animate={{ height: [2, maxH, 2] }}
                    transition={{ duration: 0.2 + Math.random() * 0.4, repeat: Infinity }}
                    style={{ width: '3px', borderRadius: '2px',
                      background: isSignal
                        ? themeColor(TH.accentHSL, 0.2 + drag.progress * 0.15, 8)
                        : themeColor(TH.primaryHSL, 0.08 * noiseLevel, 4) }} />
                );
              })}
            </div>
            {/* Threshold dial */}
            <div ref={drag.containerRef} style={{ width: '220px', height: '12px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.12, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.18, 10)}`,
                  position: 'absolute', top: '-6px', left: '3px' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              threshold: {Math.round(drag.progress * 100)}%
            </div>
          </motion.div>
        )}
        {stage === 'gated' && (
          <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center', height: '40px' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div key={i} animate={{ height: [8, 24, 8] }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                  style={{ width: '3px', borderRadius: '2px',
                    background: themeColor(TH.accentHSL, 0.25, 10) }} />
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Only the clear voice remains. The noise is muted.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Sensory gating. Raising the threshold is attentional control: the ability to filter signal from noise. The world is loud. Your gate determines what gets through.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Gated.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}