/**
 * PRISM #5 — The Blind Spot
 * "You cannot see what is right next to you. Trust the sensor."
 * ARCHETYPE: Pattern C (Draw) — Draw to reveal the hidden zone
 * ENTRY: Reverse Reveal — the insight comes first, then you experience it
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { PRISM_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDrawInteraction } from '../interactions/useDrawInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Practice');
type Stage = 'reveal' | 'active' | 'resonant' | 'afterglow';

export default function Prism_BlindSpot({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('reveal');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const draw = useDrawInteraction({
    coverageThreshold: 0.25, minStrokes: 1, gridRes: 8,
    onComplete: () => t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000),
  });

  useEffect(() => {
    t(() => setStage('active'), 3500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const c = draw.coverage;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'reveal' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The eye has a hole where the nerve connects. You are neurologically blind to your own biggest flaw. You require external feedback to perceive reality accurately.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>now feel it</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div {...draw.drawProps}
              style={{ ...draw.drawProps.style, width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.98, 0), border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 8)}` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180">
                {/* Eye outline */}
                <ellipse cx="110" cy="90" rx="80" ry="50" fill="none"
                  stroke={themeColor(TH.primaryHSL, 0.08, 10)} strokeWidth="0.5" />
                <circle cx="110" cy="90" r="25" fill="none"
                  stroke={themeColor(TH.primaryHSL, 0.06, 8)} strokeWidth="0.4" />
                {/* The blind spot — hidden zone revealed by drawing */}
                <motion.circle cx="155" cy="90" r={15 + c * 8}
                  fill={themeColor(TH.accentHSL, c * 0.12, 15)}
                  stroke={themeColor(TH.accentHSL, c * 0.1, 10)} strokeWidth="0.4" />
                {c > 0.15 && (
                  <motion.text x="155" y="93" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={themeColor(TH.accentHSL, 0.15, 15)} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    BLIND SPOT
                  </motion.text>
                )}
                {/* Draw strokes */}
                {draw.strokes.map((stroke, i) => (
                  <path key={i} d={stroke.points.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x * 220} ${p.y * 180}`).join(' ')}
                    fill="none" stroke={themeColor(TH.accentHSL, 0.12, 15)} strokeWidth="1.5" strokeLinecap="round" />
                ))}
                {draw.currentStroke.length > 1 && (
                  <path d={draw.currentStroke.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x * 220} ${p.y * 180}`).join(' ')}
                    fill="none" stroke={themeColor(TH.accentHSL, 0.18, 20)} strokeWidth="1.8" strokeLinecap="round" />
                )}
              </svg>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>draw to reveal</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Scotoma. We are neurologically incapable of seeing our own cognitive biases. The bias blind spot. You found it by searching: the same way you find yours; ask the mirror what they see.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Trust the sensor.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}