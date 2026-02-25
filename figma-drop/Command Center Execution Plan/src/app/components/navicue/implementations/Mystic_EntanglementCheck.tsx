/**
 * MYSTIC #4 — The Entanglement Check
 * "Separation is an optical delusion. Distance is not real."
 * INTERACTION: Two particles on opposite sides of darkness.
 * Each tap spins both in sync — 5 spins. A light line grows
 * between them. At the end: fully entangled, pulsing as one.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SPIN_STEPS = 5;

export default function Mystic_EntanglementCheck({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [spins, setSpins] = useState(0);
  const [pulse, setPulse] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const spin = () => {
    if (stage !== 'active' || spins >= SPIN_STEPS) return;
    const next = spins + 1;
    setSpins(next);
    if (next >= SPIN_STEPS) {
      addTimer(() => {
        setPulse(true);
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
      }, 1500);
    }
  };

  const t = spins / SPIN_STEPS;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Two points in darkness...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Separation is an optical delusion. You are quantumly entangled with everything you love. Distance is not real.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to spin both particles in sync</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={spin}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: spins >= SPIN_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '150px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(260, ${5 + t * 4}%, ${3 + t * 2}%, 0.95)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 150" style={{ position: 'absolute', inset: 0 }}>
                {/* Connecting light line — grows with spins */}
                {spins > 0 && (
                  <motion.line x1="55" y1="75" x2="165" y2="75"
                    stroke={`hsla(45, ${10 + t * 20}%, ${25 + t * 20}%, ${t * 0.08})`}
                    strokeWidth={0.3 + t * 0.5}
                    strokeDasharray={pulse ? '0' : `${t * 15} ${(1 - t) * 10}`}
                    initial={{ opacity: 0 }} animate={{ opacity: t * 0.08 }}
                    transition={{ duration: 0.8 }}
                  />
                )}

                {/* Particle A — left */}
                <motion.g
                  animate={{ rotate: spins * 72 }}
                  transition={{ type: 'spring', stiffness: 80, damping: 12 }}>
                  <circle cx="55" cy="75" r={6 + t * 2}
                    fill={`hsla(280, ${12 + t * 10}%, ${25 + t * 12}%, ${0.08 + t * 0.06})`} />
                  <circle cx="55" cy="75" r={3 + t}
                    fill={`hsla(280, ${15 + t * 12}%, ${30 + t * 15}%, ${0.12 + t * 0.08})`} />
                  {/* Spin indicator */}
                  <line x1="55" y1={75 - 6 - t * 2} x2="55" y2={75 - 8 - t * 2}
                    stroke={`hsla(280, 15%, 40%, ${0.06 + t * 0.04})`} strokeWidth="0.5" />
                </motion.g>
                {/* Orbital ring A */}
                <motion.ellipse cx="55" cy="75" rx={10 + t * 3} ry={4 + t}
                  fill="none" stroke={`hsla(280, 10%, 25%, ${0.03 + t * 0.02})`}
                  strokeWidth="0.3" strokeDasharray="2 2"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: spins * 72 }}
                  transition={{ type: 'spring', stiffness: 80, damping: 12 }}
                />

                {/* Particle B — right (mirrors A) */}
                <motion.g
                  initial={{ rotate: 0 }}
                  animate={{ rotate: spins * 72 }}
                  transition={{ type: 'spring', stiffness: 80, damping: 12 }}>
                  <circle cx="165" cy="75" r={6 + t * 2}
                    fill={`hsla(200, ${12 + t * 10}%, ${25 + t * 12}%, ${0.08 + t * 0.06})`} />
                  <circle cx="165" cy="75" r={3 + t}
                    fill={`hsla(200, ${15 + t * 12}%, ${30 + t * 15}%, ${0.12 + t * 0.08})`} />
                  <line x1="165" y1={75 - 6 - t * 2} x2="165" y2={75 - 8 - t * 2}
                    stroke={`hsla(200, 15%, 40%, ${0.06 + t * 0.04})`} strokeWidth="0.5" />
                </motion.g>
                <motion.ellipse cx="165" cy="75" rx={10 + t * 3} ry={4 + t}
                  fill="none" stroke={`hsla(200, 10%, 25%, ${0.03 + t * 0.02})`}
                  strokeWidth="0.3" strokeDasharray="2 2"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: spins * 72 }}
                  transition={{ type: 'spring', stiffness: 80, damping: 12 }}
                />

                {/* Entangled pulse — both glow in sync */}
                {pulse && (
                  <>
                    <motion.circle cx="55" cy="75" r="15"
                      fill="hsla(280, 15%, 35%, 0.04)"
                      initial={{ r: 15, opacity: 0.12 }}
                      animate={{ r: [15, 18, 15], opacity: [0.04, 0.06, 0.04] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.circle cx="165" cy="75" r="15"
                      fill="hsla(200, 15%, 35%, 0.04)"
                      initial={{ r: 15, opacity: 0.12 }}
                      animate={{ r: [15, 18, 15], opacity: [0.04, 0.06, 0.04] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </>
                )}

                {/* Distance label */}
                <text x="110" y="20" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(0, 0%, ${20 + t * 8}%, ${0.04 + t * 0.03})`}>
                  {pulse ? 'distance: irrelevant' : `separation: ${Math.round((1 - t) * 100)}%`}
                </text>

                <text x="110" y="140" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(260, ${8 + t * 8}%, ${22 + t * 10}%, ${0.05 + t * 0.04})`}>
                  {pulse ? 'entangled' : `spin ${spins}/${SPIN_STEPS}`}
                </text>
              </svg>
            </div>
            <motion.div key={`${spins}-${pulse}`} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {spins === 0 ? 'Two particles. Separated by darkness. Waiting.' : !pulse ? `Spin ${spins}. Both rotated in sync. Light growing between.` : 'Entangled. Pulsing as one. Distance is not real.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: SPIN_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < spins ? 'hsla(260, 18%, 48%, 0.5)' : palette.primaryFaint, opacity: i < spins ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five spins. One particle moved, and the other moved instantly. A line of light grew between them. Now they pulse as one. Separation is an optical delusion. You are quantumly entangled with everything you love.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Non-locality. The metaphor of quantum entanglement reduces the psychological distress of physical separation. Distance is not real. Interconnectedness is.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Two. Spin. One.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}