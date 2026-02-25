/**
 * MYCELIUM #5 — The Signal Pulse (Phatic)
 * "Connection does not require content. It requires signal."
 * INTERACTION: A single firefly flashes in the dark. Tap to flash back.
 * Another firefly answers. Then another. Build a constellation of pure
 * signal — no words, just "I am here."
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('sensory_cinema', 'Somatic Regulation', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const FIREFLIES = [
  { x: 30, y: 25 }, { x: 70, y: 40 }, { x: 20, y: 65 }, { x: 80, y: 20 },
  { x: 50, y: 75 }, { x: 15, y: 45 }, { x: 85, y: 60 },
];

export default function Mycelium_SignalPulse({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [flashes, setFlashes] = useState(0);
  const [lit, setLit] = useState<number[]>([]);
  const [yourFlash, setYourFlash] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const flash = () => {
    if (stage !== 'active' || flashes >= FIREFLIES.length) return;
    setYourFlash(true);
    addTimer(() => setYourFlash(false), 400);
    const nextLit = [...lit, flashes];
    setLit(nextLit);
    const count = flashes + 1;
    setFlashes(count);
    if (count >= FIREFLIES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Darkness. Then a flash.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Connection does not require content. It requires signal.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to flash; don't type words, just signal</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '280px' }}>
            {/* Firefly field */}
            <div onClick={flash}
              style={{ position: 'relative', width: '240px', height: '200px', cursor: 'pointer', borderRadius: radius.lg, overflow: 'hidden', border: `1px solid ${palette.primaryFaint}` }}>
              {/* Your flash — center */}
              <motion.div
                animate={{ opacity: yourFlash ? 0.7 : 0.15, scale: yourFlash ? 1.3 : 1 }}
                transition={{ duration: 0.2 }}
                style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '10px', height: '10px', borderRadius: '50%', background: 'hsla(55, 70%, 65%, 0.7)', boxShadow: yourFlash ? '0 0 20px hsla(55, 70%, 65%, 0.5)' : 'none' }}
              />
              <div style={{ position: 'absolute', left: '50%', top: '58%', transform: 'translateX(-50%)', ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.25 }}>you</div>
              {/* Other fireflies */}
              {FIREFLIES.map((f, i) => {
                const isLit = lit.includes(i);
                return (
                  <motion.div key={i}
                    animate={{
                      opacity: isLit ? [0, 0.6, 0.3, 0.6, 0.3] : 0.03,
                      scale: isLit ? [0.5, 1.2, 1] : 0.5,
                    }}
                    transition={isLit ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
                    style={{ position: 'absolute', left: `${f.x}%`, top: `${f.y}%`, width: '6px', height: '6px', borderRadius: '50%', background: 'hsla(55, 60%, 60%, 0.6)', boxShadow: isLit ? '0 0 12px hsla(55, 60%, 60%, 0.4)' : 'none', transform: 'translate(-50%, -50%)' }}
                  />
                );
              })}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.4 }}>
              {flashes === 0 ? 'tap to flash' : `${flashes} signal${flashes === 1 ? '' : 's'} answered`}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The darkness is full of signals.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Ping the network. "I am here" is enough.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Flash. Answer. Flash.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}