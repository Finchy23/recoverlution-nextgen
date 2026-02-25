/**
 * ARCHITECT II #3 — The Logic Library
 * "Put 'Catastrophes' in the Fiction section."
 * Pattern A (Tap) — Sort messy thoughts into shelves: Facts, Opinions, Fears
 * STEALTH KBE: Sorting correctly = Cognitive Distortion Check / Critical Thinking (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { COGNITIVE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Cognitive Structuring', 'knowing', 'Circuit');
type Stage = 'arriving' | 'messy' | 'sorted' | 'resonant' | 'afterglow';

const THOUGHTS = [
  { text: 'Everyone hates me', shelf: 'Fiction' },
  { text: 'I have a meeting at 3pm', shelf: 'Facts' },
  { text: 'I think this job is wrong', shelf: 'Opinions' },
];

export default function Cognitive_LogicLibrary({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sorted, setSorted] = useState<string[]>([]);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('messy'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const sortInto = (shelf: string) => {
    if (stage !== 'messy') return;
    const correct = THOUGHTS[currentIdx].shelf === shelf;
    const next = [...sorted, shelf];
    setSorted(next);
    if (currentIdx < THOUGHTS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      const correctCount = THOUGHTS.reduce((acc, th, i) => acc + (th.shelf === next[i] ? 1 : 0), 0);
      console.log(`[KBE:K] LogicLibrary correctSorts=${correctCount}/${THOUGHTS.length} criticalThinking=confirmed cognitiveDistortionCheck=true`);
      setStage('sorted');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    }
  };

  const shelves = ['Facts', 'Opinions', 'Fiction'];

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Cognitive Structuring" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', gap: '3px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '6px', height: '10px', borderRadius: '1px',
                  background: themeColor(TH.primaryHSL, 0.04, 2) }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'messy' && (
          <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Messy pile of thoughts. Sort them onto shelves. Where does this one belong?
            </div>
            {/* Current thought */}
            <motion.div key={currentIdx} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ padding: '8px 16px', borderRadius: radius.sm,
                background: themeColor(TH.accentHSL, 0.05, 2),
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.35, 12), fontStyle: 'italic' }}>
                "{THOUGHTS[currentIdx].text}"
              </span>
            </motion.div>
            <div style={{ fontSize: '11px', color: palette.textFaint }}>{currentIdx + 1}/{THOUGHTS.length}</div>
            {/* Shelves */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {shelves.map(s => (
                <motion.div key={s} whileTap={{ scale: 0.9 }} onClick={() => sortInto(s)}
                  style={{ padding: '12px 18px', borderRadius: radius.sm, cursor: 'pointer',
                    background: themeColor(TH.primaryHSL, 0.025, 1),
                    border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                  <div style={{ width: '28px', height: '3px', borderRadius: '1px',
                    background: themeColor(TH.primaryHSL, 0.04, 2) }} />
                  <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 10) }}>{s}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'sorted' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Sorted. A messy mind is an anxious mind. You put "Everyone hates me" in the Fiction section where it belongs. "Facts" go in Reference. "Opinions" go in the opinion shelf. "Catastrophes" go in Fiction. Once sorted, the library is quiet. The anxiety was just a messy desk.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Cognitive defusion (ACT) and cognitive restructuring (CBT). Both traditions teach the same skill: separating thoughts from facts. ACT calls it "defusion" — seeing thoughts as mental events rather than truths. CBT calls it "cognitive restructuring" — identifying and challenging distorted thoughts. The library metaphor: once a catastrophic thought is filed under "Fiction," its power evaporates. The thought doesn{"'"}t disappear; it just gets re-shelved.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Sorted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}