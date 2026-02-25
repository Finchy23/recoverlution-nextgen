/**
 * HACKER #7 — The Attention Paywall
 * "Your attention is your only currency."
 * INTERACTION: Thoughts appear with energy costs. For each one,
 * decide: Buy or Skip. See your energy budget deplete or stay full.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'embodying', 'Circuit');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const THOUGHTS = [
  { thought: 'Replaying that argument from 2019.', cost: 80 },
  { thought: 'Worrying about something you can\'t control.', cost: 60 },
  { thought: 'Comparing yourself to a stranger online.', cost: 40 },
  { thought: 'Planning what to say if they text back.', cost: 50 },
  { thought: 'Imagining the worst possible outcome.', cost: 70 },
];

export default function Hacker_AttentionPaywall({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [decisions, setDecisions] = useState<Record<number, 'buy' | 'skip'>>({});
  const [energy, setEnergy] = useState(100);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleDecide = (i: number, choice: 'buy' | 'skip') => {
    if (stage !== 'active' || decisions[i]) return;
    const next = { ...decisions, [i]: choice };
    setDecisions(next);
    if (choice === 'buy') {
      setEnergy(prev => Math.max(0, prev - THOUGHTS[i].cost));
    }
    if (Object.keys(next).length >= THOUGHTS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const decidedCount = Object.keys(decisions).length;
  const currentIdx = decidedCount < THOUGHTS.length ? decidedCount : -1;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="embodying" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Everything costs something.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Your attention is your only currency.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>buy or skip each thought</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '300px' }}>
            {/* Energy bar */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.4 }}>energy</span>
              <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: palette.primaryFaint, overflow: 'hidden' }}>
                <motion.div animate={{ width: `${energy}%` }} transition={{ duration: 0.6 }}
                  style={{ height: '100%', background: energy > 50 ? palette.accent : 'hsla(0, 50%, 50%, 0.6)', borderRadius: '2px' }} />
              </div>
              <span style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', fontFamily: 'monospace', opacity: 0.4, width: '28px', textAlign: 'right' }}>{energy}%</span>
            </div>
            {/* Current thought */}
            {currentIdx >= 0 && (
              <motion.div key={currentIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', padding: '20px 16px', border: `1px solid ${palette.primaryFaint}`, borderRadius: radius.md, textAlign: 'center' }}>
                <div style={{ ...navicueType.texture, color: palette.text, fontSize: '12px', fontStyle: 'italic', marginBottom: '8px' }}>
                  {THOUGHTS[currentIdx].thought}
                </div>
                <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', fontFamily: 'monospace', marginBottom: '16px', opacity: 0.4 }}>
                  costs {THOUGHTS[currentIdx].cost}% energy
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <motion.button onClick={() => handleDecide(currentIdx, 'skip')}
                    whileHover={{ scale: 1.05 }}
                    style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${palette.accent}`, borderRadius: radius.sm, cursor: 'pointer', ...navicueType.hint, color: palette.accent, fontSize: '11px' }}>
                    skip
                  </motion.button>
                  <motion.button onClick={() => handleDecide(currentIdx, 'buy')}
                    whileHover={{ scale: 1.05 }}
                    style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${palette.primaryFaint}`, borderRadius: radius.sm, cursor: 'pointer', ...navicueType.hint, color: palette.textFaint, fontSize: '11px' }}>
                    buy
                  </motion.button>
                </div>
              </motion.div>
            )}
            {/* Past decisions */}
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
              {THOUGHTS.map((_, i) => (
                <motion.div key={i} animate={{ opacity: decisions[i] ? 0.6 : 0.1 }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', background: decisions[i] === 'skip' ? palette.accent : decisions[i] === 'buy' ? 'hsla(0, 40%, 50%, 0.5)' : palette.primaryFaint }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You have {energy}% energy remaining.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Spend it on what you actually want to buy.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Guard the currency.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}