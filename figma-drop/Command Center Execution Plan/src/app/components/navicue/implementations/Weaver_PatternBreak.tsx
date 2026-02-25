/**
 * WEAVER #4 — The Pattern Break
 * "Not every pattern serves you."
 * INTERACTION: A repeating visual rhythm of dots. One pattern
 * is subtly different — find it and tap to break the cycle.
 * Repeat for deeper patterns.
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('pattern_glitch', 'Metacognition', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ROUNDS = [
  { label: 'The pattern you repeat without thinking.', breakIdx: 3 },
  { label: 'The cycle you inherited.', breakIdx: 7 },
  { label: 'The loop you chose to leave.', breakIdx: 5 },
];

export default function Weaver_PatternBreak({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [round, setRound] = useState(0);
  const [broken, setBroken] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  const dots = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleTap = (i: number) => {
    if (stage !== 'active' || broken) return;
    if (i === ROUNDS[round].breakIdx) {
      setBroken(true);
      addTimer(() => {
        if (round + 1 < ROUNDS.length) {
          setRound(round + 1);
          setBroken(false);
          setAttempts(0);
        } else {
          setStage('resonant');
          addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000);
        }
      }, 1800);
    } else {
      setAttempts(attempts + 1);
    }
  };

  const breakIdx = ROUNDS[round].breakIdx;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Repeating. Repeating.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Not every pattern serves you.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>find the one that doesn't belong</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '20px' }}>
              {dots.map(i => {
                const isBreak = i === breakIdx;
                const isBroken = broken && isBreak;
                return (
                  <motion.button key={`${round}-${i}`} onClick={() => handleTap(i)}
                    animate={{
                      opacity: isBroken ? 0.1 : isBreak ? 0.35 : 0.2,
                      scale: isBroken ? 0.3 : 1,
                      borderRadius: isBreak && !isBroken ? '30%' : '50%',
                    }}
                    whileHover={{ opacity: 0.5, scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    style={{ width: '32px', height: '32px', background: isBroken ? palette.accent : palette.primaryFaint, border: 'none', cursor: broken ? 'default' : 'pointer', borderRadius: '50%' }} />
                );
              })}
            </div>
            <motion.div key={round} initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
              style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '11px', fontStyle: 'italic', textAlign: 'center' }}>
              {broken ? ROUNDS[round].label : `round ${round + 1} of ${ROUNDS.length}`}
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You can see the pattern now.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>And what you can see, you can change.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Break the loop. Begin again.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}