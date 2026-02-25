/**
 * SAGE #7 — The Ripple Watch
 * "Every action creates a ripple. Watch how far yours reach."
 * INTERACTION: Drop a stone in water. Concentric circles expand,
 * each labeled with a person or domain your action touches.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('witness_ritual', 'Metacognition', 'knowing', 'InventorySpark');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const RIPPLES = [
  { label: 'You', delay: 0 },
  { label: 'Someone close', delay: 0.8 },
  { label: 'Someone you barely know', delay: 1.6 },
  { label: 'Someone you will never meet', delay: 2.4 },
  { label: 'The future', delay: 3.2 },
];

export default function Sage_RippleWatch({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [dropped, setDropped] = useState(false);
  const [visibleRipples, setVisibleRipples] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleDrop = () => {
    if (dropped) return;
    setDropped(true);
    RIPPLES.forEach((r, i) => {
      addTimer(() => setVisibleRipples(i + 1), r.delay * 1000 + 300);
    });
    addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 5000);
  };

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="knowing" form="InventorySpark" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A stone waits.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Watch how far your ripples reach.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to drop the stone</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleDrop}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: dropped ? 'default' : 'pointer' }}>
            <div style={{ width: '240px', height: '240px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Ripple rings */}
              {RIPPLES.map((r, i) => {
                if (i >= visibleRipples) return null;
                const size = 20 + i * 22;
                return (
                  <motion.div key={i}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.25 - i * 0.03 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{ position: 'absolute', width: `${size}%`, height: `${size}%`, borderRadius: '50%', border: `1px solid ${palette.primary}` }}>
                    <motion.span
                      initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                      transition={{ delay: 0.5 }}
                      style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', ...navicueType.hint, color: palette.textFaint, fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {r.label}
                    </motion.span>
                  </motion.div>
                );
              })}
              {/* Stone / center */}
              {!dropped ? (
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: '12px', height: '12px', borderRadius: '50%', background: palette.primary, boxShadow: `0 0 12px ${palette.primaryGlow}`, zIndex: 1 }} />
              ) : (
                <motion.div initial={{ scale: 1 }} animate={{ scale: 0.5, opacity: 0.3 }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', background: palette.accent, zIndex: 1 }} />
              )}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Your ripples outlive you.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Every kindness is a stone dropped in water.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The ripple reaches shores you will never see.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}