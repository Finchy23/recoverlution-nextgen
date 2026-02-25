/**
 * WILDING #6 — The Dark Anchor
 * "Melatonin is the hormone of darkness. Protect the dark."
 * INTERACTION: Screen starts bright (simulated blue light).
 * Each tap dims — 5 stages of darkening. Blue light drops.
 * Melatonin gauge rises. At the final tap: true black.
 * The circadian pacemaker is protected.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Canopy');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const DIM_STEPS = 5;

export default function Wilding_DarkAnchor({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [dimmed, setDimmed] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const dim = () => {
    if (stage !== 'active' || dimmed >= DIM_STEPS) return;
    const next = dimmed + 1;
    setDimmed(next);
    if (next >= DIM_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = dimmed / DIM_STEPS;
  const dark = t >= 1;
  // Blue light intensity: starts high, drops to zero
  const blueLight = 1 - t;
  // Melatonin level: inverse of blue light
  const melatonin = t;
  // Background brightness
  const bgLight = 12 - t * 8;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Too bright...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Artificial light is a drug. Turn it off. Thirty minutes before sleep. Melatonin is the hormone of darkness. Blue light destroys it. Protect the dark.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to dim</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={dim}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: dimmed >= DIM_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <motion.div
              animate={{ backgroundColor: `hsla(230, ${6 + blueLight * 8}%, ${bgLight}%, 0.35)` }}
              transition={{ duration: 1.2 }}
              style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Blue light haze — fades with each tap */}
                <motion.rect x="0" y="0" width="220" height="180"
                  fill={`hsla(220, ${30 * blueLight}%, ${40 * blueLight + 10}%, ${blueLight * 0.08})`}
                  animate={{ opacity: blueLight * 0.08 }}
                  transition={{ duration: 1 }}
                />

                {/* Screen simulation — the source of blue light */}
                <motion.rect x="75" y="40" width="70" height="50" rx="3"
                  fill={`hsla(220, ${25 * blueLight}%, ${45 * blueLight + 8}%, ${blueLight * 0.1})`}
                  stroke={`hsla(220, ${15 * blueLight}%, ${30 * blueLight + 10}%, ${blueLight * 0.06})`}
                  strokeWidth="0.5"
                  animate={{ opacity: blueLight * 0.1 + 0.02 }}
                  transition={{ duration: 1 }}
                />
                {/* Screen glare lines */}
                {blueLight > 0.2 && Array.from({ length: 3 }, (_, i) => (
                  <line key={i} x1="80" y1={50 + i * 12} x2="140" y2={50 + i * 12}
                    stroke={`hsla(220, 15%, 40%, ${blueLight * 0.04})`} strokeWidth="0.3" />
                ))}

                {/* Blue light meter — left */}
                <g>
                  <rect x="15" y="35" width="5" height="60" rx="1.5"
                    fill="hsla(0, 0%, 10%, 0.03)" />
                  <rect x="15" y={35 + (1 - blueLight) * 60} width="5" height={blueLight * 60} rx="1.5"
                    fill={`hsla(220, ${20 + blueLight * 15}%, ${35 + blueLight * 15}%, ${0.06 + blueLight * 0.06})`} />
                  <text x="17.5" y="28" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={`hsla(220, 10%, 30%, ${0.05 + blueLight * 0.03})`}>blue</text>
                </g>

                {/* Melatonin meter — right */}
                <g>
                  <rect x="200" y="35" width="5" height="60" rx="1.5"
                    fill="hsla(0, 0%, 10%, 0.03)" />
                  <rect x="200" y={35 + (1 - melatonin) * 60} width="5" height={melatonin * 60} rx="1.5"
                    fill={`hsla(270, ${10 + melatonin * 12}%, ${25 + melatonin * 15}%, ${0.04 + melatonin * 0.06})`} />
                  <text x="202.5" y="28" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={`hsla(270, 8%, 30%, ${0.04 + melatonin * 0.04})`}>mel</text>
                </g>

                {/* Darkness percentage */}
                <text x="110" y="120" textAnchor="middle" fontSize="14" fontFamily="monospace" fontWeight="200"
                  fill={`hsla(0, 0%, ${15 + t * 15}%, ${0.06 + t * 0.08})`}>
                  {Math.round(t * 100)}%
                </text>
                <text x="110" y="132" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(0, 0%, ${20 + t * 10}%, ${0.05 + t * 0.04})`}>
                  darkness
                </text>

                {/* True black moment */}
                {dark && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 0.5, duration: 2 }}>
                    <text x="110" y="160" textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill="hsla(270, 15%, 42%, 0.15)" letterSpacing="2">
                      PROTECTED
                    </text>
                  </motion.g>
                )}
              </svg>
            </motion.div>
            <motion.div key={dimmed} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {dimmed === 0 ? 'Blue light flooding. Melatonin suppressed.' : dimmed < DIM_STEPS ? `Dimmed ${dimmed}. Blue dropping. Melatonin rising.` : 'True black. Zero blue. Melatonin flows. Sleep protected.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: DIM_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < dimmed ? 'hsla(270, 15%, 42%, 0.5)' : palette.primaryFaint, opacity: i < dimmed ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five dims. Blue light dead. The screen went dark. Melatonin rose. The circadian pacemaker is protected. Darkness is not absence. Darkness is medicine.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Melatonin suppression. Eliminating blue light prevents disruption of the circadian pacemaker, essential for restorative sleep. Protect the dark. The hormone of darkness needs darkness to work.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Bright. Dim. Dark.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}