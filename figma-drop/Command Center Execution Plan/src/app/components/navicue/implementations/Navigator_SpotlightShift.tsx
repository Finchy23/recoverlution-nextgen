/**
 * NAVIGATOR #6 — The Spotlight Shift
 * "You are staring at the lens. Look at the view."
 * INTERACTION: A stage spotlight moves from "Me" to "Them."
 * When you lose yourself, you find the flow.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Attention Shift', 'embodying', 'Mirror');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

export default function Navigator_SpotlightShift({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [spotlightPos, setSpotlightPos] = useState(0); // 0=me, 100=them
  const [shifted, setShifted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stage !== 'active' || shifted) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setSpotlightPos(x * 100);
    if (x > 0.85 && !shifted) {
      setShifted(true);
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const p = spotlightPos / 100;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Attention Shift" kbe="embodying" form="Mirror" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The spotlight is on you.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Look at the view, not the lens.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag the light outward</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onPointerMove={handleDrag}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', cursor: 'pointer', touchAction: 'none', padding: '0 24px' }}>
            {/* Stage floor */}
            <div style={{ width: '100%', maxWidth: '300px', height: '160px', position: 'relative', borderRadius: radius.md, overflow: 'hidden', background: palette.primaryFaint }}>
              {/* Spotlight cone */}
              <motion.div animate={{ left: `${spotlightPos}%` }}
                style={{ position: 'absolute', top: 0, width: '80px', height: '100%', transform: 'translateX(-50%)', background: `radial-gradient(ellipse at 50% 0%, ${palette.primaryGlow}, transparent 80%)`, opacity: 0.5 + p * 0.3 }} />
              {/* Me label */}
              <motion.div animate={{ opacity: 1 - p * 0.7 }}
                style={{ position: 'absolute', left: '15%', bottom: '20%', transform: 'translateX(-50%)', ...navicueType.choice, color: palette.text, fontSize: '14px' }}>
                Me
              </motion.div>
              {/* Them label */}
              <motion.div animate={{ opacity: 0.3 + p * 0.7 }}
                style={{ position: 'absolute', right: '15%', bottom: '20%', transform: 'translateX(50%)', ...navicueType.choice, color: palette.text, fontSize: '14px' }}>
                The World
              </motion.div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {shifted ? 'shifted' : p < 0.3 ? 'self-focused' : p < 0.6 ? 'expanding...' : 'almost there'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>When you lose yourself, you find the flow.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The view was there all along.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Stop staring at the lens.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}