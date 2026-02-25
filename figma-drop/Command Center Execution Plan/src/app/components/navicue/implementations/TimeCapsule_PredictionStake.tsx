/**
 * TIME CAPSULE #4 — The Prediction Stake
 * "Lock in your prediction. We will audit the catastrophe."
 * ARCHETYPE: Pattern D (Type) — Type your catastrophic prediction
 * ENTRY: Reverse Reveal — "You survived." appears first, then the bet
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TIMECAPSULE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Practice');
type Stage = 'reveal' | 'active' | 'resonant' | 'afterglow';

export default function TimeCapsule_PredictionStake({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('reveal');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    minLength: 10,
    onAccept: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 3000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'reveal' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }}
              style={{ ...navicueType.prompt, color: palette.text, fontSize: '18px', fontFamily: 'serif' }}>
              You survived.
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>
              but you didn{'\u2019'}t believe you would
            </motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              You think this disaster will ruin you? Bet on it. Write down exactly what you think will happen. Lock it in. When the date comes, we{'\u2019'}ll audit the catastrophe.
            </div>
            <div style={{
              width: '240px', padding: '12px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.05, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}`,
            }}>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, opacity: 0.4, marginBottom: '8px' }}>
                PREDICTION STAKE
              </div>
              <textarea
                value={typeInt.value}
                onChange={e => typeInt.onChange(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); typeInt.submit(); } }}
                placeholder=""
                rows={3}
                style={{
                  width: '100%', padding: '8px', borderRadius: radius.xs, resize: 'none',
                  background: themeColor(TH.primaryHSL, 0.03, 2),
                  border: 'none', color: palette.text, fontFamily: 'inherit', fontSize: '13px',
                  outline: 'none',
                }} />
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Locked in. The brain predicts catastrophe with certainty, but keeps no receipts. This is the receipt. When the date arrives, you{'\u2019'}ll see the gap between the nightmare you imagined and the Tuesday you actually lived.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>On the record.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}