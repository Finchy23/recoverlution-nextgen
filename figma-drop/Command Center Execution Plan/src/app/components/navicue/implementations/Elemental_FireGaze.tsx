/**
 * ELEMENTAL #1 — The Fire Gaze
 * "Fire is the first television. It burns the thoughts you don't need."
 * INTERACTION: A procedural flame simulation — particles rise, flicker,
 * never repeat. Hold your gaze. A thought counter slowly decreases as
 * alpha-state entrainment deepens. The fire consumes what isn't needed.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Somatic Regulation', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

interface Particle { id: number; x: number; y: number; size: number; life: number; maxLife: number; hue: number; }

const GAZE_DURATION = 12000;

export default function Elemental_FireGaze({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [gazing, setGazing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [thoughts, setThoughts] = useState(7);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const particleId = useRef(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const tick = useCallback(() => {
    const elapsed = Date.now() - startRef.current;
    const p = Math.min(1, elapsed / GAZE_DURATION);
    setProgress(p);
    setThoughts(Math.max(0, Math.round(7 * (1 - p))));

    // Spawn particles
    setParticles(prev => {
      const next = prev
        .map(pt => ({ ...pt, life: pt.life + 1 }))
        .filter(pt => pt.life < pt.maxLife);
      if (Math.random() > 0.3) {
        particleId.current++;
        next.push({
          id: particleId.current,
          x: 95 + (Math.random() - 0.5) * 30,
          y: 140,
          size: 3 + Math.random() * 6,
          life: 0,
          maxLife: 30 + Math.random() * 25,
          hue: 15 + Math.random() * 30,
        });
      }
      return next;
    });

    if (p >= 1) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [onComplete]);

  const startGaze = () => {
    if (gazing || stage !== 'active') return;
    setGazing(true);
    startRef.current = Date.now() - progress * GAZE_DURATION;
    rafRef.current = requestAnimationFrame(tick);
  };

  // Keep flame alive even before gazing
  useEffect(() => {
    if (stage !== 'active' || gazing) return;
    const ambient = () => {
      setParticles(prev => {
        const next = prev.map(pt => ({ ...pt, life: pt.life + 1 })).filter(pt => pt.life < pt.maxLife);
        if (Math.random() > 0.5) {
          particleId.current++;
          next.push({ id: particleId.current, x: 95 + (Math.random() - 0.5) * 20, y: 140, size: 2 + Math.random() * 4, life: 0, maxLife: 20 + Math.random() * 15, hue: 15 + Math.random() * 30 });
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(ambient);
    };
    rafRef.current = requestAnimationFrame(ambient);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage, gazing]);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Striking the match...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Watch the flame. It never repeats.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to light the fire</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={startGaze}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: gazing ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            {/* Fire field */}
            <div style={{ position: 'relative', width: '190px', height: '180px', overflow: 'hidden', borderRadius: radius.md }}>
              {/* Dark base */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(0deg, hsla(15, 30%, 8%, 0.6), transparent)' }} />
              {/* Wick */}
              <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '2px', height: '20px', background: 'hsla(30, 20%, 30%, 0.4)', borderRadius: '1px' }} />
              {/* Particles */}
              <svg width="100%" height="100%" viewBox="0 0 190 180" style={{ position: 'absolute', inset: 0 }}>
                {particles.map(pt => {
                  const lifeRatio = pt.life / pt.maxLife;
                  const y = pt.y - lifeRatio * 100 - Math.sin(pt.life * 0.3) * 5;
                  const x = pt.x + Math.sin(pt.life * 0.2 + pt.id) * 8;
                  const opacity = lifeRatio < 0.3 ? lifeRatio / 0.3 : 1 - (lifeRatio - 0.3) / 0.7;
                  const size = pt.size * (1 - lifeRatio * 0.6);
                  const hue = pt.hue + lifeRatio * 20;
                  return (
                    <circle key={pt.id} cx={x} cy={y} r={size}
                      fill={`hsla(${hue}, ${80 - lifeRatio * 30}%, ${55 + lifeRatio * 15}%, ${opacity * 0.7})`}
                    />
                  );
                })}
                {/* Core glow */}
                <circle cx="95" cy="130" r={gazing ? 12 : 8} fill="hsla(40, 90%, 60%, 0.15)" />
                <circle cx="95" cy="125" r={gazing ? 6 : 4} fill="hsla(45, 95%, 70%, 0.2)" />
              </svg>
              {/* Ambient glow */}
              <motion.div
                animate={{ opacity: gazing ? 0.12 : 0.04 }}
                style={{ position: 'absolute', bottom: '10%', left: '30%', width: '40%', height: '50%', borderRadius: '50%', background: 'radial-gradient(ellipse, hsla(30, 80%, 50%, 0.3), transparent)', filter: 'blur(10px)' }}
              />
            </div>
            {/* Thought counter */}
            {gazing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ ...navicueType.texture, color: 'hsla(30, 60%, 55%, 0.6)', fontSize: '11px', fontStyle: 'italic' }}>
                  {thoughts > 0 ? `${thoughts} thought${thoughts !== 1 ? 's' : ''} remaining...` : 'burned clean.'}
                </div>
                <div style={{ width: '120px', height: '2px', background: palette.primaryFaint, borderRadius: '1px', overflow: 'hidden' }}>
                  <motion.div animate={{ width: `${progress * 100}%` }} style={{ height: '100%', background: 'hsla(25, 70%, 50%, 0.5)' }} />
                </div>
              </motion.div>
            )}
            {!gazing && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.35 }}>
                tap to gaze into the flame
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Fire is the first television. It burned the thoughts you didn't need.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Alpha state. The oldest medicine. Still works.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Embers. Quiet mind.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}