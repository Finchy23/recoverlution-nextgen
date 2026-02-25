/**
 * GRAVITON #3 — The Binary Star
 * "Find your equal. Do not orbit. Dance."
 * ARCHETYPE: Pattern C (Draw) — Draw the orbit connecting two equal masses
 * ENTRY: Reverse Reveal — the truth first, then the dance
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GRAVITON_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDrawInteraction } from '../interactions/useDrawInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Stellar');
type Stage = 'reveal' | 'active' | 'resonant' | 'afterglow';

export default function Graviton_BinaryStar({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('reveal');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const draw = useDrawInteraction({
    coverageThreshold: 0.2, minStrokes: 1, gridRes: 8,
    onComplete: () => t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000),
  });

  useEffect(() => {
    t(() => setStage('active'), 3500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const c = draw.coverage;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'reveal' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            If they are too small, they become your satellite. If they are too big, you become theirs. Find the one with equal mass. Spin together.
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div {...draw.drawProps}
              style={{ ...draw.drawProps.style, width: '220px', height: '200px', borderRadius: radius.md, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.98, 0), border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 6)}` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 200">
                {/* Star A */}
                <motion.circle cx="75" cy="100" r="15"
                  fill={themeColor(TH.accentHSL, 0.15 + c * 0.1, 12)}
                  initial={{ cx: 75, cy: 100 }}
                  animate={{ cx: [75, 78, 75], cy: [100, 97, 100] }}
                  transition={{ duration: 4, repeat: Infinity }} />
                {/* Star B */}
                <motion.circle cx="145" cy="100" r="15"
                  fill={themeColor(TH.accentHSL, 0.15 + c * 0.1, 12)}
                  initial={{ cx: 145, cy: 100 }}
                  animate={{ cx: [145, 142, 145], cy: [100, 103, 100] }}
                  transition={{ duration: 4, repeat: Infinity }} />
                {/* Barycenter */}
                <circle cx="110" cy="100" r="2" fill={themeColor(TH.accentHSL, 0.08, 15)} />
                {/* Orbit path — revealed by drawing */}
                {c > 0.05 && (
                  <motion.ellipse cx="110" cy="100" rx="55" ry="30" fill="none"
                    stroke={themeColor(TH.accentHSL, c * 0.12, 15)} strokeWidth="0.5" strokeDasharray="3 2"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                )}
                {/* User strokes */}
                {draw.strokes.map((s, i) => (
                  <path key={i} d={s.points.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x * 220} ${p.y * 200}`).join(' ')}
                    fill="none" stroke={themeColor(TH.accentHSL, 0.12, 15)} strokeWidth="1.5" strokeLinecap="round" />
                ))}
                {draw.currentStroke.length > 1 && (
                  <path d={draw.currentStroke.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x * 220} ${p.y * 200}`).join(' ')}
                    fill="none" stroke={themeColor(TH.accentHSL, 0.18, 20)} strokeWidth="1.8" strokeLinecap="round" />
                )}
              </svg>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>draw the dance</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Assortative partnership. Relationships are most stable when partners have equivalent mass — creating a balanced dynamic, not a dependency. Neither orbits. Both dance.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Equal mass.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}