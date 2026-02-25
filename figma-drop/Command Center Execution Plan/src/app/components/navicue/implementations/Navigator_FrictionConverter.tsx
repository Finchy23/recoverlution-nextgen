/**
 * NAVIGATOR #2 — The Friction Converter
 * "Stress is just energy without direction. Harvest it."
 * INTERACTION: Sparks fly into a battery cell, charging it green.
 * Hold through the friction and watch it become fuel.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Somatic Regulation', 'embodying', 'Key');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

export default function Navigator_FrictionConverter({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [charge, setCharge] = useState(0);
  const [holding, setHolding] = useState(false);
  const intervalRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); clearInterval(intervalRef.current); };
  }, []);

  const startCharge = () => {
    if (stage !== 'active' || charge >= 100) return;
    setHolding(true);
    intervalRef.current = window.setInterval(() => {
      setCharge(prev => {
        const next = prev + 1.2;
        if (next >= 100) {
          clearInterval(intervalRef.current);
          setHolding(false);
          setTimeout(() => { setStage('resonant'); setTimeout(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 1500);
          return 100;
        }
        return next;
      });
    }, 40);
  };

  const stopCharge = () => {
    setHolding(false);
    clearInterval(intervalRef.current);
  };

  const progress = charge / 100;
  // Color transitions from red (stress) to gold (fuel)
  const batteryHue = 0 + progress * 50; // 0=red, 50=gold
  const batteryColor = `hsla(${batteryHue}, 70%, 55%, ${0.4 + progress * 0.4})`;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Somatic Regulation" kbe="embodying" form="Key" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The friction is fuel.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Do not suppress it. Harvest it.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>hold to convert the energy</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onPointerDown={startCharge} onPointerUp={stopCharge} onPointerLeave={stopCharge}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', cursor: 'pointer', touchAction: 'none' }}>
            {/* Battery */}
            <div style={{ width: '80px', height: '140px', border: `1px solid ${palette.primaryGlow}`, borderRadius: radius.sm, position: 'relative', overflow: 'hidden' }}>
              {/* Battery cap */}
              <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', width: '30px', height: '8px', background: palette.primaryFaint, borderRadius: `${radius.xs} ${radius.xs} 0 0` }} />
              {/* Fill */}
              <motion.div animate={{ height: `${progress * 100}%` }}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: `linear-gradient(180deg, ${batteryColor}, ${batteryColor.replace(/[\d.]+\)$/, '0.2)')})`, transition: 'height 0.1s' }} />
              {/* Sparks */}
              {holding && Array.from({ length: 6 }, (_, i) => (
                <motion.div key={i}
                  animate={{ y: [0, -(20 + Math.random() * 40)], x: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 50], opacity: [0.8, 0], scale: [1, 0.3] }}
                  transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.15 }}
                  style={{ position: 'absolute', bottom: `${progress * 100}%`, left: `${30 + Math.random() * 40}%`, width: '3px', height: '3px', borderRadius: '50%', background: `hsla(${batteryHue}, 80%, 65%, 0.8)` }}
                />
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>
              {charge >= 100 ? 'fully charged' : holding ? 'converting...' : `${Math.round(charge)}%`}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Stress became fuel.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Add direction. Reclaim the energy.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Energy without direction is noise. Energy with direction is power.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}