/**
 * WILDING #8 — The Barefoot Step
 * "10,000 years of shoes. 2 million years without."
 * INTERACTION: Earth texture renders beneath a bare foot silhouette.
 * 5 taps plant steps on different terrain (grass, stone, sand, mud, moss).
 * Each step reveals a grounding fact. Mechanoreceptors fire.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Canopy');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const TERRAINS = [
  { name: 'grass', color: 'hsla(120, 22%, 28%, 0.6)', fact: '200,000 mechanoreceptors in each foot. Grass fires them all.' },
  { name: 'stone', color: 'hsla(30, 8%, 35%, 0.6)', fact: 'Stone teaches proprioception. Your ancestors read terrain through their soles.' },
  { name: 'sand', color: 'hsla(42, 25%, 45%, 0.5)', fact: 'Wet sand. Negative ions. Earthing completes the circuit.' },
  { name: 'mud', color: 'hsla(25, 18%, 22%, 0.6)', fact: 'Mud between toes. Mycobacterium vaccae in soil boosts serotonin.' },
  { name: 'moss', color: 'hsla(140, 20%, 25%, 0.6)', fact: 'Moss — the oldest carpet. 450 million years of softness.' },
];

export default function Wilding_BarefootStep({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [steps, setSteps] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  const step = () => {
    if (stage !== 'active' || steps >= 5) return;
    const next = steps + 1;
    setSteps(next);
    if (next >= 5) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
    }
  };

  const t = steps / 5;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The earth remembers your feet...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Ten thousand years of shoes. Two million years without. Your feet forgot what they knew. Remind them.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to plant each step</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={step}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: steps >= 5 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(120, ${6 + t * 10}%, ${6 + t * 5}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Terrain layers */}
                {TERRAINS.map((terrain, i) => i < steps && (
                  <motion.rect key={terrain.name}
                    x={i * 44} y="120" width="44" height="60"
                    fill={terrain.color}
                    initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{ transformOrigin: 'bottom' }}
                  />
                ))}
                {/* Foot prints */}
                {Array.from({ length: steps }, (_, i) => (
                  <motion.ellipse key={`foot-${i}`}
                    cx={22 + i * 44} cy={140}
                    rx="12" ry="18"
                    fill={`hsla(30, 12%, 55%, ${0.06 + i * 0.02})`}
                    initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  />
                ))}
                {/* Central glow */}
                <motion.circle cx="110" cy="90" r={20 + t * 30}
                  fill={`hsla(120, 15%, 40%, ${t * 0.04})`}
                  animate={{ r: 20 + t * 30 }}
                />
              </svg>
            </div>
            <motion.div key={steps} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center', maxWidth: '260px' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {steps === 0 ? 'Five terrains wait beneath your soles.' : TERRAINS[steps - 1].fact}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {TERRAINS.map((_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < steps ? TERRAINS[i].color : palette.primaryFaint, opacity: i < steps ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five terrains. Five ancient conversations. Your feet spoke a language older than words. Mechanoreceptors, proprioceptors, the electrical grounding circuit: all awakened.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Earthing research: barefoot contact with earth transfers free electrons. Reduces inflammation markers. The oldest medicine is the ground beneath you.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Grass. Stone. Sand. Mud. Moss. Home.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}