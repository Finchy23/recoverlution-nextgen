/**
 * WILDING #9 — The Storm Breathe
 * "Stand in the rain. Let barometric pressure reset you."
 * INTERACTION: Rain renders in increasing density across 4 stages.
 * User holds button through each storm phase: drizzle → rain →
 * downpour → thunder. Lightning flash at the peak. Then clearing.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, safeOpacity } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Canopy');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PHASES = ['drizzle', 'rain', 'downpour', 'thunder'] as const;
const PHASE_DURATION = 3000;

export default function Wilding_StormBreathe({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [phase, setPhase] = useState(0);
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [flash, setFlash] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (!holding || stage !== 'active') return;
    startRef.current = performance.now();
    const tick = () => {
      const el = performance.now() - startRef.current;
      const prog = Math.min(el / PHASE_DURATION, 1);
      setHoldProgress(prog);
      if (prog >= 1) {
        const next = phase + 1;
        if (next >= 4) {
          setHolding(false);
          setFlash(true);
          addTimer(() => setFlash(false), 200);
          addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2000);
        } else {
          setPhase(next);
          startRef.current = performance.now();
          rafRef.current = requestAnimationFrame(tick);
        }
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [holding, phase]);

  const totalProgress = (phase + holdProgress) / 4;
  const rainDensity = Math.floor(8 + totalProgress * 40);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Pressure dropping...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The storm is medicine. Negative ions flood. Barometric pressure drops. Your body calibrates to the ancient signal: weather is coming. Stand in it.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>hold to stand in the storm</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(220, ${6 + totalProgress * 8}%, ${10 - totalProgress * 4}%, 0.35)` }}>
              {flash && <motion.div initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'hsla(0, 0%, 95%, 0.3)', zIndex: 5 }} />}
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Rain drops — density increases with phase */}
                {Array.from({ length: rainDensity }, (_, i) => {
                  const x = (i * 47 + i * i * 3) % 220;
                  const y = (i * 31 + phase * 17) % 180;
                  const len = 4 + totalProgress * 8;
                  return (
                    <motion.line key={`rain-${i}`}
                      x1={x} y1={y} x2={x - 1} y2={y + len}
                      stroke={`hsla(210, ${15 + totalProgress * 10}%, ${50 + totalProgress * 15}%, ${0.03 + totalProgress * 0.04})`}
                      strokeWidth={0.4 + totalProgress * 0.3}
                      initial={{ opacity: 0 }} animate={{ opacity: safeOpacity(0.06 + totalProgress * 0.06) }}
                    />
                  );
                })}
                {/* Phase label */}
                <text x="110" y="30" textAnchor="middle" fontSize="11" fontFamily="monospace" fontWeight="300"
                  fill={`hsla(210, 15%, 50%, ${0.08 + totalProgress * 0.06})`} letterSpacing="2">
                  {PHASES[phase]?.toUpperCase()}
                </text>
                {/* Hold ring */}
                <circle cx="110" cy="105" r="28" fill="none"
                  stroke="hsla(210, 10%, 30%, 0.03)" strokeWidth="2" />
                <circle cx="110" cy="105" r="28" fill="none"
                  stroke={`hsla(210, ${15 + totalProgress * 15}%, ${40 + totalProgress * 15}%, ${0.06 + totalProgress * 0.08})`}
                  strokeWidth="2" strokeLinecap="round"
                  strokeDasharray={`${holdProgress * 176} 176`}
                  transform="rotate(-90, 110, 105)" />
              </svg>
            </div>
            <button
              onPointerDown={() => { if (phase < 4) setHolding(true); }}
              onPointerUp={() => setHolding(false)}
              onPointerLeave={() => setHolding(false)}
              style={{ padding: '8px 24px', borderRadius: radius.sm, border: 'none', cursor: 'pointer',
                background: holding ? `hsla(210, 18%, 25%, 0.3)` : `hsla(210, 12%, 18%, 0.15)`,
                color: palette.text, fontSize: '11px', fontFamily: 'monospace', letterSpacing: '1px', transition: 'background 0.3s' }}>
              {holding ? 'holding...' : 'hold to stand'}
            </button>
            <div style={{ display: 'flex', gap: '5px' }}>
              {PHASES.map((_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%',
                  background: i < phase ? 'hsla(210, 25%, 55%, 0.5)' : i === phase && holding ? 'hsla(210, 20%, 45%, 0.3)' : palette.primaryFaint,
                  opacity: i <= phase ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Four phases. Drizzle to thunder. You stood in it all. The barometric pressure reset is ancient medicine: your sinuses, your joints, your mood, all recalibrated by the storm.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Negative ion research: waterfalls and storms generate 10,000-50,000 negative ions per cm3. Indoor air: 100. Your nervous system evolved in storms, not offices.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Drizzle. Rain. Downpour. Thunder. Clear.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}