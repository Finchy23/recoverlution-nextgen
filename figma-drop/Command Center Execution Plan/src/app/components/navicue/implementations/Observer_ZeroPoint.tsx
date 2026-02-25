/**
 * OBSERVER #8 — The Zero Point
 * "The vacuum is not empty. It is full."
 * ARCHETYPE: Pattern E (Hold) — Hold in the void to feel the energy
 * ENTRY: Scene First — empty space already humming
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { OBSERVER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
type Stage = 'scene' | 'resonant' | 'afterglow';

export default function Observer_ZeroPoint({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [textIn, setTextIn] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const hold = useHoldInteraction({
    maxDuration: 6000,
    onComplete: () => t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500),
  });

  useEffect(() => {
    t(() => setTextIn(true), 1200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const h = hold.tension;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, width: '180px', height: '180px', borderRadius: '50%', overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.98, 0), position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 180 180">
                {/* Quantum fluctuations — always present, intensify with hold */}
                {Array.from({ length: 12 + Math.floor(h * 12) }, (_, i) => {
                  const x = 20 + (i * 23) % 140;
                  const y = 20 + (i * 31 + 7) % 140;
                  return (
                    <motion.circle key={i} cx={x} cy={y} r={0.5 + h * 1.5}
                      fill={themeColor(TH.accentHSL, 0.02 + h * 0.06, 15)}
                      initial={{ cx: x, cy: y, opacity: 0.12 }}
                      animate={{ cx: [x, x + 3, x - 2, x], cy: [y, y - 2, y + 3, y], opacity: [0.02, 0.06 + h * 0.06, 0.02] }}
                      transition={{ duration: 1.5 + i * 0.1, repeat: Infinity, delay: i * 0.08 }} />
                  );
                })}
                {/* Field energy glow */}
                <motion.circle cx="90" cy="90" r={20 + h * 40}
                  fill={themeColor(TH.accentHSL, h * 0.04, 12)} />
                {/* Center label */}
                <text x="90" y="93" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.accentHSL, 0.06 + h * 0.1, 15)} letterSpacing="0.1em">
                  {h > 0.8 ? 'FULL' : h > 0.4 ? 'TEEMING' : 'EMPTY?'}
                </text>
              </svg>
            </div>
            <motion.div animate={{ opacity: textIn ? 1 : 0 }} transition={{ duration: 1 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Even in the absolute void, there is infinite energy. When you feel empty, you are just disconnected from the field. Tap back in.
            </motion.div>
            {!hold.completed && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
                {hold.isHolding ? 'tapping in...' : 'hold to feel the field'}
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Zero-point energy. The vacuum state is teeming with fluctuations and potential. What felt empty was full all along. You reconnected to the field.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>The void is full.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}