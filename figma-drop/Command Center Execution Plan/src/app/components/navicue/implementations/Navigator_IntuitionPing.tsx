/**
 * NAVIGATOR #3 — The Intuition Ping
 * "The data is noisy. Your gut has processed it already."
 * INTERACTION: A radar sweep highlights blips. Tap the one
 * that feels right. Trust the first signal.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sensory_cinema', 'Somatic Awareness', 'embodying', 'Probe');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const BLIPS = [
  { x: 35, y: 25, label: 'a quiet yes' },
  { x: 70, y: 40, label: 'a loud maybe' },
  { x: 25, y: 65, label: 'the obvious one' },
  { x: 60, y: 72, label: 'the scary one' },
  { x: 50, y: 45, label: 'the one you already know' },
];

export default function Navigator_IntuitionPing({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [sweepAngle, setSweepAngle] = useState(0);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [chosen, setChosen] = useState<number | null>(null);
  const animRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); cancelAnimationFrame(animRef.current); };
  }, []);

  // Radar sweep
  useEffect(() => {
    if (stage !== 'active') return;
    let frame = 0;
    const tick = () => {
      frame++;
      const angle = (frame * 1.2) % 360;
      setSweepAngle(angle);
      // Reveal blips at their angular positions
      BLIPS.forEach((b, i) => {
        const blipAngle = Math.atan2(b.y - 50, b.x - 50) * (180 / Math.PI) + 180;
        if (Math.abs(((angle - blipAngle + 360) % 360)) < 8 && !revealed.includes(i)) {
          setRevealed(prev => [...prev, i]);
        }
      });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [stage, revealed]);

  const handleChoose = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    cancelAnimationFrame(animRef.current);
    addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Awareness" kbe="embodying" form="Probe" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Scanning.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>What is the first thing you knew was true?</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>trust the signal</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            {/* Radar */}
            <div style={{ width: '220px', height: '220px', borderRadius: '50%', border: `1px solid ${palette.primaryFaint}`, position: 'relative', overflow: 'hidden' }}>
              {/* Grid rings */}
              {[35, 55, 75].map(r => (
                <div key={r} style={{ position: 'absolute', top: '50%', left: '50%', width: `${r}%`, height: `${r}%`, borderRadius: '50%', border: `1px solid ${palette.primaryFaint}`, transform: 'translate(-50%, -50%)', opacity: 0.3 }} />
              ))}
              {/* Sweep */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', width: '50%', height: '2px', background: `linear-gradient(90deg, ${palette.accent}, transparent)`, transformOrigin: '0 50%', transform: `rotate(${sweepAngle}deg)`, opacity: 0.5 }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `conic-gradient(from ${sweepAngle}deg, ${palette.accentGlow}, transparent 25%)`, opacity: 0.1 }} />
              {/* Blips */}
              {BLIPS.map((b, i) => {
                if (!revealed.includes(i)) return null;
                const isChosen = chosen === i;
                return (
                  <motion.button key={i} onClick={() => handleChoose(i)}
                    initial={{ opacity: 0, scale: 0 }} animate={{ opacity: isChosen ? 1 : (chosen !== null ? 0.15 : 0.7), scale: 1 }}
                    whileHover={chosen === null ? { scale: 1.4 } : undefined}
                    style={{ position: 'absolute', left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%, -50%)', width: isChosen ? '14px' : '8px', height: isChosen ? '14px' : '8px', borderRadius: '50%', background: isChosen ? palette.accent : palette.primary, boxShadow: isChosen ? `0 0 20px ${palette.accentGlow}` : `0 0 8px ${palette.primaryGlow}`, border: 'none', cursor: chosen === null ? 'pointer' : 'default', padding: 0, transition: 'all 0.3s' }}
                  />
                );
              })}
            </div>
            {chosen !== null && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.6, y: 0 }} style={{ ...navicueType.texture, color: palette.text, textAlign: 'center' }}>
                {BLIPS[chosen].label}
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You knew before you decided.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Trust the signal.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The gut has already processed the data.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
