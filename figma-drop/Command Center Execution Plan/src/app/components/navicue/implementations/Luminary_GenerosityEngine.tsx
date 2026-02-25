/**
 * LUMINARY #7 — The Generosity Engine
 * "Give without attachment. Receive without guilt."
 * INTERACTION: An engine that cycles between giving and receiving.
 * Tap to alternate — each cycle builds momentum.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('pattern_glitch', 'Behavioral Activation', 'embodying', 'Key');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const CYCLES = [
  { mode: 'give', text: 'Give your attention fully.' },
  { mode: 'receive', text: 'Accept the compliment.' },
  { mode: 'give', text: 'Share what you know.' },
  { mode: 'receive', text: 'Let someone help you.' },
  { mode: 'give', text: 'Offer your presence.' },
  { mode: 'receive', text: 'Rest without guilt.' },
];

export default function Luminary_GenerosityEngine({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [cycleIdx, setCycleIdx] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleCycle = () => {
    if (stage !== 'active') return;
    const next = cycleIdx + 1;
    if (next < CYCLES.length) {
      setCycleIdx(next);
    } else {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const cycle = CYCLES[cycleIdx];
  const isGive = cycle.mode === 'give';
  const rotation = cycleIdx * 60;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Behavioral Activation" kbe="embodying" form="Key" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Give. Receive. Repeat.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Give without attachment. Receive without guilt.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to cycle the engine</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleCycle}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', cursor: 'pointer' }}>
            {/* Engine visualization */}
            <div style={{ width: '160px', height: '160px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div
                animate={{ rotate: rotation }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '80%', height: '80%', borderRadius: '50%', border: `1.5px solid ${palette.primaryFaint}`, position: 'absolute', borderTopColor: palette.accent }} />
              <motion.div
                animate={{ rotate: -rotation * 0.7 }}
                transition={{ duration: 0.8 }}
                style={{ width: '50%', height: '50%', borderRadius: '50%', border: `1px solid ${palette.primaryFaint}`, position: 'absolute', borderBottomColor: palette.accent, opacity: 0.5 }} />
              <motion.div animate={{ scale: isGive ? 0.8 : 1.2, opacity: 0.6 }}
                style={{ width: '12px', height: '12px', borderRadius: '50%', background: palette.accent, boxShadow: `0 0 12px ${palette.accentGlow}` }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', opacity: 0.6 }}>
                {isGive ? 'give' : 'receive'}
              </div>
              <motion.div key={cycleIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.6, y: 0 }}
                style={{ ...navicueType.texture, color: palette.text, fontSize: '12px', fontStyle: 'italic' }}>
                {cycle.text}
              </motion.div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{cycleIdx + 1} of {CYCLES.length}</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The engine runs on both.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Generosity is a cycle, not a direction.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Keep the engine turning.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}