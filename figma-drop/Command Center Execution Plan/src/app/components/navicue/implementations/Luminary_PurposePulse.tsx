/**
 * LUMINARY #8 — The Purpose Pulse
 * "Feel the pull. Follow it."
 * INTERACTION: A pulsing signal. Tap in rhythm with it — the pulse
 * strengthens as you align. Miss the beat and it fades.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sensory_cinema', 'Somatic Regulation', 'embodying', 'Mirror');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PULSES = [
  'The pull toward meaning.',
  'The pull toward service.',
  'The pull toward truth.',
  'The pull toward love.',
  'The pull toward you.',
];

export default function Luminary_PurposePulse({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [pulseIdx, setPulseIdx] = useState(0);
  const [strength, setStrength] = useState(0.2);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handlePulse = () => {
    if (stage !== 'active') return;
    const next = pulseIdx + 1;
    const newStrength = Math.min(1, strength + 0.18);
    setStrength(newStrength);
    if (next < PULSES.length) {
      setPulseIdx(next);
    } else {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="embodying" form="Mirror" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something is pulsing.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Feel the pull. Follow it.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap in rhythm with the pulse</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handlePulse}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', cursor: 'pointer' }}>
            <div style={{ width: '200px', height: '200px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Pulse rings */}
              {[0, 1, 2].map(i => (
                <motion.div key={i}
                  animate={{ scale: [1, 1.15, 1], opacity: [strength * 0.1, strength * 0.2, strength * 0.1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  style={{ position: 'absolute', width: `${50 + i * 20}%`, height: `${50 + i * 20}%`, borderRadius: '50%', border: `1px solid ${palette.accent}` }} />
              ))}
              {/* Center pulse */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [strength * 0.5, strength, strength * 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ width: `${12 + strength * 8}px`, height: `${12 + strength * 8}px`, borderRadius: '50%', background: palette.accent, boxShadow: `0 0 ${16 + strength * 20}px ${palette.accentGlow}` }} />
            </div>
            <motion.div key={pulseIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.5, y: 0 }}
              style={{ ...navicueType.texture, color: palette.text, fontSize: '12px', fontStyle: 'italic', textAlign: 'center' }}>
              {PULSES[pulseIdx]}
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{pulseIdx + 1} of {PULSES.length}</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The pulse is yours. It always was.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Purpose doesn't shout. It pulses.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Follow the pulse.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
