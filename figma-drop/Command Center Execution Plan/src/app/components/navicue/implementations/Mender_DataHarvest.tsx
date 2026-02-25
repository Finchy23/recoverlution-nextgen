/**
 * MENDER #3 — The Data Harvest
 * "What did the wreckage teach you? Mine it for signal."
 * INTERACTION: Debris field of scattered pieces. Tap each to
 * reveal a hidden lesson. The wreckage becomes a harvest.
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'InventorySpark');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const DEBRIS = [
  { lesson: 'I learned what I actually need.' },
  { lesson: 'I learned who shows up.' },
  { lesson: 'I learned my own limit.' },
  { lesson: 'I learned what I will not repeat.' },
  { lesson: 'I learned I can survive this.' },
  { lesson: 'I learned what matters most.' },
];

export default function Mender_DataHarvest({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [mined, setMined] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  const positions = useMemo(() => DEBRIS.map((_, i) => ({
    x: 15 + (i % 3) * 32 + (Math.random() - 0.5) * 10,
    y: 15 + Math.floor(i / 3) * 40 + (Math.random() - 0.5) * 10,
    rot: (Math.random() - 0.5) * 30,
    w: 18 + Math.random() * 10,
  })), []);

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleMine = (i: number) => {
    if (stage !== 'active' || mined.includes(i)) return;
    const next = [...mined, i];
    setMined(next);
    if (next.length >= DEBRIS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2200);
    }
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="InventorySpark" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something fell apart.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Mine the wreckage for signal.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each piece to harvest a lesson</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '260px', height: '200px', position: 'relative' }}>
              {DEBRIS.map((d, i) => {
                const isMined = mined.includes(i);
                const pos = positions[i];
                return (
                  <motion.button key={i}
                    onClick={() => handleMine(i)}
                    whileHover={!isMined ? { scale: 1.15 } : undefined}
                    animate={{ rotate: isMined ? 0 : pos.rot, opacity: isMined ? 1 : 0.35 }}
                    transition={{ duration: 0.6 }}
                    style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, width: `${pos.w}%`, padding: '6px 4px', background: isMined ? palette.primaryGlow : 'rgba(255,255,255,0.02)', border: `1px solid ${isMined ? palette.accent : palette.primaryFaint}`, borderRadius: radius.xs, cursor: isMined ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isMined ? (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.7 }}
                        style={{ ...navicueType.hint, color: palette.text, fontSize: '8px', textAlign: 'center', lineHeight: 1.3 }}>
                        {d.lesson}
                      </motion.span>
                    ) : (
                      <div style={{ width: '100%', height: '12px', background: palette.primaryFaint, borderRadius: '2px', opacity: 0.3 }} />
                    )}
                  </motion.button>
                );
              })}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {mined.length} of {DEBRIS.length} harvested
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The wreckage was full of signal.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Nothing was wasted. Not even this.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Every ruin is a library.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}