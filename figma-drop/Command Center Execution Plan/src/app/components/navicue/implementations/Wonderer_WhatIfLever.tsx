/**
 * WONDERER #1 — The "What If" Lever
 * "You are predicting doom. That is boring. Predict magic."
 * ARCHETYPE: Pattern B (Drag) — Pull lever from "Worst Case" to "Weirdest Case"
 * ENTRY: Scene-first — heavy industrial lever
 * STEALTH KBE: Choosing surreal over logical = Divergent Thinking (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { WONDERER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'active' | 'weird' | 'resonant' | 'afterglow';

const WEIRD_OUTCOMES = [
  'The mistake leads to a treasure map.',
  'Your boss turns into a talking parrot who only says "approved."',
  'The failure becomes a best-selling memoir.',
  'The rejection letter was addressed to someone in a parallel universe.',
];

export default function Wonderer_WhatIfLever({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [outcome] = useState(() => WEIRD_OUTCOMES[Math.floor(Math.random() * WEIRD_OUTCOMES.length)]);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'y', sticky: true,
    onComplete: () => {
      console.log(`[KBE:B] WhatIfLever scenarioSelection=weird divergentThinking=confirmed`);
      setStage('weird');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('active'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const leverAngle = drag.progress * 60;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ width: '6px', height: '40px', borderRadius: '3px',
              background: themeColor(TH.primaryHSL, 0.08, 4),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.1, 6)}` }} />
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {drag.progress < 0.5 ? 'THE WORST CASE' : 'THE WEIRDEST CASE'}
            </div>
            {/* Lever visualization */}
            <div style={{ position: 'relative', width: '60px', height: '80px',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              <div style={{ width: '20px', height: '8px', borderRadius: radius.xs,
                background: themeColor(TH.primaryHSL, 0.08, 4) }} />
              <div style={{ position: 'absolute', bottom: '4px', left: '50%',
                width: '6px', height: '50px', borderRadius: '3px',
                background: drag.progress < 0.5
                  ? themeColor(TH.primaryHSL, 0.1, 5)
                  : themeColor(TH.accentHSL, 0.12 + drag.progress * 0.08, 6),
                transformOrigin: 'bottom center',
                transform: `translateX(-50%) rotate(${-30 + leverAngle}deg)`,
                transition: 'background 0.3s' }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Pull the lever down. Switch from doom to wonder.
            </div>
            <div ref={drag.containerRef} style={{ width: '12px', height: '100px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '26px', height: '26px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.1 + drag.progress * 0.08, 5),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                  position: 'absolute', left: '-7px', top: '2px' }} />
            </div>
          </motion.div>
        )}
        {stage === 'weird' && (
          <motion.div key="w" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '280px' }}>
            <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.35, 12), textAlign: 'center', fontStyle: 'italic' }}>
              "{outcome}"
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Better story. Same probability as the doom one. Your brain just prefers catastrophe because it{"'"}s familiar.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Scenario reframing. The brain{"'"}s negativity bias means "worst case" scenarios feel more probable than they are. Pulling the lever to "weirdest case" activates the same neural pathways but redirects them toward creativity. Both futures are fiction; you just chose the more interesting one. Curiosity is the antidote to catastrophizing.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Reframed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}