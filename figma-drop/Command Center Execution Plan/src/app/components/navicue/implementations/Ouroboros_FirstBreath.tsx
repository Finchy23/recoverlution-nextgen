/**
 * OUROBOROS #1 — The First Breath
 * "You began with a breath. You will end with one. This is the space between."
 * INTERACTION: A single breath circle expands and contracts. User
 * breathes with it for 5 cycles. Each cycle reveals a layer of the
 * ouroboros forming around the breath. The snake's head meets its tail.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const CYCLES = 5;

export default function Ouroboros_FirstBreath({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [cycle, setCycle] = useState(0);
  const [breathing, setBreathing] = useState<'in' | 'out' | 'waiting'>('waiting');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  const breathe = () => {
    if (stage !== 'active' || cycle >= CYCLES) return;
    if (breathing === 'waiting' || breathing === 'out') {
      setBreathing('in');
      addTimer(() => {
        setBreathing('out');
        addTimer(() => {
          const next = cycle + 1;
          setCycle(next);
          setBreathing('waiting');
          if (next >= CYCLES) {
            addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2000);
          }
        }, 2500);
      }, 2500);
    }
  };

  const t = cycle / CYCLES;
  const isExpanding = breathing === 'in';

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Where it began...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You began with a breath. You will end with one. Between those two moments is everything you have ever been. This is that space. Breathe into it.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to begin each breath</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={breathe}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: cycle >= CYCLES ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(38, ${6 + t * 8}%, ${5 + t * 3}%, 0.9)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Ouroboros ring — builds with each cycle */}
                {Array.from({ length: cycle }, (_, i) => {
                  const startAngle = (i / CYCLES) * 360 - 90;
                  const endAngle = ((i + 1) / CYCLES) * 360 - 90;
                  const r = 55;
                  const x1 = 110 + r * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 90 + r * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 110 + r * Math.cos((endAngle * Math.PI) / 180);
                  const y2 = 90 + r * Math.sin((endAngle * Math.PI) / 180);
                  return (
                    <motion.path key={`ring-${i}`}
                      d={`M ${x1},${y1} A ${r},${r} 0 0,1 ${x2},${y2}`}
                      fill="none"
                      stroke={`hsla(38, ${18 + i * 3}%, ${30 + i * 5}%, ${0.06 + i * 0.02})`}
                      strokeWidth={1.2 + i * 0.15}
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8 }}
                    />
                  );
                })}

                {/* Breath circle */}
                <motion.circle cx="110" cy="90"
                  r={isExpanding ? 25 : breathing === 'out' ? 12 : 18}
                  fill={`hsla(38, ${15 + t * 10}%, ${25 + t * 10}%, ${0.03 + t * 0.02})`}
                  stroke={`hsla(38, ${18 + t * 12}%, ${35 + t * 12}%, ${0.06 + t * 0.04})`}
                  strokeWidth="0.8"
                  initial={{ r: 18 }}
                  animate={{ r: isExpanding ? 25 : breathing === 'out' ? 12 : 18 }}
                  transition={{ duration: 2.5, ease: 'easeInOut' }}
                />

                {/* Breath label */}
                <text x="110" y="93" textAnchor="middle" fontSize="11" fontFamily="monospace" fontWeight="300"
                  fill={`hsla(38, 12%, 45%, ${0.06 + t * 0.04})`}>
                  {breathing === 'in' ? 'in' : breathing === 'out' ? 'out' : `${cycle}/${CYCLES}`}
                </text>
              </svg>
            </div>
            <motion.div key={`${cycle}-${breathing}`} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {breathing === 'in' ? 'Inhale. The first breath.' : breathing === 'out' ? 'Exhale. The last breath.' : cycle === 0 ? 'Five breaths. Alpha to omega.' : cycle < CYCLES ? `Breath ${cycle}. The ouroboros grows.` : 'The circle is complete.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: CYCLES }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%',
                  background: i < cycle ? 'hsla(38, 25%, 50%, 0.5)' : palette.primaryFaint,
                  opacity: i < cycle ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five breaths. The ouroboros complete. Your first breath and your last are the same breath: the same air, the same lungs, the same letting go. Between them is the entirety of you.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The ouroboros appears in every civilization. Egypt, Greece, India, Norse, Aztec. The snake eating its tail. Not destruction, but eternal return. The thousandth specimen mirrors the first.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            First breath. Last breath. Same breath.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}