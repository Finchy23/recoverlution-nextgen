/**
 * ATHLETE #6 -- The Fuel Check
 * "You are not anxious. You are hypoglycemic."
 * INTERACTION: A fuel gauge needle sits on E. Each tap adds fuel --
 * the needle sweeps upward through 5 segments. As fuel rises,
 * the amygdala alarm icon dims. Not anxiety. Just hungry.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const FUEL_STEPS = 5;
const HALT_LABELS = ['hungry', 'angry', 'lonely', 'tired', 'fed'];

export default function Athlete_FuelCheck({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [fuel, setFuel] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const refuel = () => {
    if (stage !== 'active' || fuel >= FUEL_STEPS) return;
    const next = fuel + 1;
    setFuel(next);
    if (next >= FUEL_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = fuel / FUEL_STEPS;
  const needleAngle = -90 + t * 180; // -90° (E) → 90° (F)
  const alarmOpacity = (1 - t) * 0.15;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The gauge reads empty...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are not anxious. You are hypoglycemic. The brain uses 20% of your energy. Feed the machine.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to add fuel</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={refuel}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: fuel >= FUEL_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '170px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(35, ${8 + t * 8}%, ${7 + t * 3}%, 0.3)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Gauge arc */}
                <path d="M 40 120 A 60 60 0 0 1 160 120"
                  fill="none" stroke="hsla(0, 0%, 20%, 0.06)" strokeWidth="8" strokeLinecap="round" />
                {/* Fuel fill arc */}
                {t > 0 && (
                  <motion.path
                    d="M 40 120 A 60 60 0 0 1 160 120"
                    fill="none"
                    stroke={`hsla(${35 + t * 80}, ${20 + t * 15}%, ${35 + t * 12}%, ${0.1 + t * 0.1})`}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${t * 188.5} ${188.5}`}
                    initial={{ strokeDasharray: '0 188.5' }}
                  />
                )}

                {/* E and F labels */}
                <text x="32" y="132" fontSize="7" fontFamily="monospace"
                  fill="hsla(0, 12%, 35%, 0.12)">E</text>
                <text x="162" y="132" fontSize="7" fontFamily="monospace"
                  fill="hsla(120, 12%, 35%, 0.12)">F</text>

                {/* Gauge needle */}
                <motion.g
                  initial={{ rotate: 0 }}
                  animate={{ rotate: needleAngle }}
                  transition={{ type: 'spring', stiffness: 60, damping: 12 }}
                  style={{ transformOrigin: '100px 120px' }}>
                  <line x1="100" y1="120" x2="100" y2="70"
                    stroke={`hsla(${35 + t * 80}, ${15 + t * 10}%, ${35 + t * 10}%, ${0.15 + t * 0.08})`}
                    strokeWidth="1.2" strokeLinecap="round" />
                </motion.g>
                {/* Needle hub */}
                <circle cx="100" cy="120" r="3"
                  fill={`hsla(0, 0%, 18%, 0.08)`} />

                {/* Amygdala alarm -- fading */}
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: alarmOpacity }} transition={{ duration: 0.5 }}>
                  <circle cx="100" cy="38" r="12" fill="none"
                    stroke="hsla(0, 20%, 40%, 0.08)" strokeWidth="0.5" />
                  <text x="100" y="41" textAnchor="middle" fontSize="6" fontFamily="monospace"
                    fill={`hsla(0, 15%, 38%, ${alarmOpacity})`}>!</text>
                  <text x="100" y="55" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                    fill={`hsla(0, 10%, 32%, ${alarmOpacity * 0.6})`}>amygdala</text>
                </motion.g>

                {/* HALT check */}
                <text x="100" y="155" textAnchor="middle" fontSize="5" fontFamily="monospace"
                  fill={`hsla(35, 12%, 38%, ${0.08 + t * 0.06})`}>
                  {fuel === 0 ? 'H.A.L.T. check' : HALT_LABELS[Math.min(fuel - 1, HALT_LABELS.length - 1)]}
                </text>
              </svg>
            </div>
            <motion.div key={fuel} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {fuel === 0 ? 'Empty. The alarm is firing. Not anxiety.' : fuel < FUEL_STEPS ? `Fueling... gauge at ${Math.round(t * 100)}%.` : 'Full. The alarm went silent. It was glucose.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: FUEL_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < fuel ? `hsla(${35 + (i / FUEL_STEPS) * 80}, 25%, 48%, 0.5)` : palette.primaryFaint, opacity: i < fuel ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Gauge full. Alarm silent. It was not anxiety, it was glucose. The amygdala fires when the machine is hungry. Feed it first, diagnose second.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Metabolic regulation. Separating psychological distress from physiological deficit. HALT: Hungry, Angry, Lonely, Tired. Check the body before blaming the mind.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Empty. Feed. Silent.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}