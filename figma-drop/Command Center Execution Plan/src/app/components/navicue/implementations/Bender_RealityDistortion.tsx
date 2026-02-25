/**
 * BENDER #1 — The Reality Distortion
 * "Everything you call 'life' was made up by people no smarter than you."
 * ARCHETYPE: Pattern B (Drag) — Drag horizontally to warp screen edges.
 * The further you drag, the more the rigid grid distorts into liquid.
 * Mercury palette. Warped glass.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BENDER_THEME, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Practice');
const TH = BENDER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Bender_RealityDistortion({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const drag = useDragInteraction({
    axis: 'x', sticky: true,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 3500);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const t = drag.progress;
  const warp = t * 12; // SVG distortion amount

  const svgId = useId();

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The walls are softening...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Everything you call "life" was made up by people no smarter than you. You can change it. You can mold it. The walls are not solid. Push.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag across to warp reality</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '300px' }}>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '240px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 240 180" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <filter id={`${svgId}-bendWarp`}>
                    <feTurbulence type="turbulence" baseFrequency={0.01 + t * 0.03} numOctaves="2" result="turb" seed="3" />
                    <feDisplacementMap in="SourceGraphic" in2="turb" scale={warp} />
                  </filter>
                </defs>

                {/* Rigid grid — warps with drag */}
                <g filter={t > 0.05 ? `url(#${svgId}-bendWarp)` : undefined}>
                  {/* Vertical lines */}
                  {Array.from({ length: 9 }, (_, i) => (
                    <line key={`v-${i}`} x1={27 + i * 24} y1="10" x2={27 + i * 24} y2="170"
                      stroke={themeColor(TH.primaryHSL, 0.04 + t * 0.03, 10)}
                      strokeWidth={0.4 + t * 0.2} />
                  ))}
                  {/* Horizontal lines */}
                  {Array.from({ length: 7 }, (_, i) => (
                    <line key={`h-${i}`} x1="10" y1={20 + i * 22} x2="230" y2={20 + i * 22}
                      stroke={themeColor(TH.primaryHSL, 0.04 + t * 0.03, 10)}
                      strokeWidth={0.4 + t * 0.2} />
                  ))}
                  {/* Institutional labels — dissolve */}
                  {t < 0.7 && (
                    <>
                      <text x="60" y="50" fontSize="4" fontFamily="monospace" fill={themeColor(TH.primaryHSL, 0.06 * (1 - t), 15)}>RULE</text>
                      <text x="140" y="50" fontSize="4" fontFamily="monospace" fill={themeColor(TH.primaryHSL, 0.06 * (1 - t), 15)}>NORM</text>
                      <text x="60" y="100" fontSize="4" fontFamily="monospace" fill={themeColor(TH.primaryHSL, 0.06 * (1 - t), 15)}>LAW</text>
                      <text x="140" y="100" fontSize="4" fontFamily="monospace" fill={themeColor(TH.primaryHSL, 0.06 * (1 - t), 15)}>LIMIT</text>
                      <text x="100" y="140" fontSize="4" fontFamily="monospace" fill={themeColor(TH.primaryHSL, 0.06 * (1 - t), 15)}>FIXED</text>
                    </>
                  )}
                </g>

                {/* Mercury liquid overlay — emerges with warp */}
                {t > 0.3 && (
                  <motion.ellipse cx={120} cy={90} rx={40 + t * 40} ry={20 + t * 30}
                    fill={themeColor(TH.primaryHSL, t * 0.04, 20)}
                    initial={{ opacity: 0 }} animate={{ opacity: t * 0.04 }}
                  />
                )}

                {/* "PLASTIC" text emerges at high warp */}
                {t > 0.8 && (
                  <motion.text x="120" y="95" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold"
                    fill={themeColor(TH.accentHSL, 0.14)} letterSpacing="3"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.14 }}
                    transition={{ duration: 1.5 }}>
                    PLASTIC
                  </motion.text>
                )}

                {/* Drag indicator */}
                <rect x="10" y="172" width="220" height="3" rx="1.5"
                  fill={themeColor(TH.primaryHSL, 0.03)} />
                <motion.rect x="10" y="172" width={220 * t} height="3" rx="1.5"
                  fill={themeColor(TH.accentHSL, 0.08 + t * 0.06)}
                  initial={{ width: 0 }}
                  animate={{ width: 220 * t }}
                  transition={{ type: 'spring', stiffness: 40 }} />
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {t < 0.1 ? 'A rigid grid. Rules, norms, laws, limits. Drag to push.' : t < 0.5 ? 'The grid ripples. The walls are softening.' : t < 0.95 ? 'Liquid glass. The labels are dissolving.' : 'PLASTIC. The world bends to your hand.'}
              </div>
            </div>
            {/* Progress bar as mercury drops */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: t >= threshold ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You dragged and the grid dissolved. Rules, norms, laws, limits: each label rippled into liquid. The rigid became plastic. Everything you call "life" was made up by people no smarter than you. The walls were never solid. You just pushed.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Social constructionism. Understanding that social "rules" are constructed, not physics, reduces inhibition and increases creative agency. The world is plastic. Mold it.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Grid. Push. Plastic.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}