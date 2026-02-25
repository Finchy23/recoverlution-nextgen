/**
 * ZENITH #9 — The Whiteout (Navigation)
 * "Your feelings are hallucinating. Follow the compass."
 * ARCHETYPE: Pattern B (Drag) — Follow compass direction despite visual illusions
 * ENTRY: Cold open — total white screen
 * STEALTH KBE: Following compass = Values-Based Action (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ZENITH_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'knowing', 'Practice');
type Stage = 'arriving' | 'whiteout' | 'navigated' | 'resonant' | 'afterglow';

export default function Zenith_Whiteout({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'x', sticky: true,
    onComplete: () => {
      console.log(`[KBE:K] Whiteout valuesBasedAction=confirmed compassOverFeelings=true`);
      setStage('navigated');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('whiteout'), 1800); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}
            style={{ width: '60px', height: '40px', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.02, 1) }} />
        )}
        {stage === 'whiteout' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            {/* Whiteout field */}
            <div style={{ width: '140px', height: '70px', borderRadius: radius.xs, position: 'relative',
              background: themeColor(TH.primaryHSL, 0.015, 0),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.03, 2)}` }}>
              {/* Illusion arrow pointing LEFT */}
              <motion.div animate={{ opacity: [0.05, 0.12, 0.05] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ position: 'absolute', top: '30px', left: '15px',
                  fontSize: '11px', color: themeColor(TH.primaryHSL, 0.06, 3) }}>
                ← feels right
              </motion.div>
              {/* Compass pointing RIGHT */}
              <div style={{ position: 'absolute', top: '25px', right: '10px',
                width: '20px', height: '20px', borderRadius: '50%',
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 6)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.35, 12) }}>N→</span>
              </div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Whiteout. No landmarks. The compass says "Straight." Your feelings say "Turn." Follow the compass.
            </div>
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
        {stage === 'navigated' && (
          <motion.div key="n" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Through the whiteout. Your feelings were hallucinating; they said "Turn left." The compass said "Straight." You followed the instrument. In zero visibility, trust the compass (your values), not your eyes (your emotions).
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Values-based action. ACT (Acceptance and Commitment Therapy) distinguishes between "feeling-driven" and "values-driven" behavior. In a whiteout (crisis, confusion, emotional storm), feelings become unreliable instruments, like a gyroscope in turbulence. Your values are the magnetic compass that points true north regardless of conditions. Follow the compass, not the hallucination.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>True north.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}