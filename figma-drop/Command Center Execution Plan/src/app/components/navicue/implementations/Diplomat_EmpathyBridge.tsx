/**
 * DIPLOMAT #7 — The Empathy Bridge
 * "Cross to their side. Not to stay. To understand."
 * INTERACTION: A bridge with stepping stones. Each step reveals a
 * piece of someone else's experience. Walk across, then walk back.
 * You return changed but still yourself.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('science_x_soul', 'Connection', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const STEPS = [
  { label: 'They woke up afraid today.' },
  { label: 'They carry a story you don\'t know.' },
  { label: 'They learned love differently than you.' },
  { label: 'They are doing their best with what they have.' },
  { label: 'They want to be understood, too.' },
];

export default function Diplomat_EmpathyBridge({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [stepIdx, setStepIdx] = useState(-1);
  const [returning, setReturning] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleStep = () => {
    if (stage !== 'active') return;
    if (!returning) {
      const next = stepIdx + 1;
      if (next < STEPS.length) {
        setStepIdx(next);
      }
      if (next >= STEPS.length - 1) {
        // Start return journey
        addTimer(() => setReturning(true), 1500);
      }
    } else {
      // returning
      const next = stepIdx - 1;
      if (next >= 0) {
        setStepIdx(next);
      } else {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
      }
    }
  };

  const progress = returning ? STEPS.length - stepIdx : stepIdx + 1;
  const total = STEPS.length;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Connection" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A bridge connects two shores.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Cross to their side. Not to stay.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to take each step</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleStep}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', cursor: 'pointer' }}>
            {/* Bridge visualization */}
            <div style={{ width: '280px', height: '60px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              {/* Bridge rail */}
              <div style={{ position: 'absolute', left: '10%', right: '10%', top: '50%', height: '1px', background: palette.primaryFaint, opacity: 0.2 }} />
              {/* Stepping stones */}
              {STEPS.map((_, i) => {
                const x = 10 + (i / (STEPS.length - 1)) * 80;
                const isActive = i === stepIdx;
                const isPassed = i < stepIdx;
                return (
                  <motion.div key={i}
                    animate={{ opacity: isActive ? 1 : isPassed ? 0.4 : 0.15, scale: isActive ? 1.3 : 1 }}
                    style={{ position: 'absolute', left: `${x}%`, top: '50%', transform: 'translate(-50%, -50%)', width: '10px', height: '10px', borderRadius: '50%', background: isActive ? palette.accent : palette.primaryFaint, boxShadow: isActive ? `0 0 12px ${palette.accentGlow}` : 'none' }} />
                );
              })}
              {/* Shore labels */}
              <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.3 }}>you</div>
              <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.3 }}>them</div>
            </div>
            {/* Step revelation */}
            {stepIdx >= 0 && (
              <motion.div key={`step-${stepIdx}-${returning}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.6, y: 0 }}
                style={{ ...navicueType.texture, color: palette.text, textAlign: 'center', maxWidth: '250px', fontSize: '13px', fontStyle: 'italic' }}>
                {returning ? 'You carry this understanding back.' : STEPS[stepIdx].label}
              </motion.div>
            )}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {returning ? 'returning home...' : `step ${stepIdx + 2} of ${total}`}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You returned. Changed but still yourself.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Empathy is a round trip.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The bridge stays. Walk it anytime.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}