/**
 * TIME CAPSULE #9 — The Dead Man's Switch
 * "Accountability is the only way. The clock is ticking."
 * ARCHETYPE: Pattern B (Drag) — Drag the timer to arm the switch
 * ENTRY: Instruction as Poetry — ticking immediately, no explanation
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TIMECAPSULE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'active' | 'resonant' | 'afterglow';

export default function TimeCapsule_DeadMansSwitch({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [tick, setTick] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const tickRef = useRef<number>(0);

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
    const iv = window.setInterval(() => setTick(p => p + 1), 1000);
    tickRef.current = iv;
    return () => { T.current.forEach(clearTimeout); clearInterval(iv); };
  }, []);

  const progress = drag.progress;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ fontSize: '24px', fontFamily: 'monospace', color: palette.text }}>
              30:00
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 0.8 }}
              style={{ width: '4px', height: '4px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.4, 10) }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              If you do not follow through, this message sends. Put your reputation on the line. The Ulysses Pact: create a future cost for non-compliance. Arm the switch.
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '18px', color: palette.text, opacity: 0.5 }}>
              {String(29 - (tick % 30)).padStart(2, '0')}:{String(59 - (tick % 60)).padStart(2, '0')}
            </div>
            <div {...drag.dragProps} style={{
              ...drag.dragProps.style,
              width: '60px', height: '120px', borderRadius: radius.full, position: 'relative',
              background: themeColor(TH.primaryHSL, 0.04, 5),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}`,
            }}>
              <motion.div
                style={{
                  position: 'absolute', left: '10px', top: `${10 + progress * 60}px`,
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.1 + progress * 0.2, 8),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 10)}`,
                  pointerEvents: 'none',
                }} />
            </div>
            {progress < 0.9 && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.35 }}>drag to arm</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Armed. The switch is live. If you go silent, if you disappear into avoidance for thirty days, the message sends itself. You just made inaction more expensive than action. The only way to stop the clock is to show up.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Ticking.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}