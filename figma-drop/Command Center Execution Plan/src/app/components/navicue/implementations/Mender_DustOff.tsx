/**
 * MENDER #7 — The Dust Off
 * "You fell. Now brush yourself off. One motion at a time."
 * INTERACTION: Dust covers the screen. Swipe/tap areas to brush
 * it away. Beneath each cleared patch — a truth about resilience.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Behavioral Activation', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PATCHES = [
  { x: 15, y: 20, truth: 'You got back up before.' },
  { x: 55, y: 15, truth: 'The fall is not the story.' },
  { x: 30, y: 50, truth: 'Dust washes off.' },
  { x: 65, y: 55, truth: 'You are still here.' },
  { x: 20, y: 80, truth: 'Standing is enough.' },
  { x: 60, y: 80, truth: 'Begin again. Gently.' },
];

export default function Mender_DustOff({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [cleared, setCleared] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleClear = (i: number) => {
    if (stage !== 'active' || cleared.includes(i)) return;
    const next = [...cleared, i];
    setCleared(next);
    if (next.length >= PATCHES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2200);
    }
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Behavioral Activation" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            You fell.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Now brush yourself off.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap the dust to clear it</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '260px', height: '220px', position: 'relative', borderRadius: radius.md, overflow: 'hidden' }}>
              {/* Dust overlay */}
              <motion.div
                animate={{ opacity: 1 - (cleared.length / PATCHES.length) * 0.6 }}
                style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, ${palette.primaryFaint}, transparent)`, pointerEvents: 'none', zIndex: 0 }}
              />
              {/* Dust patches */}
              {PATCHES.map((p, i) => {
                const isCleared = cleared.includes(i);
                return (
                  <motion.button key={i}
                    onClick={() => handleClear(i)}
                    animate={isCleared ? { opacity: 1, scale: 1 } : { opacity: 0.6, scale: 1 }}
                    whileHover={!isCleared ? { scale: 1.08 } : undefined}
                    style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, width: '80px', height: '36px', borderRadius: radius.full, background: isCleared ? 'transparent' : palette.primaryFaint, border: isCleared ? `1px solid ${palette.accentGlow}` : '1px solid transparent', cursor: isCleared ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 8px', zIndex: 1 }}>
                    {isCleared ? (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.7 }}
                        style={{ ...navicueType.hint, color: palette.text, fontSize: '9px', textAlign: 'center', lineHeight: 1.3 }}>
                        {p.truth}
                      </motion.span>
                    ) : (
                      <div style={{ width: '100%', height: '8px', background: palette.primary, borderRadius: radius.xs, opacity: 0.15 }} />
                    )}
                  </motion.button>
                );
              })}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {cleared.length} of {PATCHES.length} cleared
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You fell. You got up. That is the whole story.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Dust washes off. Resilience does not.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Brushed off. Still standing.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}