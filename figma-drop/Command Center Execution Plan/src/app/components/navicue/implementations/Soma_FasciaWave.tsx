/**
 * SOMA #6 — The Fascia Wave
 * "The slow wave moves through you. Let it."
 * ARCHETYPE: Pattern E (Hold) — Hold and feel the slow wave through connective tissue
 * ENTRY: Ambient Fade — a ripple slowly emerges from the dark
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SOMA_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'ambient' | 'active' | 'resonant' | 'afterglow';

export default function Soma_FasciaWave({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const [wavePhase, setWavePhase] = useState(0);
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
    const wave = setInterval(() => setWavePhase(p => p + 1), 3000);
    return () => { T.current.forEach(clearTimeout); clearInterval(wave); };
  }, []);

  const tension = hold.tension;
  const waveY = Math.sin(wavePhase * 0.5) * 20;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ opacity: [0.02, 0.05, 0.02] }} transition={{ duration: 4, repeat: Infinity }}
              style={{ width: '180px', height: '2px', background: themeColor(TH.accentHSL, 0.06, 5) }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1.8 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>a wave forms</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The slow wave moves through you. Let it. Fascia transmits force at 10cm per second. Hold still and feel it propagate from one end to the other.
            </div>
            <svg width="220" height="60" style={{ overflow: 'visible' }}>
              <motion.path
                d={`M 10 ${30 + waveY * (1 - tension * 0.5)} Q 60 ${30 - waveY} 110 ${30 + waveY * tension} T 210 ${30 - waveY * 0.5}`}
                fill="none"
                stroke={themeColor(TH.accentHSL, 0.08 + tension * 0.1, 6)}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <div {...hold.holdProps} style={{
              ...hold.holdProps.style,
              padding: '14px 28px', borderRadius: radius.full,
              background: themeColor(TH.primaryHSL, 0.05 + tension * 0.05, 4),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06 + tension * 0.06, 5)}`,
            }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>
                {hold.completed ? 'transmitted' : hold.isHolding ? 'propagating\u2026' : 'hold to feel the wave'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Fascial continuity. Your connective tissue is one continuous web: shoulder to hip to ankle. A restriction in your foot changes your jaw. The wave you felt isn{'\u2019'}t metaphor. It{'\u2019'}s mechanical signal transmission through collagen fibers.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Connected.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}