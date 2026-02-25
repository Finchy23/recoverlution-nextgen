/**
 * SERVANT LEADER #8 — The Conflict Dissolve
 * "It is not Me vs You. It is Us vs The Problem."
 * INTERACTION: Two red arrows face each other — opposition. Each tap
 * rotates them slightly until both point at a third, green target.
 * The problem, not the person. Principled negotiation.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ROTATE_STEPS = 5;

export default function ServantLeader_ConflictDissolve({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [rotated, setRotated] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const rotate = () => {
    if (stage !== 'active' || rotated >= ROTATE_STEPS) return;
    const next = rotated + 1;
    setRotated(next);
    if (next >= ROTATE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const t = rotated / ROTATE_STEPS;
  // Left arrow: starts pointing right (0°), rotates to point up-right (-45°)
  const leftAngle = t * -45;
  // Right arrow: starts pointing left (180°), rotates to point up-left (225°→ 135°)
  const rightAngle = 180 - t * 45;
  // Color transition: red → neutral → cooperative
  const arrowHue = 0 + t * 120; // red → green
  const arrowSat = 50 - t * 15;
  // Target visibility
  const targetOpacity = t * 0.4;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Two forces collide...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>It is not Me vs You. It is Us vs The Problem. Attack the problem.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to redirect the arrows</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={rotate}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: rotated >= ROTATE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '150px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(0, 5%, 8%, 0.2)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 150" style={{ position: 'absolute', inset: 0 }}>
                {/* The Problem — green target at top center */}
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: targetOpacity }} transition={{ duration: 0.8 }}>
                  <circle cx="110" cy="35" r="12"
                    fill="none" stroke={`hsla(120, 40%, 45%, ${targetOpacity})`} strokeWidth="1.5" />
                  <circle cx="110" cy="35" r="6"
                    fill="none" stroke={`hsla(120, 40%, 45%, ${targetOpacity * 0.7})`} strokeWidth="0.8" />
                  <circle cx="110" cy="35" r="2"
                    fill={`hsla(120, 40%, 45%, ${targetOpacity})`} />
                  <text x="110" y="55" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={`hsla(120, 30%, 50%, ${targetOpacity * 0.6})`}>
                    THE PROBLEM
                  </text>
                </motion.g>
                {/* Labels */}
                <text x="50" y="120" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(${arrowHue}, 20%, 40%, 0.2)`}>ME</text>
                <text x="170" y="120" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(${arrowHue}, 20%, 40%, 0.2)`}>YOU</text>
                {/* Left arrow */}
                <motion.g
                  animate={{ rotate: leftAngle }}
                  style={{ transformOrigin: '50px 90px' }}
                  transition={{ type: 'spring', stiffness: 80 }}>
                  <line x1="50" y1="90" x2="90" y2="90"
                    stroke={`hsla(${arrowHue}, ${arrowSat}%, 45%, 0.4)`} strokeWidth="2.5" strokeLinecap="round" />
                  <polygon points="90,85 100,90 90,95"
                    fill={`hsla(${arrowHue}, ${arrowSat}%, 45%, 0.4)`} />
                </motion.g>
                {/* Right arrow */}
                <motion.g
                  animate={{ rotate: rightAngle - 180 }}
                  style={{ transformOrigin: '170px 90px' }}
                  transition={{ type: 'spring', stiffness: 80 }}>
                  <line x1="170" y1="90" x2="130" y2="90"
                    stroke={`hsla(${arrowHue}, ${arrowSat}%, 45%, 0.4)`} strokeWidth="2.5" strokeLinecap="round" />
                  <polygon points="130,85 120,90 130,95"
                    fill={`hsla(${arrowHue}, ${arrowSat}%, 45%, 0.4)`} />
                </motion.g>
                {/* "US" label — appears when aligned */}
                {t > 0.6 && (
                  <motion.text x="110" y="100" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={`hsla(120, 30%, 50%, ${(t - 0.6) * 0.5})`}
                    initial={{ opacity: 0 }} animate={{ opacity: (t - 0.6) * 0.4 }}>
                    US
                  </motion.text>
                )}
                {/* Connection arc — appears when both point at target */}
                {t >= 1 && (
                  <motion.path d="M 55 85 Q 110 60, 165 85"
                    fill="none" stroke="hsla(120, 35%, 50%, 0.1)" strokeWidth="0.8" strokeDasharray="3 5"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.15 }}
                    transition={{ duration: 1.5 }}
                  />
                )}
              </svg>
            </div>
            <motion.div key={rotated} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {rotated === 0 ? 'Two arrows. Head to head.' : rotated < ROTATE_STEPS ? `Redirecting... ${Math.floor(t * 100)}%` : 'Both arrows face the problem. Together.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: ROTATE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < rotated ? `hsla(${(i / ROTATE_STEPS) * 120}, 40%, 45%, 0.5)` : palette.primaryFaint, opacity: i < rotated ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The arrows stopped fighting each other and aimed at the real enemy. Us vs The Problem.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Conflict transformed. Positional bargaining dissolved. Principled negotiation activated.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Opposed. Redirected. United.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}