/**
 * SAGE #4 — The Silence Soak
 * "The mind speaks. The wisdom listens. Soak in the quiet."
 * INTERACTION: A noise field fades to silence. Hold still.
 * A counter tracks seconds of pure presence. The quiet deepens.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sensory_cinema', 'Somatic Regulation', 'knowing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

export default function Sage_SilenceSoak({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [seconds, setSeconds] = useState(0);
  const [noiseParticles, setNoiseParticles] = useState(30);
  const intervalRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    intervalRef.current = window.setInterval(() => {
      setSeconds(prev => {
        const next = prev + 1;
        setNoiseParticles(Math.max(0, 30 - next * 2));
        if (next >= 15) {
          clearInterval(intervalRef.current);
          setTimeout(() => { setStage('resonant'); setTimeout(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 1500);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [stage]);

  const p = Math.min(1, seconds / 15);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Listen.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Soak in the quiet.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>be still and the noise will fade</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
            {/* Noise field */}
            <div style={{ width: '200px', height: '200px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Fading noise particles */}
              {Array.from({ length: noiseParticles }, (_, i) => (
                <motion.div key={i}
                  animate={{ x: (Math.random() - 0.5) * 160, y: (Math.random() - 0.5) * 160, opacity: [0.3, 0.05] }}
                  transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}
                  style={{ position: 'absolute', width: '2px', height: '2px', borderRadius: '50%', background: palette.primaryFaint }}
                />
              ))}
              {/* Center stillness */}
              <motion.div
                animate={{ scale: 1 + p * 0.5, opacity: 0.1 + p * 0.3 }}
                transition={{ duration: 2 }}
                style={{ width: '40px', height: '40px', borderRadius: '50%', background: `radial-gradient(circle, ${palette.accentGlow}, transparent)`, zIndex: 1 }}
              />
            </div>
            {/* Timer */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '24px', fontVariantNumeric: 'tabular-nums', opacity: 0.5 + p * 0.3 }}>
                {seconds}s
              </div>
              <div style={{ width: '120px', height: '2px', background: palette.primaryFaint, borderRadius: '1px', overflow: 'hidden' }}>
                <motion.div animate={{ width: `${p * 100}%` }} style={{ height: '100%', background: palette.accent, borderRadius: '1px' }} />
              </div>
              <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
                {noiseParticles > 0 ? 'the noise is fading' : 'silence'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The mind speaks. The wisdom listens.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>{seconds} seconds of presence.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            In the silence, knowing arrives.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
