/**
 * NAVIGATOR #9 - The Values Jam
 * "Life is jazz. You know the chords. Now improvise the melody."
 * INTERACTION: A mixing board. Fade up Courage and fade down Comfort.
 * Your values are the chords - the melody is yours.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Values Clarification', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

interface Fader { label: string; value: number; }

export default function Navigator_ValuesJam({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [faders, setFaders] = useState<Fader[]>([
    { label: 'Courage', value: 30 },
    { label: 'Comfort', value: 70 },
    { label: 'Truth', value: 40 },
    { label: 'Safety', value: 60 },
  ]);
  const [locked, setLocked] = useState(false);
  const [activeFader, setActiveFader] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleFaderDrag = useCallback((idx: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (stage !== 'active' || locked) return;
    setActiveFader(idx);
    const rect = e.currentTarget.getBoundingClientRect();
    const y = 1 - Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setFaders(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], value: Math.round(y * 100) };
      return next;
    });
  }, [stage, locked]);

  const handleLock = () => {
    if (locked) return;
    setLocked(true);
    addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
  };

  // Determine which values are "up"
  const topValue = faders.reduce((a, b) => a.value > b.value ? a : b).label;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Values Clarification" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The chords are yours.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Set your mix. Improvise the melody.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag the faders, then lock</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
            {/* Mixing board */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end' }}>
              {faders.map((f, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  {/* Fader track */}
                  <div
                    onPointerMove={(e) => handleFaderDrag(i, e)}
                    style={{ width: '32px', height: '140px', background: palette.primaryFaint, borderRadius: radius.lg, position: 'relative', cursor: locked ? 'default' : 'pointer', touchAction: 'none', overflow: 'hidden' }}>
                    {/* Fill */}
                    <motion.div animate={{ height: `${f.value}%` }}
                      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: `linear-gradient(180deg, ${palette.accent}, ${palette.primaryGlow})`, borderRadius: radius.lg, opacity: 0.5, transition: 'height 0.1s' }} />
                    {/* Knob */}
                    <motion.div animate={{ bottom: `${f.value}%` }}
                      style={{ position: 'absolute', left: '50%', transform: 'translate(-50%, 50%)', width: '24px', height: '8px', borderRadius: radius.xs, background: locked ? palette.accent : palette.primary, boxShadow: `0 0 8px ${palette.primaryGlow}`, transition: 'bottom 0.1s' }} />
                  </div>
                  {/* Label */}
                  <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', textAlign: 'center', width: '50px' }}>
                    {f.label}
                  </div>
                </div>
              ))}
            </div>
            {!locked && (
              <motion.button onClick={handleLock} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${palette.primaryGlow}`, borderRadius: radius.sm, cursor: 'pointer', ...navicueType.hint, color: palette.text }}>
                lock the mix
              </motion.button>
            )}
            {locked && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ ...navicueType.hint, color: palette.accent }}>
                {topValue} leads.
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Your mix. Your melody.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Adapt to the situation. Stay true to the values.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Life is jazz. Improvise.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}