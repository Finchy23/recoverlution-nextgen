/**
 * MENDER #1 — The Kintsugi File
 * "The gold goes where the cracks were."
 * INTERACTION: A vessel with visible fracture lines. Tap each crack
 * to fill it with gold. The broken places become the most beautiful.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sacred_ordinary', 'Self-Compassion', 'believing', 'Mirror');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const CRACKS = [
  { x1: 30, y1: 15, x2: 45, y2: 40, label: 'a loss' },
  { x1: 55, y1: 20, x2: 70, y2: 50, label: 'a mistake' },
  { x1: 25, y1: 55, x2: 50, y2: 75, label: 'a betrayal' },
  { x1: 50, y1: 60, x2: 75, y2: 85, label: 'a failure' },
  { x1: 40, y1: 35, x2: 55, y2: 60, label: 'a wound' },
];

export default function Mender_KintsugiFile({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [filled, setFilled] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleFill = (i: number) => {
    if (stage !== 'active' || filled.includes(i)) return;
    const next = [...filled, i];
    setFilled(next);
    if (next.length >= CRACKS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2200);
    }
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Self-Compassion" kbe="believing" form="Mirror" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something broke.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The gold goes where the cracks were.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each fracture to fill it</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {/* Vessel with cracks */}
            <svg width="220" height="200" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
              {/* Vessel shape */}
              <ellipse cx="50" cy="50" rx="38" ry="42" fill="none" stroke={palette.primaryFaint} strokeWidth="0.8" opacity={0.3} />
              {/* Cracks */}
              {CRACKS.map((c, i) => {
                const isFilled = filled.includes(i);
                return (
                  <g key={i} onClick={() => handleFill(i)} style={{ cursor: isFilled ? 'default' : 'pointer' }}>
                    <motion.line
                      x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                      stroke={isFilled ? 'hsla(42, 70%, 55%, 0.8)' : palette.primaryFaint}
                      strokeWidth={isFilled ? 2 : 0.8}
                      strokeLinecap="round"
                      initial={{ opacity: 0.4 }}
                      animate={{ opacity: isFilled ? 1 : 0.4 }}
                      transition={{ duration: 0.8 }}
                    />
                    {/* Hover target area */}
                    <line x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke="transparent" strokeWidth="8" />
                    {isFilled && (
                      <motion.text
                        initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                        x={(c.x1 + c.x2) / 2} y={(c.y1 + c.y2) / 2 - 4}
                        textAnchor="middle" fill={palette.textFaint} fontSize="4" fontFamily="inherit">
                        {c.label}
                      </motion.text>
                    )}
                    {isFilled && (
                      <motion.circle
                        initial={{ opacity: 0, r: 0 }} animate={{ opacity: 0.3, r: 3 }}
                        cx={(c.x1 + c.x2) / 2} cy={(c.y1 + c.y2) / 2}
                        fill="hsla(42, 70%, 55%, 0.4)"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {filled.length} of {CRACKS.length} filled with gold
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The broken places are the most beautiful.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>You are not broken. You are mid-repair.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Gold lives where the fracture was.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}