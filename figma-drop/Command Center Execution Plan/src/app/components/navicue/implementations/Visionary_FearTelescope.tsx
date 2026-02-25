/**
 * VISIONARY #4 — The Fear Telescope
 * "Look through the fear. What's on the other side?"
 * INTERACTION: Concentric rings of fear. Tap to zoom through each
 * layer. On the other side: what you actually want.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('witness_ritual', 'Exposure', 'believing', 'Key');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LAYERS = [
  { fear: 'The surface fear: embarrassment.', ring: 100 },
  { fear: 'Beneath: rejection.', ring: 75 },
  { fear: 'Deeper: unworthiness.', ring: 50 },
  { fear: 'At the core: I am not enough.', ring: 25 },
  { fear: 'Through the core: I want to be loved as I am.', ring: 0 },
];

export default function Visionary_FearTelescope({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [depth, setDepth] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleZoom = () => {
    if (stage !== 'active') return;
    const next = depth + 1;
    if (next < LAYERS.length) {
      setDepth(next);
    }
    if (next >= LAYERS.length - 1) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const layer = LAYERS[depth];
  const isThrough = depth >= LAYERS.length - 1;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Exposure" kbe="believing" form="Key" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something is behind the fear.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Look through the fear.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to zoom deeper</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleZoom}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', cursor: isThrough ? 'default' : 'pointer' }}>
            <div style={{ width: '200px', height: '200px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {LAYERS.map((l, i) => (
                <motion.div key={i}
                  animate={{ opacity: i <= depth ? 0.12 + (i === depth ? 0.25 : 0) : 0.04, scale: i <= depth ? 1 : 0.9 }}
                  style={{ position: 'absolute', width: `${l.ring}%`, height: `${l.ring}%`, borderRadius: '50%', border: `1px solid ${i === depth ? (isThrough ? palette.accent : palette.primaryFaint) : palette.primaryFaint}`, background: isThrough && i === depth ? `radial-gradient(circle, ${palette.accentGlow}, transparent)` : 'none' }} />
              ))}
              <motion.div animate={{ scale: isThrough ? 1.5 : 0.5, opacity: isThrough ? 0.7 : 0.2 }}
                transition={{ duration: 1.5 }}
                style={{ width: '8px', height: '8px', borderRadius: '50%', background: palette.accent, boxShadow: isThrough ? `0 0 20px ${palette.accentGlow}` : 'none', zIndex: 1 }} />
            </div>
            <motion.div key={depth} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.6, y: 0 }}
              style={{ ...navicueType.texture, color: isThrough ? palette.accent : palette.text, textAlign: 'center', maxWidth: '240px', fontSize: '12px', fontStyle: 'italic' }}>
              {layer.fear}
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>depth {depth + 1} of {LAYERS.length}</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>On the other side of fear: desire.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The fear was guarding what you want most.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Walk through it.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
