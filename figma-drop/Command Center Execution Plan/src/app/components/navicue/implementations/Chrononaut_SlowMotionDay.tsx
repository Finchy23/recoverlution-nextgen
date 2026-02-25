/**
 * CHRONONAUT #3 — The Slow-Motion Day
 * "Hurry is a form of violence. Slow down. The slower you go, the more you see."
 * INTERACTION: A drop of honey falling in ultra-slow motion.
 * Hold your finger on the drop to keep it slow — 10 seconds to
 * reach the bottom. Release and it crashes. Patience = richness.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Somatic Regulation', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const HOLD_DURATION = 10000; // 10 seconds

export default function Chrononaut_SlowMotionDay({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const tick = () => {
    const elapsed = Date.now() - startRef.current;
    const p = Math.min(1, elapsed / HOLD_DURATION);
    setProgress(p);
    if (p >= 1) {
      setCompleted(true);
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  const handleDown = () => {
    if (stage !== 'active' || completed) return;
    setHolding(true);
    startRef.current = Date.now() - progress * HOLD_DURATION;
    rafRef.current = requestAnimationFrame(tick);
  };
  const handleUp = () => {
    setHolding(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Slowing down...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Hurry is a form of violence.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>hold to guide the drop slowly down</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onPointerDown={handleDown} onPointerUp={handleUp} onPointerLeave={handleUp}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '200px', cursor: completed ? 'default' : 'pointer', userSelect: 'none', touchAction: 'none' }}>
            {/* Glass vessel */}
            <div style={{ width: '60px', height: '220px', position: 'relative', borderRadius: radius.full, border: `1px solid ${palette.primaryFaint}`, overflow: 'hidden' }}>
              {/* The drop */}
              <motion.div
                animate={{ top: `${progress * 180}px` }}
                transition={{ duration: 0.05 }}
                style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: '16px', height: '22px', borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: `radial-gradient(circle at 40% 35%, hsla(38, 70%, 60%, 0.7), hsla(30, 60%, 45%, 0.5))`, boxShadow: holding ? `0 0 12px hsla(38, 60%, 50%, 0.3)` : 'none' }} />
              {/* Pool at bottom */}
              <motion.div animate={{ height: `${progress * 30}px`, opacity: progress * 0.6 }}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'hsla(38, 60%, 45%, 0.3)', borderRadius: '0 0 30px 30px' }} />
            </div>
            {/* Timer */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', fontFamily: 'monospace', opacity: 0.4 }}>
                {(progress * 10).toFixed(1)}s
              </div>
              <motion.div animate={{ opacity: holding ? 0.7 : 0.3 }}
                style={{ ...navicueType.hint, color: holding ? palette.accent : palette.textFaint, fontSize: '11px', marginTop: '4px' }}>
                {completed ? 'arrived' : holding ? 'holding...' : 'hold to slow'}
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The slower you go, the more you see.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Move at the speed of honey. See everything.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Slow. Rich. Full.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}