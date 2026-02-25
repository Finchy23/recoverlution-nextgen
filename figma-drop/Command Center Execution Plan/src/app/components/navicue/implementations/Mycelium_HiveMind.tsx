/**
 * MYCELIUM #2 — The Hive Mind
 * "Collective intelligence beats individual genius. Ask the swarm."
 * INTERACTION: A swarm of particles moving as one fluid shape. Tap to
 * fragment them (individual thinking) — they scatter. Tap again and they
 * re-coalesce into the swarm. The unity is stronger than isolation.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PARTICLE_COUNT = 24;

function makeParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    angle: (i / PARTICLE_COUNT) * Math.PI * 2,
    radius: 20 + Math.random() * 15,
    size: 3 + Math.random() * 3,
    speed: 0.3 + Math.random() * 0.4,
  }));
}

export default function Mycelium_HiveMind({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [scattered, setScattered] = useState(false);
  const [cycles, setCycles] = useState(0);
  const particles = useRef(makeParticles()).current;
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const toggle = useCallback(() => {
    if (stage !== 'active') return;
    const next = !scattered;
    setScattered(next);
    if (!next) {
      const c = cycles + 1;
      setCycles(c);
      if (c >= 3) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
      }
    }
  }, [stage, scattered, cycles]);

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The swarm assembles...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Collective intelligence beats individual genius.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to scatter and re-gather the swarm</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={toggle}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: 'pointer', userSelect: 'none' }}>
            {/* Swarm field */}
            <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {particles.map(p => {
                const scatterX = Math.cos(p.angle) * (60 + p.radius * 1.5);
                const scatterY = Math.sin(p.angle) * (60 + p.radius * 1.5);
                const swarmX = Math.cos(p.angle) * p.radius;
                const swarmY = Math.sin(p.angle) * p.radius;
                return (
                  <motion.div key={p.id}
                    animate={{
                      x: scattered ? scatterX : swarmX,
                      y: scattered ? scatterY : swarmY,
                      opacity: scattered ? 0.2 : 0.5,
                      scale: scattered ? 0.6 : 1,
                    }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    style={{ position: 'absolute', width: `${p.size}px`, height: `${p.size}px`, borderRadius: '50%', background: palette.accent, boxShadow: scattered ? 'none' : `0 0 ${p.size * 2}px ${palette.accentGlow}` }}
                  />
                );
              })}
              {/* Center glow when unified */}
              <motion.div
                animate={{ opacity: scattered ? 0 : 0.15, scale: scattered ? 0.5 : 1 }}
                transition={{ duration: 0.8 }}
                style={{ position: 'absolute', width: '60px', height: '60px', borderRadius: '50%', background: `radial-gradient(circle, ${palette.accent}, transparent)` }}
              />
            </div>
            <div style={{ ...navicueType.hint, color: scattered ? palette.textFaint : palette.accent, fontSize: '11px', opacity: scattered ? 0.4 : 0.6 }}>
              {scattered ? 'isolated. tap to re-gather' : 'unified. tap to scatter'}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i < cycles ? palette.accent : palette.primaryFaint, opacity: i < cycles ? 0.5 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Stop thinking alone. Ask the swarm.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The collective is smarter than any one node.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            One swarm. One mind.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}