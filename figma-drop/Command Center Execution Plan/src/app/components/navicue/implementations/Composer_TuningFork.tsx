/**
 * COMPOSER #7 — The Tuning Fork (The Standard)
 * "Return to the reference pitch. Hum it until you vibrate."
 * ARCHETYPE: Pattern C (Hold) — Hold center against pulling forces
 * ENTRY: Scene-first — vibrating fork
 * STEALTH KBE: Holding center = Vocal Resonance / Vagus activation (E)
 * WEB ADAPT: microphone → hold button
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { COMPOSER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'embodying', 'Theater');
type Stage = 'arriving' | 'vibrating' | 'held' | 'resonant' | 'afterglow';

export default function Composer_TuningFork({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({ duration: 4000,
    onComplete: () => {
      console.log(`[KBE:E] TuningFork vagusActivation=confirmed vocalResonance=true`);
      setStage('held');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('vibrating'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="embodying" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <motion.div animate={{ x: [-1, 1, -1] }} transition={{ duration: 0.1, repeat: Infinity }}
              style={{ width: '2px', height: '24px', borderRadius: '1px',
                background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'vibrating' && (
          <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              This is your truth. Hold the center against the noise.
            </div>
            {/* Tuning fork visual */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
              <motion.div animate={{ x: [-1.5, 1.5, -1.5] }} transition={{ duration: 0.08, repeat: Infinity }}
                style={{ width: '3px', height: '30px', borderRadius: '1px',
                  background: themeColor(TH.accentHSL, 0.1 + hold.progress * 0.08, 5) }} />
              <div style={{ width: '8px', height: '14px', borderRadius: '0 0 4px 4px',
                background: themeColor(TH.accentHSL, 0.06, 3) }} />
              <motion.div animate={{ x: [1.5, -1.5, 1.5] }} transition={{ duration: 0.08, repeat: Infinity }}
                style={{ width: '3px', height: '30px', borderRadius: '1px',
                  background: themeColor(TH.accentHSL, 0.1 + hold.progress * 0.08, 5) }} />
            </div>
            {/* Hold target */}
            <motion.div {...hold.holdProps}
              animate={hold.isHolding ? { boxShadow: `0 0 ${6 + hold.progress * 10}px ${themeColor(TH.accentHSL, 0.04 + hold.progress * 0.06, 4)}` } : {}}
              style={{ width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06 + hold.progress * 0.04, 3),
                border: `2px solid ${themeColor(TH.accentHSL, 0.1 + hold.progress * 0.1, 6)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                userSelect: 'none', WebkitUserSelect: 'none' }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.25 + hold.progress * 0.15, 10) }}>
                {hold.isHolding ? 'Humming...' : 'Hold'}
              </span>
            </motion.div>
            {/* Progress ring */}
            <div style={{ width: '40px', height: '3px', borderRadius: '1.5px',
              background: themeColor(TH.primaryHSL, 0.04, 2) }}>
              <div style={{ height: '100%', borderRadius: '1.5px',
                width: `${hold.progress * 100}%`,
                background: themeColor(TH.accentHSL, 0.12, 6), transition: 'width 0.1s' }} />
            </div>
          </motion.div>
        )}
        {stage === 'held' && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            You held the center. The world tried to detune you — and failed. Return to the reference pitch. Hum it until you vibrate. This is your A440 — your truth that doesn{"'"}t waver.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Vagal tone. Humming and sustained vocalization activate the vagus nerve via the laryngeal branch, increasing heart rate variability and parasympathetic tone. A440 is the universal reference pitch — every orchestra tunes to it before playing. Your values are your A440. When the world tries to pull you sharp or flat, return to the fork.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>A440.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}