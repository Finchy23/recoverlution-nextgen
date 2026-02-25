/**
 * NAVIGATOR #7 — The Doubt Detox
 * "Doubt is just noise in the system. Filter for signal."
 * INTERACTION: Muddy water pours in the top. You hold to filter.
 * Clear water pours out the bottom. Signal from noise.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'knowing', 'Key');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

export default function Navigator_DoubtDetox({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [filterProgress, setFilterProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const intervalRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); clearInterval(intervalRef.current); };
  }, []);

  const startFilter = () => {
    if (stage !== 'active' || filterProgress >= 100) return;
    setHolding(true);
    intervalRef.current = window.setInterval(() => {
      setFilterProgress(prev => {
        const next = prev + 0.8;
        if (next >= 100) {
          clearInterval(intervalRef.current);
          setHolding(false);
          setTimeout(() => { setStage('resonant'); setTimeout(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
          return 100;
        }
        return next;
      });
    }, 40);
  };

  const stopFilter = () => { setHolding(false); clearInterval(intervalRef.current); };

  const p = filterProgress / 100;
  // Muddy → clear color transition
  const muddyColor = `hsla(30, ${40 - p * 30}%, ${35 + p * 25}%, ${0.4 - p * 0.25})`;
  const clearColor = `hsla(200, ${20 + p * 40}%, ${45 + p * 20}%, ${p * 0.4})`;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="knowing" form="Key" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The water is muddy.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Filter for signal. Ship the action.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>hold to run the filter</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onPointerDown={startFilter} onPointerUp={stopFilter} onPointerLeave={stopFilter}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', touchAction: 'none' }}>
            {/* Filter container */}
            <div style={{ width: '100px', height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              {/* Top chamber — muddy */}
              <div style={{ width: '80px', height: '80px', borderRadius: radius.sm, border: `1px solid ${palette.primaryFaint}`, position: 'relative', overflow: 'hidden' }}>
                <motion.div animate={{ height: `${(1 - p) * 100}%` }}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, background: muddyColor }} />
                {/* Particles representing noise */}
                {holding && Array.from({ length: 4 }, (_, i) => (
                  <motion.div key={i}
                    animate={{ y: [0, 70], opacity: [0.5, 0] }}
                    transition={{ duration: 1, delay: i * 0.25, repeat: Infinity }}
                    style={{ position: 'absolute', left: `${20 + i * 20}%`, top: '60%', width: '3px', height: '3px', borderRadius: '50%', background: 'hsla(30, 30%, 45%, 0.5)' }}
                  />
                ))}
              </div>
              {/* Filter mesh */}
              <div style={{ width: '80px', height: '8px', background: `repeating-linear-gradient(90deg, ${palette.primaryFaint} 0px, ${palette.primaryFaint} 2px, transparent 2px, transparent 6px)`, opacity: 0.5, borderRadius: '2px' }} />
              {/* Bottom chamber — clear */}
              <div style={{ width: '80px', height: '80px', borderRadius: radius.sm, border: `1px solid ${palette.primaryFaint}`, position: 'relative', overflow: 'hidden' }}>
                <motion.div animate={{ height: `${p * 100}%` }}
                  style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: clearColor }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100px', marginTop: '4px' }}>
              <span style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, fontSize: '11px' }}>noise</span>
              <span style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, fontSize: '11px' }}>signal</span>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4, marginTop: '8px' }}>
              {filterProgress >= 100 ? 'filtered' : holding ? 'filtering...' : `${Math.round(filterProgress)}%`}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Signal. Not noise.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Act despite uncertainty.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Doubt is noise. Action is signal.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}