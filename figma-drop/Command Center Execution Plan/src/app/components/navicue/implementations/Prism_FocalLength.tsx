/**
 * PRISM #6 — The Focal Length
 * "Blur the noise."
 * ARCHETYPE: Pattern B (Drag) — Twist lens to shift focus, background blurs
 * ENTRY: Ambient Fade — everything materializes simultaneously
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { PRISM_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Practice');
type Stage = 'ambient' | 'resonant' | 'afterglow';

export default function Prism_FocalLength({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const drag = useDragInteraction({
    axis: 'x', sticky: true,
    onComplete: () => t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000),
  });

  useEffect(() => () => T.current.forEach(clearTimeout), []);
  const d = drag.progress;
  const bgBlur = d * 6;
  const fgSharp = 0.3 + d * 0.7;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="amb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You cannot see everything clearly at once. Decide what is subject and what is background. Blur the noise.
            </div>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, width: '220px', height: '130px', borderRadius: radius.sm, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.98, 0), position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 130">
                {/* Background shapes — blur with focus */}
                <g style={{ filter: `blur(${bgBlur}px)` }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <circle key={i} cx={30 + i * 45} cy={30 + (i % 3) * 25} r={8 + i * 2}
                      fill={themeColor(TH.primaryHSL, 0.06 * (1 - d * 0.6), 8)} />
                  ))}
                </g>
                {/* Foreground subject — sharpens */}
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: fgSharp }}>
                  <circle cx="110" cy="75" r="20"
                    fill={themeColor(TH.accentHSL, 0.15 + d * 0.15, 12)}
                    stroke={themeColor(TH.accentHSL, 0.12 + d * 0.1, 18)} strokeWidth="0.5" />
                  <text x="110" y="78" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={themeColor(TH.accentHSL, 0.2 + d * 0.2, 20)} letterSpacing="0.08em">
                    SUBJECT
                  </text>
                </motion.g>
                {/* Lens ring */}
                <circle cx="110" cy="75" r={35 + d * 5} fill="none"
                  stroke={themeColor(TH.primaryHSL, 0.06 + d * 0.04, 10)} strokeWidth="0.4" strokeDasharray="3 2" />
              </svg>
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: themeColor(TH.accentHSL, 0.1 + d * 0.1, 12), letterSpacing: '0.1em' }}>
              {d > 0.9 ? 'FOCUSED' : `f/${(1.4 + d * 14).toFixed(0)}`}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Selective attention. The brain{'\u2019'}s capacity is limited. Consciously treating background stressors as noise frees processing power for what matters. Subject and background. You chose.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Blur the noise.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}