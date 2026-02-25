/**
 * LUMINARY #6 — The Service Compass
 * "Where does the world need what you have?"
 * INTERACTION: A compass with four directions — each a domain of
 * service. Tap each to align your gifts with the world's needs.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sacred_ordinary', 'Values Clarification', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const DIRECTIONS = [
  { label: 'What you love', angle: 0, y: 15, x: 50 },
  { label: 'What the world needs', angle: 90, y: 50, x: 85 },
  { label: 'What you\'re good at', angle: 180, y: 85, x: 50 },
  { label: 'What sustains you', angle: 270, y: 50, x: 15 },
];

export default function Luminary_ServiceCompass({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [aligned, setAligned] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleAlign = (i: number) => {
    if (stage !== 'active' || aligned.includes(i)) return;
    const next = [...aligned, i];
    setAligned(next);
    if (next.length >= DIRECTIONS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const allAligned = aligned.length >= DIRECTIONS.length;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Values Clarification" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Where do you point?
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Where does the world need what you have?</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each direction to align</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '240px', height: '240px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Compass circle */}
              <motion.div animate={{ opacity: allAligned ? 0.3 : 0.1 }}
                style={{ position: 'absolute', width: '70%', height: '70%', borderRadius: '50%', border: `1px solid ${allAligned ? palette.accent : palette.primaryFaint}` }} />
              {/* Center */}
              <motion.div animate={{ opacity: allAligned ? 0.7 : 0.3, scale: allAligned ? 1.3 : 1 }}
                style={{ width: '8px', height: '8px', borderRadius: '50%', background: palette.accent, boxShadow: allAligned ? `0 0 16px ${palette.accentGlow}` : 'none', zIndex: 1 }} />
              {/* Directions */}
              {DIRECTIONS.map((d, i) => {
                const isAligned = aligned.includes(i);
                return (
                  <motion.button key={i} onClick={() => handleAlign(i)}
                    animate={{ opacity: isAligned ? 0.7 : 0.25 }}
                    whileHover={!isAligned ? { opacity: 0.5, scale: 1.1 } : undefined}
                    style={{ position: 'absolute', left: `${d.x}%`, top: `${d.y}%`, transform: 'translate(-50%, -50%)', background: 'none', border: 'none', cursor: isAligned ? 'default' : 'pointer', textAlign: 'center', padding: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isAligned ? palette.accent : palette.primaryFaint, margin: '0 auto 4px', boxShadow: isAligned ? `0 0 8px ${palette.accentGlow}` : 'none' }} />
                    <div style={{ ...navicueType.hint, color: isAligned ? palette.text : palette.textFaint, fontSize: '11px', whiteSpace: 'nowrap' }}>{d.label}</div>
                  </motion.button>
                );
              })}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{aligned.length} of {DIRECTIONS.length} aligned</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Where all four meet: purpose.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Service is not sacrifice. It's alignment.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Follow the compass.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}