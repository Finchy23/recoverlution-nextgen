/**
 * SAGE #3 — The Empty Boat
 * "An empty boat bumps into yours. No anger. It was empty."
 * INTERACTION: Boats drift on water. Tap each to discover — all empty.
 * The offense dissolves when there is no offender.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'knowing', 'Key');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const BOATS = [
  { x: 25, y: 30, drift: 3, label: 'The one who cut you off' },
  { x: 60, y: 50, drift: -2, label: 'The one who forgot' },
  { x: 40, y: 70, drift: 4, label: 'The one who lied' },
  { x: 75, y: 35, drift: -3, label: 'The one who left' },
];

export default function Sage_EmptyBoat({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [checked, setChecked] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleCheck = (i: number) => {
    if (stage !== 'active' || checked.includes(i)) return;
    const next = [...checked, i];
    setChecked(next);
    if (next.length >= BOATS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="knowing" form="Key" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something bumped into you.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Look inside the boat.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each to see who is inside</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '260px', height: '200px', position: 'relative' }}>
            {/* Water ripple */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: radius.md, background: `linear-gradient(180deg, transparent, ${palette.primaryFaint})`, opacity: 0.15 }} />
            {BOATS.map((boat, i) => {
              const isChecked = checked.includes(i);
              return (
                <motion.button key={i}
                  onClick={() => handleCheck(i)}
                  animate={{ x: [0, boat.drift, 0], y: [0, -2, 0] }}
                  transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
                  whileHover={!isChecked ? { scale: 1.15 } : undefined}
                  style={{ position: 'absolute', left: `${boat.x}%`, top: `${boat.y}%`, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: isChecked ? 'default' : 'pointer', padding: 0 }}>
                  {/* Boat shape */}
                  <svg width="32" height="16" viewBox="0 0 32 16">
                    <path d="M 2,12 Q 16,0 30,12 Z" fill={isChecked ? 'transparent' : palette.primaryGlow} stroke={isChecked ? palette.accentGlow : palette.primary} strokeWidth="1" opacity={isChecked ? 0.3 : 0.6} />
                  </svg>
                  {isChecked && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 0.5, y: 0 }}
                      style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', whiteSpace: 'nowrap' }}>
                      empty
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
            {/* Last checked label */}
            {checked.length > 0 && (
              <motion.div key={checked[checked.length - 1]}
                initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                style={{ position: 'absolute', bottom: '-28px', left: 0, right: 0, textAlign: 'center', ...navicueType.hint, color: palette.textFaint, fontSize: '11px' }}>
                {BOATS[checked[checked.length - 1]].label}: empty.
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Every boat was empty.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The offense dissolves when there is no offender.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            An empty boat bumps into yours. No anger.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}