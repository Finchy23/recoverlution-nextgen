/**
 * GUARDIAN #2 — The Co-Regulation Breath
 * "They cannot calm down until you do."
 * INTERACTION: Two concentric breathing rings. The outer ring (You)
 * is steady — user taps to breathe in/out. The inner ring (Them)
 * starts chaotic/jittery. After 5 steady breaths, the inner ring
 * syncs to the outer. Mirror neurons fire. Co-regulation achieved.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const BREATH_COUNT = 5;

export default function Guardian_CoRegulationBreath({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [breaths, setBreaths] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'exhale'>('idle');
  const [outerR, setOuterR] = useState(38);
  const [innerR, setInnerR] = useState(14);
  const [innerJitter, setInnerJitter] = useState(6);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Inner ring jitter animation
  useEffect(() => {
    if (stage !== 'active') return;
    let frame = 0;
    const tick = () => {
      frame++;
      const chaos = Math.max(0, innerJitter);
      setInnerR(14 + Math.sin(frame * 0.15) * chaos + Math.cos(frame * 0.23) * chaos * 0.5);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage, innerJitter]);

  const breathe = () => {
    if (stage !== 'active' || breaths >= BREATH_COUNT || phase !== 'idle') return;
    // Inhale — outer ring grows
    setPhase('inhale');
    setOuterR(48);
    addTimer(() => {
      // Exhale — outer ring shrinks
      setPhase('exhale');
      setOuterR(38);
      addTimer(() => {
        setPhase('idle');
        const next = breaths + 1;
        setBreaths(next);
        // Reduce inner jitter with each breath
        setInnerJitter(prev => Math.max(0, prev - 1.2));
        if (next >= BREATH_COUNT) {
          addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
        }
      }, 1800);
    }, 2000);
  };

  const t = breaths / BREATH_COUNT;
  const synced = t >= 1;
  const syncColor = `hsla(340, ${12 + t * 12}%, ${35 + t * 12}%, ${0.08 + t * 0.06})`;
  const outerColor = `hsla(210, ${12 + t * 8}%, ${35 + t * 10}%, ${0.1 + t * 0.04})`;
  const innerColor = synced ? outerColor : `hsla(0, ${10 + (1 - t) * 12}%, ${30 + t * 8}%, ${0.08 + t * 0.04})`;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Two rhythms...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>They cannot calm down until you do. Be the thermostat, not the thermometer.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to breathe; the small ring will follow</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={breathe}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: breaths >= BREATH_COUNT || phase !== 'idle' ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(230, ${5 + t * 4}%, ${6 + t * 3}%, 0.85)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Outer ring (You) — steady, responsive to breath */}
                <motion.circle cx="110" cy="85" r={outerR}
                  fill="none"
                  stroke={outerColor}
                  strokeWidth="1.2"
                  initial={{ r: outerR }}
                  animate={{ r: outerR }}
                  transition={{ type: 'spring', stiffness: 30, damping: 12 }}
                />
                {/* Outer glow */}
                <motion.circle cx="110" cy="85" r={outerR + 6}
                  fill="none"
                  stroke={`hsla(210, 10%, 35%, ${0.02 + t * 0.02})`}
                  strokeWidth="0.4"
                  initial={{ r: outerR + 6 }}
                  animate={{ r: outerR + 6 }}
                  transition={{ type: 'spring', stiffness: 30, damping: 12 }}
                />

                {/* Inner ring (Them) — chaotic, gradually syncing */}
                <circle cx="110" cy="85" r={innerR}
                  fill="none"
                  stroke={innerColor}
                  strokeWidth="0.8"
                />
                {/* Inner jitter echo */}
                {!synced && (
                  <circle cx={110 + Math.sin(innerR) * 0.8} cy={85 + Math.cos(innerR) * 0.5}
                    r={innerR + 2}
                    fill="none"
                    stroke={`hsla(0, 8%, 28%, ${0.02 * (1 - t)})`}
                    strokeWidth="0.3" strokeDasharray="2 3"
                  />
                )}

                {/* Sync pulse — appears when fully synced */}
                {synced && (
                  <motion.circle cx="110" cy="85" r={outerR - 12}
                    fill="none" stroke={syncColor} strokeWidth="0.6"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.12 }}
                    transition={{ duration: 1.5 }}
                  />
                )}

                {/* Labels */}
                <text x="110" y={85 - outerR - 8} textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(210, 8%, 32%, ${0.06 + t * 0.03})`}>
                  you
                </text>
                <text x="110" y={85 + innerR + 12} textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(${synced ? 210 : 0}, 8%, 30%, ${0.05 + t * 0.03})`}>
                  {synced ? 'synced' : 'them'}
                </text>

                {/* Phase indicator */}
                <text x="110" y="168" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(210, ${8 + t * 6}%, ${25 + t * 8}%, ${0.06 + t * 0.04})`}>
                  {phase === 'inhale' ? '↑ inhale' : phase === 'exhale' ? '↓ exhale' : `${breaths}/${BREATH_COUNT} breaths`}
                </text>

                {/* Mirror neuron readout */}
                {t > 0.3 && (
                  <text x="195" y="170" textAnchor="end" fontSize="11" fontFamily="monospace"
                    fill={`hsla(210, 8%, 30%, ${t * 0.05})`}>
                    sync: {Math.round(t * 100)}%
                  </text>
                )}

                {/* SYNCED */}
                {synced && (
                  <motion.text x="110" y="20" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(210, 18%, 48%, 0.15)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 0.3, duration: 1.5 }}>
                    CO-REGULATED
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={`${breaths}-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {breaths === 0 && phase === 'idle' ? 'Two rhythms. Yours is steady. Theirs is not. Yet.' : phase === 'inhale' ? 'Breathing in. The outer ring grows.' : phase === 'exhale' ? 'Breathing out. Holding steady.' : breaths < BREATH_COUNT ? `Breath ${breaths}. The small ring is settling.` : 'Both rings breathing as one. Co-regulation.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: BREATH_COUNT }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < breaths ? 'hsla(210, 18%, 48%, 0.5)' : palette.primaryFaint, opacity: i < breaths ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five steady breaths. The large ring held. The small ring stopped thrashing. It found your rhythm. Co-regulation. They could not calm down until you did. You became the thermostat.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Mirror neurons. A dysregulated nervous system instinctively looks to a regulated one to find its rhythm. Be steady. They will follow.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Chaos. Steady. Sync.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}