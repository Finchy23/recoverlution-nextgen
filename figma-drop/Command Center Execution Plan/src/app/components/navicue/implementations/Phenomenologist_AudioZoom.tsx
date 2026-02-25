/**
 * PHENOMENOLOGIST #2 — The Audio Zoom
 * "You are not the listener. You are the hearing itself."
 * INTERACTION: A sensitive waveform visualizer. Three phases: zoom
 * to furthest sound, zoom to nearest sound, dissolve into the silence
 * behind both. Each tap shifts the focal plane of hearing.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'embodying', 'Ocean');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const FOCAL_PLANES = [
  { label: 'Listen to the furthest sound.', hint: 'the edge of hearing...', amplitude: 0.15, freq: 0.8, color: 'hsla(220, 30%, 50%, 0.25)' },
  { label: 'Now the nearest sound.', hint: 'right here...', amplitude: 0.6, freq: 2.5, color: 'hsla(180, 35%, 55%, 0.4)' },
  { label: 'Now the silence behind both.', hint: 'the space where sound happens...', amplitude: 0.03, freq: 0.3, color: 'hsla(260, 20%, 45%, 0.15)' },
];

export default function Phenomenologist_AudioZoom({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [plane, setPlane] = useState(0);
  const [phase, setPhase] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    const tick = () => { setPhase(p => p + 0.04); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const shiftFocus = () => {
    if (stage !== 'active' || plane >= FOCAL_PLANES.length - 1) return;
    const next = plane + 1;
    setPlane(next);
    if (next >= FOCAL_PLANES.length - 1) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 5000);
    }
  };

  const current = FOCAL_PLANES[plane];

  // Generate waveform points
  const buildWaveform = () => {
    const points: string[] = [];
    const w = 220;
    const midY = 75;
    for (let x = 0; x <= w; x += 2) {
      const a = current.amplitude * 60;
      const y = midY + Math.sin(x * 0.03 * current.freq + phase) * a
        + Math.sin(x * 0.07 * current.freq + phase * 1.3) * a * 0.4
        + Math.sin(x * 0.12 + phase * 0.7) * a * 0.15;
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="embodying" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Tuning in...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are not the listener. You are the hearing itself. Be the space where sound happens.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to shift the focal plane</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={shiftFocus}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: plane >= FOCAL_PLANES.length - 1 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            {/* Waveform */}
            <div style={{ position: 'relative', width: '220px', height: '150px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(220, 10%, 10%, 0.3)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 150" style={{ position: 'absolute', inset: 0 }}>
                {/* Center line */}
                <line x1="0" y1="75" x2="220" y2="75" stroke="hsla(220, 15%, 30%, 0.1)" strokeWidth="0.5" />
                {/* Waveform */}
                <motion.polyline
                  points={buildWaveform()}
                  fill="none"
                  stroke={current.color}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                />
                {/* Ghost waveform — echo */}
                <motion.polyline
                  points={buildWaveform()}
                  fill="none"
                  stroke={current.color}
                  strokeWidth="0.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.15 }}
                  style={{ transform: 'translateY(4px)' }}
                />
                {/* Focal plane indicator */}
                <motion.circle cx="110" cy="75" r={plane === 0 ? 40 : plane === 1 ? 15 : 60}
                  fill="none" stroke={current.color} strokeWidth="0.5"
                  strokeDasharray="3 6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                />
              </svg>
              {/* Distance label */}
              <motion.div key={plane} initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ duration: 1.5 }}
                style={{ position: 'absolute', top: '12px', left: 0, right: 0, textAlign: 'center', fontSize: '11px', color: current.color, fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                {plane === 0 ? 'FAR' : plane === 1 ? 'NEAR' : 'SILENCE'}
              </motion.div>
            </div>
            {/* Current instruction */}
            <motion.div key={plane} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>{current.label}</div>
              <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', marginTop: '4px', opacity: 0.35 }}>{current.hint}</div>
            </motion.div>
            {/* Progress */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {FOCAL_PLANES.map((_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i <= plane ? 'hsla(200, 30%, 55%, 0.5)' : palette.primaryFaint, opacity: i <= plane ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You found the silence behind both. You are the space where sound happens.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Executive control sharpened. The filter trained. Overwhelm reduced.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Far. Near. Silence. Hearing.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}