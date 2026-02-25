/**
 * SERVANT LEADER #5 — The Responsibility Take
 * "Extreme Ownership. No excuses. The moment you blame, you lose the power to fix."
 * INTERACTION: A heavy weight drops from above. It sits on the ground.
 * Each tap picks it up a bit — shoulders under it — until you're
 * standing tall with the weight held overhead. Ownership claimed.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Exposure', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LIFT_STEPS = 5;

export default function ServantLeader_ResponsibilityTake({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [lifted, setLifted] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const lift = () => {
    if (stage !== 'active' || lifted >= LIFT_STEPS) return;
    const next = lifted + 1;
    setLifted(next);
    if (next >= LIFT_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const t = lifted / LIFT_STEPS;
  // Weight position: starts at 120 (ground), ends at 30 (overhead)
  const weightY = 110 - t * 75;
  // Figure posture: crouching → standing
  const figureH = 30 + t * 40;
  const figureY = 120 - figureH;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Exposure" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something heavy falls...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>It happened on your watch. Extreme ownership. No excuses. The moment you blame, you lose the power to fix.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to pick it up</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={lift}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: lifted >= LIFT_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '180px', height: '160px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(220, 10%, 8%, 0.25)' }}>
              <svg width="100%" height="100%" viewBox="0 0 180 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Ground line */}
                <line x1="20" y1="125" x2="160" y2="125" stroke="hsla(0, 0%, 20%, 0.15)" strokeWidth="0.5" />
                {/* Figure — grows from crouching to standing */}
                <motion.g initial={{ y: 0 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 100 }}>
                  {/* Body */}
                  <motion.rect x="84" y={figureY} width="12" height={figureH} rx="4"
                    fill={`hsla(220, 15%, ${30 + t * 15}%, ${0.25 + t * 0.15})`}
                    animate={{ y: figureY, height: figureH }}
                    transition={{ type: 'spring', stiffness: 80 }}
                  />
                  {/* Head */}
                  <motion.circle cx="90" cy={figureY - 6} r="6"
                    fill={`hsla(220, 15%, ${30 + t * 15}%, ${0.2 + t * 0.1})`}
                    initial={{ cy: figureY - 6 }}
                    animate={{ cy: figureY - 6 }}
                    transition={{ type: 'spring', stiffness: 80 }}
                  />
                  {/* Arms — reaching up as lifting */}
                  <motion.line x1="84" y1={figureY + 10} x2={78 - t * 6} y2={figureY - t * 10}
                    stroke={`hsla(220, 15%, 35%, ${0.2 + t * 0.1})`} strokeWidth="2" strokeLinecap="round"
                    animate={{ x2: 78 - t * 6, y1: figureY + 10, y2: figureY - t * 10 }}
                    transition={{ type: 'spring', stiffness: 80 }}
                  />
                  <motion.line x1="96" y1={figureY + 10} x2={102 + t * 6} y2={figureY - t * 10}
                    stroke={`hsla(220, 15%, 35%, ${0.2 + t * 0.1})`} strokeWidth="2" strokeLinecap="round"
                    animate={{ x2: 102 + t * 6, y1: figureY + 10, y2: figureY - t * 10 }}
                    transition={{ type: 'spring', stiffness: 80 }}
                  />
                </motion.g>
                {/* The Weight */}
                <motion.g initial={{ y: 0 }} animate={{ y: weightY - 110 }} transition={{ type: 'spring', stiffness: 60, damping: 12 }}>
                  <rect x="65" y="105" width="50" height="18" rx="3"
                    fill={`hsla(0, 0%, ${15 + t * 8}%, ${0.4 + t * 0.15})`}
                    stroke={`hsla(0, 0%, ${25 + t * 10}%, ${0.2 + t * 0.1})`} strokeWidth="1" />
                  {/* Weight label */}
                  <text x="90" y="117" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={`hsla(0, 0%, ${35 + t * 15}%, ${0.3 + t * 0.15})`}>
                    OWNERSHIP
                  </text>
                </motion.g>
                {/* Effort lines */}
                {lifted > 0 && lifted < LIFT_STEPS && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
                    {[0, 1, 2].map(i => (
                      <line key={i} x1={70 - i * 5} y1={figureY + 5 + i * 3} x2={65 - i * 5} y2={figureY + 2 + i * 3}
                        stroke="hsla(220, 15%, 40%, 0.15)" strokeWidth="0.5" />
                    ))}
                    {[0, 1, 2].map(i => (
                      <line key={`r${i}`} x1={110 + i * 5} y1={figureY + 5 + i * 3} x2={115 + i * 5} y2={figureY + 2 + i * 3}
                        stroke="hsla(220, 15%, 40%, 0.15)" strokeWidth="0.5" />
                    ))}
                  </motion.g>
                )}
                {/* Triumph glow at top */}
                {lifted >= LIFT_STEPS && (
                  <motion.circle cx="90" cy="30" r="25"
                    fill="hsla(45, 30%, 55%, 0.04)"
                    initial={{ r: 5, opacity: 0 }} animate={{ r: 25, opacity: 0.06 }}
                    transition={{ duration: 1.5 }}
                  />
                )}
              </svg>
            </div>
            <motion.div key={lifted} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {lifted === 0 ? 'It dropped. It\'s yours.' : lifted < LIFT_STEPS ? `Lifting... ${Math.floor(t * 100)}% owned.` : 'Overhead. Fully owned.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: LIFT_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < lifted ? 'hsla(220, 25%, 50%, 0.5)' : palette.primaryFaint, opacity: i < lifted ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You picked it up. No blame. No excuses. Ownership is power. The power to fix.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Internal locus of control activated. Helplessness dissolved. The weight became the strength.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Dropped. Picked up. Owned.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}