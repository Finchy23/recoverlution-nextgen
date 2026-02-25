/**
 * SAGE #1 — The Ego Zoom
 * "Pull back. See yourself from orbit. You are the landscape, not the storm."
 * INTERACTION: A zoom lens pulls outward — street → city → planet → cosmos.
 * Your problem shrinks. Your perspective grows.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('witness_ritual', 'Metacognition', 'knowing', 'Mirror');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const ZOOM_LEVELS = [
  { label: 'You, here', scale: 1, ring: 12 },
  { label: 'Your street, your neighbors', scale: 0.7, ring: 40 },
  { label: 'Your city, millions breathing', scale: 0.45, ring: 70 },
  { label: 'The planet, spinning', scale: 0.25, ring: 100 },
  { label: 'The cosmos. Indifferent. Beautiful.', scale: 0.12, ring: 140 },
];

export default function Sage_EgoZoom({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [zoomIdx, setZoomIdx] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleZoomOut = () => {
    if (stage !== 'active') return;
    const next = zoomIdx + 1;
    if (next < ZOOM_LEVELS.length) {
      setZoomIdx(next);
    }
    if (next >= ZOOM_LEVELS.length - 1) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const level = ZOOM_LEVELS[zoomIdx];
  const p = zoomIdx / (ZOOM_LEVELS.length - 1);

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="knowing" form="Mirror" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            You are very close to this.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Pull back. See the landscape.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to zoom out</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleZoomOut}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', cursor: 'pointer' }}>
            {/* Orbital rings */}
            <div style={{ width: '220px', height: '220px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {ZOOM_LEVELS.map((z, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: i <= zoomIdx ? 0.15 + (i === zoomIdx ? 0.35 : 0) : 0, scale: 1 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  style={{ position: 'absolute', width: `${z.ring}%`, height: `${z.ring}%`, borderRadius: '50%', border: `1px solid ${i === zoomIdx ? palette.accent : palette.primary}` }}
                />
              ))}
              {/* Center dot — you */}
              <motion.div
                animate={{ scale: level.scale, opacity: 0.3 + (1 - p) * 0.5 }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '10px', height: '10px', borderRadius: '50%', background: palette.accent, boxShadow: `0 0 ${16 + p * 20}px ${palette.accentGlow}`, zIndex: 1 }}
              />
            </div>
            {/* Zoom level label */}
            <motion.div key={zoomIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.6, y: 0 }} transition={{ duration: 0.8 }}
              style={{ ...navicueType.texture, color: palette.text, textAlign: 'center', maxWidth: '240px' }}>
              {level.label}
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {zoomIdx < ZOOM_LEVELS.length - 1 ? `zoom ${zoomIdx + 1} of ${ZOOM_LEVELS.length}` : 'fully zoomed'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are the landscape. Not the storm.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>This too is small. This too is precious.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            From orbit, everything is whole.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
