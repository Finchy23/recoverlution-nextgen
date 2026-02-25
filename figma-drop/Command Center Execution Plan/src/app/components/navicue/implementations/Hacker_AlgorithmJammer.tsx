/**
 * HACKER #3 — The Algorithm Jammer
 * "The algorithm wants your outrage. Give it your silence."
 * INTERACTION: A chaotic feed scrolls fast with noise fragments.
 * Tap to insert solid "silence bars" that physically stop the feed.
 * Starve the beast.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart(
  'sensory_cinema',
  'Somatic Regulation',
  'believing',
  'Circuit'
);
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const NOISE = [
  'BREAKING: You\'re not enough',
  'TRENDING: Everyone else is winning',
  'ALERT: You\'re missing out',
  'UPDATE: Your body is wrong',
  'VIRAL: Your opinion doesn\'t matter',
  'HOT TAKE: You should be worried',
];

export default function Hacker_AlgorithmJammer({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [jammed, setJammed] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const timersRef = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    if (stage === 'active' && jammed < NOISE.length) {
      intervalRef.current = window.setInterval(() => setScrollY(p => p + 1), 60);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
  }, [stage, jammed]);

  const handleJam = () => {
    if (stage !== 'active') return;
    const next = jammed + 1;
    setJammed(next);
    if (next >= NOISE.length) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
    }
  };

  const feedSpeed = Math.max(0, 1 - jammed / NOISE.length);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The feed never stops.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The algorithm wants your outrage.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to insert silence</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleJam}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ width: '100%', height: '220px', overflow: 'hidden', borderRadius: radius.md, border: `1px solid ${palette.primaryFaint}`, position: 'relative' }}>
              {NOISE.map((n, i) => {
                const isJammed = i < jammed;
                const yPos = ((i * 42 - scrollY * feedSpeed * 0.8) % (NOISE.length * 42) + NOISE.length * 42) % (NOISE.length * 42);
                return isJammed ? (
                  <motion.div key={`j${i}`} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                    style={{ position: 'absolute', top: `${i * 36 + 8}px`, left: '8px', right: '8px', height: '28px', background: palette.accent, borderRadius: radius.xs, opacity: 0.15, transformOrigin: 'left' }} />
                ) : (
                  <motion.div key={`n${i}`}
                    animate={{ y: yPos - 20, opacity: 0.25 * feedSpeed }}
                    transition={{ duration: 0.06 }}
                    style={{ position: 'absolute', left: '12px', right: '12px', ...navicueType.hint, color: palette.textFaint, fontSize: '11px', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    {n}
                  </motion.div>
                );
              })}
              {/* Silence overlay */}
              <motion.div animate={{ opacity: jammed / NOISE.length * 0.4 }}
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {jammed >= NOISE.length && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                    style={{ ...navicueType.texture, color: palette.accent, fontSize: '14px', letterSpacing: '0.2em' }}>
                    SILENCE
                  </motion.div>
                )}
              </motion.div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{jammed} of {NOISE.length} silenced</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The feed is silent. You are still here.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Starve what feeds on your attention.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Your silence is power.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}