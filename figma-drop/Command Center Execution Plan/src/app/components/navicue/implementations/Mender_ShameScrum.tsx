/**
 * MENDER #2 — The Shame Scrum
 * "Name it. The power drains the moment you say it out loud."
 * INTERACTION: A fog of unnamed shame. Type the shame, watch
 * it crystallize into a named thing, then watch it shrink.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Exposure', 'believing', 'PartsRollcall');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Mender_ShameScrum({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [shame, setShame] = useState('');
  const [named, setNamed] = useState(false);
  const [shrinkProgress, setShrinkProgress] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleName = () => {
    if (!shame.trim() || named) return;
    setNamed(true);
    // Animate shrink over 3 seconds
    let step = 0;
    const interval = window.setInterval(() => {
      step++;
      setShrinkProgress(step / 20);
      if (step >= 20) {
        clearInterval(interval);
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 1500);
      }
    }, 150);
    timersRef.current.push(interval as any);
  };

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Exposure" kbe="believing" form="PartsRollcall" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            There is something you haven't named.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Name it. The power drains the moment you say it.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>write what carries shame</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%', maxWidth: '300px' }}>
            {/* Fog / named crystal */}
            <div style={{ width: '140px', height: '140px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {!named ? (
                <>
                  {/* Fog particles */}
                  {Array.from({ length: 12 }, (_, i) => (
                    <motion.div key={i}
                      animate={{ x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100, opacity: [0.08, 0.2, 0.08] }}
                      transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
                      style={{ position: 'absolute', width: `${20 + Math.random() * 30}px`, height: `${20 + Math.random() * 30}px`, borderRadius: '50%', background: palette.primaryFaint }}
                    />
                  ))}
                  <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '10px', zIndex: 1, opacity: 0.4 }}>unnamed</div>
                </>
              ) : (
                <motion.div
                  animate={{ scale: 1 - shrinkProgress * 0.7, opacity: 1 - shrinkProgress * 0.6 }}
                  style={{ width: '80px', height: '80px', borderRadius: radius.sm, background: `linear-gradient(135deg, ${palette.primaryGlow}, ${palette.primaryFaint})`, border: `1px solid ${palette.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                  <span style={{ ...navicueType.hint, color: palette.text, fontSize: '10px', textAlign: 'center', wordBreak: 'break-word' }}>
                    {shame}
                  </span>
                </motion.div>
              )}
            </div>
            {/* Input */}
            {!named && (
              <>
                <input
                  type="text"
                  value={shame}
                  onChange={(e) => setShame(e.target.value)}
                  placeholder="Name the shame..."
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${palette.primaryFaint}`, borderRadius: radius.sm, color: palette.text, fontSize: '14px', fontFamily: 'inherit', outline: 'none', textAlign: 'center' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleName()}
                />
                {shame.trim() && (
                  <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleName}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{ padding: '10px 28px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${palette.primaryGlow}`, borderRadius: radius.sm, cursor: 'pointer', ...navicueType.hint, color: palette.text }}>
                    name it
                  </motion.button>
                )}
              </>
            )}
            {named && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1 }}
                style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center' }}>
                Watch it shrink.
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Named things lose their power over you.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The fog was always smaller than it looked.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            You said it. It is smaller now.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}