/**
 * ALCHEMIST II #2 -- The Grief Garden
 * "Grief is love with nowhere to go. Plant it. Let it grow something new."
 * INTERACTION: Rain falls on barren soil. Each tap plants a seed.
 * Time-lapse: sprouts → stems → flowers emerge from the grief.
 * Loss as fertilizer. The end becomes the beginning.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Self-Compassion', 'embodying', 'Ember');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SEEDS = 5;

export default function AlchemistII_GriefGarden({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [planted, setPlanted] = useState(0);
  const [rainPhase, setRainPhase] = useState(0);
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
    const tick = () => { setRainPhase(p => p + 0.06); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const plant = () => {
    if (stage !== 'active' || planted >= SEEDS) return;
    const next = planted + 1;
    setPlanted(next);
    if (next >= SEEDS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  const growth = planted / SEEDS;
  const PLANT_POSITIONS = [35, 70, 110, 145, 180];
  const FLOWER_COLORS = ['hsla(330, 40%, 55%, 0.6)', 'hsla(280, 35%, 50%, 0.5)', 'hsla(45, 50%, 55%, 0.6)', 'hsla(200, 35%, 50%, 0.5)', 'hsla(15, 45%, 50%, 0.6)'];

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Self-Compassion" kbe="embodying" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Rain begins...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Grief is love with nowhere to go. Plant it. Let it grow something new.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to plant each seed</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={plant}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: planted >= SEEDS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '160px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(220, 15%, 10%, 0.4)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Rain */}
                {Array.from({ length: 15 }, (_, i) => {
                  const rx = (i * 37 + rainPhase * 15) % 220;
                  const ry = (i * 23 + rainPhase * 40) % 130;
                  const opacity = Math.max(0, 0.15 - growth * 0.08);
                  return (
                    <line key={`r${i}`} x1={rx} y1={ry} x2={rx - 1} y2={ry + 6}
                      stroke={`hsla(210, 20%, 55%, ${opacity})`} strokeWidth="0.5" />
                  );
                })}
                {/* Ground -- darkens as rain soaks in, then enriches */}
                <rect x="0" y="120" width="220" height="40"
                  fill={`hsla(${25 + growth * 10}, ${10 + growth * 15}%, ${12 + growth * 5}%, 0.5)`} />
                {/* Ground texture lines */}
                {[0, 40, 80, 120, 160, 200].map((gx, i) => (
                  <line key={`g${i}`} x1={gx} y1="122" x2={gx + 20} y2="122"
                    stroke={`hsla(25, 10%, 20%, ${0.1 + growth * 0.05})`} strokeWidth="0.5" />
                ))}
                {/* Plants */}
                {PLANT_POSITIONS.map((px, i) => {
                  if (i >= planted) return null;
                  const age = (planted - i) / SEEDS;
                  const stemH = 15 + age * 40;
                  const hasFlower = age > 0.3;
                  return (
                    <g key={`plant${i}`}>
                      {/* Stem */}
                      <motion.line x1={px} y1={120} x2={px} y2={120 - stemH}
                        stroke={`hsla(120, 25%, ${30 + age * 15}%, ${0.3 + age * 0.3})`}
                        strokeWidth="1.5" strokeLinecap="round"
                        initial={{ y2: 120 }} animate={{ y2: 120 - stemH }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                      {/* Leaves */}
                      {age > 0.2 && (
                        <>
                          <motion.ellipse cx={px - 5} cy={120 - stemH * 0.5} rx="4" ry="2"
                            fill={`hsla(120, 30%, 35%, ${age * 0.4})`}
                            transform={`rotate(-30, ${px - 5}, ${120 - stemH * 0.5})`}
                            initial={{ opacity: 0 }} animate={{ opacity: age * 0.5 }}
                            transition={{ delay: 0.5 }}
                          />
                          <motion.ellipse cx={px + 5} cy={120 - stemH * 0.6} rx="4" ry="2"
                            fill={`hsla(120, 30%, 35%, ${age * 0.4})`}
                            transform={`rotate(30, ${px + 5}, ${120 - stemH * 0.6})`}
                            initial={{ opacity: 0 }} animate={{ opacity: age * 0.5 }}
                            transition={{ delay: 0.8 }}
                          />
                        </>
                      )}
                      {/* Flower */}
                      {hasFlower && (
                        <motion.circle cx={px} cy={120 - stemH - 4} r={3 + age * 3}
                          fill={FLOWER_COLORS[i]}
                          initial={{ r: 0, opacity: 0 }}
                          animate={{ r: 3 + age * 3, opacity: 0.6 }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
            <motion.div key={planted} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {planted === 0 ? 'Dead soil. Rain falling.' : planted < SEEDS ? `Seed ${planted} planted. Growing...` : 'The garden blooms from grief.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: SEEDS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < planted ? FLOWER_COLORS[i] : palette.primaryFaint, opacity: i < planted ? 0.7 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The grief became the garden. Love found somewhere to go.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Post-traumatic growth. The end became fertilizer. Something new blooms.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Planted. Grown. Blooming.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}