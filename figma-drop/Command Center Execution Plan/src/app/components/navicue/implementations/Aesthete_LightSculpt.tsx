/**
 * AESTHETE #8 -- The Light Sculpt
 * "Light is the painter. You are the canvas."
 * INTERACTION: A sundial-like shape. A shadow slowly moves across it
 * as you hold. The angle shifts -- golden hour light sculpting form.
 * Notice the transience: this exact angle will never come again.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Self-Compassion', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LIGHT_DURATION = 8000;

export default function Aesthete_LightSculpt({ onComplete }: Props) {
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
    const p = Math.min(1, (Date.now() - startRef.current) / LIGHT_DURATION);
    setProgress(p);
    if (p >= 1 && !completed) {
      setCompleted(true);
      setHolding(false);
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  const handleDown = () => {
    if (completed || stage !== 'active') return;
    setHolding(true);
    startRef.current = Date.now() - progress * LIGHT_DURATION;
    rafRef.current = requestAnimationFrame(tick);
  };
  const handleUp = () => {
    setHolding(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  // Shadow angle based on progress (0 = morning, 0.5 = noon, 1 = evening)
  const shadowAngle = -60 + progress * 120;
  const lightWarmth = progress < 0.3 ? 0.3 : progress > 0.7 ? 0.8 : 0.5;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Self-Compassion" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The light shifts...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Notice the angle of the light. It will never be this angle again.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>hold to watch the light sculpt</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onPointerDown={handleDown} onPointerUp={handleUp} onPointerLeave={handleUp}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: completed ? 'default' : 'pointer', touchAction: 'none', width: '100%', maxWidth: '280px' }}>
            {/* Sundial scene */}
            <div style={{ position: 'relative', width: '200px', height: '180px', borderRadius: radius.md, overflow: 'hidden', border: `1px solid ${palette.primaryFaint}` }}>
              {/* Light source glow */}
              <motion.div
                animate={{
                  left: `${20 + progress * 60}%`,
                  top: `${15 + Math.sin(progress * Math.PI) * -10}%`,
                  opacity: holding ? lightWarmth : 0.1,
                }}
                style={{ position: 'absolute', width: '30px', height: '30px', borderRadius: '50%', background: `radial-gradient(circle, hsla(40, 70%, ${60 + lightWarmth * 20}%, ${0.3 + lightWarmth * 0.2}), transparent)`, transform: 'translate(-50%, -50%)' }}
              />
              {/* Object -- simple geometric form */}
              <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)' }}>
                {/* Form */}
                <div style={{ width: '40px', height: '60px', background: `hsla(25, 15%, ${30 + lightWarmth * 10}%, 0.4)`, borderRadius: `${radius.xs} ${radius.xs} 0 0` }} />
                {/* Shadow */}
                <motion.div
                  animate={{
                    transform: `skewX(${shadowAngle}deg) scaleY(0.3)`,
                    opacity: holding ? 0.2 : 0.05,
                  }}
                  style={{ width: '40px', height: '60px', background: 'rgba(0,0,0,0.3)', borderRadius: radius.xs, transformOrigin: 'bottom center', marginTop: '-2px' }}
                />
              </div>
              {/* Ground line */}
              <div style={{ position: 'absolute', bottom: '28px', left: '10%', right: '10%', height: '1px', background: palette.primaryFaint }} />
              {/* Time labels */}
              <div style={{ position: 'absolute', bottom: '8px', left: '10%', ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.2 }}>dawn</div>
              <div style={{ position: 'absolute', bottom: '8px', right: '10%', ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.2 }}>dusk</div>
            </div>
            {/* Light warmth indicator */}
            <div style={{ width: '100%', height: '3px', borderRadius: '2px', overflow: 'hidden', background: palette.primaryFaint }}>
              <motion.div animate={{ width: `${progress * 100}%` }}
                style={{ height: '100%', background: `linear-gradient(90deg, hsla(200, 30%, 50%, 0.4), hsla(40, 60%, 55%, 0.5), hsla(15, 50%, 45%, 0.4))`, borderRadius: '2px' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: holding ? 0.5 : 0.3 }}>
              {completed ? 'the light has passed' : holding ? 'the shadow defines the light...' : 'hold to sculpt with light'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>That exact light will never return.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Light is the painter. You were the canvas. And you noticed.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Transient. Savored. Gone.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}