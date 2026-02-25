/**
 * SHAMAN #6 — The Shadow Walk
 * "To find the light, you must first walk through the dark. Do not run. Walk."
 * ARCHETYPE: Pattern B (Drag) — A path from darkness to light.
 * Drag horizontally. Left = deep shadow. Right = dawn light. The transition is gradual.
 * Shadow integration. Walking through, not around.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { SHAMAN_THEME, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Ember');
const TH = SHAMAN_THEME;

export default function Shaman_ShadowWalk({ onComplete }: NaviCueProps) {
  const { stage, setStage, addTimer } = useNaviCueStages();
  const svgId = useId();
  const drag = useDragInteraction({
    axis: 'x', sticky: true,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    },
  });

  const t = drag.progress;
  const walkerX = 25 + t * 160;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Darkness ahead...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>To find the light, you must first walk through the dark. Do not run. Walk. The shadow is not the enemy. It is the path.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag right, walk through the shadow toward the light</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '300px' }}>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '220px', height: '120px', borderRadius: radius.md, overflow: 'hidden' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 120" style={{ position: 'absolute', inset: 0 }}>
                {/* Gradient background — dark to light */}
                <defs>
                  <linearGradient id={`${svgId}-shadowGrad`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={`hsla(28, 12%, 3%, 0.95)`} />
                    <stop offset="30%" stopColor={`hsla(28, 12%, 5%, 0.9)`} />
                    <stop offset="60%" stopColor={`hsla(28, 18%, 10%, 0.7)`} />
                    <stop offset="85%" stopColor={`hsla(35, 22%, 18%, 0.5)`} />
                    <stop offset="100%" stopColor={`hsla(40, 25%, 28%, 0.3)`} />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="220" height="120" fill={`url(#${svgId}-shadowGrad)`} />

                {/* Path */}
                <line x1="15" y1="85" x2="205" y2="85"
                  stroke={themeColor(TH.primaryHSL, 0.04 + t * 0.02, 8)} strokeWidth="0.5" />

                {/* Shadow figures in the dark portion */}
                {t < 0.7 && [30, 55, 80].map((sx, i) => (
                  <motion.g key={`shadow-${i}`} initial={{ opacity: 0.04 }} animate={{ opacity: Math.max(0, 0.04 - t * 0.04) }}>
                    <circle cx={sx} cy={65} r="5"
                      fill={`hsla(28, 8%, 8%, ${0.04 - t * 0.03})`} />
                    <rect x={sx - 3} y={70} width="6" height="14" rx="1"
                      fill={`hsla(28, 8%, 6%, ${0.03 - t * 0.02})`} />
                  </motion.g>
                ))}

                {/* Dawn light on the right */}
                <motion.ellipse cx="200" cy="45" rx={30 + t * 20} ry={25 + t * 15}
                  fill={`hsla(40, 25%, 30%, ${0.02 + t * 0.03})`}
                />

                {/* Trees/obstacles along the path */}
                {[50, 90, 130, 170].map((tx, i) => (
                  <line key={`tree-${i}`} x1={tx} y1="85" x2={tx + (i % 2 ? 3 : -3)} y2={60 - i * 3}
                    stroke={themeColor(TH.primaryHSL, 0.03 + (tx < walkerX ? t * 0.01 : 0), 6)}
                    strokeWidth="0.5" />
                ))}

                {/* Walker figure */}
                <motion.g initial={{ x: 0 }} animate={{ x: walkerX - 25 }} transition={{ type: 'spring', stiffness: 25 }}>
                  <circle cx="25" cy="72" r="4"
                    fill={themeColor(TH.accentHSL, 0.08 + t * 0.06, 15 + t * 8)} />
                  <rect x="22.5" y="76" width="5" height="9" rx="1"
                    fill={themeColor(TH.accentHSL, 0.06 + t * 0.05, 12 + t * 6)} />
                  {/* Footsteps behind */}
                  {t > 0.1 && Array.from({ length: Math.floor(t * 6) }, (_, i) => (
                    <circle key={`step-${i}`}
                      cx={25 - (i + 1) * 12} cy="87" r="1"
                      fill={themeColor(TH.primaryHSL, 0.02 - i * 0.003, 6)}
                    />
                  ))}
                </motion.g>

                <text x="110" y="110" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.04 + t * 0.05, 12 + t * 8)}>
                  {t >= 0.95 ? 'THROUGH. the light was worth the walk' : `${t < 0.3 ? 'deep shadow' : t < 0.6 ? 'twilight' : 'approaching dawn'}`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {t < 0.1 ? 'A figure at the edge of darkness. The path stretches right.' : t < 0.4 ? 'Walking through shadow. Shapes in the dark. Keep moving.' : t < 0.7 ? 'Twilight zone. The shadows thin. Light ahead.' : t < 0.95 ? 'Almost through. Dawn breaking.' : 'Through. The light was worth the walk.'}
              </div>
            </div>
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
            <div style={{ ...navicueType.prompt, color: palette.text }}>You walked. Not ran. Through deep shadow, past shapes in the dark, through twilight, into dawn. The shadow was not the enemy. It was the path. To find the light, you must first walk through the dark. There is no shortcut around it. Only through.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Shadow integration. Jungian psychology shows that avoiding the shadow amplifies it. Walking through difficult emotions, not around them, is the only path to genuine wholeness.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Dark. Walk. Light.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}