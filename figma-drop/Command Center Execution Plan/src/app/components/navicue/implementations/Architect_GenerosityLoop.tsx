/**
 * ARCHITECT #9 -- The Generosity Loop
 * "Get out of your own head by getting into someone else's life."
 * INTERACTION: An arrow pointing outward. Choose one small act
 * of generosity. The arrow curves back into a loop -- giving returns.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Behavioral Activation', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const ACTS = [
  'Send a kind message',
  'Help someone without being asked',
  'Listen to someone fully',
  'Leave something better than you found it',
  'Offer encouragement to a stranger',
];

export default function Architect_GenerosityLoop({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [chosen, setChosen] = useState<number | null>(null);
  const [loopComplete, setLoopComplete] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleChoose = (i: number) => {
    if (stage !== 'active' || loopComplete) return;
    setChosen(i);
    setLoopComplete(true);
    addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Behavioral Activation" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The arrow points outward.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Get out of your own head.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>help someone else right now</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            {/* Arrow / Loop visual */}
            <svg viewBox="0 0 100 60" style={{ width: '200px', height: '120px' }}>
              {!loopComplete ? (
                <motion.path d="M 20,30 L 80,30" fill="none" stroke={palette.primary} strokeWidth="1" opacity={0.5} markerEnd="url(#arrow)" />
              ) : (
                <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                  d="M 20,30 Q 80,5 80,30 Q 80,55 20,30" fill="none" stroke={palette.accent} strokeWidth="1" opacity={0.6} />
              )}
              <defs>
                <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M 0,0 L 6,3 L 0,6" fill="none" stroke={palette.primary} strokeWidth="0.5" />
                </marker>
              </defs>
            </svg>
            {/* Choices */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '300px', width: '100%', padding: '0 24px' }}>
              {ACTS.map((act, i) => (
                <motion.button key={i} onClick={() => handleChoose(i)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  animate={{ opacity: loopComplete && chosen !== i ? 0.15 : 1 }}
                  style={{ padding: '14px 16px', background: chosen === i ? palette.primaryFaint : 'rgba(255,255,255,0.02)', border: `1px solid ${chosen === i ? palette.primaryGlow : palette.primaryFaint}`, borderRadius: radius.sm, cursor: loopComplete ? 'default' : 'pointer', textAlign: 'left', ...navicueType.hint, color: chosen === i ? palette.accent : palette.text, fontSize: '13px' }}>
                  {act}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The arrow came back.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Service is the ultimate regulator.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            What you gave, you kept.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}