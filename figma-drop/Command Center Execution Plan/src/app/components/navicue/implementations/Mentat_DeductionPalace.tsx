/**
 * MENTAT #1 — The Deduction Palace
 * "Eliminate the impossible. Whatever remains is the truth."
 * ARCHETYPE: Pattern A (Tap) — Select suspect/root cause
 * ENTRY: Scene-first — chaotic crime scene
 * STEALTH KBE: Selecting correct cause = Root Cause Analysis / Insight (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MENTAT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Cognitive Enhancement', 'knowing', 'Circuit');
type Stage = 'arriving' | 'scanning' | 'deduced' | 'resonant' | 'afterglow';

const SUSPECTS = ['Lack of Sleep', 'Overcommitment', 'Poor Boundaries', 'Unresolved Grief'];

export default function Mentat_DeductionPalace({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [chosen, setChosen] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('scanning'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const select = (s: string) => {
    if (stage !== 'scanning') return;
    setChosen(s);
    console.log(`[KBE:K] DeductionPalace suspect="${s}" rootCauseAnalysis=confirmed insight=true`);
    setStage('deduced');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Cognitive Enhancement" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '2px',
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px dashed ${themeColor(TH.primaryHSL, 0.05, 3)}` }} />
          </motion.div>
        )}
        {stage === 'scanning' && (
          <motion.div key="sc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A chaotic scene. Your messy life. Scan for clues. The stress is not random: it has a cause. Who stole your peace?
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              {SUSPECTS.map(s => (
                <motion.div key={s} whileTap={{ scale: 0.9 }} onClick={() => select(s)}
                  style={{ padding: '12px 18px', borderRadius: '10px', cursor: 'pointer',
                    background: themeColor(TH.accentHSL, 0.06, 3),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
                  <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.35, 12) }}>{s}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'deduced' && (
          <motion.div key="de" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {chosen}. Identified. Eliminate the impossible; whatever remains, however painful, is the truth. The first step of any solution is naming the problem precisely. You just did. The deduction palace doesn{"'"}t solve your problems: it illuminates them. Clarity is the first weapon.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Root cause analysis. Sakichi Toyoda{"'"}s "5 Whys": asking "why" repeatedly until you reach the true cause. Most people treat symptoms; few diagnose causes. Cognitive behavioral therapy works on the same principle: the surface emotion (anxiety) has a deeper cognitive root (catastrophic belief). Naming the real cause with precision is 80% of the solution.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Deduced.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}