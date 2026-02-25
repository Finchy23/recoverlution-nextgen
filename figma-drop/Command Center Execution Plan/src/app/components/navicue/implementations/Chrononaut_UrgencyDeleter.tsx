/**
 * CHRONONAUT #6 — The Urgency Deleter
 * "Urgency is a biological lie. Unless you are bleeding, you have time."
 * INTERACTION: A red siren pulsing fast. Drag a fader to slow it
 * down — the siren morphs into a calm heartbeat. Sympathetic
 * downregulation through the Iso-Principle.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('science_x_soul', 'Somatic Regulation', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Chrononaut_UrgencyDeleter({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [speed, setSpeed] = useState(1); // 1 = panic, 0 = calm
  const [completed, setCompleted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (completed) return;
    const val = 1 - parseFloat(e.target.value);
    setSpeed(val);
    if (val <= 0.05 && !completed) {
      setCompleted(true);
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
    }
  };

  const pulseRate = 0.2 + speed * 1.3; // seconds per pulse
  const sirenColor = `hsla(${speed * 0}, ${40 + speed * 30}%, ${45 + (1 - speed) * 15}%, ${0.3 + speed * 0.4})`;
  const label = speed > 0.7 ? 'PANIC' : speed > 0.4 ? 'URGENT' : speed > 0.15 ? 'calm' : 'heartbeat';

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Somatic Regulation" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The siren is screaming.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Urgency is a biological lie.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>slide to slow the siren into a heartbeat</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%', maxWidth: '280px' }}>
            {/* Siren / heartbeat visualization */}
            <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div
                animate={{ scale: [1, 1 + speed * 0.3, 1], opacity: [0.3 + speed * 0.3, 0.5 + speed * 0.3, 0.3 + speed * 0.3] }}
                transition={{ duration: pulseRate, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '80px', height: '80px', borderRadius: '50%', background: sirenColor, position: 'absolute' }} />
              <motion.div
                animate={{ scale: [1, 1 + speed * 0.15, 1] }}
                transition={{ duration: pulseRate, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '40px', height: '40px', borderRadius: '50%', background: sirenColor, position: 'absolute', opacity: 0.6 }} />
              <motion.div
                animate={{ scale: [1, 1 + speed * 0.05, 1] }}
                transition={{ duration: pulseRate, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '16px', height: '16px', borderRadius: '50%', background: completed ? palette.accent : sirenColor, position: 'absolute', boxShadow: completed ? `0 0 16px ${palette.accentGlow}` : 'none' }} />
            </div>
            {/* Label */}
            <div style={{ ...navicueType.hint, color: speed > 0.4 ? 'hsla(0, 40%, 55%, 0.6)' : palette.accent, fontSize: '11px', letterSpacing: '0.15em', fontFamily: 'monospace', opacity: 0.5 }}>
              {label}
            </div>
            {/* Fader */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.3 }}>panic</span>
                <span style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px', opacity: 0.3 }}>heartbeat</span>
              </div>
              <input type="range" min="0" max="1" step="0.01" value={1 - speed}
                onChange={handleSlider}
                style={{ width: '100%', height: '4px', appearance: 'none', background: `linear-gradient(90deg, hsla(0, 40%, 50%, 0.3), ${palette.accent})`, borderRadius: '2px', cursor: 'pointer', outline: 'none' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, fontSize: '11px' }}>
              {Math.round((1 - speed) * 100)}% dilated
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The siren is a heartbeat now.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Unless you are bleeding, you have time. Dilate the moment.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            You have time.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}