/**
 * MENTAT #10 — The Mentat Seal (Fluid Intelligence)
 * "The mind is a diamond. Pressure made it clear."
 * ARCHETYPE: Pattern A (Tap) — Crystal lattice formation
 * ENTRY: Cold open — lattice forming
 * STEALTH KBE: Completion = Fluid Intelligence confirmed
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MENTAT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Cognitive Enhancement', 'knowing', 'Circuit');
type Stage = 'arriving' | 'forming' | 'crystallized' | 'resonant' | 'afterglow';

export default function Mentat_MentatSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('forming'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const crystallize = () => {
    if (stage !== 'forming') return;
    console.log(`[KBE:K] MentatSeal fluidIntelligence=confirmed cognitiveClarity=true`);
    setStage('crystallized');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Cognitive Enhancement" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <svg width="30" height="30" viewBox="0 0 30 30">
              <polygon points="15,2 28,15 15,28 2,15" fill="none"
                stroke={themeColor(TH.accentHSL, 0.05, 3)} strokeWidth="1" />
            </svg>
          </motion.div>
        )}
        {stage === 'forming' && (
          <motion.div key="fo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {/* Crystal lattice */}
            <svg width="80" height="80" viewBox="0 0 80 80">
              {/* Lattice lines */}
              {[[40, 10, 70, 40], [70, 40, 40, 70], [40, 70, 10, 40], [10, 40, 40, 10],
                [40, 10, 40, 70], [10, 40, 70, 40]].map((coords, i) => (
                <motion.line key={i} x1={coords[0]} y1={coords[1]} x2={coords[2]} y2={coords[3]}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.08 }}
                  transition={{ delay: i * 0.3, duration: 0.5 }}
                  stroke={themeColor(TH.accentHSL, 0.08, 4)} strokeWidth="1" />
              ))}
              {/* Nodes */}
              {[[40, 10], [70, 40], [40, 70], [10, 40], [40, 40]].map(([cx, cy], i) => (
                <motion.circle key={i} cx={cx} cy={cy} r="3"
                  initial={{ opacity: 0 }} animate={{ opacity: 0.12 }}
                  transition={{ delay: 0.5 + i * 0.2 }}
                  fill={themeColor(TH.accentHSL, 0.12, 6)} />
              ))}
            </svg>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '240px', fontStyle: 'italic' }}>
              A crystal lattice forming. Clarity through structure. Pressure made it clear.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={crystallize}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>Crystallize</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'crystallized' && (
          <motion.div key="cr" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}>
              <svg width="40" height="40" viewBox="0 0 40 40">
                <polygon points="20,2 38,20 20,38 2,20" fill={themeColor(TH.accentHSL, 0.06, 3)}
                  stroke={themeColor(TH.accentHSL, 0.1, 6)} strokeWidth="1" />
                <polygon points="20,8 32,20 20,32 8,20" fill="none"
                  stroke={themeColor(TH.accentHSL, 0.06, 4)} strokeWidth="0.5" />
              </svg>
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
              Crystal. The mind is a diamond. It was always there — carbon under pressure. The exercises you just performed — deduction, compression, logic gates, pattern matching, algorithm rewriting — they sharpened the facets. Pressure made it clear.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Fluid intelligence. Raymond Cattell{"'"}s distinction: crystallized intelligence (what you know) vs. fluid intelligence (how well you reason with novel information). Fluid intelligence is trainable through working memory exercises, pattern recognition, and cognitive flexibility training. The Mentat collection targeted all three. The mind is not fixed. It is a diamond still being cut.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Crystal.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}