/**
 * DIPLOMAT #10 — The Sangha Search
 * "Your people exist. This is how you find them."
 * INTERACTION: Scattered dim lights in darkness — each a potential
 * connection. Tap to send a signal. Some lights glow back.
 * Not all of them — but enough. Your tribe is out there.
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('relational_ghost', 'Connection', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

export default function Diplomat_SanghaSearch({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [signaled, setSignaled] = useState<number[]>([]);
  const [glowedBack, setGlowedBack] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  const LIGHTS = useMemo(() => {
    const rng = seededRandom(42);
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 10 + rng() * 80,
      y: 10 + rng() * 80,
      responds: rng() > 0.45, // ~55% respond
    }));
  }, []);

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleSignal = (i: number) => {
    if (stage !== 'active' || signaled.includes(i)) return;
    const next = [...signaled, i];
    setSignaled(next);
    // After a beat, the light responds (or doesn't)
    if (LIGHTS[i].responds) {
      addTimer(() => setGlowedBack(prev => [...prev, i]), 600 + Math.random() * 800);
    }
    // After signaling 8+, complete
    if (next.length >= 8) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  const respondedCount = glowedBack.length;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Connection" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            You are not the only light.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Your people exist. Send the signal.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap the lights to call out</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '280px', height: '260px', position: 'relative' }}>
              {LIGHTS.map(light => {
                const isSig = signaled.includes(light.id);
                const isGlowed = glowedBack.includes(light.id);
                const isSilent = isSig && !light.responds;
                return (
                  <motion.button key={light.id}
                    onClick={() => handleSignal(light.id)}
                    animate={{
                      opacity: isGlowed ? 0.9 : isSig ? (isSilent ? 0.08 : 0.3) : 0.15,
                      scale: isGlowed ? 1.4 : isSig ? 0.8 : 1,
                    }}
                    whileHover={!isSig ? { scale: 1.3, opacity: 0.35 } : undefined}
                    transition={{ duration: 0.8 }}
                    style={{ position: 'absolute', left: `${light.x}%`, top: `${light.y}%`, transform: 'translate(-50%, -50%)', width: '14px', height: '14px', borderRadius: '50%', background: isGlowed ? palette.accent : palette.primaryFaint, border: 'none', cursor: isSig ? 'default' : 'pointer', boxShadow: isGlowed ? `0 0 16px ${palette.accentGlow}` : 'none', padding: 0 }} />
                );
              })}
              {/* You — center */}
              <motion.div
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '8px', height: '8px', borderRadius: '50%', background: palette.accent, boxShadow: `0 0 12px ${palette.accentGlow}` }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {respondedCount} light{respondedCount !== 1 ? 's' : ''} glowed back
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Not all of them. But enough.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Your people are out there. They're looking for you too.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Keep signaling.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}