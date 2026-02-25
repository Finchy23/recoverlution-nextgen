/**
 * NAVIGATOR #1 — The Tempo Dial
 * "The world is fast. You are the stillness inside the speed."
 * INTERACTION: A haptic dial you drag to slow or speed the world.
 * The UI ripples like liquid frequency. Find your tempo.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sensory_cinema', 'Somatic Regulation', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

export default function Navigator_TempoDial({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [tempo, setTempo] = useState(50); // 0=slow, 100=fast
  const [holdCount, setHoldCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (stage !== 'active' || locked) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setTempo(Math.round(x * 100));
  }, [stage, locked]);

  const handleLock = () => {
    if (locked) return;
    const next = holdCount + 1;
    setHoldCount(next);
    if (next >= 3) {
      setLocked(true);
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
    }
  };

  const rippleSpeed = 2 + (tempo / 100) * 6;
  const rippleCount = 5;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The world is moving.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Adjust your internal metronome.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag to find your tempo, then tap to lock</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
            {/* Ripple field */}
            <div style={{ width: '200px', height: '200px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Array.from({ length: rippleCount }, (_, i) => (
                <motion.div key={i}
                  animate={{ scale: [1, 1.5 + i * 0.3], opacity: [0.3, 0] }}
                  transition={{ duration: rippleSpeed, delay: i * (rippleSpeed / rippleCount), repeat: Infinity, ease: 'easeOut' }}
                  style={{ position: 'absolute', width: '40px', height: '40px', borderRadius: '50%', border: `1px solid ${palette.primary}` }}
                />
              ))}
              {/* Center dot */}
              <motion.div animate={{ scale: locked ? 1.3 : 1 }} style={{ width: '8px', height: '8px', borderRadius: '50%', background: locked ? palette.accent : palette.primary, boxShadow: `0 0 20px ${locked ? palette.accentGlow : palette.primaryGlow}`, zIndex: 1 }} />
            </div>
            {/* Tempo slider */}
            <div onPointerMove={handleDrag} onClick={handleLock} style={{ width: '260px', height: '40px', position: 'relative', cursor: 'pointer', touchAction: 'none' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: palette.primaryFaint, transform: 'translateY(-50%)' }} />
              <motion.div animate={{ left: `${tempo}%` }} style={{ position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)', width: '16px', height: '16px', borderRadius: '50%', background: locked ? palette.accent : palette.primary, boxShadow: `0 0 12px ${palette.primaryGlow}` }} />
              <div style={{ position: 'absolute', left: '2px', bottom: '-2px', ...navicueType.hint, color: palette.textFaint, opacity: 0.3, fontSize: '11px' }}>slow</div>
              <div style={{ position: 'absolute', right: '2px', bottom: '-2px', ...navicueType.hint, color: palette.textFaint, opacity: 0.3, fontSize: '11px' }}>fast</div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {locked ? 'locked' : `tap to lock (${holdCount}/3)`}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Your tempo. Not the world's.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The stillness inside the speed.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            You are the metronome.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}