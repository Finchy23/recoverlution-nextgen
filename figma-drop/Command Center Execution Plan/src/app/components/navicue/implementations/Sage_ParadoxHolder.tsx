/**
 * SAGE #4 — The Paradox Holder
 * "The great mind holds 'Both.'"
 * Pattern B (Drag) — Drag two opposing truths together; they merge into Yin-Yang
 * STEALTH KBE: Speed of merging = Cognitive Complexity / Dialectical Thinking (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SAGE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Transcendent Wisdom', 'knowing', 'Practice');
type Stage = 'arriving' | 'apart' | 'merged' | 'resonant' | 'afterglow';

export default function Sage_ParadoxHolder({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [leftPos, setLeftPos] = useState(15);
  const [rightPos, setRightPos] = useState(85);
  const startRef = useRef(Date.now());
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => { setStage('apart'); startRef.current = Date.now(); }, 2200); return () => T.current.forEach(clearTimeout); }, []);

  const nudgeLeft = () => {
    if (stage !== 'apart') return;
    setLeftPos(p => Math.min(p + 8, 50));
    checkMerge(leftPos + 8, rightPos);
  };
  const nudgeRight = () => {
    if (stage !== 'apart') return;
    setRightPos(p => Math.max(p - 8, 50));
    checkMerge(leftPos, rightPos - 8);
  };
  const checkMerge = (l: number, r: number) => {
    if (Math.abs(l - r) < 12) {
      const elapsed = ((Date.now() - startRef.current) / 1000).toFixed(1);
      console.log(`[KBE:K] ParadoxHolder mergeTimeS=${elapsed} dialecticalThinking=confirmed cognitiveComplexity=true`);
      setStage('merged');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    }
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Transcendent Wisdom" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: themeColor(TH.primaryHSL, 0.04, 2) }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.04, 2) }} />
            </div>
          </motion.div>
        )}
        {stage === 'apart' && (
          <motion.div key="ap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Two truths float apart. Bring them together. Hold the tension.
            </div>
            {/* Field */}
            <div style={{ position: 'relative', width: '160px', height: '60px' }}>
              <motion.div animate={{ left: `${leftPos}%` }}
                style={{ position: 'absolute', top: '10px', marginLeft: '-24px',
                  padding: '4px 8px', borderRadius: radius.sm,
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`, transition: 'left 0.15s' }}>
                <span style={{ ...navicueType.micro, color: palette.textFaint }}>Life is Suffering</span>
              </motion.div>
              <motion.div animate={{ left: `${rightPos}%` }}
                style={{ position: 'absolute', top: '10px', marginLeft: '-24px',
                  padding: '4px 8px', borderRadius: radius.sm,
                  background: themeColor(TH.accentHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.05, 3)}`, transition: 'left 0.15s' }}>
                <span style={{ ...navicueType.micro, color: palette.textFaint }}>Life is Beautiful</span>
              </motion.div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <motion.div whileTap={{ scale: 0.85 }} onClick={nudgeLeft}
                style={{ padding: '12px 18px', borderRadius: radius.md, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
                <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Suffering →</span>
              </motion.div>
              <motion.div whileTap={{ scale: 0.85 }} onClick={nudgeRight}
                style={{ padding: '12px 18px', borderRadius: radius.md, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
                <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>← Beautiful</span>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'merged' && (
          <motion.div key="m" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            {/* Yin-Yang */}
            <svg width="50" height="50" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="23" fill={themeColor(TH.primaryHSL, 0.04, 2)} />
              <path d="M25,2 A23,23 0 0 1 25,48 A11.5,11.5 0 0 1 25,25 A11.5,11.5 0 0 0 25,2"
                fill={themeColor(TH.accentHSL, 0.06, 3)} />
              <circle cx="25" cy="13.5" r="3" fill={themeColor(TH.primaryHSL, 0.04, 2)} />
              <circle cx="25" cy="36.5" r="3" fill={themeColor(TH.accentHSL, 0.06, 3)} />
            </svg>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Both. The small mind needs "Either/Or." The great mind holds "Both." It is terrible AND it is wonderful. Hold the tension. The paradox is not a problem to solve — it is a doorway to walk through. When you can hold two contradictions without collapse, you{"'"}ve entered wisdom.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Dialectical thinking. Basseches{"'"} research on post-formal thought: mature cognition moves beyond binary logic (thesis/antithesis) to dialectical integration (synthesis). Marsha Linehan{"'"}s DBT is built entirely on this: "radical acceptance AND change." The ability to hold paradox without collapsing into one pole is a hallmark of cognitive maturity. The Yin-Yang is not half-and-half — it{"'"}s both-in-one.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Held.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}