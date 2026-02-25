/**
 * GRAVITON #7 — The Center of Mass
 * "The chaos is on the edge. The calm is in the center."
 * ARCHETYPE: Pattern C (Draw) — Draw to find the barycenter
 * ENTRY: Reverse Reveal — the answer first, then find it
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GRAVITON_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDrawInteraction } from '../interactions/useDrawInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Stellar');
type Stage = 'reveal' | 'active' | 'resonant' | 'afterglow';

export default function Graviton_CenterOfMass({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('reveal');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const draw = useDrawInteraction({
    coverageThreshold: 0.2, minStrokes: 1, gridRes: 8,
    onComplete: () => t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000),
  });

  useEffect(() => {
    t(() => setStage('active'), 3200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const c = draw.coverage;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'reveal' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Do not live on the rim of the wheel. Live at the hub. The chaos is on the edge. The calm is in the center. Find the barycenter.
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div {...draw.drawProps}
              style={{ ...draw.drawProps.style, width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.98, 0), border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 6)}` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200">
                {/* Spinning irregular shape */}
                <motion.g style={{ transformOrigin: '100px 100px' }}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                  <polygon points="100,30 140,50 170,100 140,160 80,170 40,130 30,80 60,40"
                    fill="none" stroke={themeColor(TH.primaryHSL, 0.06, 8)} strokeWidth="0.5" />
                </motion.g>
                {/* Center point — revealed by drawing */}
                <motion.circle cx="100" cy="100" r={3 + c * 8}
                  fill={themeColor(TH.accentHSL, 0.05 + c * 0.15, 15)}
                  stroke={themeColor(TH.accentHSL, c * 0.12, 18)} strokeWidth="0.5" />
                {c > 0.1 && (
                  <motion.text x="100" y="104" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={themeColor(TH.accentHSL, 0.15, 15)} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    CENTER
                  </motion.text>
                )}
                {/* User strokes */}
                {draw.strokes.map((s, i) => (
                  <path key={i} d={s.points.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x * 200} ${p.y * 200}`).join(' ')}
                    fill="none" stroke={themeColor(TH.accentHSL, 0.12, 15)} strokeWidth="1.5" strokeLinecap="round" />
                ))}
                {draw.currentStroke.length > 1 && (
                  <path d={draw.currentStroke.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x * 200} ${p.y * 200}`).join(' ')}
                    fill="none" stroke={themeColor(TH.accentHSL, 0.18, 20)} strokeWidth="1.8" strokeLinecap="round" />
                )}
              </svg>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Centering. Moving attention from periphery to center — from sensory chaos to interoception and breath — reduces the angular momentum of stress. You found the hub.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>The hub.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}