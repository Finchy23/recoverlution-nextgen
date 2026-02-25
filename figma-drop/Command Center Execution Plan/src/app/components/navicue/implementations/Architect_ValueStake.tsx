/**
 * ARCHITECT #7 -- The Value Stake
 * "The wind blows everything else away. What remains fixed? That is you."
 * INTERACTION: Drive a stake into the ground. Choose a value.
 * Feel the impact. The stake holds. You hold.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Values Clarification', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const VALUES = ['Integrity', 'Courage', 'Patience', 'Honesty', 'Kindness', 'Presence'];

export default function Architect_ValueStake({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [chosen, setChosen] = useState<string | null>(null);
  const [staked, setStaked] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleChoose = (v: string) => {
    if (stage !== 'active' || staked) return;
    setChosen(v);
  };

  const handleStake = () => {
    if (!chosen || staked) return;
    setStaked(true);
    addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Values Clarification" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The wind blows everything away.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>What remains fixed? That is you.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>choose a value and drive the stake</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', padding: '0 24px' }}>
            {/* Value choices */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', maxWidth: '320px' }}>
              {VALUES.map(v => (
                <motion.button key={v} onClick={() => handleChoose(v)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  style={{ padding: '8px 18px', background: chosen === v ? palette.primaryFaint : 'rgba(255,255,255,0.02)', border: `1px solid ${chosen === v ? palette.primary : palette.primaryFaint}`, borderRadius: radius.full, cursor: staked ? 'default' : 'pointer', ...navicueType.choice, color: chosen === v ? palette.accent : palette.text, fontSize: '14px', opacity: staked && chosen !== v ? 0.2 : 1, transition: 'opacity 0.5s' }}>
                  {v}
                </motion.button>
              ))}
            </div>
            {/* Stake visual */}
            {chosen && !staked && (
              <motion.button onClick={handleStake} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{ padding: '14px 36px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${palette.primaryGlow}`, borderRadius: radius.sm, cursor: 'pointer', ...navicueType.choice, color: palette.text }}>
                Drive the stake
              </motion.button>
            )}
            {staked && (
              <motion.div initial={{ opacity: 0, y: -30, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', damping: 12 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '4px', height: '60px', background: `linear-gradient(180deg, ${palette.accent}, ${palette.primaryGlow})`, borderRadius: '2px' }} />
                <div style={{ ...navicueType.texture, color: palette.accent }}>{chosen}</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>I stand for {chosen} today.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The stake holds.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            What remains when the wind stops.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}