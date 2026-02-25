/**
 * DREAMWALKER #2 — The Sleep Architect
 * "You build worlds every night. What would you build on purpose?"
 * ARCHETYPE: Pattern B (Drag) — Drag upward to raise dream structures
 * from a dark plane. Towers, arches, bridges emerge from nothing.
 * Dream Incubation — intentional subconscious creation.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { DREAMWALKER_THEME, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Ocean');
const TH = DREAMWALKER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const STRUCTURES = [
  { x: 25, w: 12, maxH: 60, label: 'tower' },
  { x: 50, w: 30, maxH: 20, label: 'bridge' },
  { x: 90, w: 8, maxH: 50, label: 'spire' },
  { x: 115, w: 25, maxH: 35, label: 'arch' },
  { x: 155, w: 14, maxH: 55, label: 'obelisk' },
];

export default function DreamWalker_SleepArchitect({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

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

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A dark plane stretches...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Every night your mind builds entire cities, then demolishes them by morning. You are already an architect. What would you build on purpose?
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag upward to raise the architecture</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '200px', height: '160px', borderRadius: radius.sm, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.98, 0) }}>

              <svg width="100%" height="100%" viewBox="0 0 200 160">
                {/* Ground plane */}
                <line x1="0" y1="140" x2="200" y2="140"
                  stroke={themeColor(TH.primaryHSL, 0.06, 8)} strokeWidth="0.5" />

                {/* Stars in the dream sky */}
                {Array.from({ length: 8 }, (_, i) => (
                  <motion.circle key={`s-${i}`}
                    cx={15 + i * 24} cy={10 + (i * 7) % 30}
                    r={0.5 + (i % 3) * 0.3}
                    fill={themeColor(TH.accentHSL, 0.06 + t * 0.04, 20)}
                    initial={{ opacity: 0.04 }}
                    animate={{ opacity: [0.04, 0.08, 0.04] }}
                    transition={{ duration: 2 + i * 0.4, repeat: Infinity }} />
                ))}

                {/* Rising structures */}
                {STRUCTURES.map((s, i) => {
                  const h = s.maxH * t;
                  const y = 140 - h;
                  return (
                    <g key={i}>
                      {/* Structure body */}
                      <motion.rect
                        x={s.x} y={y} width={s.w} height={h}
                        rx={s.label === 'spire' || s.label === 'obelisk' ? 2 : 1}
                        fill={themeColor(TH.primaryHSL, 0.05 + t * 0.03, 8 + i * 2)}
                        stroke={themeColor(TH.accentHSL, 0.06 + t * 0.04, 15)}
                        strokeWidth={safeSvgStroke(0.3)}
                        initial={{ y: 140, height: 0 }}
                        animate={{ y, height: h }}
                        transition={{ type: 'spring', stiffness: 40, damping: 12 }} />
                      {/* Window dots */}
                      {h > 15 && Array.from({ length: Math.floor(h / 12) }, (_, j) => (
                        <motion.circle key={j}
                          cx={s.x + s.w / 2} cy={y + 8 + j * 12} r="1"
                          fill={themeColor(TH.accentHSL, 0.08 + t * 0.05, 20)}
                          initial={{ opacity: 0.05 }}
                          animate={{ opacity: [0.05, 0.1, 0.05] }}
                          transition={{ duration: 1.5, delay: j * 0.2, repeat: Infinity }} />
                      ))}
                    </g>
                  );
                })}

                {/* Arch connectors — appear at higher progress */}
                {t > 0.5 && (
                  <motion.path
                    d="M 37 100 Q 55 80 73 100"
                    fill="none" stroke={themeColor(TH.accentHSL, 0.05 + t * 0.03, 15)}
                    strokeWidth="0.5"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
                )}
                {t > 0.7 && (
                  <motion.path
                    d="M 98 105 Q 115 85 132 105"
                    fill="none" stroke={themeColor(TH.accentHSL, 0.05 + t * 0.03, 15)}
                    strokeWidth="0.5"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
                )}
              </svg>
            </div>

            {/* Progress */}
            <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em',
              color: themeColor(TH.accentHSL, 0.1 + t * 0.12, 12) }}>
              {t > 0.9 ? 'CITY RISEN' : `RISING ${Math.round(t * 100)}%`}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              A city from nothing. Your subconscious does this every night. Dream incubation is simply doing on purpose what you already do by accident.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>you are already the architect</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>Build on purpose.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}