/**
 * ETHICIST #1 — The Integrity Gap
 * "The gap between word and deed is where shame lives. Close the gap."
 * ARCHETYPE: Pattern B (Drag) — Drag lines together until they overlap
 * ENTRY: Scene-first — two diverging lines
 * STEALTH KBE: Naming misalignment = Self-Concordance / Integrity (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ETHICIST_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'knowing', 'Practice');
type Stage = 'arriving' | 'gapped' | 'aligned' | 'resonant' | 'afterglow';

export default function Ethicist_IntegrityGap({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'y', sticky: true,
    onComplete: () => {
      console.log(`[KBE:K] IntegrityGap selfConcordance=confirmed integrity=aligned`);
      setStage('aligned');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('gapped'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const gap = 30 - drag.progress * 28;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <svg width="60" height="30" viewBox="0 0 60 30">
              <line x1="5" y1="10" x2="55" y2="10" stroke={themeColor(TH.accentHSL, 0.06, 3)} strokeWidth="1" />
              <line x1="5" y1="20" x2="55" y2="20" stroke={themeColor(TH.primaryHSL, 0.04, 2)} strokeWidth="1" />
            </svg>
          </motion.div>
        )}
        {stage === 'gapped' && (
          <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Two lines. "What I Say" and "What I Do." They{"'"}re far apart. Close the gap.
            </div>
            <svg width="160" height="60" viewBox="0 0 160 60">
              <line x1="10" y1={30 - gap / 2} x2="150" y2={30 - gap / 2}
                stroke={themeColor(TH.accentHSL, 0.1, 5)} strokeWidth="2" />
              <text x="10" y={26 - gap / 2} fill={themeColor(TH.accentHSL, 0.2, 8)} fontSize="7">What I Say</text>
              <line x1="10" y1={30 + gap / 2} x2="150" y2={30 + gap / 2}
                stroke={themeColor(TH.primaryHSL, 0.06, 3)} strokeWidth="2" />
              <text x="10" y={36 + gap / 2} fill={palette.textFaint} fontSize="7">What I Do</text>
            </svg>
            <div ref={drag.containerRef} style={{ width: '12px', height: '70px', borderRadius: '6px',
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.1, 5),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                  position: 'absolute', left: '-6px', top: '2px' }} />
            </div>
          </motion.div>
        )}
        {stage === 'aligned' && (
          <motion.div key="al" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Snap. The lines overlap. Word and deed, aligned. The gap between what you say and what you do is where shame lives. Close the gap. Silence the shame. Integrity is the sound of alignment.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Self-concordance. Kennon Sheldon{"'"}s research: goals that align with authentic values (self-concordant goals) produce sustained motivation and well-being. Goals that don{"'"}t align create a "say-do gap" — the integrity deficit that generates chronic low-grade shame. The cure is alignment, not perfection. Close the gap by adjusting the words OR the actions.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Aligned.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}