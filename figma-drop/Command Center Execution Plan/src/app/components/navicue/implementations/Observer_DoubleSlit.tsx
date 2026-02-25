/**
 * OBSERVER #9 — The Double Slit
 * "Who is watching?"
 * ARCHETYPE: Pattern B (Drag) — Drag to shift between wave and particle
 * ENTRY: Instruction as Poetry — the question IS the experiment
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { OBSERVER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
type Stage = 'present' | 'active' | 'resonant' | 'afterglow';

export default function Observer_DoubleSlit({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('present');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const drag = useDragInteraction({
    axis: 'x', sticky: true,
    onComplete: () => t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000),
  });

  useEffect(() => {
    t(() => setStage('active'), 2500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const d = drag.progress;
  const wave = 1 - d;  // wave pattern
  const particle = d;  // particle pattern

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Are you a particle, rigid, separate? Or a wave, fluid, connected? It depends on the audience. Choose your form.
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, width: '220px', height: '130px', borderRadius: radius.sm, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.98, 0) }}>
              <svg width="100%" height="100%" viewBox="0 0 220 130">
                {/* Double slit wall */}
                <rect x="70" y="5" width="6" height="45" fill={themeColor(TH.primaryHSL, 0.1, 8)} />
                <rect x="70" y="55" width="6" height="20" fill={themeColor(TH.primaryHSL, 0.1, 8)} />
                <rect x="70" y="80" width="6" height="45" fill={themeColor(TH.primaryHSL, 0.1, 8)} />
                {/* Wave pattern (left of drag = wave) */}
                {Array.from({ length: 7 }, (_, i) => (
                  <motion.rect key={`w-${i}`} x={130 + i * 12} y="10" width="3" height="110" rx="1"
                    fill={themeColor(TH.accentHSL, wave * 0.1 * (i % 2 === 0 ? 1 : 0.4), 15)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: wave * (i % 2 === 0 ? 0.15 : 0.05) }} />
                ))}
                {/* Particle pattern (right of drag = dots) */}
                {Array.from({ length: 8 }, (_, i) => (
                  <motion.circle key={`p-${i}`}
                    cx={140 + (i % 2) * 8} cy={20 + i * 12} r={2}
                    fill={themeColor(TH.accentHSL, particle * 0.2, 18)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: particle * 0.25 }} />
                ))}
                {/* Source */}
                <circle cx="30" cy="65" r="5" fill={themeColor(TH.accentHSL, 0.12, 12)} />
                {/* Labels */}
                <text x="30" y="120" fontSize="11" fontFamily="monospace" textAnchor="middle"
                  fill={themeColor(TH.accentHSL, 0.08, 10)}>SOURCE</text>
                <text x="170" y="120" fontSize="11" fontFamily="monospace" textAnchor="middle"
                  fill={themeColor(TH.accentHSL, 0.08, 10)}>
                  {d > 0.7 ? 'PARTICLE' : d > 0.3 ? 'SHIFTING' : 'WAVE'}
                </text>
              </svg>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Wave-particle duality. You can be solid: boundaries, edges, definition. Or fluid: connection, flow, possibility. The choice depends on context and audience. Who is watching?
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Choose your form.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}