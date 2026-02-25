/**
 * NAVIGATOR #5 — The Drift Correction
 * "You don't need to be perfect. You just need to correct early."
 * INTERACTION: A gyroscope interface. You are slightly off-center.
 * Tilt gently (drag) to snap back to the center line.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('pattern_glitch', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

export default function Navigator_DriftCorrection({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [offset, setOffset] = useState({ x: 30, y: -20 }); // starts off-center
  const [corrections, setCorrections] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleCorrect = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (stage !== 'active') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (e.clientX - rect.left - cx) * 0.3;
    const dy = (e.clientY - rect.top - cy) * 0.3;
    setOffset({ x: dx, y: dy });
    // Check if close to center
    if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
      const next = corrections + 1;
      setCorrections(next);
      // Drift away again
      if (next < 3) {
        addTimer(() => {
          setOffset({ x: (Math.random() - 0.5) * 60, y: (Math.random() - 0.5) * 40 });
        }, 800);
      } else {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 1500);
      }
    }
  }, [stage, corrections]);

  const dist = Math.sqrt(offset.x ** 2 + offset.y ** 2);
  const isNearCenter = dist < 8;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Slightly off course.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Micro-adjustments save you from the crash.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag toward center to correct</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onPointerMove={handleCorrect}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', touchAction: 'none' }}>
            {/* Gyroscope */}
            <div style={{ width: '220px', height: '220px', borderRadius: '50%', border: `1px solid ${palette.primaryFaint}`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              {/* Crosshair */}
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: palette.primaryFaint, opacity: 0.2 }} />
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: palette.primaryFaint, opacity: 0.2 }} />
              {/* Concentric rings */}
              {[30, 60, 90].map(r => (
                <div key={r} style={{ position: 'absolute', width: `${r}%`, height: `${r}%`, borderRadius: '50%', border: `1px solid ${palette.primaryFaint}`, opacity: 0.15 }} />
              ))}
              {/* Drifting dot */}
              <motion.div
                animate={{ x: offset.x, y: offset.y }}
                transition={{ type: 'spring', damping: 15, stiffness: 150 }}
                style={{ width: '14px', height: '14px', borderRadius: '50%', background: isNearCenter ? palette.accent : palette.primary, boxShadow: `0 0 ${isNearCenter ? 25 : 12}px ${isNearCenter ? palette.accentGlow : palette.primaryGlow}`, zIndex: 1 }}
              />
              {/* Center target */}
              <div style={{ position: 'absolute', width: '16px', height: '16px', borderRadius: '50%', border: `1px solid ${palette.accentGlow}`, opacity: 0.4 }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              correction {corrections} of 3
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Not perfect. Corrected.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Deviation is data, not failure.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The center is a practice, not a place.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
