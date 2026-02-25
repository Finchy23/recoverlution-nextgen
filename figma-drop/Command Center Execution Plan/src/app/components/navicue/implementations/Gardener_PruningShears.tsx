/**
 * GARDENER II #3 — The Pruning Shears
 * "Cut the suckers. Send the energy to the fruit."
 * Pattern A (Tap) — Tree with dead branches; tap to cut; trunk surges with sap
 * STEALTH KBE: Willingness to subtract = Essentialism / Focus (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GARDENER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Ecological Identity', 'knowing', 'Canopy');
type Stage = 'arriving' | 'overgrown' | 'pruned' | 'resonant' | 'afterglow';

const BRANCHES = ['Busy Work', 'People-Pleasing', 'Perfectionism', 'Scrolling', 'Overthinking'];

export default function Gardener_PruningShears({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [cut, setCut] = useState<string[]>([]);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('overgrown'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const prune = (branch: string) => {
    if (stage !== 'overgrown') return;
    const next = [...cut, branch];
    setCut(next);
    if (next.length >= 3) {
      console.log(`[KBE:K] PruningShears essentialism=confirmed cut=[${next}]`);
      setStage('pruned');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    }
  };

  const remaining = BRANCHES.filter(b => !cut.includes(b));
  const sapEnergy = cut.length / 3;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Ecological Identity" kbe="knowing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '3px', height: '20px', background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'overgrown' && (
          <motion.div key="o" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A tree dying of distraction. Cut the dead branches. Send the energy to the fruit. ({3 - cut.length} more)
            </div>
            {/* Trunk with energy indicator */}
            <div style={{ width: '6px', height: '30px', borderRadius: '2px',
              background: themeColor(TH.accentHSL, 0.04 + sapEnergy * 0.06, 3),
              transition: 'background 0.5s' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              {remaining.map(b => (
                <motion.div key={b} whileTap={{ scale: 0.85 }} onClick={() => prune(b)}
                  style={{ padding: '12px 18px', borderRadius: '10px', cursor: 'pointer',
                    background: themeColor(TH.primaryHSL, 0.03, 1),
                    border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }}>
                  <span style={{ fontSize: '11px', color: palette.textFaint }}>✂ {b}</span>
                </motion.div>
              ))}
            </div>
            {cut.length > 0 && (
              <div style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 6) }}>
                Cut: {cut.join(', ')}
              </div>
            )}
          </motion.div>
        )}
        {stage === 'pruned' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Pruned. The trunk surges with sap. You cut {cut.join(', ')} — and the remaining branches drink deeply. The tree was trying to do too much. Essentialism is the disciplined pursuit of less. Every dead branch you leave on the tree steals water from the fruit. Subtraction is an act of love for what remains.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Essentialism and strategic subtraction. Greg McKeown{"'"}s {"'"}Essentialism{"'"}: "The disciplined pursuit of less but better." In arboriculture, pruning removes 20-30% of a tree{"'"}s canopy to redirect energy to healthy growth. Decision fatigue research (Baumeister): every commitment costs cognitive resources. Pareto principle: 80% of results come from 20% of activities. The courage to cut is rarer and more valuable than the impulse to add.
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