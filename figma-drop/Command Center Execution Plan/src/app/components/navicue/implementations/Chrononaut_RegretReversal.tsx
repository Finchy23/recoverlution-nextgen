/**
 * CHRONONAUT #7 — The Regret Reversal
 * "Discipline is just remembering what you want."
 * INTERACTION: A fork in the road. Left path: "Easy Now, Hard Later."
 * Right path: "Hard Now, Easy Later." Trace the right path with
 * your finger to choose the future you actually want.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'embodying', 'Key');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PATH_STEPS = [
  'Accept the discomfort.',
  'Do the hard thing today.',
  'Invest in tomorrow\'s ease.',
  'Trust the compound effect.',
  'Arrive without regret.',
];

export default function Chrononaut_RegretReversal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [steps, setSteps] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleStep = (i: number) => {
    if (stage !== 'active' || steps.includes(i) || i !== steps.length) return;
    const next = [...steps, i];
    setSteps(next);
    if (next.length >= PATH_STEPS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="embodying" form="Key" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A fork in the road.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Choose the pain of discipline over the pain of regret.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>trace the harder path</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '300px' }}>
            {/* Fork visualization */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '12px', alignItems: 'flex-start' }}>
              {/* Left path — easy now */}
              <div style={{ textAlign: 'center', opacity: 0.2, flex: 1 }}>
                <div style={{ ...navicueType.hint, color: 'hsla(0, 30%, 50%, 0.5)', fontSize: '11px', marginBottom: '4px' }}>easy now</div>
                <div style={{ width: '2px', height: '40px', background: 'hsla(0, 30%, 40%, 0.2)', margin: '0 auto' }} />
                <div style={{ ...navicueType.hint, color: 'hsla(0, 30%, 50%, 0.4)', fontSize: '11px', marginTop: '4px' }}>hard later</div>
              </div>
              {/* Center divider */}
              <div style={{ width: '1px', height: '60px', background: palette.primaryFaint, opacity: 0.2 }} />
              {/* Right path — hard now */}
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px', marginBottom: '4px', opacity: 0.6 }}>hard now</div>
                <div style={{ width: '2px', height: '40px', background: palette.accent, margin: '0 auto', opacity: 0.3 }} />
                <div style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px', marginTop: '4px', opacity: 0.5 }}>easy later</div>
              </div>
            </div>
            {/* Steps along the right path */}
            {PATH_STEPS.map((s, i) => {
              const isDone = steps.includes(i);
              const isNext = i === steps.length;
              return (
                <motion.button key={i} onClick={() => handleStep(i)}
                  animate={{ opacity: isDone ? 0.7 : isNext ? 0.4 : 0.12 }}
                  whileHover={isNext ? { opacity: 0.6, scale: 1.02 } : undefined}
                  style={{ width: '100%', padding: '14px 14px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.01)', border: `1px solid ${isDone ? palette.accent : isNext ? palette.primaryFaint : 'transparent'}`, borderRadius: radius.sm, cursor: isNext ? 'pointer' : 'default', textAlign: 'left' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: isDone ? palette.accent : palette.primaryFaint, opacity: isDone ? 0.6 : 0.2, boxShadow: isDone ? `0 0 8px ${palette.accentGlow}` : 'none' }} />
                  <span style={{ ...navicueType.texture, color: isDone ? palette.text : palette.textFaint, fontSize: '11px', fontStyle: 'italic' }}>{s}</span>
                </motion.button>
              );
            })}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '4px' }}>{steps.length} of {PATH_STEPS.length} walked</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Hard now. Easy later. No regret.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Discipline is just remembering what you want.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The harder path was the lighter one.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}