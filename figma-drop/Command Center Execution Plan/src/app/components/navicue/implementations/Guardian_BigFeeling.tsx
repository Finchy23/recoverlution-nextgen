/**
 * GUARDIAN #1 — The Big Feeling
 * "It is not bad behavior. It is a big feeling in a small body."
 * INTERACTION: A storm cloud builds. Tap to let it rain — heavy
 * downpour across 5 taps, each heavier. The rain exhausts itself.
 * Cloud evaporates. Sky clears. The limbic alarm quiets.
 * Prefrontal cortex engages.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const RAIN_STAGES = 5;

export default function Guardian_BigFeeling({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [rainLevel, setRainLevel] = useState(0);
  const [clearing, setClearing] = useState(false);
  const [raindrops, setRaindrops] = useState<{ id: number; x: number; delay: number; speed: number }[]>([]);
  const dropIdRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const rain = () => {
    if (stage !== 'active' || rainLevel >= RAIN_STAGES || clearing) return;
    const next = rainLevel + 1;
    setRainLevel(next);
    // Spawn raindrops proportional to level
    const count = next * 6;
    const drops = Array.from({ length: count }, () => ({
      id: dropIdRef.current++,
      x: Math.random() * 220,
      delay: Math.random() * 0.8,
      speed: 0.6 + Math.random() * 0.5,
    }));
    setRaindrops(prev => [...prev, ...drops]);
    if (next >= RAIN_STAGES) {
      // Rain exhausts itself → clearing
      addTimer(() => {
        setClearing(true);
        addTimer(() => {
          setStage('resonant');
          addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500);
        }, 3000);
      }, 2500);
    }
  };

  const t = rainLevel / RAIN_STAGES;
  const cloudDarkness = clearing ? 0.02 : 0.03 + t * 0.06;
  const cloudSize = clearing ? 20 : 25 + t * 15;
  const skyHue = clearing ? 210 : 230;
  const skyLight = clearing ? 12 : 6 + t * 2;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something gathering...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Let it rain. It is not bad behavior. It is a big feeling in a small body. Do not stop the rain. Hold the umbrella.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to let the storm through</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={rain}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: rainLevel >= RAIN_STAGES || clearing ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <motion.div
              animate={{ backgroundColor: `hsla(${skyHue}, ${6 + (clearing ? 8 : 0)}%, ${skyLight}%, 0.85)` }}
              transition={{ duration: 2 }}
              style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Storm cloud */}
                <motion.g initial={{ opacity: 0.06 }} animate={{ opacity: clearing ? 0.02 : 0.06 + t * 0.06 }} transition={{ duration: 2.5 }}>
                  <ellipse cx="110" cy="35" rx={cloudSize} ry={cloudSize * 0.5}
                    fill={`hsla(230, 8%, ${18 - t * 4}%, ${cloudDarkness})`} />
                  <ellipse cx="90" cy="32" rx={cloudSize * 0.7} ry={cloudSize * 0.4}
                    fill={`hsla(230, 6%, ${20 - t * 5}%, ${cloudDarkness * 0.8})`} />
                  <ellipse cx="130" cy="33" rx={cloudSize * 0.65} ry={cloudSize * 0.38}
                    fill={`hsla(230, 7%, ${19 - t * 4}%, ${cloudDarkness * 0.7})`} />
                </motion.g>

                {/* Raindrops — fall animation */}
                {!clearing && raindrops.map(d => (
                  <motion.line key={d.id}
                    x1={d.x} y1={50}
                    x2={d.x} y2={53}
                    stroke={`hsla(210, 15%, ${35 + t * 8}%, ${0.04 + t * 0.03})`}
                    strokeWidth="0.5" strokeLinecap="round"
                    initial={{ y: 0, opacity: 0.06 }}
                    animate={{ y: 130, opacity: 0 }}
                    transition={{ duration: d.speed, delay: d.delay, ease: 'linear' }}
                  />
                ))}

                {/* Ground puddle — grows with rain */}
                <motion.ellipse cx="110" cy="165" rx={15 + t * 30} ry={2 + t * 3}
                  fill={`hsla(210, ${8 + t * 6}%, ${18 + t * 4}%, ${0.02 + t * 0.03})`}
                  initial={{ rx: 15, opacity: 0.12 }}
                  animate={{ rx: clearing ? 50 + t * 15 : 15 + t * 30, opacity: clearing ? 0.01 : 0.02 + t * 0.03 }}
                  transition={{ duration: 2 }}
                />

                {/* Clearing sky — sun breaking through */}
                {clearing && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ duration: 2.5 }}>
                    <circle cx="160" cy="40" r="12"
                      fill="hsla(42, 22%, 50%, 0.08)" />
                    <circle cx="160" cy="40" r="20"
                      fill="hsla(42, 15%, 45%, 0.03)" />
                    {/* Rays */}
                    {Array.from({ length: 6 }, (_, i) => {
                      const angle = (i * 60) * Math.PI / 180;
                      return (
                        <line key={i}
                          x1={160 + Math.cos(angle) * 14} y1={40 + Math.sin(angle) * 14}
                          x2={160 + Math.cos(angle) * 24} y2={40 + Math.sin(angle) * 24}
                          stroke="hsla(42, 18%, 48%, 0.05)" strokeWidth="0.4" />
                      );
                    })}
                  </motion.g>
                )}

                {/* Evaporation wisps */}
                {clearing && Array.from({ length: 5 }, (_, i) => (
                  <motion.line key={`evap-${i}`}
                    x1={70 + i * 20} y1={155}
                    x2={70 + i * 20} y2={145}
                    stroke="hsla(0, 0%, 30%, 0.03)"
                    strokeWidth="0.3" strokeDasharray="1 2"
                    initial={{ opacity: 0, y: 0 }} animate={{ opacity: 0.12, y: -15 }}
                    transition={{ duration: 2, delay: i * 0.3 }}
                  />
                ))}

                {/* Stage label */}
                <text x="110" y="175" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(${clearing ? 42 : 230}, ${8 + t * 6}%, ${25 + t * 8}%, ${0.06 + t * 0.04})`}>
                  {clearing ? 'clearing' : rainLevel === 0 ? 'gathering' : `rain ${rainLevel}/${RAIN_STAGES}`}
                </text>

                {/* CLEAR */}
                {clearing && (
                  <motion.text x="110" y="100" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(42, 18%, 48%, 0.15)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 1, duration: 2 }}>
                    CLEAR
                  </motion.text>
                )}
              </svg>
            </motion.div>
            <motion.div key={`${rainLevel}-${clearing}`} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {rainLevel === 0 ? 'Storm cloud building. Something needs to come out.' : !clearing && rainLevel < RAIN_STAGES ? `Rain level ${rainLevel}. Heavier. Let it pour.` : clearing ? 'Rained itself out. Sky clearing. Feeling named.' : 'Downpour complete. Wait for it.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: RAIN_STAGES }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < rainLevel ? 'hsla(210, 18%, 50%, 0.5)' : palette.primaryFaint, opacity: i < rainLevel ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five waves of rain. Each heavier than the last. Then it rained itself out. The cloud evaporated. The sky cleared. The feeling was not stopped. It was held. That is the difference.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Name it to tame it. Acknowledging and naming intense emotions engages the prefrontal cortex, soothing the limbic system's alarm state. Do not stop the rain. Hold the umbrella.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Storm. Rain. Clear.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}