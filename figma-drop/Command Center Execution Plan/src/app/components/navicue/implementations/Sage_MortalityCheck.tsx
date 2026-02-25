/**
 * SAGE #6 — The Mortality Check
 * "You have approximately 4,000 weeks. How many have you spent?"
 * INTERACTION: A grid of 4,000 tiny dots. Past weeks grey out.
 * Remaining weeks glow. The finite makes the present infinite.
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'knowing', 'Probe');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const TOTAL_WEEKS = 4000;
const COLS = 80;

export default function Sage_MortalityCheck({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [age, setAge] = useState(30);
  const [revealed, setRevealed] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const weeksLived = age * 52;
  const weeksLeft = Math.max(0, TOTAL_WEEKS - weeksLived);
  const rows = Math.ceil(TOTAL_WEEKS / COLS);

  const handleReveal = () => {
    if (revealed) return;
    setRevealed(true);
    addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 4000);
  };

  // Only render a sampled grid for performance (every 10th week = 400 dots)
  const SAMPLE = 10;
  const dots = useMemo(() => {
    const arr = [];
    for (let i = 0; i < TOTAL_WEEKS; i += SAMPLE) {
      arr.push(i);
    }
    return arr;
  }, []);

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="knowing" form="Probe" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            4,000 weeks.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>How many have you spent?</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>set your age and look</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {/* Age slider */}
            {!revealed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '12px' }}>age</span>
                <input type="range" min={15} max={85} value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  style={{ width: '140px', accentColor: palette.primary }} />
                <span style={{ ...navicueType.texture, color: palette.text, fontSize: '16px', width: '28px' }}>{age}</span>
              </div>
            )}
            {/* Dot grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', width: `${(COLS / SAMPLE) * 5}px`, gap: '1px', justifyContent: 'center' }}>
              {dots.map((week) => {
                const isLived = week < weeksLived;
                return (
                  <motion.div key={week}
                    animate={revealed ? { opacity: isLived ? 0.15 : 0.5 } : { opacity: 0.2 }}
                    transition={{ duration: 0.8, delay: revealed ? (week / TOTAL_WEEKS) * 1.5 : 0 }}
                    style={{ width: '3px', height: '3px', borderRadius: '50%', background: revealed ? (isLived ? palette.textFaint : palette.accent) : palette.primaryFaint }}
                  />
                );
              })}
            </div>
            {!revealed ? (
              <motion.button onClick={handleReveal} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${palette.primaryGlow}`, borderRadius: radius.sm, cursor: 'pointer', ...navicueType.hint, color: palette.text }}>
                show me
              </motion.button>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2 }}
                style={{ ...navicueType.texture, color: palette.text, textAlign: 'center' }}>
                {weeksLeft.toLocaleString()} weeks remain.
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The finite makes the present infinite.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>This week counts. This one.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            4,000 weeks. Spend this one awake.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}