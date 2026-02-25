/**
 * BENDER #2 — The Timeline Jump
 * "If you do not like the destination, do not walk faster. Change the line."
 * ARCHETYPE: Pattern B (Drag vertical) — Drag avatar from grey→red→gold line.
 * Three parallel timelines. Butterfly effect.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BENDER_THEME, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
const TH = BENDER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LINES = [
  { y: 120, color: [0, 0, 35], label: 'Grey. Default trajectory.' },
  { y: 75, color: [0, 20, 35], label: 'Red. Risk and friction.' },
  { y: 30, color: [45, 30, 45], label: 'Gold. The line you want.' },
];

export default function Bender_TimelineJump({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const drag = useDragInteraction({
    axis: 'y', sticky: true,
    snapPoints: [0, 0.5, 1.0],
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
  const avatarY = 120 - t * 90; // moves from grey (120) to gold (30)
  const currentLine = t < 0.3 ? 0 : t < 0.7 ? 1 : 2;
  const currentHue = LINES[currentLine].color[0];

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Three timelines...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are on a trajectory. If you do not like the destination, do not walk faster. Change the line.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag upward. jump from grey to gold.</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '300px' }}>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '240px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.95, t * 4) }}>
              <svg width="100%" height="100%" viewBox="0 0 240 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Three timeline threads */}
                {LINES.map((line, i) => (
                  <g key={i}>
                    <line x1="20" y1={line.y} x2="220" y2={line.y}
                      stroke={`hsla(${line.color[0]}, ${line.color[1]}%, ${line.color[2]}%, ${i === currentLine ? 0.12 : 0.04})`}
                      strokeWidth={i === currentLine ? 1.2 : 0.5}
                      strokeDasharray={i === 2 ? '0' : '4 3'} />
                    {/* Destination markers */}
                    <circle cx="220" cy={line.y} r={i === currentLine ? 4 : 2}
                      fill={`hsla(${line.color[0]}, ${line.color[1]}%, ${line.color[2]}%, ${i === currentLine ? 0.1 : 0.03})`} />
                    {/* Labels */}
                    <text x="225" y={line.y + 2} fontSize="3" fontFamily="monospace"
                      fill={`hsla(${line.color[0]}, ${line.color[1] * 0.5}%, ${line.color[2]}%, ${i === currentLine ? 0.08 : 0.03})`}>
                      {['GREY', 'RED', 'GOLD'][i]}
                    </text>
                  </g>
                ))}

                {/* Trail from avatar showing trajectory shift */}
                {t > 0.05 && (
                  <motion.path
                    d={`M 40,120 Q ${40 + t * 60},${120 - t * 40} ${40 + t * 100},${avatarY}`}
                    fill="none"
                    stroke={`hsla(${currentHue}, ${10 + t * 20}%, ${30 + t * 15}%, ${0.06 + t * 0.04})`}
                    strokeWidth={0.5 + t * 0.4}
                    strokeDasharray="2 1"
                  />
                )}

                {/* Avatar dot */}
                <motion.circle cx={40 + t * 100} cy={avatarY} r={4 + t * 2}
                  fill={`hsla(${currentHue}, ${15 + t * 20}%, ${25 + t * 18}%, ${0.1 + t * 0.08})`}
                  stroke={`hsla(${currentHue}, ${15 + t * 15}%, ${30 + t * 15}%, ${0.08 + t * 0.06})`}
                  strokeWidth={0.6 + t * 0.3}
                  initial={{ cx: 40, cy: avatarY }}
                  animate={{ cx: 40 + t * 100, cy: avatarY }}
                  transition={{ type: 'spring', stiffness: 50 }}
                />

                {/* Butterfly ripple at transition points */}
                {t > 0.3 && t < 0.7 && (
                  <motion.circle cx={40 + t * 100} cy={avatarY} r="15"
                    fill="none" stroke={`hsla(0, 15%, 35%, 0.04)`} strokeWidth={safeSvgStroke(0.3)}
                    initial={{ r: 15, opacity: 0.12 }}
                    animate={{ r: [15, 25], opacity: [0.04, 0] }}
                    transition={{ duration: 2, repeat: Infinity }} />
                )}

                {/* Gold glow at destination */}
                {t >= 0.95 && (
                  <motion.circle cx={40 + t * 100} cy={avatarY} r="20"
                    fill="hsla(45, 22%, 35%, 0.04)"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.12 }}
                    transition={{ duration: 2 }} />
                )}

                {/* Divergence label */}
                <text x="120" y="152" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 0.95 ? 'timeline: GOLD. trajectory shifted.' : `divergence: ${Math.round(t * 100)}%`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {t < 0.1 ? 'You are on the grey line. The default trajectory.' : t < 0.5 ? 'Crossing through red. Friction. Risk. Keep dragging.' : t < 0.95 ? 'The gold line is near. Almost there.' : 'On gold. The destination changed. Butterfly effect.'}
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
            <div style={{ ...navicueType.prompt, color: palette.text }}>You dragged upward. Grey line to red, friction and risk. Red to gold, the line you wanted. One small shift in initial conditions. The destination changed completely. You do not need to walk faster on the wrong path. Change the line.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Trajectory modification. In non-linear systems, a small shift in initial conditions creates massive divergence in outcomes. The butterfly effect. Change the line, not the speed.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Grey. Red. Gold.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}