/**
 * ARCHITECT #3 -- The Micro-Yes
 * "Momentum needs a start. Just open the door."
 * INTERACTION: A very small door. Tap to open it. That's it. That's enough.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Behavioral Activation', 'believing', 'Key');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

export default function Architect_MicroYes({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [doorOpen, setDoorOpen] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  useEffect(() => { addTimer(() => setStage('present'), 1200); addTimer(() => setStage('active'), 3500); return () => timersRef.current.forEach(clearTimeout); }, []);

  const handleOpen = () => {
    if (stage !== 'active' || doorOpen) return;
    setDoorOpen(true);
    addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Behavioral Activation" kbe="believing" form="Key" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Something small.</motion.div>}
        {stage === 'present' && <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}><div style={{ ...navicueType.prompt, color: palette.text }}>Say yes to one tiny thing.</div><div style={{ ...navicueType.hint, color: palette.textFaint }}>just open the door</div></motion.div>}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
            <motion.button onClick={handleOpen} whileHover={!doorOpen ? { scale: 1.05 } : undefined} whileTap={!doorOpen ? { scale: 0.95 } : undefined}
              style={{ width: '48px', height: '72px', background: doorOpen ? `linear-gradient(180deg, ${palette.accentGlow}, transparent)` : 'rgba(255,255,255,0.04)', border: `1px solid ${doorOpen ? palette.accent : 'rgba(255,255,255,0.08)'}`, borderRadius: `${radius.xs} ${radius.xs} 2px 2px`, cursor: doorOpen ? 'default' : 'pointer', position: 'relative', transition: 'all 0.8s ease', boxShadow: doorOpen ? `0 0 40px ${palette.accentGlow}` : 'none' }}>
              {!doorOpen && <div style={{ position: 'absolute', right: '8px', top: '50%', width: '4px', height: '4px', borderRadius: '50%', background: palette.primary, opacity: 0.4 }} />}
            </motion.button>
            {doorOpen && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.6, y: 0 }} transition={{ delay: 0.5, duration: 1 }} style={{ ...navicueType.texture, color: palette.text }}>You opened it.</motion.div>}
          </motion.div>
        )}
        {stage === 'resonant' && <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}><div style={{ ...navicueType.prompt, color: palette.text }}>That was enough.</div><motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Momentum only needs a start.</motion.div></motion.div>}
        {stage === 'afterglow' && <motion.div key="af" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>The smallest door opens the largest room.</motion.div>}
      </AnimatePresence>
    </NaviCueShell>
  );
}