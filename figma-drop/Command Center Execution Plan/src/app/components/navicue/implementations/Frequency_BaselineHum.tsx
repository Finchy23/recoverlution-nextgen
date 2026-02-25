/**
 * FREQUENCY #1 — The Baseline Hum
 * "You are already vibrating. Notice the frequency."
 * ARCHETYPE: Pattern E (Hold) — Hold still and notice your current frequency
 * ENTRY: Ambient Fade — a single tone-line slowly emerges
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldPill } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { FREQUENCY_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'ambient' | 'active' | 'resonant' | 'afterglow';

export default function Frequency_BaselineHum({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const [phase, setPhase] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    maxDuration: 7000,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2800);
    const phaseInt = setInterval(() => setPhase(p => p + 1), 100);
    return () => { T.current.forEach(clearTimeout); clearInterval(phaseInt); };
  }, []);

  const tension = hold.tension;
  const waveAmp = 8 + tension * 12;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ opacity: [0.02, 0.06, 0.02] }} transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '200px', height: '1px', background: themeColor(TH.accentHSL, 0.08, 5) }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1.6 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>a frequency</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You are already vibrating. Hold completely still and notice the frequency you{'\u2019'}re already running at. Heartbeat. Breath. Brain waves. What{'\u2019'}s the baseline?
            </div>
            <svg width="240" height="50" style={{ overflow: 'visible' }}>
              {Array.from({ length: 80 }).map((_, i) => {
                const x = i * 3;
                const y = 25 + Math.sin((phase + i) * 0.15) * waveAmp * (0.3 + tension * 0.7);
                return <circle key={i} cx={x} cy={y} r="1"
                  fill={themeColor(TH.accentHSL, 0.08 + tension * 0.08, 6)} />;
              })}
            </svg>
            <div {...hold.holdProps} style={{
              ...hold.holdProps.style,
              ...immersiveHoldPill(palette).base(tension),
            }}>
              <div style={immersiveHoldPill(palette).label}>
                {hold.completed ? 'tuned' : hold.isHolding ? 'listening\u2026' : 'hold to tune in'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Baseline oscillation. Every system in your body runs on rhythm {'\u2014'} 72bpm heart, 12 breaths per minute, 10Hz alpha brain waves. You just paused long enough to notice the orchestra already playing. The baseline hum is the sound of being alive.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Humming.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}