/**
 * CHRONONAUT #5 — The Patience Muscle
 * "Waiting is not empty time. It is gestation."
 * INTERACTION: A heavy digital flywheel. Hold your thumb on it to keep
 * it spinning slowly. Release and it stops. Build up rotations
 * through patient, sustained presence. Inhibitory control training.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('koan_paradox', 'Somatic Regulation', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const HOLD_TARGET = 8000; // 8 seconds

export default function Chrononaut_PatienceMuscle({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [holding, setHolding] = useState(false);
  const [totalHeld, setTotalHeld] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [completed, setCompleted] = useState(false);
  const holdStartRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const tick = () => {
    const now = Date.now();
    const elapsed = now - holdStartRef.current;
    const newTotal = Math.min(HOLD_TARGET, totalHeld + elapsed);
    setTotalHeld(newTotal);
    setRotation(prev => prev + 0.8);
    holdStartRef.current = now;
    if (newTotal >= HOLD_TARGET && !completed) {
      setCompleted(true);
      setHolding(false);
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  const handleDown = () => {
    if (stage !== 'active' || completed) return;
    setHolding(true);
    holdStartRef.current = Date.now();
    rafRef.current = requestAnimationFrame(tick);
  };
  const handleUp = () => {
    setHolding(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const pct = Math.min(100, (totalHeld / HOLD_TARGET) * 100);
  const wheelSize = 120;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Somatic Regulation" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something heavy waits.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Waiting is not empty time. It is gestation.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>hold the wheel and let the seed grow in the dark</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onPointerDown={handleDown} onPointerUp={handleUp} onPointerLeave={handleUp}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: completed ? 'default' : 'pointer', userSelect: 'none', touchAction: 'none' }}>
            {/* Flywheel */}
            <div style={{ position: 'relative', width: `${wheelSize}px`, height: `${wheelSize}px` }}>
              <motion.div
                animate={{ rotate: rotation }}
                transition={{ duration: 0.05 }}
                style={{ width: '100%', height: '100%', borderRadius: '50%', border: `2px solid ${holding ? palette.accent : palette.primaryFaint}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: holding ? `0 0 24px ${palette.accentGlow}` : 'none' }}>
                {/* Spokes */}
                {[0, 60, 120].map(deg => (
                  <div key={deg} style={{ position: 'absolute', width: '2px', height: '45%', background: holding ? palette.accent : palette.primaryFaint, opacity: holding ? 0.4 : 0.15, transform: `rotate(${deg}deg)`, transformOrigin: '50% 100%', top: '5%', left: 'calc(50% - 1px)' }} />
                ))}
                {/* Center */}
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: holding ? palette.accent : palette.primaryFaint, opacity: holding ? 0.6 : 0.2 }} />
              </motion.div>
              {/* Progress ring */}
              <svg style={{ position: 'absolute', inset: '-4px', width: `${wheelSize + 8}px`, height: `${wheelSize + 8}px`, transform: 'rotate(-90deg)' }}>
                <circle cx={(wheelSize + 8) / 2} cy={(wheelSize + 8) / 2} r={(wheelSize + 4) / 2}
                  fill="none" stroke={palette.accent} strokeWidth="1.5" strokeLinecap="round"
                  strokeDasharray={Math.PI * (wheelSize + 4)} strokeDashoffset={Math.PI * (wheelSize + 4) * (1 - pct / 100)} opacity={0.4} />
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', fontFamily: 'monospace', opacity: 0.4 }}>
                {(totalHeld / 1000).toFixed(1)}s / {HOLD_TARGET / 1000}s
              </div>
              <motion.div animate={{ opacity: holding ? 0.7 : 0.3 }}
                style={{ ...navicueType.hint, color: holding ? palette.accent : palette.textFaint, fontSize: '11px', marginTop: '4px' }}>
                {completed ? 'patient' : holding ? 'holding the tension...' : 'hold to spin'}
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The wheel turns. You held the tension.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Let the seed grow in the dark.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Patience. Gestation. Growth.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}