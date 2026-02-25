/**
 * ELEMENTAL #4 — The Stone Hold
 * "I have been here for a million years. I am not in a hurry."
 * INTERACTION: A massive ancient boulder rendered in SVG. Press and
 * hold your thumb on it — haptic weight builds. The stone doesn't
 * move. Geological time counter shows its age. Lean your weight on it.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('science_x_soul', 'Somatic Regulation', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const HOLD_DURATION = 10000;
const LAYERS = [
  { threshold: 0.2, label: '3.8 billion years. First stone.' },
  { threshold: 0.4, label: '2.1 billion years. Still here.' },
  { threshold: 0.6, label: '500 million years. Patient.' },
  { threshold: 0.8, label: '1 million years. Unhurried.' },
  { threshold: 0.95, label: 'Now. You leaned on me.' },
];

export default function Elemental_StoneHold({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const tick = () => {
    const p = Math.min(1, (Date.now() - startRef.current) / HOLD_DURATION);
    setProgress(p);
    if (p >= 1) {
      setHolding(false);
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  const handleDown = () => {
    if (stage !== 'active' || progress >= 1) return;
    setHolding(true);
    startRef.current = Date.now() - progress * HOLD_DURATION;
    rafRef.current = requestAnimationFrame(tick);
  };
  const handleUp = () => {
    setHolding(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const currentLayer = [...LAYERS].reverse().find(a => progress >= a.threshold);
  const weight = holding ? 0.3 + progress * 0.5 : 0.1;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Somatic Regulation" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The stone has waited...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>I have been here for a million years. I am not in a hurry.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>press and hold the stone; lean your weight</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            {/* Stone */}
            <motion.div
              onPointerDown={handleDown} onPointerUp={handleUp} onPointerLeave={handleUp}
              animate={{ scale: holding ? 0.98 : 1 }}
              transition={{ duration: 0.3 }}
              style={{ position: 'relative', width: '200px', height: '160px', cursor: 'pointer', touchAction: 'none' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160">
                {/* Boulder shape — organic, massive */}
                <path d="M 30 130 Q 10 90, 25 55 Q 40 25, 75 20 Q 110 15, 145 25 Q 180 35, 185 70 Q 190 105, 170 130 Q 140 145, 100 145 Q 60 145, 30 130 Z"
                  fill={`hsla(25, 12%, ${22 + progress * 6}%, ${weight})`}
                  stroke={`hsla(25, 10%, ${30 + progress * 8}%, ${weight * 0.7})`}
                  strokeWidth="1"
                />
                {/* Grain texture — veins in the rock */}
                <path d="M 50 60 Q 80 55, 110 65 Q 140 75, 160 65" fill="none" stroke={`hsla(25, 8%, 35%, ${weight * 0.3})`} strokeWidth="0.5" />
                <path d="M 40 90 Q 70 85, 100 95 Q 130 105, 165 95" fill="none" stroke={`hsla(25, 8%, 35%, ${weight * 0.3})`} strokeWidth="0.5" />
                <path d="M 55 110 Q 90 105, 120 115 Q 145 120, 160 112" fill="none" stroke={`hsla(25, 8%, 35%, ${weight * 0.25})`} strokeWidth={safeSvgStroke(0.3)} />
                {/* Lichen patches */}
                {progress > 0.3 && (
                  <>
                    <circle cx="65" cy="50" r="5" fill="hsla(90, 20%, 35%, 0.1)" />
                    <circle cx="140" cy="40" r="4" fill="hsla(80, 15%, 30%, 0.08)" />
                    <circle cx="110" cy="110" r="6" fill="hsla(100, 15%, 35%, 0.07)" />
                  </>
                )}
                {/* Weight impression — grows as you hold */}
                {holding && (
                  <motion.ellipse cx="100" cy="80" rx={15 + progress * 10} ry={10 + progress * 6}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.08 }}
                    fill="hsla(25, 15%, 15%, 0.3)" />
                )}
              </svg>
              {/* Glow when connected */}
              <motion.div
                animate={{ opacity: holding ? 0.06 : 0 }}
                style={{ position: 'absolute', inset: '10%', borderRadius: '50%', background: `radial-gradient(circle, hsla(25, 20%, 40%, 0.3), transparent)` }}
              />
            </motion.div>
            {/* Geological age */}
            {progress > 0 && currentLayer && (
              <motion.div key={currentLayer.label} initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '11px', fontStyle: 'italic', textAlign: 'center' }}>
                {currentLayer.label}
              </motion.div>
            )}
            {/* Progress */}
            <div style={{ width: '100%', height: '2px', background: palette.primaryFaint, borderRadius: '1px', overflow: 'hidden' }}>
              <motion.div animate={{ width: `${progress * 100}%` }} style={{ height: '100%', background: 'hsla(25, 15%, 40%, 0.4)' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.25 }}>
              {holding ? 'leaning...' : 'press and hold'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Lean your weight on me. I am not in a hurry.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Geological time. The stone doesn't flinch. Neither will you.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Ancient. Solid. Unhurried.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}