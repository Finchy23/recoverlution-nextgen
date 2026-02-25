/**
 * ASTRONAUT #5 -- The Sonic Boom (The Silence)
 * "Push through the noise. The quiet is on the other side."
 * ARCHETYPE: Pattern C (Hold) -- Hold through escalating visual noise → silence
 * ENTRY: Cold open -- building noise
 * STEALTH KBE: Deep breath after silence = Physiological Reset (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ASTRONAUT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'embodying', 'Stellar');
type Stage = 'arriving' | 'building' | 'silence' | 'resonant' | 'afterglow';

export default function Astronaut_SonicBoom({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    duration: 5000,
    onComplete: () => {
      console.log(`[KBE:E] SonicBoom physiologicalReset=confirmed contrastSensitivity=true`);
      setStage('silence');
      t(() => setStage('resonant'), 6000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    },
  });

  useEffect(() => { t(() => setStage('building'), 1800); return () => T.current.forEach(clearTimeout); }, []);

  const noiseIntensity = hold.progress;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="embodying" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div key={i} animate={{ height: [4, 4 + i, 4] }}
                transition={{ duration: 0.5 + i * 0.1, repeat: Infinity }}
                style={{ width: '3px', borderRadius: '1px',
                  background: themeColor(TH.primaryHSL, 0.06, 3) }} />
            ))}
          </motion.div>
        )}
        {stage === 'building' && (
          <motion.div key="bu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Hold through the noise. The silence is on the other side.
            </div>
            {/* Noise visualization -- gets more chaotic with progress */}
            <div style={{ width: '160px', height: '40px', display: 'flex', gap: '2px',
              alignItems: 'center', justifyContent: 'center' }}>
              {Array.from({ length: 16 }).map((_, i) => (
                <motion.div key={i}
                  animate={hold.isHolding ? {
                    height: [6, 6 + noiseIntensity * 30 * Math.sin(i + Date.now() / 200), 6],
                    opacity: [0.3, 0.3 + noiseIntensity * 0.4, 0.3],
                  } : { height: [6, 10, 6] }}
                  transition={{ duration: hold.isHolding ? 0.15 : 0.8, repeat: Infinity, delay: i * 0.02 }}
                  style={{ width: '3px', borderRadius: '1.5px',
                    background: themeColor(TH.accentHSL, 0.08 + noiseIntensity * 0.15, 4 + noiseIntensity * 8) }} />
              ))}
            </div>
            <div {...hold.holdProps}
              style={{ padding: '14px 32px', borderRadius: '9999px', cursor: 'pointer', userSelect: 'none',
                background: hold.isHolding
                  ? themeColor(TH.accentHSL, 0.06 + noiseIntensity * 0.06, 3 + noiseIntensity * 3)
                  : themeColor(TH.accentHSL, 0.06, 3),
                border: `2px solid ${themeColor(TH.accentHSL, hold.isHolding ? 0.12 + noiseIntensity * 0.08 : 0.08, 6)}`,
                transform: hold.isHolding ? `scale(${1 + noiseIntensity * 0.03})` : 'none' }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>
                {hold.isHolding
                  ? (noiseIntensity < 0.5 ? 'louder...' : noiseIntensity < 0.85 ? 'LOUDER...' : 'BREAKING...')
                  : 'Hold through'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'silence' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
            {/* Absolute stillness -- single breath prompt */}
            <div style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
              <motion.div animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 4, repeat: Infinity }}
                style={{ width: '1px', height: '1px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.15, 8) }} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1.5 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px',
                fontStyle: 'italic' }}>
              Silence. Breathe. You broke through. The quiet was always here -- on the other side of the noise.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Contrast sensitivity. The brain doesn{"'"}t register silence -- it registers the contrast between noise and silence. The sonic boom works by building intensity to a breaking point, then removing everything. The resulting silence triggers a parasympathetic cascade: heart rate drops, breathing deepens, the body resets. Push through the noise. The quiet is on the other side.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Silence.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}