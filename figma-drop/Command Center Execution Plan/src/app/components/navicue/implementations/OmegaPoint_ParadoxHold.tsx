/**
 * OMEGA POINT #6 — The Paradox Hold
 * "The heart is big enough to hold it all."
 * INTERACTION: Two heavy weights labeled "Grief" and "Joy" sit on
 * opposite sides of a balance beam. Each tap adjusts them until
 * both rest level — perfectly balanced. You don't have to choose.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Self-Compassion', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const BALANCE_STEPS = 5;

export default function OmegaPoint_ParadoxHold({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [balanced, setBalanced] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const balance = () => {
    if (stage !== 'active' || balanced >= BALANCE_STEPS) return;
    const next = balanced + 1;
    setBalanced(next);
    if (next >= BALANCE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  const t = balanced / BALANCE_STEPS;
  // Beam tilt: starts tilted (grief heavy), levels to 0
  const tilt = (1 - t) * 12; // degrees
  const griefY = 70 + (1 - t) * 15;
  const joyY = 70 - (1 - t) * 15;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Self-Compassion" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Two weights settle...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The heart is big enough to hold it all. You don't have to choose.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to find the balance</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={balance}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: balanced >= BALANCE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '210px', height: '150px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(270, 10%, 7%, 0.25)' }}>
              <svg width="100%" height="100%" viewBox="0 0 210 150" style={{ position: 'absolute', inset: 0 }}>
                {/* Fulcrum */}
                <polygon points="100,120 105,110 110,120" fill="hsla(0, 0%, 25%, 0.25)" />
                {/* Balance beam */}
                <motion.g
                  animate={{ rotate: -tilt }}
                  style={{ transformOrigin: '105px 108px' }}
                  transition={{ type: 'spring', stiffness: 60, damping: 12 }}>
                  <line x1="35" y1="108" x2="175" y2="108"
                    stroke={`hsla(0, 0%, ${30 + t * 15}%, ${0.3 + t * 0.15})`} strokeWidth="2" strokeLinecap="round" />
                  {/* Grief weight — left */}
                  <g>
                    <line x1="50" y1="108" x2="50" y2="88" stroke="hsla(0, 0%, 25%, 0.15)" strokeWidth="0.5" />
                    <motion.rect x="35" y="75" width="30" height="18" rx="3"
                      fill={`hsla(220, 30%, ${30 + t * 8}%, ${0.3 + t * 0.1})`}
                      stroke={`hsla(220, 25%, 40%, ${0.15 + t * 0.1})`} strokeWidth="0.5"
                    />
                    <text x="50" y="87" textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill={`hsla(220, 20%, 50%, ${0.3 + t * 0.1})`}>GRIEF</text>
                  </g>
                  {/* Joy weight — right */}
                  <g>
                    <line x1="160" y1="108" x2="160" y2="88" stroke="hsla(0, 0%, 25%, 0.15)" strokeWidth="0.5" />
                    <motion.rect x="145" y="75" width="30" height="18" rx="3"
                      fill={`hsla(45, 35%, ${35 + t * 10}%, ${0.3 + t * 0.1})`}
                      stroke={`hsla(45, 30%, 45%, ${0.15 + t * 0.1})`} strokeWidth="0.5"
                    />
                    <text x="160" y="87" textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill={`hsla(45, 25%, 50%, ${0.3 + t * 0.1})`}>JOY</text>
                  </g>
                </motion.g>
                {/* Heart glow at center — appears when balanced */}
                {t > 0.5 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: (t - 0.5) * 0.5 }}>
                    <circle cx="105" cy="95" r={8 + (t - 0.5) * 10}
                      fill={`hsla(340, 30%, 50%, ${(t - 0.5) * 0.06})`} />
                    {/* Heart shape — simple */}
                    <path d="M 105 98 Q 100 90, 98 93 Q 96 96, 105 103 Q 114 96, 112 93 Q 110 90, 105 98"
                      fill={`hsla(340, 35%, 50%, ${(t - 0.5) * 0.2})`} />
                  </motion.g>
                )}
                {/* Perfect balance indicator */}
                {balanced >= BALANCE_STEPS && (
                  <motion.text x="105" y="140" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(270, 20%, 50%, 0.25)"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.25 }}
                    transition={{ delay: 0.5, duration: 1.5 }}>
                    balanced
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={balanced} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {balanced === 0 ? 'Grief weighs more. The beam tilts.' : balanced < BALANCE_STEPS ? 'Finding the balance...' : 'Both held. Both honored. Level.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: BALANCE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < balanced ? 'hsla(270, 30%, 50%, 0.5)' : palette.primaryFaint, opacity: i < balanced ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Grief and joy. Both held. Neither denied. The heart is big enough.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Emotional complexity. Positive and negative emotions held simultaneously. The source of resilience.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Grief. Joy. Both.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}