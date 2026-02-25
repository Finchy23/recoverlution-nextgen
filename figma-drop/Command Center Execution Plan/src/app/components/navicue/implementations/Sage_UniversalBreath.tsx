/**
 * SAGE #8 — The Universal Breath
 * "Right now, 8 billion people are breathing with you."
 * INTERACTION: A single breath circle. As you breathe, other circles
 * appear — an expanding field of synchronized breath. You are not alone.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sensory_cinema', 'Somatic Regulation', 'knowing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

export default function Sage_UniversalBreath({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [breathCycles, setBreathCycles] = useState(0);
  const [others, setOthers] = useState(0);
  const cycleRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); clearInterval(cycleRef.current); };
  }, []);

  // Count breath cycles
  useEffect(() => {
    if (stage !== 'active') return;
    cycleRef.current = window.setInterval(() => {
      setBreathCycles(prev => {
        const next = prev + 1;
        setOthers(Math.min(20, next * 3));
        if (next >= 6) {
          clearInterval(cycleRef.current);
          setTimeout(() => { setStage('resonant'); setTimeout(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
        }
        return next;
      });
    }, 4500); // one full breath cycle
    return () => clearInterval(cycleRef.current);
  }, [stage]);

  const BREATH_DURATION = 4.5;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Breathe.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>8 billion people are breathing with you.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>follow the rhythm</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '240px', height: '240px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Your breath circle */}
              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: BREATH_DURATION, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '40px', height: '40px', borderRadius: '50%', background: `radial-gradient(circle, ${palette.accent}, transparent)`, opacity: 0.5, zIndex: 2 }}
              />
              {/* Others appearing */}
              {Array.from({ length: others }, (_, i) => {
                const angle = (i / 20) * Math.PI * 2 + (i % 3) * 0.5;
                const dist = 40 + (i % 4) * 20;
                const x = Math.cos(angle) * dist;
                const y = Math.sin(angle) * dist;
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.15 + (i < 5 ? 0.1 : 0), scale: [0.8, 1.2, 0.8] }}
                    transition={{ scale: { duration: BREATH_DURATION, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 0.5 }, opacity: { duration: 1 } }}
                    style={{ position: 'absolute', left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: 'translate(-50%, -50%)', width: '12px', height: '12px', borderRadius: '50%', background: palette.primaryGlow }}
                  />
                );
              })}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              breath {breathCycles} of 6
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are never breathing alone.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The whole world exhales with you.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            One breath. Eight billion lungs.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
