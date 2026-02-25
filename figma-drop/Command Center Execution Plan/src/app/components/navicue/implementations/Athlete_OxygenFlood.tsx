/**
 * ATHLETE #1 -- The Oxygen Flood
 * "Change the chemistry."
 * INTERACTION: A graphical lung silhouette expands/contracts with
 * a breathing guide. Exhale bar is 2× longer than inhale bar.
 * 5 breath cycles. CO2 meter drops. Blood pH shifts alkaline.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Self-Compassion', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const BREATH_CYCLES = 5;
const INHALE_MS = 2000;
const EXHALE_MS = 4000;

export default function Athlete_OxygenFlood({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [cycles, setCycles] = useState(0);
  const [breathing, setBreathing] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'exhale' | 'idle'>('idle');
  const [breathT, setBreathT] = useState(0);
  const rafRef = useRef<number | null>(null);
  const phaseStartRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const startBreathing = () => {
    if (breathing || stage !== 'active') return;
    setBreathing(true);
    runCycle(0);
  };

  const runCycle = (c: number) => {
    if (c >= BREATH_CYCLES) {
      setCycles(BREATH_CYCLES);
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
      setPhase('idle');
      return;
    }
    setPhase('inhale');
    phaseStartRef.current = performance.now();
    const animateInhale = () => {
      const elapsed = performance.now() - phaseStartRef.current;
      setBreathT(Math.min(elapsed / INHALE_MS, 1));
      if (elapsed < INHALE_MS) { rafRef.current = requestAnimationFrame(animateInhale); }
      else {
        setPhase('exhale');
        phaseStartRef.current = performance.now();
        const animateExhale = () => {
          const el2 = performance.now() - phaseStartRef.current;
          setBreathT(1 - Math.min(el2 / EXHALE_MS, 1));
          if (el2 < EXHALE_MS) { rafRef.current = requestAnimationFrame(animateExhale); }
          else { setCycles(c + 1); runCycle(c + 1); }
        };
        rafRef.current = requestAnimationFrame(animateExhale);
      }
    };
    rafRef.current = requestAnimationFrame(animateInhale);
  };

  const t = cycles / BREATH_CYCLES;
  const lungScale = 0.6 + breathT * 0.4;
  const co2Level = 1 - t;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Self-Compassion" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Lungs fill...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>CO₂ dump. Exhale twice as long as you inhale. Change the chemistry.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to begin breathing</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={startBreathing}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: breathing ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(200, ${10 + t * 12}%, ${7 + t * 3}%, 0.3)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <radialGradient id={`${svgId}-lungGlow`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(200, 30%, 50%, ${breathT * 0.12})`} />
                    <stop offset="80%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <circle cx="100" cy="100" r="90" fill={`url(#${svgId}-lungGlow)`} />

                {/* Left lung */}
                <motion.path
                  d={`M 75 65 Q 55 ${65 + lungScale * 15}, 52 ${95 + lungScale * 15} Q 50 ${130 + lungScale * 8}, 70 ${140 + lungScale * 5} Q 85 ${145 + lungScale * 3}, 90 130`}
                  fill="none"
                  stroke={`hsla(200, ${20 + breathT * 15}%, ${35 + breathT * 15}%, ${0.12 + breathT * 0.1})`}
                  strokeWidth={0.8 + breathT * 0.4}
                  strokeLinecap="round"
                  initial={{ scale: 1 }}
                  animate={{ scale: lungScale }}
                  style={{ transformOrigin: '72px 100px' }}
                />
                {/* Right lung */}
                <motion.path
                  d={`M 125 65 Q 145 ${65 + lungScale * 15}, 148 ${95 + lungScale * 15} Q 150 ${130 + lungScale * 8}, 130 ${140 + lungScale * 5} Q 115 ${145 + lungScale * 3}, 110 130`}
                  fill="none"
                  stroke={`hsla(200, ${20 + breathT * 15}%, ${35 + breathT * 15}%, ${0.12 + breathT * 0.1})`}
                  strokeWidth={0.8 + breathT * 0.4}
                  strokeLinecap="round"
                  initial={{ scale: 1 }}
                  animate={{ scale: lungScale }}
                  style={{ transformOrigin: '128px 100px' }}
                />
                {/* Trachea */}
                <line x1="100" y1="45" x2="100" y2="70"
                  stroke={`hsla(200, 15%, 35%, ${0.08 + breathT * 0.04})`} strokeWidth="1" strokeLinecap="round" />
                {/* Bronchi */}
                <line x1="100" y1="70" x2="80" y2="85" stroke={`hsla(200, 15%, 35%, ${0.06 + breathT * 0.03})`} strokeWidth="0.6" />
                <line x1="100" y1="70" x2="120" y2="85" stroke={`hsla(200, 15%, 35%, ${0.06 + breathT * 0.03})`} strokeWidth="0.6" />

                {/* Oxygen particles -- float upward during inhale */}
                {breathing && phase === 'inhale' && Array.from({ length: 6 }, (_, i) => (
                  <motion.circle key={`o-${i}-${cycles}`}
                    cx={85 + i * 6} cy={160 - breathT * 80}
                    r={1 + breathT * 0.5}
                    fill={`hsla(200, 35%, 55%, ${breathT * 0.15})`}
                    initial={{ opacity: 0 }} animate={{ opacity: breathT * 0.15 }}
                  />
                ))}

                {/* CO2 bar -- shrinks as cycles complete */}
                <rect x="170" y={40 + (1 - co2Level) * 100} width="8" height={co2Level * 100} rx="2"
                  fill={`hsla(0, ${15 + co2Level * 15}%, ${30 + co2Level * 10}%, ${0.06 + co2Level * 0.06})`} />
                <text x="174" y="35" textAnchor="middle" fontSize="4.5" fontFamily="monospace"
                  fill="hsla(0, 10%, 35%, 0.1)">CO₂</text>

                {/* Phase label */}
                {breathing && phase !== 'idle' && (
                  <text x="100" y="185" textAnchor="middle" fontSize="7" fontFamily="monospace"
                    fill={`hsla(200, 18%, 42%, ${0.12 + breathT * 0.06})`}>
                    {phase === 'inhale' ? 'inhale' : 'exhale. slow.'}
                  </text>
                )}
              </svg>
            </div>
            <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', textAlign: 'center' }}>
              {!breathing ? 'The lungs. Waiting.' : cycles < BREATH_CYCLES ? `Cycle ${cycles + 1} of ${BREATH_CYCLES}. ${phase}.` : 'Flooded. Chemistry changed.'}
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: BREATH_CYCLES }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < cycles ? 'hsla(200, 30%, 50%, 0.5)' : palette.primaryFaint, opacity: i < cycles ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five cycles. CO₂ dumped. Blood alkalized. You changed the chemistry with nothing but breath.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Respiratory alkalosis. Extended exhale shifts blood pH, driving oxygen into tissues. The Wim Hof mechanism: consciousness altered through chemistry.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Inhale. Exhale. Alkalized.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}