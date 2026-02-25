/**
 * TUNER #6 — The Heart Coherence Visualizer
 * "Chaos is a jagged line. Coherence is a sine wave."
 * ARCHETYPE: Pattern B (Drag) — Drag to smooth the jagged HRV line into a sine wave
 * ENTRY: Instruction-as-Poetry — "Make your breath a perfect curve"
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TUNER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'poem' | 'active' | 'resonant' | 'afterglow';

export default function Tuner_HeartCoherence({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('poem');
  const [wavePhase, setWavePhase] = useState(0);
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
    const wave = setInterval(() => setWavePhase(p => p + 0.08), 50);
    return () => { T.current.forEach(clearTimeout); clearInterval(wave); };
  }, []);

  const progress = drag.progress;
  // Jagged → smooth interpolation
  const jaggedPoints = Array.from({ length: 30 }, (_, i) => {
    const smooth = Math.sin(wavePhase + i * 0.4) * 20;
    const jagged = (Math.random() - 0.5) * 30 + Math.sin(i * 1.2) * 15;
    const y = 40 + smooth * progress + jagged * (1 - progress);
    return `${i * 8},${y}`;
  }).join(' ');

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'poem' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.3 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>
              chaos is a jagged line.
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>
              coherence is a sine wave.
            </motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              Smooth out the edges of the breath. Make it a perfect curve. Drag the slider from chaos to coherence. Watch the line transform.
            </div>
            <svg width="240" height="80" viewBox="0 0 240 80">
              <polyline
                fill="none"
                stroke={themeColor(TH.accentHSL, 0.12 + progress * 0.15, 8)}
                strokeWidth={1 + progress * 0.5}
                strokeLinecap="round"
                points={jaggedPoints} />
              {/* Coherence glow at high progress */}
              {progress > 0.6 && (
                <polyline
                  fill="none"
                  stroke={themeColor(TH.accentHSL, 0.04, 15)}
                  strokeWidth={3}
                  strokeLinecap="round"
                  points={jaggedPoints} />
              )}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, opacity: 0.3 }}>jagged</div>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, opacity: 0.3 }}>sine</div>
            </div>
            <div {...drag.dragProps} style={{ ...drag.dragProps.style, width: '200px', height: '36px', borderRadius: radius.full, position: 'relative',
              background: themeColor(TH.primaryHSL, 0.04, 3) }}>
              <motion.div
                style={{
                  position: 'absolute', top: '3px', left: `${5 + progress * 155}px`,
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.1 + progress * 0.15, 8),
                  pointerEvents: 'none',
                }} />
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Heart Rate Variability Coherence. A physiological state where the heart rhythm becomes sine-wave-like, maximizing efficiency of the cardiovascular and nervous systems. You just turned noise into signal. The jagged line was your stress. The sine wave is your power.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Coherent.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}