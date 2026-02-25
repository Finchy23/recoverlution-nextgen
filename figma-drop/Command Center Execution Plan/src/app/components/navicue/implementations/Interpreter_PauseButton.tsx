/**
 * INTERPRETER #7 — The Pause Button (The Gap)
 * "Between stimulus and response, there is a gap. Widen the gap."
 * ARCHETYPE: Pattern C (Hold) — Hold button for 5 full seconds to unlock
 * ENTRY: Ambient fade — heated conversation text fades in before button appears
 * STEALTH KBE: Completing the 5s hold = proven impulse control (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { INTERPRETER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Hearth');
type Stage = 'arriving' | 'active' | 'paused' | 'resonant' | 'afterglow';

export default function Interpreter_PauseButton({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const [breathCount, setBreathCount] = useState(0);

  const hold = useHoldInteraction({
    maxDuration: 5000,
    onThreshold: (tension) => {
      if (tension >= 0.25) setBreathCount(1);
      if (tension >= 0.5) setBreathCount(2);
      if (tension >= 0.75) setBreathCount(3);
    },
    onComplete: () => {
      console.log(`[KBE:E] PauseButton holdCompleted=true impulseControlProven=true`);
      setBreathCount(4);
      setStage('paused');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const ringProgress = hold.tension;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference * (1 - ringProgress);

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '280px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', lineHeight: '1.8' }}>
              "How could you say that?"
              {'\n'}
              "You never listen!"
              {'\n'}
              "I can't believe you..."
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Between stimulus and response, there is a gap. Widen the gap. Do not react. Respond.
            </div>
            {/* Giant Pause Button with ring */}
            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
              <svg width="100" height="100" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="none"
                  stroke={themeColor(TH.primaryHSL, 0.06, 4)} strokeWidth="3" />
                <circle cx="50" cy="50" r="40" fill="none"
                  stroke={themeColor(TH.accentHSL, 0.3 + ringProgress * 0.3, 8)}
                  strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 0.1s linear' }} />
              </svg>
              <motion.div {...hold.holdProps}
                animate={{ scale: hold.isHolding ? 0.92 : 1,
                  boxShadow: hold.isHolding
                    ? `0 0 ${20 + ringProgress * 20}px ${themeColor(TH.accentHSL, 0.1 + ringProgress * 0.1, 6)}`
                    : `0 0 8px ${themeColor(TH.accentHSL, 0.04, 4)}` }}
                style={{ position: 'absolute', top: '10px', left: '10px', width: '80px', height: '80px',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: themeColor(TH.primaryHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                  touchAction: 'none', cursor: 'pointer', userSelect: 'none' }}>
                {/* Pause icon */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '6px', height: '22px', borderRadius: '2px',
                    background: themeColor(TH.accentHSL, 0.25 + ringProgress * 0.2, 10) }} />
                  <div style={{ width: '6px', height: '22px', borderRadius: '2px',
                    background: themeColor(TH.accentHSL, 0.25 + ringProgress * 0.2, 10) }} />
                </div>
              </motion.div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {hold.isHolding ? `breathing... ${breathCount}/4` : 'hold to pause the world'}
            </div>
            {hold.isHolding && !hold.completed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
                style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px' }}>
                {Math.ceil(5 - hold.tension * 5)}s remaining
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'paused' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 4, repeat: Infinity }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.08, 6),
                border: `2px solid ${themeColor(TH.accentHSL, 0.15, 10)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.4, 12), fontSize: '11px' }}>
                  5.0s
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              The world stopped. You held the gap open. Now you can choose a response instead of a reaction.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Inhibitory control. Viktor Frankl{"'"}s gap: the space between stimulus and response is where freedom lives. Holding for 5 seconds engages the prefrontal cortex over the amygdala. You just practiced executive function.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Paused.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}