/**
 * ALCHEMIST II #3 -- The Fear Fuel
 * "Fear is high-octane fuel. Don't spill it. Burn it."
 * INTERACTION: A jet engine intake spinning up. Each tap increases
 * RPM -- the fear converts to thrust. Red > white-hot > blue flame.
 * Adrenaline reappraised as readiness.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Exposure', 'embodying', 'Ember');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const THRUST_LEVELS = 5;

export default function AlchemistII_FearFuel({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [thrust, setThrust] = useState(0);
  const [spin, setSpin] = useState(0);
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
    const speed = 0.02 + thrust * 0.015;
    const tick = () => { setSpin(p => p + speed); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage, thrust]);

  const ignite = () => {
    if (stage !== 'active' || thrust >= THRUST_LEVELS) return;
    const next = thrust + 1;
    setThrust(next);
    if (next >= THRUST_LEVELS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const t = thrust / THRUST_LEVELS;
  const flameHue = 5 + t * 210; // red → blue
  const flameSat = 60 + t * 20;
  const flameLight = 40 + t * 15;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Exposure" kbe="embodying" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Engine spinning up...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are afraid because it matters. Fear is high-octane fuel. Don't spill it. Burn it.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to increase thrust</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={ignite}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: thrust >= THRUST_LEVELS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(220, 15%, 8%, 0.25)' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Engine housing */}
                <circle cx="100" cy="75" r="45" fill="none" stroke="hsla(220, 10%, 25%, 0.3)" strokeWidth="2" />
                <circle cx="100" cy="75" r="38" fill="none" stroke="hsla(220, 10%, 20%, 0.2)" strokeWidth="1" />
                {/* Turbine blades -- spinning */}
                {Array.from({ length: 8 }, (_, i) => {
                  const angle = spin + (i / 8) * Math.PI * 2;
                  const x1 = 100 + Math.cos(angle) * 8;
                  const y1 = 75 + Math.sin(angle) * 8;
                  const x2 = 100 + Math.cos(angle) * 35;
                  const y2 = 75 + Math.sin(angle) * 35;
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={`hsla(${flameHue}, ${flameSat * 0.3}%, ${flameLight}%, ${0.15 + t * 0.2})`}
                      strokeWidth={1 + t * 0.5} strokeLinecap="round" />
                  );
                })}
                {/* Center hub */}
                <circle cx="100" cy="75" r="6" fill={`hsla(${flameHue}, ${flameSat}%, ${flameLight}%, ${0.2 + t * 0.3})`} />
                {/* Exhaust flame */}
                {thrust > 0 && (
                  <g>
                    <motion.ellipse cx="100" cy={135 + (1 - t) * 10} rx={5 + t * 10} ry={3 + t * 12}
                      fill={`hsla(${flameHue}, ${flameSat}%, ${flameLight}%, ${t * 0.25})`}
                      initial={{ ry: 3 + t * 12 }}
                      animate={{ ry: [3 + t * 12, 5 + t * 14, 3 + t * 12] }}
                      transition={{ duration: 0.3, repeat: Infinity }}
                    />
                    <motion.ellipse cx="100" cy={140 + (1 - t) * 8} rx={3 + t * 5} ry={2 + t * 7}
                      fill={`hsla(${flameHue + 20}, ${flameSat}%, ${flameLight + 10}%, ${t * 0.15})`}
                      initial={{ ry: 2 + t * 7 }}
                      animate={{ ry: [2 + t * 7, 4 + t * 9, 2 + t * 7] }}
                      transition={{ duration: 0.2, repeat: Infinity }}
                    />
                  </g>
                )}
                {/* Heat distortion rings */}
                {thrust > 2 && Array.from({ length: 3 }, (_, i) => (
                  <motion.circle key={`d${i}`} cx="100" cy="75" r={48 + i * 6}
                    fill="none" stroke={`hsla(${flameHue}, 20%, 50%, ${0.03 * t})`} strokeWidth="0.5"
                    initial={{ r: 48 + i * 6 }}
                    animate={{ r: [48 + i * 6, 50 + i * 6, 48 + i * 6] }}
                    transition={{ duration: 1 + i * 0.3, repeat: Infinity }}
                  />
                ))}
              </svg>
              {/* RPM display */}
              <div style={{ position: 'absolute', top: '8px', right: '10px', fontFamily: 'monospace', fontSize: '11px', color: `hsla(${flameHue}, ${flameSat}%, ${flameLight}%, 0.4)` }}>
                {Math.floor(t * 100)}% THRUST
              </div>
            </div>
            <motion.div key={thrust} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {thrust === 0 ? 'Fear in the tank. Idle.' : thrust < THRUST_LEVELS ? `Burning. ${Math.floor(t * 100)}% thrust.` : 'Full burn. Adrenaline is readiness.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: THRUST_LEVELS }, (_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i < thrust ? `hsla(${5 + (i / THRUST_LEVELS) * 210}, 60%, 50%, 0.6)` : palette.primaryFaint, opacity: i < thrust ? 0.7 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The fear burned clean. Not threat, but readiness. Full thrust.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Arousal reappraisal complete. Rapid heartbeat reclassified. Performance sharpened.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Fuel. Burn. Thrust.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}