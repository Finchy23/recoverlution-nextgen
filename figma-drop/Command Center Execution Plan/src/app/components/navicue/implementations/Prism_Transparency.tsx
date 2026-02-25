/**
 * PRISM #2 — Transparency Mode
 * "Be glass, not stone."
 * ARCHETYPE: Pattern E (Hold) — Hold to become transparent
 * ENTRY: Scene First — the wall is already there, instructions emerge over it
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldScene } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { PRISM_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Practice');
type Stage = 'scene' | 'active' | 'resonant' | 'afterglow';

export default function Prism_Transparency({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
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
  const wallOpacity = 0.85 - h * 0.8;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {(stage === 'scene' || stage === 'active') && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            {/* The wall/window visual — always present */}
            <div {...(stage === 'active' ? hold.holdProps : {})}
              style={{ ...(stage === 'active' ? hold.holdProps.style : {}), ...immersiveHoldScene(palette, 200, 160, 'sm').base }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160">
                {/* Arrow approaching */}
                <motion.line x1={10 + h * 80} y1="80" x2={30 + h * 80} y2="80"
                  stroke={themeColor(TH.accentHSL, 0.15, 15)} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                <defs><marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                  <path d="M 0 0 L 6 2 L 0 4 Z" fill={themeColor(TH.accentHSL, 0.15, 15)} />
                </marker></defs>
                {/* The wall — becomes glass */}
                <motion.rect x="90" y="10" width="8" height="140" rx="2"
                  animate={{ fill: `hsla(${TH.primaryHSL[0]}, ${TH.primaryHSL[1]}%, ${TH.primaryHSL[2] + h * 15}%, ${wallOpacity})` }}
                  stroke={themeColor(TH.primaryHSL, 0.08, 10)} strokeWidth="0.4" />
                {/* Arrow passing through (appears at high h) */}
                {h > 0.5 && (
                  <motion.line x1="100" y1="80" x2={100 + (h - 0.5) * 180} y2="80"
                    stroke={themeColor(TH.accentHSL, (h - 0.5) * 0.2, 15)} strokeWidth="1"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                )}
                {/* Glass shimmer lines */}
                {h > 0.3 && Array.from({ length: 4 }, (_, i) => (
                  <motion.line key={i} x1="92" y1={25 + i * 32} x2="96" y2={30 + i * 32}
                    stroke={themeColor(TH.accentHSL, h * 0.08, 20)} strokeWidth="0.3"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                ))}
              </svg>
            </div>
            {/* Text fades in over scene */}
            <motion.div animate={{ opacity: stage === 'active' ? 1 : 0.5 }} transition={{ duration: 1.2 }}
              style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ ...navicueType.prompt, color: palette.text }}>
                If you are a wall, the arrow hits you. If you are the sky, the arrow passes through. Do not resist the insult. Be transparent.
              </div>
              {stage === 'active' && !hold.completed && (
                <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>
                  {hold.isHolding ? 'becoming glass...' : 'hold to become transparent'}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Radical non-resistance. The stressor passed through because there was nothing to hit. Psychological flexibility means observing without hooking: the arrow traverses you without lodging.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Be glass.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}