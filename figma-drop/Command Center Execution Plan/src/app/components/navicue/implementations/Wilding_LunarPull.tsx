/**
 * WILDING #5 — The Lunar Pull
 * "You are not solid. You are a tide."
 * INTERACTION: A moon phase cycle. Each tap advances the phase —
 * new → crescent → quarter → gibbous → full. 5 phases. As the
 * moon fills, a tide line rises and falls in sync. You are 70%
 * water. Feel the pull.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Canopy');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PHASES_COUNT = 5;
const PHASE_NAMES = ['new', 'crescent', 'quarter', 'gibbous', 'full'];
const PHASE_LABELS = ['●', '◐', '◑', '◕', '○'];

export default function Wilding_LunarPull({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [moonPhase, setMoonPhase] = useState(0);
  const [tidePhase, setTidePhase] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    const tick = () => { setTidePhase(p => p + 0.02); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const advance = () => {
    if (stage !== 'active' || moonPhase >= PHASES_COUNT) return;
    const next = moonPhase + 1;
    setMoonPhase(next);
    if (next >= PHASES_COUNT) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = moonPhase / PHASES_COUNT;
  const full = t >= 1;

  // Moon illumination: 0 = new (all dark), 1 = full (all lit)
  const illum = t;
  // Tide height oscillation — amplitude grows with moon phase
  const tideAmp = 5 + t * 18;
  const tideY = 130 + Math.sin(tidePhase) * tideAmp;

  // Moon clip path for phases — using an ellipse overlay to shadow
  const shadowX = (1 - illum) * 50; // 50 = fully covering → 0 = no shadow

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The tide shifts...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The moon pulls the ocean. You are seventy percent water. Feel the tide. You are not solid. You are a tide. High energy, low energy. Do not fight the cycle.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to advance the phase</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={advance}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: moonPhase >= PHASES_COUNT ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(230, ${6 + t * 6}%, ${5 + t * 3}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Stars */}
                {Array.from({ length: 15 }, (_, i) => (
                  <circle key={`star-${i}`}
                    cx={12 + (i * 29) % 200} cy={8 + (i * 17) % 60}
                    r={0.4 + (i % 3) * 0.2}
                    fill={`hsla(0, 0%, ${40 + i * 2}%, ${0.04 + t * 0.02})`} />
                ))}

                {/* Moon — circle with shadow overlay */}
                <circle cx="110" cy="50" r="22"
                  fill={`hsla(42, ${15 + t * 12}%, ${25 + t * 20}%, ${0.06 + t * 0.08})`}
                  stroke={`hsla(42, ${10 + t * 8}%, ${30 + t * 12}%, ${0.06 + t * 0.04})`}
                  strokeWidth="0.4" />
                {/* Shadow crescent — covers right side for waxing */}
                <motion.ellipse cx={110 + 22 - shadowX * 0.88} cy="50" rx={shadowX * 0.44} ry="22"
                  fill={`hsla(230, 6%, ${5 + t * 3}%, 0.85)`}
                  animate={{ rx: shadowX * 0.44 }}
                  transition={{ type: 'spring', stiffness: 60 }}
                />

                {/* Moon glow */}
                <circle cx="110" cy="50" r={28 + t * 8}
                  fill={`hsla(42, ${12 + t * 10}%, ${35 + t * 15}%, ${t * 0.04})`} />

                {/* Tide line — oscillating wave */}
                <motion.path
                  d={`M 0 ${tideY} Q 55 ${tideY - 4 - t * 3} 110 ${tideY} Q 165 ${tideY + 4 + t * 3} 220 ${tideY} L 220 180 L 0 180 Z`}
                  fill={`hsla(210, ${12 + t * 10}%, ${18 + t * 8}%, ${0.05 + t * 0.04})`}
                />
                {/* Second wave layer */}
                <motion.path
                  d={`M 0 ${tideY + 3} Q 55 ${tideY + 3 + 3 + t * 2} 110 ${tideY + 3} Q 165 ${tideY + 3 - 3 - t * 2} 220 ${tideY + 3} L 220 180 L 0 180 Z`}
                  fill={`hsla(210, ${10 + t * 8}%, ${15 + t * 6}%, ${0.04 + t * 0.03})`}
                />

                {/* Phase name */}
                <text x="110" y="168" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(42, ${10 + t * 10}%, ${30 + t * 12}%, ${0.08 + t * 0.06})`}>
                  {moonPhase > 0 ? PHASE_NAMES[moonPhase - 1] : 'new'}
                </text>

                {/* Phase tracker */}
                <g>
                  {PHASE_NAMES.map((_, i) => {
                    const px = 70 + i * 20;
                    const active = i < moonPhase;
                    return (
                      <circle key={i} cx={px} cy="90" r="3"
                        fill={active ? `hsla(42, ${15 + i * 3}%, ${35 + i * 4}%, ${0.08 + i * 0.02})` : 'hsla(0, 0%, 12%, 0.03)'}
                        stroke={active ? `hsla(42, 12%, 38%, 0.06)` : 'none'} strokeWidth="0.3" />
                    );
                  })}
                </g>

                {/* Gravitational pull lines — from moon to tide */}
                {t > 0 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: t * 0.05 }}>
                    <line x1="100" y1="72" x2="95" y2={tideY - 5}
                      stroke="hsla(42, 10%, 35%, 0.04)" strokeWidth="0.3" strokeDasharray="2 3" />
                    <line x1="110" y1="72" x2="110" y2={tideY - 5}
                      stroke="hsla(42, 10%, 35%, 0.04)" strokeWidth="0.3" strokeDasharray="2 3" />
                    <line x1="120" y1="72" x2="125" y2={tideY - 5}
                      stroke="hsla(42, 10%, 35%, 0.04)" strokeWidth="0.3" strokeDasharray="2 3" />
                  </motion.g>
                )}

                {/* Full label */}
                {full && (
                  <motion.text x="110" y="15" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(42, 20%, 50%, 0.18)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.18 }} transition={{ delay: 0.3, duration: 1.5 }}>
                    TIDAL
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={moonPhase} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {moonPhase === 0 ? 'New moon. Dark. The tide barely moves.' : moonPhase < PHASES_COUNT ? `${PHASE_NAMES[moonPhase - 1]} moon. Tide amplitude rising.` : 'Full moon. Maximum pull. You are the tide.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: PHASES_COUNT }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < moonPhase ? 'hsla(42, 20%, 48%, 0.5)' : palette.primaryFaint, opacity: i < moonPhase ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>New to full. Five phases. The tide rose with the moon. Gravitational pull on water. You are seventy percent water. High energy, low energy. The cycle is not your enemy. It is your rhythm.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Cyclical biology. Aligning cognitive expectations with infradian rhythms reduces shame around low-energy phases. You are not broken. You are tidal.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            New. Full. Tidal.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}