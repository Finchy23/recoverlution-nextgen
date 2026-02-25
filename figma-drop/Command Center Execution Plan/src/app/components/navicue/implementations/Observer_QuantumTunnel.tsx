/**
 * OBSERVER #4 — The Quantum Tunnel
 * "The barrier is not 100% solid."
 * ARCHETYPE: Pattern E (Hold) — Hold to tunnel through the wall
 * ENTRY: Cold Open — a solid wall appears, then you walk through it
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { OBSERVER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
type Stage = 'cold' | 'active' | 'resonant' | 'afterglow';

export default function Observer_QuantumTunnel({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('cold');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const hold = useHoldInteraction({
    maxDuration: 5000,
    onComplete: () => t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500),
  });

  useEffect(() => {
    t(() => setStage('active'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const h = hold.tension;
  const wallOpacity = 0.3 - h * 0.25;
  const particleX = 30 + h * 140; // particle moves through wall

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'cold' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
            style={{ width: '8px', height: '120px', background: themeColor(TH.primaryHSL, 0.3, 10), borderRadius: '2px' }} />
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              In the quantum world, there is a non-zero chance you appear on the other side without climbing. The barrier is not 100% solid. Take the leap.
            </div>
            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, width: '200px', height: '100px', borderRadius: radius.sm, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.98, 0) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 100">
                {/* Wall */}
                <motion.rect x="90" y="10" width="20" height="80" rx="2"
                  fill={themeColor(TH.primaryHSL, wallOpacity, 10)}
                  animate={{ opacity: Math.max(0.05, wallOpacity) }}
                  transition={{ duration: 0.3 }} />
                {/* Particle */}
                <motion.circle cx={particleX} cy="50" r="8"
                  fill={themeColor(TH.accentHSL, 0.2 + h * 0.2, 15)}
                  initial={{ cx: particleX }}
                  animate={{ cx: particleX }} transition={{ type: 'spring', stiffness: 40 }} />
                {/* Probability cloud through wall */}
                {h > 0.3 && h < 0.7 && (
                  <motion.ellipse cx="100" cy="50" rx="15" ry="8"
                    fill={themeColor(TH.accentHSL, (h - 0.3) * 0.08, 15)}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                )}
                {/* Labels */}
                <text x="50" y="95" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.06, 8)}>BEFORE</text>
                <text x="150" y="95" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.accentHSL, h > 0.5 ? 0.1 : 0.04, 12)}>AFTER</text>
              </svg>
            </div>
            {!hold.completed && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
                {hold.isHolding ? 'tunneling...' : 'hold to pass through'}
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Quantum tunneling. The particle passed through a barrier it theoretically could not surmount. The wall was never 100% solid. Neither are yours.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Through the wall.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}