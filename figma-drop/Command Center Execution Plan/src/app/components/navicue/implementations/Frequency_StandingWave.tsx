/**
 * FREQUENCY #5 — The Standing Wave
 * "Perfect stillness creates perfect resonance."
 * ARCHETYPE: Pattern E (Hold) — Hold perfectly still to create a standing wave
 * ENTRY: Reverse Reveal — starts with "the wave collapsed" then rewinds
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldPill } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { FREQUENCY_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'reveal' | 'active' | 'resonant' | 'afterglow';

export default function Frequency_StandingWave({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('reveal');
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
    t(() => setStage('active'), 2500);
    const ph = setInterval(() => setPhase(p => p + 1), 80);
    return () => { T.current.forEach(clearTimeout); clearInterval(ph); };
  }, []);

  const tension = hold.tension;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'reveal' && (
          <motion.div key="rev" initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 2.2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', opacity: 0.4 }}>the wave collapsed</div>
            <motion.div initial={{ opacity: 0.3 }} animate={{ opacity: 0 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>rebuilding{'\u2026'}</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Perfect stillness creates perfect resonance. A standing wave appears only when the forward and reflected waves are in exact phase. Hold. Be the node.
            </div>
            <svg width="240" height="60" style={{ overflow: 'visible' }}>
              {Array.from({ length: 80 }).map((_, i) => {
                const x = i * 3;
                const standingAmp = Math.sin(i * 0.15) * (10 + tension * 15);
                const oscillation = Math.cos(phase * 0.12) * standingAmp;
                const y = 30 + oscillation * (tension > 0.5 ? 1 : 0.3 + tension);
                return <circle key={i} cx={x} cy={y} r={tension > 0.8 ? 1.5 : 1}
                  fill={themeColor(TH.accentHSL, 0.06 + tension * 0.1, 6)} />;
              })}
              {/* Node markers */}
              {tension > 0.5 && [0, 40, 80, 120, 160, 200, 240].map(x => (
                <circle key={`n${x}`} cx={x} cy={30} r="2"
                  fill={themeColor(TH.accentHSL, tension * 0.15, 10)} />
              ))}
            </svg>
            <div {...hold.holdProps} style={{
              ...hold.holdProps.style,
              ...immersiveHoldPill(palette).base(tension),
            }}>
              <div style={immersiveHoldPill(palette).label}>
                {hold.completed ? 'standing' : hold.isHolding ? 'forming\u2026' : 'hold to create the wave'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Standing wave formation. Unlike traveling waves, standing waves appear to be still {'\u2014'} their energy is contained between nodes of perfect cancellation. This is what mastery looks like from the outside: effortless. But inside, two forces are in perfect, constant negotiation.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Still.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}