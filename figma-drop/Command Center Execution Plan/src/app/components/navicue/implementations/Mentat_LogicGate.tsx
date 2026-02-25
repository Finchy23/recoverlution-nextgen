/**
 * MENTAT #3 — The Logic Gate (If/Then)
 * "Anxiety is an open loop. Close it with 'Then I will.'"
 * ARCHETYPE: Pattern B (Drag) — Drag Plan B block to complete circuit
 * ENTRY: Scene-first — broken circuit board
 * STEALTH KBE: Completing circuit = Contingency Planning / Preparedness (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MENTAT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('poetic_precision', 'Cognitive Enhancement', 'believing', 'Circuit');
type Stage = 'arriving' | 'broken' | 'closed' | 'resonant' | 'afterglow';

export default function Mentat_LogicGate({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'x', sticky: true,
    onComplete: () => {
      console.log(`[KBE:B] LogicGate contingencyPlanning=confirmed preparedness=true`);
      setStage('closed');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('broken'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Cognitive Enhancement" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <svg width="50" height="20" viewBox="0 0 50 20">
              <line x1="5" y1="10" x2="20" y2="10" stroke={themeColor(TH.accentHSL, 0.06, 3)} strokeWidth="2" />
              <line x1="30" y1="10" x2="45" y2="10" stroke={themeColor(TH.accentHSL, 0.03, 1)} strokeWidth="2" strokeDasharray="3 3" />
            </svg>
          </motion.div>
        )}
        {stage === 'broken' && (
          <motion.div key="br" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A broken circuit. IF [I fail] THEN [___]. The loop is open. Drag the Plan B block to close it.
            </div>
            {/* Circuit */}
            <svg width="160" height="40" viewBox="0 0 160 40">
              <line x1="10" y1="20" x2="50" y2="20" stroke={themeColor(TH.accentHSL, 0.08, 4)} strokeWidth="2" />
              <rect x="50" y="10" width="30" height="20" rx="3" fill={themeColor(TH.accentHSL, 0.06, 3)}
                stroke={themeColor(TH.accentHSL, 0.1, 6)} strokeWidth="1" />
              <text x="56" y="23" fill={themeColor(TH.accentHSL, 0.25, 8)} fontSize="11">IF fail</text>
              {/* Gap */}
              <line x1="80" y1="20" x2="100" y2="20" stroke={themeColor(TH.primaryHSL, 0.04, 2)} strokeWidth="2" strokeDasharray="4 3" />
              {/* Plan B block (fills with progress) */}
              <rect x="100" y="10" width="30" height="20" rx="3"
                fill={themeColor(TH.accentHSL, drag.progress * 0.06, 3)}
                stroke={themeColor(TH.accentHSL, 0.04 + drag.progress * 0.08, 5)} strokeWidth="1" />
              <text x="104" y="23" fill={themeColor(TH.accentHSL, 0.1 + drag.progress * 0.2, 8)} fontSize="11">THEN ...</text>
              <line x1="130" y1="20" x2="155" y2="20" stroke={themeColor(TH.accentHSL, 0.04 + drag.progress * 0.04, 3)} strokeWidth="2" />
              {/* Status light */}
              <circle cx="155" cy="20" r="4"
                fill={drag.progress > 0.9
                  ? themeColor(TH.accentHSL, 0.15, 8)
                  : themeColor(TH.primaryHSL, 0.04, 2)} />
            </svg>
            <div ref={drag.containerRef} style={{ width: '120px', height: '12px', borderRadius: '6px',
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '24px', height: '24px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.1, 5),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                  position: 'absolute', top: '-6px', left: '2px' }} />
            </div>
          </motion.div>
        )}
        {stage === 'closed' && (
          <motion.div key="cl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Circuit closed. The light turns green. Anxiety was an open loop: "What if I fail?" You closed it: "Then I will..." The power of "IF/THEN" implementation intentions: they pre-load a response so the brain doesn{"'"}t panic when the trigger fires. Code the solution before the error occurs.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Implementation intentions. Peter Gollwitzer{"'"}s research: "IF X happens, THEN I will do Y" plans are 2-3x more effective than simple goal-setting. They work by pre-loading the behavioral response, reducing the cognitive load at the moment of decision. Anxiety thrives in open loops — unresolved "what ifs." The IF/THEN format closes the loop, converts uncertainty into a plan, and reduces rumination.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Closed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}