/**
 * MAGNUMOPUS #4 — The Philosopher's Stone
 * "The symbol is the thing. Draw it into existence."
 * ARCHETYPE: Pattern C (Draw) — First Pattern C specimen.
 * Draw freely on the surface. Your marks inscribe the symbol.
 * As coverage grows, a geometric form emerges beneath your strokes.
 * Embodied Cognition — the hand knows before the mind.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MAGNUMOPUS_THEME, themeColor } from '../interactions/seriesThemes';
import { useDrawInteraction, Point } from '../interactions/useDrawInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Ember');
const TH = MAGNUMOPUS_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

function pointsToSvg(pts: Point[], w: number, h: number): string {
  if (pts.length < 2) return '';
  const segs: string[] = [];
  let prev = pts[0];
  segs.push(`M ${prev.x * w} ${prev.y * h}`);
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i];
    // Detect stroke breaks (large jumps)
    const dx = Math.abs(p.x - prev.x);
    const dy = Math.abs(p.y - prev.y);
    if (dx > 0.15 || dy > 0.15) {
      segs.push(`M ${p.x * w} ${p.y * h}`);
    } else {
      segs.push(`L ${p.x * w} ${p.y * h}`);
    }
    prev = p;
  }
  return segs.join(' ');
}

export default function MagnumOpus_PhilosophersStone({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  const draw = useDrawInteraction({
    coverageThreshold: 0.3,
    minStrokes: 2,
    gridRes: 8,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const c = draw.coverage;
  const goldAlpha = Math.min(c / 0.3, 1);

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A blank surface waits...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The philosopher{'\u2019'}s stone was never a physical object. It was a symbol drawn into existence by the act of seeking it. Draw. The symbol will find you.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>draw freely on the surface</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '300px' }}>

            <div {...draw.drawProps}
              style={{ ...draw.drawProps.style, position: 'relative', width: '220px', height: '220px', borderRadius: radius.md, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.98, 0),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 8)}` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 220">
                {/* Hidden geometry — revealed by drawing */}
                {/* Outer circle */}
                <circle cx="110" cy="110" r="85"
                  fill="none" stroke={themeColor(TH.accentHSL, goldAlpha * 0.06, 15)}
                  strokeWidth="0.4" />

                {/* Square within circle */}
                {c > 0.08 && (
                  <motion.rect x="50" y="50" width="120" height="120"
                    fill="none" stroke={themeColor(TH.accentHSL, goldAlpha * 0.05, 15)}
                    strokeWidth="0.4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                )}

                {/* Triangle within square */}
                {c > 0.15 && (
                  <motion.polygon points="110,55 170,165 50,165"
                    fill="none" stroke={themeColor(TH.accentHSL, goldAlpha * 0.05, 15)}
                    strokeWidth="0.4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                )}

                {/* Inner circle */}
                {c > 0.22 && (
                  <motion.circle cx="110" cy="125" r="30"
                    fill={themeColor(TH.accentHSL, goldAlpha * 0.03, 18)}
                    stroke={themeColor(TH.accentHSL, goldAlpha * 0.06, 20)}
                    strokeWidth="0.4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                )}

                {/* Center point — the stone */}
                {c > 0.28 && (
                  <motion.circle cx="110" cy="125" r="4"
                    fill={themeColor(TH.accentHSL, goldAlpha * 0.2, 25)}
                    initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 60 }} />
                )}

                {/* User's drawing strokes */}
                {draw.strokes.map((stroke, i) => (
                  <path key={i}
                    d={pointsToSvg(stroke.points, 220, 220)}
                    fill="none"
                    stroke={themeColor(TH.accentHSL, 0.12, 18)}
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                ))}

                {/* Current stroke */}
                {draw.currentStroke.length > 1 && (
                  <path
                    d={pointsToSvg(draw.currentStroke, 220, 220)}
                    fill="none"
                    stroke={themeColor(TH.accentHSL, 0.18, 22)}
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </div>

            {/* Coverage */}
            <div style={{ fontSize: '8px', fontFamily: 'monospace', letterSpacing: '0.1em',
              color: themeColor(TH.accentHSL, 0.1 + goldAlpha * 0.1, 12) }}>
              {draw.completed ? 'THE STONE APPEARS' :
               draw.strokes.length === 0 ? 'DRAW' :
               `INSCRIBING ${Math.round(c * 100)}%`}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The stone appeared beneath your strokes. Circle, square, triangle, circle. The ancient symbol of wholeness, drawn not with precision but with intention. The act of drawing was the alchemy.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>the seeking was the finding</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>The symbol is the thing.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}