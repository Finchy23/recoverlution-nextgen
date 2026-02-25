/**
 * GRAVITON #1 — The Heavy Object
 * "Do not move. Sit heavy."
 * ARCHETYPE: Pattern E (Hold) — Hold still to accumulate mass
 * ENTRY: Cold Open — "MASS" appears, then spacetime grid warps
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldScene } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GRAVITON_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Stellar');
type Stage = 'cold' | 'active' | 'resonant' | 'afterglow';

export default function Graviton_HeavyObject({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('cold');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const hold = useHoldInteraction({
    maxDuration: 7000,
    onComplete: () => t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000),
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const h = hold.tension;
  const warp = h * 25;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'cold' && (
          <motion.div key="c" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{ fontSize: '28px', fontFamily: 'serif', letterSpacing: '0.25em', color: palette.text, textAlign: 'center' }}>
            MASS
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Frantic energy is light. Calm energy is heavy. To lead the room, you must be the heaviest thing in it. Drop your anchor.
            </div>
            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, ...immersiveHoldScene(palette, 200, 160, 'sm').base }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160">
                {/* Spacetime grid */}
                {Array.from({ length: 9 }, (_, i) => {
                  const x = 20 + i * 20;
                  const distFromCenter = Math.abs(x - 100) / 100;
                  const sag = warp * (1 - distFromCenter * distFromCenter);
                  return (
                    <motion.line key={`v-${i}`} x1={x} y1="20" x2={x} y2={100 + sag}
                      stroke={themeColor(TH.accentHSL, 0.06, 8)} strokeWidth="0.4"
                      initial={{ y2: 100 }}
                      animate={{ y2: 100 + sag }} transition={{ type: 'spring', stiffness: 40 }} />
                  );
                })}
                {Array.from({ length: 5 }, (_, i) => {
                  const y = 40 + i * 15;
                  return (
                    <motion.path key={`h-${i}`}
                      d={`M 20 ${y} Q 100 ${y + (i > 1 ? warp * 0.5 : 0)} 180 ${y}`}
                      fill="none" stroke={themeColor(TH.accentHSL, 0.06, 8)} strokeWidth="0.4"
                      initial={{ d: `M 20 ${y} Q 100 ${y + (i > 1 ? warp * 0.5 : 0)} 180 ${y}` }}
                      animate={{ d: `M 20 ${y} Q 100 ${y + (i > 1 ? warp * 0.5 : 0)} 180 ${y}` }} />
                  );
                })}
                {/* The mass — sphere dropping into grid */}
                <motion.circle cx="100" cy={60 + warp * 0.4} r={12 + h * 6}
                  fill={themeColor(TH.accentHSL, 0.2 + h * 0.2, 10)}
                  stroke={themeColor(TH.accentHSL, 0.1 + h * 0.1, 18)} strokeWidth="0.5"
                  initial={{ cy: 60, r: 12 }}
                  animate={{ cy: 60 + warp * 0.4, r: 12 + h * 6 }}
                  transition={{ type: 'spring', stiffness: 30 }} />
                <text x="100" y="145" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.accentHSL, 0.1 + h * 0.08, 12)} letterSpacing="0.1em">
                  {h > 0.9 ? 'ANCHORED' : h > 0.5 ? 'HEAVY' : 'LIGHT'}
                </text>
              </svg>
            </div>
            {!hold.completed && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
                {hold.isHolding ? 'accumulating mass...' : 'hold to sit heavy'}
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Social dominance through stillness. Low frequency, slow movement — these signal mass. You warped the space around you without moving. That is presence.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Sit heavy.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}