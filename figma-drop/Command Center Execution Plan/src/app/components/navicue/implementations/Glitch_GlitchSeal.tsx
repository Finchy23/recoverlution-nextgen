/**
 * GLITCH #10 — The Glitch Seal (The Proof)
 * "The noise is part of the signal. Welcome back."
 * ARCHETYPE: Pattern A (Tap) — Static fuzz clears into a perfect white circle
 * ENTRY: Ambient Fade — static noise resolves
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GLITCH_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'static' | 'clearing' | 'clear' | 'resonant' | 'afterglow';

export default function Glitch_GlitchSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('static');
  const [noiseOpacity, setNoiseOpacity] = useState(0.6);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  // Draw static noise
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = 120, h = 120;
    canvas.width = w;
    canvas.height = h;
    let running = true;
    const drawNoise = () => {
      if (!running) return;
      const imageData = ctx.createImageData(w, h);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const v = Math.random() * 60;
        imageData.data[i] = v;
        imageData.data[i + 1] = v + Math.random() * 15;
        imageData.data[i + 2] = v;
        imageData.data[i + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      frameRef.current = requestAnimationFrame(drawNoise);
    };
    drawNoise();
    return () => { running = false; cancelAnimationFrame(frameRef.current); };
  }, []);

  useEffect(() => {
    t(() => {
      setStage('clearing');
      // Gradually reduce noise
      let op = 0.6;
      const fade = window.setInterval(() => {
        op -= 0.03;
        setNoiseOpacity(Math.max(0, op));
        if (op <= 0) {
          clearInterval(fade);
          setStage('clear');
          t(() => setStage('resonant'), 4000);
          t(() => { setStage('afterglow'); onComplete?.(); }, 9000);
        }
      }, 80);
      T.current.push(fade as any);
    }, 2500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {(stage === 'static' || stage === 'clearing') && (
          <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden' }}>
              <canvas ref={canvasRef} style={{ width: '100%', height: '100%', opacity: noiseOpacity, transition: 'opacity 0.1s' }} />
              {stage === 'clearing' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 - noiseOpacity }}
                  style={{ position: 'absolute', inset: 0, borderRadius: '50%',
                    background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.06, 20)}, transparent)` }} />
              )}
            </div>
            {stage === 'static' && (
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>noise...</div>
            )}
          </motion.div>
        )}
        {stage === 'clear' && (
          <motion.div key="cl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 150 }}
              style={{ width: '100px', height: '100px', borderRadius: '50%',
                background: `radial-gradient(circle at 40% 40%, ${themeColor(TH.accentHSL, 0.12, 25)}, ${themeColor(TH.primaryHSL, 0.04, 10)})`,
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 15)}` }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.15em',
                color: themeColor(TH.accentHSL, 0.3, 15) }}>
              SIGNAL RESTORED
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Signal-to-noise ratio. The noise {'\u2014'} disruption, suffering, glitches {'\u2014'} is not separate from the signal. It is part of it. Accepting the noise allows you to refocus on purpose faster. Welcome back.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Signal. Restored.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}