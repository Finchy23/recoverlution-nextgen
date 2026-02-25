/**
 * PHENOMENOLOGIST #9 — The Micro-Texture
 * "The entire universe is in that friction. Feel the grain of existence."
 * INTERACTION: Extreme close-up of a fingerprint rendered in SVG.
 * Rub your thumb and forefinger together. Each tap zooms deeper
 * into the ridges — the universe in the friction.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Somatic Regulation', 'embodying', 'Ocean');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ZOOM_LEVELS = [
  { scale: 1, label: 'Your fingerprint.', hint: 'ridges visible', spacing: 4 },
  { scale: 2, label: 'Closer. See the valleys.', hint: 'each ridge unique', spacing: 8 },
  { scale: 4, label: 'The grain of the skin.', hint: 'cells, textures, landscape', spacing: 14 },
  { scale: 8, label: 'The universe in the friction.', hint: 'you are here', spacing: 22 },
];

export default function Phenomenologist_MicroTexture({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [zoom, setZoom] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const zoomIn = () => {
    if (stage !== 'active' || zoom >= ZOOM_LEVELS.length - 1) return;
    const next = zoom + 1;
    setZoom(next);
    if (next >= ZOOM_LEVELS.length - 1) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  const current = ZOOM_LEVELS[zoom];

  // Generate fingerprint ridge lines
  const buildRidges = () => {
    const lines: JSX.Element[] = [];
    const spacing = current.spacing;
    const cx = 110;
    const cy = 85;
    for (let r = 10; r < 80; r += spacing) {
      const points: string[] = [];
      for (let a = 0; a < Math.PI * 2; a += 0.1) {
        const wobble = Math.sin(a * 3 + r * 0.2) * (2 + zoom * 1.5)
          + Math.cos(a * 5 + r * 0.4) * (1 + zoom);
        const px = cx + (r + wobble) * Math.cos(a) * 0.9;
        const py = cy + (r + wobble) * Math.sin(a) * 0.7;
        if (px >= 0 && px <= 220 && py >= 0 && py <= 170) {
          points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
        }
      }
      if (points.length > 2) {
        lines.push(
          <polyline key={r} points={points.join(' ')} fill="none"
            stroke={`hsla(25, 15%, ${40 + zoom * 5}%, ${0.12 + zoom * 0.05})`}
            strokeWidth={0.5 + zoom * 0.3} strokeLinecap="round" />
        );
      }
    }
    return lines;
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Somatic Regulation" kbe="embodying" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Zooming in...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Rub your thumb and forefinger together. The entire universe is in that friction.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to zoom deeper</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={zoomIn}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: zoom >= ZOOM_LEVELS.length - 1 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            {/* Fingerprint field */}
            <motion.div
              animate={{ scale: 1 }}
              style={{ position: 'relative', width: '220px', height: '170px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(25, 10%, 10%, 0.3)' }}>
              <motion.svg
                key={zoom}
                width="100%" height="100%" viewBox="0 0 220 170"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                style={{ position: 'absolute', inset: 0 }}>
                {buildRidges()}
                {/* Center detail dots at higher zoom */}
                {zoom >= 2 && Array.from({ length: zoom * 6 }, (_, i) => (
                  <circle key={`d${i}`}
                    cx={70 + Math.sin(i * 2.3) * 50 + 30}
                    cy={50 + Math.cos(i * 1.7) * 40 + 25}
                    r={0.3 + zoom * 0.2}
                    fill={`hsla(25, 10%, 45%, ${0.05 + zoom * 0.02})`}
                  />
                ))}
              </motion.svg>
              {/* Zoom indicator */}
              <div style={{ position: 'absolute', top: '8px', right: '10px', fontFamily: 'monospace', fontSize: '11px', color: palette.textFaint, opacity: 0.2 }}>
                {current.scale}×
              </div>
            </motion.div>
            {/* Label */}
            <motion.div key={zoom} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>{current.label}</div>
              <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', marginTop: '3px', opacity: 0.3 }}>{current.hint}</div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {ZOOM_LEVELS.map((_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i <= zoom ? 'hsla(25, 20%, 50%, 0.5)' : palette.primaryFaint, opacity: i <= zoom ? 0.5 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The entire universe was in that friction. You felt the grain of existence.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Somatosensory cortex activated. Minute tactile focus. Grounded in the ridges.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Ridges. Friction. Universe.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}