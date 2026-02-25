/**
 * MYCELIUM #8 — The Common Ground
 * "You and your enemy stand on the same earth."
 * INTERACTION: Two islands separated by water. Tap to lower the water
 * level — gradually revealing the land bridge beneath. They were always
 * connected. Focus on the earth, not the ocean between you.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart(
  'koan_paradox',
  'Metacognition',
  'embodying',
  'Hearth'
);
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Mycelium_CommonGround({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [waterLevel, setWaterLevel] = useState(1); // 1 = full, 0 = drained
  const [draining, setDraining] = useState(false);
  const [completed, setCompleted] = useState(false);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const startDrain = () => {
    if (draining || stage !== 'active') return;
    setDraining(true);
    let level = waterLevel;
    const tick = () => {
      level -= 0.008;
      if (level <= 0) {
        level = 0;
        setWaterLevel(0);
        setCompleted(true);
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
        return;
      }
      setWaterLevel(level);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const waterHeight = waterLevel * 55;
  const bridgeVisible = 1 - waterLevel;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Two islands. One ocean.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Focus on the earth, not the ocean between you.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to lower the water</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={startDrain}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '280px', cursor: draining ? 'default' : 'pointer' }}>
            {/* Island scene */}
            <div style={{ position: 'relative', width: '240px', height: '140px', borderRadius: radius.md, overflow: 'hidden', border: `1px solid ${palette.primaryFaint}` }}>
              {/* Sky */}
              <div style={{ position: 'absolute', inset: 0, background: 'hsla(220, 15%, 12%, 0.3)' }} />
              {/* Left island */}
              <div style={{ position: 'absolute', bottom: '40px', left: '10px', width: '60px', height: '50px', background: 'hsla(120, 20%, 30%, 0.4)', borderRadius: `${radius['3xl']} ${radius['3xl']} 0 0` }} />
              {/* Right island */}
              <div style={{ position: 'absolute', bottom: '40px', right: '10px', width: '60px', height: '45px', background: 'hsla(120, 20%, 30%, 0.4)', borderRadius: `${radius['3xl']} ${radius['3xl']} 0 0` }} />
              {/* Land bridge (revealed as water drains) */}
              <motion.div
                animate={{ opacity: bridgeVisible * 0.7 }}
                style={{ position: 'absolute', bottom: '20px', left: '40px', right: '40px', height: '25px', background: 'hsla(30, 25%, 30%, 0.4)', borderRadius: radius.xs, boxShadow: bridgeVisible > 0.8 ? `0 0 12px ${palette.accentGlow}` : 'none' }} />
              {/* Water */}
              <motion.div
                animate={{ height: `${waterHeight}px` }}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'hsla(210, 40%, 35%, 0.3)', borderTop: `1px solid hsla(210, 40%, 45%, 0.15)` }} />
              {/* Labels */}
              <div style={{ position: 'absolute', top: '8px', left: '25px', ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.3 }}>you</div>
              <div style={{ position: 'absolute', top: '8px', right: '25px', ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.3 }}>them</div>
              {/* Bridge label */}
              {bridgeVisible > 0.6 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                  style={{ position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)', ...navicueType.hint, color: palette.accent, fontSize: '11px', whiteSpace: 'nowrap' }}>
                  common ground
                </motion.div>
              )}
            </div>
            {/* Water level indicator */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.3 }}>ocean</div>
              <div style={{ flex: 1, height: '3px', background: palette.primaryFaint, borderRadius: '2px', overflow: 'hidden' }}>
                <motion.div animate={{ width: `${(1 - waterLevel) * 100}%` }} style={{ height: '100%', background: palette.accent, borderRadius: '2px', opacity: 0.4 }} />
              </div>
              <div style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px', opacity: 0.3 }}>earth</div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: draining ? 0.5 : 0.3 }}>
              {completed ? 'the same earth' : draining ? 'draining...' : 'tap to lower the water'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>They were always connected.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The same earth. The ocean was the illusion.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Common ground. Always there.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}