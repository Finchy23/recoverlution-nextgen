/**
 * NAVIGATOR #10 — The Flow Trigger
 * "Challenge meets skill. Thinking is too slow. Just do."
 * INTERACTION: An infinity loop accelerates until it becomes
 * a blur of motion. Step into the stream.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('science_x_soul', 'Behavioral Activation', 'embodying', 'IdentityKoan');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

export default function Navigator_FlowTrigger({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [speed, setSpeed] = useState(0);
  const [taps, setTaps] = useState(0);
  const [inFlow, setInFlow] = useState(false);
  const decayRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); clearInterval(decayRef.current); };
  }, []);

  // Speed decay
  useEffect(() => {
    if (stage !== 'active') return;
    decayRef.current = window.setInterval(() => {
      setSpeed(prev => Math.max(0, prev - 0.5));
    }, 100);
    return () => clearInterval(decayRef.current);
  }, [stage]);

  const handleTap = () => {
    if (stage !== 'active' || inFlow) return;
    const nextSpeed = Math.min(speed + 12, 100);
    setSpeed(nextSpeed);
    setTaps(prev => prev + 1);
    if (nextSpeed >= 90) {
      setInFlow(true);
      clearInterval(decayRef.current);
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  const s = speed / 100;
  const loopDuration = Math.max(0.3, 4 - s * 3.7);
  const blur = s > 0.7 ? (s - 0.7) * 10 : 0;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Behavioral Activation" kbe="embodying" form="IdentityKoan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Challenge meets skill.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Thinking is too slow. Just do.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap rapidly to enter the stream</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleTap}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', cursor: 'pointer', userSelect: 'none' }}>
            {/* Infinity loop */}
            <div style={{ width: '200px', height: '120px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: `blur(${blur}px)` }}>
              <svg viewBox="0 0 200 100" style={{ width: '100%', height: '100%' }}>
                <motion.path
                  d="M 50,50 C 50,20 80,20 100,50 C 120,80 150,80 150,50 C 150,20 120,20 100,50 C 80,80 50,80 50,50 Z"
                  fill="none" stroke={inFlow ? palette.accent : palette.primary}
                  strokeWidth={inFlow ? 2 : 1} opacity={0.6}
                  animate={{ rotate: 360 }}
                  transition={{ duration: loopDuration, repeat: Infinity, ease: 'linear' }}
                  style={{ transformOrigin: '100px 50px' }}
                />
              </svg>
              {inFlow && (
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.5, scale: 1.5 }}
                  style={{ position: 'absolute', width: '60px', height: '60px', borderRadius: '50%', background: `radial-gradient(circle, ${palette.accentGlow}, transparent)` }} />
              )}
            </div>
            {/* Speed meter */}
            <div style={{ width: '160px', height: '4px', background: palette.primaryFaint, borderRadius: '2px', overflow: 'hidden' }}>
              <motion.div animate={{ width: `${speed}%` }}
                style={{ height: '100%', background: inFlow ? palette.accent : palette.primary, borderRadius: '2px', transition: 'width 0.1s' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {inFlow ? 'flow state' : speed > 50 ? 'faster...' : 'tap to accelerate'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are in the stream.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Thinking stopped. Doing began.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Step into the stream. The current carries.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
