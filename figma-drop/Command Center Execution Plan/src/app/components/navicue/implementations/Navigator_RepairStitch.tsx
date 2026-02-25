/**
 * NAVIGATOR #4 — The Repair Stitch
 * "A break is not the end. It is where the gold goes."
 * INTERACTION: A gold thread weaves through a tear in fabric.
 * Kintsugi style — the mend is more beautiful than the original.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('relational_ghost', 'Connection', 'believing', 'Mirror');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

export default function Navigator_RepairStitch({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [stitchProgress, setStitchProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const intervalRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); clearInterval(intervalRef.current); };
  }, []);

  const startStitch = () => {
    if (stage !== 'active' || stitchProgress >= 100) return;
    setHolding(true);
    intervalRef.current = window.setInterval(() => {
      setStitchProgress(prev => {
        const next = prev + 0.8;
        if (next >= 100) {
          clearInterval(intervalRef.current);
          setHolding(false);
          setTimeout(() => { setStage('resonant'); setTimeout(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
          return 100;
        }
        return next;
      });
    }, 40);
  };

  const stopStitch = () => { setHolding(false); clearInterval(intervalRef.current); };

  const p = stitchProgress / 100;
  // 7 stitch points across a diagonal tear
  const stitchPoints = Array.from({ length: 7 }, (_, i) => ({
    x: 20 + i * 10,
    y: 30 + Math.sin(i * 0.8) * 15 + i * 4,
    filled: p > i / 7,
  }));

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Connection" kbe="believing" form="Mirror" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something tore.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Repair the connection. Make it stronger.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>hold to stitch with gold</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onPointerDown={startStitch} onPointerUp={stopStitch} onPointerLeave={stopStitch}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', cursor: 'pointer', touchAction: 'none' }}>
            <svg viewBox="0 0 100 80" style={{ width: '260px', height: '200px' }}>
              {/* Tear line */}
              <path d={`M ${stitchPoints.map(sp => `${sp.x},${sp.y}`).join(' L ')}`}
                fill="none" stroke={palette.primaryFaint} strokeWidth="0.5" strokeDasharray="3,3" opacity={0.4} />
              {/* Gold stitch */}
              {stitchPoints.map((sp, i) => {
                if (i === 0) return null;
                const prev = stitchPoints[i - 1];
                if (!sp.filled) return null;
                return (
                  <motion.line key={i} x1={prev.x} y1={prev.y} x2={sp.x} y2={sp.y}
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.7 }}
                    transition={{ duration: 0.4 }}
                    stroke="hsla(42, 70%, 55%, 0.8)" strokeWidth="1.5" strokeLinecap="round" />
                );
              })}
              {/* Stitch nodes */}
              {stitchPoints.map((sp, i) => (
                <motion.circle key={i} cx={sp.x} cy={sp.y} r={sp.filled ? 2.5 : 1.5}
                  fill={sp.filled ? 'hsla(42, 70%, 55%, 0.8)' : palette.primaryFaint}
                  animate={{ r: sp.filled ? 2.5 : 1.5 }} />
              ))}
            </svg>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>
              {stitchProgress >= 100 ? 'mended' : holding ? 'stitching...' : `${Math.round(stitchProgress)}% repaired`}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Stronger at the broken places.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The gold goes where the break was.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The mend is more beautiful than the original.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
