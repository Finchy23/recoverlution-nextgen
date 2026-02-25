/**
 * ARCHITECT COLLECTION #1 -- The Boundary Brick
 * "No is a complete sentence. Build the wall so you can garden in peace."
 * INTERACTION: Drag bricks to build a wall. Each brick is a solid "no."
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Self-Advocacy', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';

interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

export default function Architect_BoundaryBrick({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [bricks, setBricks] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handlePlace = () => {
    if (stage !== 'active') return;
    const next = bricks + 1;
    setBricks(next);
    if (next >= 5) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 1500);
    }
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Self-Advocacy" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="arr" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Some things deserve a wall.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="pres" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Build the wall so you can garden in peace.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to place each brick</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
            {/* Wall */}
            <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '3px', alignItems: 'center' }}>
              {Array.from({ length: bricks }, (_, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: -20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{ width: `${100 + (i % 2) * 20}px`, height: '24px', background: `linear-gradient(90deg, ${palette.primaryGlow}, ${palette.primaryFaint})`, borderRadius: '3px', border: `1px solid ${palette.primaryFaint}` }}
                />
              ))}
            </div>
            {bricks < 5 && (
              <motion.button onClick={handlePlace} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{ padding: '12px 32px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${palette.primaryGlow}`, borderRadius: radius.sm, cursor: 'pointer', ...navicueType.choice, color: palette.text }}>
                No.
              </motion.button>
            )}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{bricks} of 5</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The wall stands. The garden is yours.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>No is a complete sentence.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="aft" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            You built this. It holds.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}