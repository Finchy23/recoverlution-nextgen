/**
 * LOOP BREAKER #4 — The Exit Ramp
 * "The familiar path leads to the cliff. Take the strange path."
 * ARCHETYPE: Pattern B (Drag) — Drag to take the exit ramp off the loop
 * ENTRY: Instruction as Poetry — highway curving, no explanation needed
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { LOOPBREAKER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'arriving' | 'active' | 'resonant' | 'afterglow';

export default function LoopBreaker_ExitRamp({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'y',
    sticky: true,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 1800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const progress = drag.progress;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <svg width="200" height="100" viewBox="0 0 200 100">
              <motion.path d="M20,50 Q60,50 100,50 T180,50"
                fill="none" stroke={themeColor(TH.primaryHSL, 0.08, 5)} strokeWidth="2" strokeDasharray="6 4"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: [0, -20] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
              <motion.path d="M130,50 Q150,35 180,20"
                fill="none" stroke={themeColor(TH.accentHSL, 0.1, 8)} strokeWidth="1.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ delay: 1, duration: 1 }} />
            </svg>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>
              the road curves
            </motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              You usually turn left. The familiar path leads to the cliff. An exit ramp has appeared. It leads into the forest. You don{'\u2019'}t know what{'\u2019'}s there. Take it anyway.
            </div>
            <svg width="200" height="140" viewBox="0 0 200 140">
              {/* Main loop */}
              <path d="M20,100 Q60,100 100,100 T180,100"
                fill="none" stroke={themeColor(TH.primaryHSL, 0.08, 5)} strokeWidth="2" strokeDasharray="6 4" />
              {/* Exit ramp */}
              <motion.path d="M100,100 Q120,70 160,30"
                fill="none" stroke={themeColor(TH.accentHSL, 0.1 + progress * 0.2, 8)}
                strokeWidth={1.5 + progress * 1} />
              {/* Cursor on ramp */}
              <motion.circle
                cx={100 + progress * 60}
                cy={100 - progress * 70}
                r="6"
                fill={themeColor(TH.accentHSL, 0.15 + progress * 0.2, 10)} />
            </svg>
            <div {...drag.dragProps} style={{
              ...drag.dragProps.style,
              width: '60px', height: '100px', borderRadius: radius.full, position: 'relative',
              background: themeColor(TH.primaryHSL, 0.04, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 5)}`,
            }}>
              <motion.div
                style={{
                  position: 'absolute', left: '12px',
                  top: `${60 - progress * 50}px`,
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.1 + progress * 0.15, 8),
                  pointerEvents: 'none',
                }} />
            </div>
            {progress < 0.9 && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.35 }}>take the exit</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              You took the ramp. The habitual response was suppressed, and the neural pathway weakened just slightly. It felt wrong because the groove is deep. But wrong is the only direction that isn{'\u2019'}t the cliff.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Off the loop.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}