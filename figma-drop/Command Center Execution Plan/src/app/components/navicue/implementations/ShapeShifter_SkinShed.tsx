/**
 * SHAPESHIFTER #2 — The Skin Shed
 * "Outgrow. Shed. Begin again."
 * ARCHETYPE: Pattern B (Drag) — An iridescent shell/skin.
 * Drag upward to peel it away. Underneath is a luminous new surface.
 * Psychological Flexibility — releasing outdated identity.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SHAPESHIFTER_THEME, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Practice');
const TH = SHAPESHIFTER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function ShapeShifter_SkinShed({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  const drag = useDragInteraction({
    axis: 'y', sticky: true,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const t = drag.progress;
  const shed = t > 0.8;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something is outgrowing its shape...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The snake does not mourn its old skin. It was never the skin. It was always the thing beneath. Outgrow. Shed. Begin again.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag upward to shed</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '180px', height: '220px', borderRadius: radius.md, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.95, 1) }}>

              {/* New surface beneath — luminous, revealed as skin peels */}
              <motion.div
                animate={{ opacity: t }}
                style={{ position: 'absolute', inset: 0 }}>
                <svg width="100%" height="100%" viewBox="0 0 180 220">
                  {/* Inner glow */}
                  <defs>
                    <radialGradient id={`${svgId}-innerGlow`}>
                      <stop offset="0%" stopColor={themeColor(TH.accentHSL, 0.08, 20)} />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>
                  <ellipse cx="90" cy="110" rx="60" ry="80" fill={`url(#${svgId}-innerGlow)`} />
                  {/* New form — clean geometric lines */}
                  <ellipse cx="90" cy="110" rx="35" ry="50" fill="none"
                    stroke={themeColor(TH.accentHSL, 0.15, 18)} strokeWidth="0.5" />
                  <ellipse cx="90" cy="110" rx="25" ry="38" fill="none"
                    stroke={themeColor(TH.accentHSL, 0.1, 15)} strokeWidth="0.3" />
                  {/* Pulse rings */}
                  <motion.ellipse cx="90" cy="110" rx="45" ry="60"
                    fill="none" stroke={themeColor(TH.accentHSL, 0.04, 12)} strokeWidth="0.3"
                    animate={{ rx: [45, 55], ry: [60, 75], opacity: [0.04, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }} />
                  {shed && (
                    <motion.text x="90" y="180" textAnchor="middle" fontSize="11" fontFamily="serif" fontStyle="italic"
                      fill={themeColor(TH.accentHSL, 0.25, 18)}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      luminous
                    </motion.text>
                  )}
                </svg>
              </motion.div>

              {/* Old skin — peels away with drag */}
              <motion.div
                animate={{ y: -t * 220, opacity: 1 - t * 0.7 }}
                style={{ position: 'absolute', inset: 0 }}>
                <svg width="100%" height="100%" viewBox="0 0 180 220">
                  {/* Cracked, dull surface */}
                  <rect x="0" y="0" width="180" height="220" fill={themeColor(TH.primaryHSL, 0.06, 3)} />
                  {/* Cracks that widen with drag */}
                  {[
                    'M 40 0 Q 45 50 35 100 Q 40 150 50 220',
                    'M 100 0 Q 95 60 105 120 Q 100 180 90 220',
                    'M 140 0 Q 145 40 135 90 Q 140 140 150 220',
                    'M 0 80 Q 45 75 90 85 Q 135 78 180 82',
                    'M 0 150 Q 50 145 90 155 Q 130 148 180 152',
                  ].map((d, i) => (
                    <path key={i} d={d} fill="none"
                      stroke={themeColor(TH.accentHSL, 0.03 + t * 0.06, 10)}
                      strokeWidth={0.3 + t * 0.5} />
                  ))}
                  {/* Iridescent patches — the old beauty */}
                  <circle cx="60" cy="60" r="20" fill={themeColor(TH.accentHSL, 0.02, 8)} />
                  <circle cx="120" cy="140" r="15" fill={themeColor(TH.accentHSL, 0.015, 6)} />
                  {/* "OLD SKIN" label */}
                  <text x="90" y="115" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={themeColor(TH.primaryHSL, 0.06 * (1 - t), 8)} letterSpacing="0.15em">
                    OLD SELF
                  </text>
                </svg>
              </motion.div>

              {/* Peel edge — visible during drag */}
              {t > 0.05 && t < 0.85 && (
                <motion.div
                  animate={{ top: `${(1 - t) * 100}%` }}
                  style={{ position: 'absolute', left: 0, right: 0, height: '3px',
                    background: `linear-gradient(90deg, transparent, ${themeColor(TH.accentHSL, 0.1, 15)}, transparent)` }} />
              )}
            </div>

            {/* Progress */}
            <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em',
              color: themeColor(TH.accentHSL, 0.12 + t * 0.15, 10) }}>
              {shed ? 'SHED COMPLETE' : `SHEDDING ${Math.round(t * 100)}%`}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The old skin served you. Now it{'\u2019'}s too small. The discomfort of outgrowing is not a problem. It{'\u2019'}s a signal.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>growth requires shedding</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>Begin again.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}