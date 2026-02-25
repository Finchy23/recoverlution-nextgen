/**
 * WEAVER #3 — The Contradiction Hold
 * "Hold two truths at once. Neither cancels the other."
 * INTERACTION: Two opposing truths appear on either side. Tap both
 * simultaneously (or in sequence) to hold them together. The screen
 * settles when you stop choosing between them.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PAIRS = [
  { a: 'I am strong.', b: 'I am afraid.', union: 'Courage is fear that has said its prayers.' },
  { a: 'I need people.', b: 'I need solitude.', union: 'Belonging starts with being whole alone.' },
  { a: 'I am enough.', b: 'I want to grow.', union: 'Growth doesn\'t come from lack.' },
];

export default function Weaver_ContradictionHold({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [pairIdx, setPairIdx] = useState(0);
  const [held, setHeld] = useState<Set<'a' | 'b'>>(new Set());
  const [unions, setUnions] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleHold = (side: 'a' | 'b') => {
    if (stage !== 'active') return;
    const next = new Set(held);
    next.add(side);
    setHeld(next);
    if (next.has('a') && next.has('b')) {
      const nextUnions = unions + 1;
      setUnions(nextUnions);
      addTimer(() => {
        if (pairIdx + 1 < PAIRS.length) {
          setPairIdx(pairIdx + 1);
          setHeld(new Set());
        } else {
          setStage('resonant');
          addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000);
        }
      }, 2000);
    }
  };

  const pair = PAIRS[pairIdx];
  const bothHeld = held.has('a') && held.has('b');

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Two truths. One you.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Hold two truths at once.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap both sides to hold them together</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <motion.button onClick={() => handleHold('a')}
                animate={{ opacity: held.has('a') ? 0.8 : 0.3, scale: held.has('a') ? 1.05 : 1 }}
                whileHover={{ opacity: 0.6 }}
                style={{ width: '130px', padding: '20px 12px', background: held.has('a') ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)', border: `1px solid ${held.has('a') ? palette.accent : palette.primaryFaint}`, borderRadius: radius.md, cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ ...navicueType.texture, color: palette.text, fontSize: '12px', fontStyle: 'italic' }}>{pair.a}</div>
              </motion.button>
              <motion.div animate={{ opacity: bothHeld ? 0.6 : 0.15 }}
                style={{ ...navicueType.hint, color: palette.accent, fontSize: '16px' }}>+</motion.div>
              <motion.button onClick={() => handleHold('b')}
                animate={{ opacity: held.has('b') ? 0.8 : 0.3, scale: held.has('b') ? 1.05 : 1 }}
                whileHover={{ opacity: 0.6 }}
                style={{ width: '130px', padding: '20px 12px', background: held.has('b') ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)', border: `1px solid ${held.has('b') ? palette.accent : palette.primaryFaint}`, borderRadius: radius.md, cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ ...navicueType.texture, color: palette.text, fontSize: '12px', fontStyle: 'italic' }}>{pair.b}</div>
              </motion.button>
            </div>
            {bothHeld && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.6, y: 0 }} transition={{ duration: 1.2 }}
                style={{ ...navicueType.texture, color: palette.accent, fontSize: '12px', textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
                {pair.union}
              </motion.div>
            )}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{pairIdx + 1} of {PAIRS.length}</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Neither cancels the other.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>You are large enough to contain contradictions.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Both. Always both.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}