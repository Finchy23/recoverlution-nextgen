/**
 * FUTURE WEAVER #5 — The Branch Pruner
 * "Prune the possibilities to feed the probability."
 * ARCHETYPE: Pattern A (Tap) — Prune dead branches from a tree
 * ENTRY: Scene-first — overgrown tree
 * STEALTH KBE: Willingness to kill options = Essentialism / Focus (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { FUTUREWEAVER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'overgrown' | 'pruned' | 'resonant' | 'afterglow';

const BRANCHES = [
  { label: 'Distraction A', dead: true },
  { label: 'Core Work', dead: false },
  { label: 'Distraction B', dead: true },
  { label: 'True Passion', dead: false },
  { label: 'Busy Work', dead: true },
];

export default function FutureWeaver_BranchPruner({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [pruned, setPruned] = useState<Set<number>>(new Set());
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('overgrown'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const prune = (idx: number) => {
    if (stage !== 'overgrown' || !BRANCHES[idx].dead) return;
    const next = new Set(pruned);
    next.add(idx);
    setPruned(next);
    const deadCount = BRANCHES.filter(b => b.dead).length;
    if (next.size >= deadCount) {
      console.log(`[KBE:B] BranchPruner essentialism=confirmed focus=true pruned=${next.size}`);
      setStage('pruned');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    }
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '4px', height: '30px', borderRadius: '2px', background: themeColor(TH.primaryHSL, 0.06, 3) }} />
        )}
        {stage === 'overgrown' && (
          <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Too many branches. The tree is weak. Prune the dead wood.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              {BRANCHES.map((b, idx) => (
                <motion.div key={idx} whileTap={b.dead && !pruned.has(idx) ? { scale: 0.95 } : {}}
                  onClick={() => prune(idx)}
                  animate={pruned.has(idx) ? { opacity: 0.2, x: 20 } : {}}
                  style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: b.dead ? 'pointer' : 'default',
                    padding: '6px 10px', borderRadius: '6px',
                    background: b.dead
                      ? themeColor(TH.primaryHSL, 0.02, 1)
                      : themeColor(TH.accentHSL, 0.04, 2),
                    border: `1px solid ${b.dead
                      ? themeColor(TH.primaryHSL, 0.04, 3)
                      : themeColor(TH.accentHSL, 0.08, 5)}` }}>
                  <div style={{ width: '6px', height: '20px', borderRadius: '1px',
                    background: b.dead
                      ? themeColor(TH.primaryHSL, 0.04, 2)
                      : themeColor(TH.accentHSL, 0.1, 5) }} />
                  <span style={{ fontSize: '11px',
                    color: b.dead ? palette.textFaint : themeColor(TH.accentHSL, 0.3, 10),
                    textDecoration: pruned.has(idx) ? 'line-through' : 'none' }}>{b.label}</span>
                  {b.dead && !pruned.has(idx) && (
                    <span style={{ fontSize: '11px', color: palette.textFaint, marginLeft: 'auto' }}>✂</span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'pruned' && (
          <motion.div key="pr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Pruned. The trunk grows taller. You cannot be everything — to be something, you must cut the rest. The branches you killed fed the ones that matter. Prune the possibilities to feed the probability.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Essentialism. Greg McKeown: "If it isn{"'"}t a clear yes, then it{"'"}s a clear no." The paradox of choice (Barry Schwartz): more options create more anxiety and worse decisions. Strategic subtraction — the discipline of pruning — is how masters create. Say no to the good so you can say yes to the great.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Pruned.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}