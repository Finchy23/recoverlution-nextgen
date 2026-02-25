/**
 * VALUATOR #9 — The Quality Control
 * "Do not ship defective thoughts. Inspect. Reject the junk."
 * ARCHETYPE: Pattern A (Tap) — Conveyor belt of thoughts; swipe to reject/keep
 * ENTRY: Scene-first — conveyor belt rolling
 * STEALTH KBE: Speed rejecting negative self-talk = automated Metacognition (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';
import { VALUATOR_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Circuit');
type Stage = 'arriving' | 'active' | 'inspected' | 'resonant' | 'afterglow';

const THOUGHTS = [
  { text: 'I am stupid', quality: 'reject' },
  { text: 'I am learning', quality: 'keep' },
  { text: 'I always fail', quality: 'reject' },
  { text: 'I am growing', quality: 'keep' },
];

export default function Valuator_QualityControl({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [idx, setIdx] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const rejectTimes = useRef<number[]>([]);
  const itemShown = useRef(0);

  useEffect(() => {
    t(() => { setStage('active'); itemShown.current = Date.now(); }, 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const act = (action: 'reject' | 'keep') => {
    if (stage !== 'active') return;
    const thought = THOUGHTS[idx];
    if (thought.quality === 'reject') {
      rejectTimes.current.push(Date.now() - itemShown.current);
    }
    const next = idx + 1;
    if (next >= THOUGHTS.length) {
      const avgReject = rejectTimes.current.length > 0
        ? rejectTimes.current.reduce((a, b) => a + b, 0) / rejectTimes.current.length : 0;
      console.log(`[KBE:E] QualityControl avgRejectMs=${Math.round(avgReject)} automatedMetacognition=${avgReject < 2000}`);
      setStage('inspected');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    } else {
      setIdx(next);
      itemShown.current = Date.now();
    }
  };

  const current = THOUGHTS[idx];

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {[0, 1, 2].map(i => (
              <motion.div key={i} animate={{ x: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                style={{ width: '30px', height: '20px', borderRadius: radius.xs,
                  background: themeColor(TH.primaryHSL, 0.05, 3),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }} />
            ))}
          </motion.div>
        )}
        {stage === 'active' && current && (
          <motion.div key={`act-${idx}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Inspect. Reject the junk.
            </div>
            <div style={{ padding: '14px 20px', borderRadius: radius.md,
              background: current.quality === 'reject'
                ? 'hsla(0, 20%, 30%, 0.06)' : themeColor(TH.accentHSL, 0.05, 3),
              border: `1px solid ${current.quality === 'reject'
                ? 'hsla(0, 20%, 35%, 0.12)' : themeColor(TH.accentHSL, 0.08, 6)}` }}>
              <span style={{ ...navicueType.texture, color: palette.text, fontStyle: 'italic' }}>"{current.text}"</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => act('reject')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: 'hsla(0, 20%, 30%, 0.06)', border: '1px solid hsla(0, 20%, 35%, 0.12)' }}>
                <div style={{ ...navicueType.choice, color: 'hsla(0, 30%, 40%, 0.5)', fontSize: '11px' }}>Reject</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => act('keep')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12), fontSize: '11px' }}>Keep</div>
              </motion.div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>{THOUGHTS.length - idx} remaining</div>
          </motion.div>
        )}
        {stage === 'inspected' && (
          <motion.div key="in" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Assembly line cleared. Only quality thoughts shipped.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Automated metacognition. The speed at which you reject negative self-talk reveals how internalized your inner supervisor is. Fast rejection means the critic is being silenced reflexively: quality control at the factory level.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Inspected.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}