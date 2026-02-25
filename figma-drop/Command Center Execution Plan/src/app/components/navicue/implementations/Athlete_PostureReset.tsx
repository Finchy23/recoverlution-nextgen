/**
 * ATHLETE #7 -- The Posture Reset
 * "The mind follows the spine."
 * INTERACTION: A curved spine silhouette, hunched. Each tap
 * straightens one vertebral segment -- 5 segments from lumbar to
 * cervical. Chin rises. Chest opens. At full extension: power pose.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Self-Compassion', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SEGMENTS = 5;
const SEGMENT_NAMES = ['lumbar', 'lower thoracic', 'upper thoracic', 'cervical', 'crown'];

export default function Athlete_PostureReset({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [straightened, setStraightened] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const straighten = () => {
    if (stage !== 'active' || straightened >= SEGMENTS) return;
    const next = straightened + 1;
    setStraightened(next);
    if (next >= SEGMENTS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = straightened / SEGMENTS;
  const upright = t >= 1;

  // Spine control points -- from hunched to straight
  // Hunched: curved forward; Straight: vertical line
  const curveAmount = (1 - t) * 35;
  const spinePoints = Array.from({ length: 6 }, (_, i) => {
    const prog = i / 5;
    const baseX = 100;
    const baseY = 140 - prog * 100; // bottom to top
    const segmentStraightened = i <= straightened;
    const curve = segmentStraightened ? 0 : curveAmount * Math.sin(prog * Math.PI);
    return { x: baseX + curve, y: baseY };
  });

  const spinePath = `M ${spinePoints.map(p => `${p.x},${p.y}`).join(' L ')}`;

  // Head position
  const headX = spinePoints[5].x;
  const headY = spinePoints[5].y - 12;
  // Chin angle (hunched = tilted down)
  const chinDrop = (1 - t) * 8;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Self-Compassion" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A spine curves...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Unfold. Chin up. Chest open. The mind follows the spine. You cannot be depressed in a power pose.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to straighten each segment</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={straighten}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: straightened >= SEGMENTS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '180px', height: '190px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(210, ${6 + t * 8}%, ${7 + t * 3}%, 0.3)` }}>
              <svg width="100%" height="100%" viewBox="0 0 180 190" style={{ position: 'absolute', inset: 0 }}>
                {/* Vertical reference line */}
                <line x1="100" y1="40" x2="100" y2="145"
                  stroke="hsla(0, 0%, 20%, 0.03)" strokeWidth={safeSvgStroke(0.3)} strokeDasharray="2 3" />

                {/* Spine */}
                <motion.path
                  d={spinePath}
                  fill="none"
                  stroke={`hsla(${210 - t * 30}, ${12 + t * 10}%, ${30 + t * 12}%, ${0.12 + t * 0.08})`}
                  strokeWidth={1.2 + t * 0.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Vertebrae markers */}
                {spinePoints.slice(0, 5).map((p, i) => (
                  <motion.circle key={i}
                    cx={p.x} cy={p.y}
                    r={i < straightened ? 3 : 2}
                    fill={i < straightened ? `hsla(${180 + i * 10}, 15%, 40%, 0.1)` : 'hsla(0, 0%, 20%, 0.04)'}
                    stroke={i < straightened ? `hsla(${180 + i * 10}, 12%, 38%, 0.08)` : 'none'}
                    strokeWidth="0.5"
                    initial={{ cx: p.x, cy: p.y }}
                    animate={{ cx: p.x, cy: p.y }}
                    transition={{ type: 'spring', stiffness: 80 }}
                  />
                ))}

                {/* Head */}
                <motion.ellipse
                  cx={headX} cy={headY + chinDrop}
                  rx={10} ry={12}
                  fill="none"
                  stroke={`hsla(210, ${10 + t * 8}%, ${28 + t * 12}%, ${0.08 + t * 0.06})`}
                  strokeWidth="0.6"
                  initial={{ cx: headX, cy: headY + chinDrop }}
                  animate={{ cx: headX, cy: headY + chinDrop }}
                  transition={{ type: 'spring', stiffness: 60 }}
                />
                {/* Chin line */}
                <motion.line
                  x1={headX - 4} y1={headY + chinDrop + 8}
                  x2={headX + 4} y2={headY + chinDrop + 8 + chinDrop * 0.2}
                  stroke={`hsla(210, 8%, 30%, ${0.06 + t * 0.03})`}
                  strokeWidth="0.4"
                  initial={{ y1: headY + chinDrop + 8, y2: headY + chinDrop + 8 + chinDrop * 0.2 }}
                  animate={{ y1: headY + chinDrop + 8, y2: headY + chinDrop + 8 + chinDrop * 0.2 }}
                />

                {/* Shoulders -- opening */}
                {t > 0.4 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.08 }}>
                    <line x1={spinePoints[3].x - 5} y1={spinePoints[3].y} x2={spinePoints[3].x - 25 - t * 5} y2={spinePoints[3].y - t * 5}
                      stroke={`hsla(180, 12%, 38%, 0.08)`} strokeWidth="0.5" strokeLinecap="round" />
                    <line x1={spinePoints[3].x + 5} y1={spinePoints[3].y} x2={spinePoints[3].x + 25 + t * 5} y2={spinePoints[3].y - t * 5}
                      stroke={`hsla(180, 12%, 38%, 0.08)`} strokeWidth="0.5" strokeLinecap="round" />
                  </motion.g>
                )}

                {/* Cortisol/Testosterone ratio */}
                {t > 0 && (
                  <text x="100" y="175" textAnchor="middle" fontSize="5" fontFamily="monospace"
                    fill={`hsla(${180 + t * 30}, ${10 + t * 8}%, ${32 + t * 10}%, ${0.06 + t * 0.06})`}>
                    T↑ C↓ {Math.round(t * 100)}%
                  </text>
                )}

                {/* Power pose label */}
                {upright && (
                  <motion.text x="100" y="25" textAnchor="middle" fontSize="6" fontFamily="monospace"
                    fill="hsla(180, 15%, 45%, 0.15)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 0.3, duration: 1.5 }}>
                    POWER POSE
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={straightened} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {straightened === 0 ? 'Hunched. Curved. The spine tells the mind.' : straightened < SEGMENTS ? `${SEGMENT_NAMES[straightened - 1]} aligned.` : 'Fully upright. Chest open. Crown lifted.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: SEGMENTS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < straightened ? `hsla(${180 + i * 10}, 15%, 45%, 0.5)` : palette.primaryFaint, opacity: i < straightened ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five segments. Lumbar to crown. The spine unfurled. Shoulders open. Chin up. The mind followed the body upward.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Embodied cognition. Posture shifts testosterone-cortisol ratios. The spine informs the mood. You cannot be depressed in a power pose.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Curved. Unfold. Rise.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}