/**
 * CHRONONAUT #4 — The Future Visitor
 * "The future you is already real. Borrow their wisdom."
 * INTERACTION: A silhouette stands in a doorway of light —
 * you, 10 years from now. Answer their question about whether
 * this current moment truly matters from the vantage of the future.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Values Clarification', 'believing', 'Mirror');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const QUESTIONS = [
  'Does this moment matter?',
  'Will you remember this worry?',
  'What would you tell yourself now?',
];

export default function Chrononaut_FutureVisitor({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [doorOpen, setDoorOpen] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => {
      setStage('active');
      addTimer(() => setDoorOpen(true), 800);
    }, 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleAnswer = (answer: string) => {
    if (stage !== 'active') return;
    const next = [...answers, answer];
    setAnswers(next);
    if (qIdx < QUESTIONS.length - 1) {
      setQIdx(prev => prev + 1);
    } else {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const yesNo = qIdx === 0 ? ['Not really', 'Yes, it does'] : qIdx === 1 ? ['Probably not', 'Maybe'] : ['Let it go', 'Keep going'];

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Values Clarification" kbe="believing" form="Mirror" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Someone is waiting.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The future you is already real.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>borrow their wisdom</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '280px' }}>
            {/* Doorway with silhouette */}
            <div style={{ width: '100px', height: '160px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Door frame */}
              <motion.div animate={{ opacity: doorOpen ? 0.8 : 0.15 }}
                style={{ position: 'absolute', inset: 0, borderRadius: `${radius.full} ${radius.full} 0 0`, background: `radial-gradient(ellipse at center, hsla(45, 40%, 70%, ${doorOpen ? 0.15 : 0.03}), transparent)`, border: `1px solid ${doorOpen ? 'hsla(45, 30%, 55%, 0.3)' : palette.primaryFaint}` }} />
              {/* Silhouette */}
              <motion.div animate={{ opacity: doorOpen ? 0.5 : 0.1, scale: doorOpen ? 1 : 0.85 }}
                transition={{ duration: 1.5 }}
                style={{ width: '24px', height: '70px', borderRadius: `${radius.md} ${radius.md} ${radius.xs} ${radius.xs}`, background: doorOpen ? palette.accent : palette.primaryFaint, position: 'relative', top: '20px' }}>
                {/* Head */}
                <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', width: '18px', height: '18px', borderRadius: '50%', background: 'inherit' }} />
              </motion.div>
              {/* Light rays */}
              {doorOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }}
                  style={{ position: 'absolute', inset: '-20px', background: `radial-gradient(ellipse at center, hsla(45, 50%, 70%, 0.2), transparent 70%)`, pointerEvents: 'none' }} />
              )}
            </div>
            {/* Label */}
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.4, fontStyle: 'italic' }}>you, 10 years from now</div>
            {/* Question */}
            {qIdx < QUESTIONS.length && (
              <motion.div key={qIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
                <div style={{ ...navicueType.texture, color: palette.text, fontSize: '13px', fontStyle: 'italic' }}>
                  "{QUESTIONS[qIdx]}"
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {yesNo.map((label, i) => (
                    <motion.button key={label} onClick={() => handleAnswer(label)}
                      whileHover={{ scale: 1.05 }}
                      style={{ padding: '12px 18px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${i === 0 ? palette.primaryFaint : palette.accent}`, borderRadius: radius.sm, cursor: 'pointer', ...navicueType.hint, color: i === 0 ? palette.textFaint : palette.accent, fontSize: '11px', opacity: i === 0 ? 0.5 : 0.7 }}>
                      {label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Time is a persistent illusion. The future you is already real.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Borrow their calm. They made it.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            They're smiling at you.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}