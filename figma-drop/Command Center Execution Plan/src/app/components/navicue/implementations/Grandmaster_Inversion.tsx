/**
 * GRANDMASTER #8 — The Inversion (The Anti-Goal)
 * "It is hard to be smart. It is easy to not be stupid. Invert the problem."
 * ARCHETYPE: Pattern A (Tap) — Flip "Be Happy" card, then select negatives to eliminate
 * ENTRY: Cold open — goal card
 * STEALTH KBE: Identifying negative drivers = Subtraction as Strategy (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GRANDMASTER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'knowing', 'Circuit');
type Stage = 'arriving' | 'goal' | 'inverted' | 'eliminated' | 'resonant' | 'afterglow';
const NEGATIVES = ['Lack of sleep', 'Toxic friends', 'Doomscrolling', 'Self-neglect'];

export default function Grandmaster_Inversion({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [flipped, setFlipped] = useState(false);
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('goal'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const flip = () => {
    if (stage !== 'goal') return;
    setFlipped(true);
    t(() => setStage('inverted'), 800);
  };

  const remove = (idx: number) => {
    if (stage !== 'inverted') return;
    const next = new Set(removed);
    next.add(idx);
    setRemoved(next);
    if (next.size >= NEGATIVES.length) {
      console.log(`[KBE:K] Inversion viaNegativa=true negativesIdentified=${next.size}`);
      setStage('eliminated');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    }
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            style={{ padding: '12px 18px', borderRadius: radius.sm,
              background: themeColor(TH.accentHSL, 0.04, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}` }}>
            <span style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.25, 10) }}>Be Happy</span>
          </motion.div>
        )}
        {stage === 'goal' && (
          <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Invert the problem.
            </div>
            <motion.div whileTap={{ scale: 0.97 }} onClick={flip}
              animate={{ rotateY: flipped ? 180 : 0 }}
              style={{ width: '120px', height: '70px', borderRadius: radius.md, cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.35, 12),
                transform: flipped ? 'rotateY(180deg)' : 'none' }}>
                {flipped ? 'Avoid Misery' : 'Be Happy'}
              </span>
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to flip</div>
          </motion.div>
        )}
        {stage === 'inverted' && (
          <motion.div key="inv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint }}>
              What destroys you? Eliminate it.
            </div>
            {NEGATIVES.map((neg, i) => (
              <motion.div key={i} whileTap={{ scale: 0.95 }}
                onClick={() => remove(i)}
                animate={{ opacity: removed.has(i) ? 0.2 : 1, x: removed.has(i) ? 40 : 0 }}
                style={{ padding: '8px 16px', borderRadius: radius.md, cursor: 'pointer', width: '100%',
                  background: removed.has(i) ? themeColor(TH.primaryHSL, 0.02, 1) : 'hsla(0, 15%, 28%, 0.05)',
                  border: `1px solid ${removed.has(i) ? themeColor(TH.primaryHSL, 0.04, 3) : 'hsla(0, 15%, 35%, 0.1)'}`,
                  textDecoration: removed.has(i) ? 'line-through' : 'none' }}>
                <span style={{ ...navicueType.choice, color: removed.has(i) ? palette.textFaint : 'hsla(0, 25%, 40%, 0.5)', fontSize: '11px' }}>
                  {neg}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
        {stage === 'eliminated' && (
          <motion.div key="el" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              The negatives are gone. What remains is closer to happiness than any pursuit could achieve.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Via negativa. It{"'"}s hard to be smart, but easy not to be stupid. Inversion, solving for what to avoid rather than what to pursue, is the mathematician{"'"}s secret. Subtract the misery and happiness is the remainder.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Inverted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}