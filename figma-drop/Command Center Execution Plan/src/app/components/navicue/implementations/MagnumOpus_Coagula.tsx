/**
 * MAGNUMOPUS #6 — Coagula
 * "Now gather the pieces. A new form is waiting."
 * ARCHETYPE: Pattern B (Drag) — The second half of Solve et Coagula.
 * Scattered particles float freely. Drag inward to coalesce them
 * into a coherent new form. Integration / Gestalt Formation.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MAGNUMOPUS_THEME, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Ember');
const TH = MAGNUMOPUS_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

// Pre-computed particle positions
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  ox: 15 + (i * 29) % 170,   // scattered x
  oy: 15 + (i * 23) % 150,   // scattered y
  r: 1.5 + (i % 3) * 0.8,
  hueShift: (i * 7) % 20,
}));

export default function MagnumOpus_Coagula({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  const drag = useDragInteraction({
    axis: 'both', sticky: true,
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
  const cx = 100, cy = 85;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Particles drift...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              After dissolution comes the gathering. The pieces are the same, but the pattern is new. Drag to coalesce. A new form is waiting to be born from the old.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag to gather the fragments</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '200px', height: '170px', borderRadius: radius.sm, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.98, 0) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 170">
                {/* Center attractor — grows with progress */}
                <motion.circle cx={cx} cy={cy} r={3 + t * 20}
                  fill={themeColor(TH.accentHSL, 0.02 + t * 0.04, 12)}
                  animate={{ r: [3 + t * 20, 5 + t * 20, 3 + t * 20] }}
                  transition={{ duration: 2.5, repeat: Infinity }} />

                {/* Particles — converge toward center */}
                {PARTICLES.map(p => {
                  const px = p.ox + (cx - p.ox) * t;
                  const py = p.oy + (cy - p.oy) * t;
                  return (
                    <motion.circle key={p.id}
                      initial={{ cx: p.ox, cy: p.oy }}
                      animate={{ cx: px, cy: py }}
                      transition={{ type: 'spring', stiffness: 30, damping: 10 }}
                      r={p.r}
                      fill={`hsla(${TH.accentHSL[0] + p.hueShift}, ${TH.accentHSL[1]}%, ${TH.accentHSL[2] + 5}%, ${0.06 + t * 0.08})`} />
                  );
                })}

                {/* Connection lines between nearby particles at high t */}
                {t > 0.5 && PARTICLES.slice(0, 12).map((p, i) => {
                  const next = PARTICLES[(i + 1) % 12];
                  const p1x = p.ox + (cx - p.ox) * t;
                  const p1y = p.oy + (cy - p.oy) * t;
                  const p2x = next.ox + (cx - next.ox) * t;
                  const p2y = next.oy + (cy - next.oy) * t;
                  return (
                    <motion.line key={`l-${i}`}
                      x1={p1x} y1={p1y} x2={p2x} y2={p2y}
                      stroke={themeColor(TH.accentHSL, (t - 0.5) * 0.1, 12)}
                      strokeWidth="0.3"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                  );
                })}

                {/* Coalesced form outline */}
                {t > 0.8 && (
                  <motion.circle cx={cx} cy={cy} r="25"
                    fill="none"
                    stroke={themeColor(TH.accentHSL, 0.1, 18)}
                    strokeWidth="0.5"
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 40 }}
                    style={{ transformOrigin: `${cx}px ${cy}px` }} />
                )}

                {/* Label */}
                <text x="100" y="162" textAnchor="middle" fontSize="5" fontFamily="monospace"
                  fill={themeColor(TH.accentHSL, 0.1 + t * 0.08, 12)} letterSpacing="0.1em">
                  {t > 0.9 ? 'COALESCED' : `GATHERING ${Math.round(t * 100)}%`}
                </text>
              </svg>
            </div>

            <div style={{ fontSize: '8px', fontFamily: 'monospace', letterSpacing: '0.1em',
              color: themeColor(TH.accentHSL, 0.1 + t * 0.12, 12) }}>
              {t > 0.9 ? 'NEW FORM' : 'COAGULA'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Same pieces. New shape. The alchemists understood that creation is not addition, it{'\u2019'}s rearrangement. You don{'\u2019'}t need new material. You need new arrangement.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>same pieces, new arrangement</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>Coagula.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}