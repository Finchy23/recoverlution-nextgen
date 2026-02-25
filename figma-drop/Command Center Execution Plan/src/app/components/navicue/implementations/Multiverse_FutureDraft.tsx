/**
 * MULTIVERSE #4 — The Future Draft
 * "You are under construction. Draw the line you want to become."
 * ARCHETYPE: Pattern B (Drag) — Trace over blueprint line with gold pen
 * ENTRY: Scene-first — blueprint sketch
 * STEALTH KBE: Completing trace = Identity Plasticity / Self-Efficacy (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MULTIVERSE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'tracing' | 'permanent' | 'resonant' | 'afterglow';

export default function Multiverse_FutureDraft({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'x', sticky: true,
    onComplete: () => {
      console.log(`[KBE:B] FutureDraft identityPlasticity=confirmed selfEfficacy=true`);
      setStage('permanent');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('tracing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <svg width="60" height="30" viewBox="0 0 60 30">
              <line x1="5" y1="25" x2="55" y2="5" stroke={themeColor(TH.accentHSL, 0.04, 2)} strokeWidth="1" strokeDasharray="3 3" />
            </svg>
          </motion.div>
        )}
        {stage === 'tracing' && (
          <motion.div key="tr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A blueprint of You V2.0. Trace over the sketchy line. Make it permanent.
            </div>
            {/* Blueprint */}
            <svg width="140" height="40" viewBox="0 0 140 40">
              {/* Sketchy blue line */}
              <line x1="10" y1="30" x2="130" y2="10" stroke={themeColor(TH.accentHSL, 0.06, 3)} strokeWidth="1" strokeDasharray="4 3" />
              {/* Gold traced line (progress) */}
              <line x1="10" y1="30" x2={10 + drag.progress * 120} y2={30 - drag.progress * 20}
                stroke={themeColor(TH.accentHSL, 0.15 + drag.progress * 0.1, 8)} strokeWidth="2" />
            </svg>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: palette.textFaint, fontStyle: 'italic' }}>Bold</span>
              <div ref={drag.containerRef} style={{ width: '100px', height: '12px', borderRadius: '6px',
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
                touchAction: 'none', position: 'relative' }}>
                <motion.div {...drag.dragProps}
                  style={{ width: '20px', height: '20px', borderRadius: '50%', cursor: 'grab',
                    background: themeColor(TH.accentHSL, 0.1, 5),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                    position: 'absolute', top: '-4px', left: '2px' }} />
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'permanent' && (
          <motion.div key="pe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Permanent. The sketchy line became gold. You are under construction — don{"'"}t apologize for the scaffolding. You drew the line you want to become. The blueprint is now a commitment. V2.0 is not fantasy; it{"'"}s a traced intention.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Identity plasticity. Carol Dweck{"'"}s growth mindset: identity is not fixed. The neural basis: every intentional behavior strengthens specific synaptic pathways (Hebbian learning). Tracing the line — physically committing to a future trait — is a micro-act of self-efficacy that Bandura showed is the strongest predictor of behavior change.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Drafted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}