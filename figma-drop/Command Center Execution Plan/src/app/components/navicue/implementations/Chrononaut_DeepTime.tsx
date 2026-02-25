/**
 * CHRONONAUT #2 — The Deep Time
 * "In deep time, mountains move like waves. Your panic is a flicker."
 * INTERACTION: Geological strata scroll fast — 1,000 years per second.
 * A counter shows your stress shrinking to 0.00001% of history.
 * Watch your worry become cosmically irrelevant.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Probe');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const STRATA = [
  { era: 'Now', years: 0, color: 'hsla(0, 40%, 50%, 0.4)' },
  { era: '1,000 years', years: 1000, color: 'hsla(25, 35%, 45%, 0.35)' },
  { era: '100,000 years', years: 100000, color: 'hsla(35, 30%, 40%, 0.3)' },
  { era: '1 million years', years: 1000000, color: 'hsla(45, 25%, 38%, 0.25)' },
  { era: '100 million years', years: 100000000, color: 'hsla(180, 20%, 35%, 0.2)' },
  { era: '4.5 billion years', years: 4500000000, color: 'hsla(220, 15%, 30%, 0.15)' },
];

export default function Chrononaut_DeepTime({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [depth, setDepth] = useState(0);
  const [zooming, setZooming] = useState(false);
  const timersRef = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startZoom = () => {
    if (zooming || stage !== 'active') return;
    setZooming(true);
    let d = 0;
    intervalRef.current = window.setInterval(() => {
      d++;
      setDepth(d);
      if (d >= STRATA.length - 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
      }
    }, 1200);
  };

  const pct = depth > 0 ? (1 / Math.pow(10, depth * 1.5) * 100).toExponential(1) : '100';

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Probe" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Zooming out...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Mountains move like waves. Your panic is a flicker.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to enter deep time</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={startZoom}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '300px', cursor: zooming ? 'default' : 'pointer' }}>
            {/* Strata visualization */}
            <div style={{ width: '100%', borderRadius: radius.md, overflow: 'hidden', border: `1px solid ${palette.primaryFaint}` }}>
              {STRATA.map((s, i) => (
                <motion.div key={i}
                  animate={{ height: i <= depth ? '36px' : '4px', opacity: i <= depth ? 1 : 0.2 }}
                  transition={{ duration: 1 }}
                  style={{ width: '100%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', overflow: 'hidden' }}>
                  {i <= depth && (
                    <>
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.3 }}
                        style={{ ...navicueType.hint, color: palette.text, fontSize: '11px' }}>{s.era}</motion.span>
                      {i === 0 && depth > 0 && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                          style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', fontFamily: 'monospace' }}>your stress ▾</motion.span>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </div>
            {/* Percentage counter */}
            {depth > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
                style={{ textAlign: 'center' }}>
                <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', marginBottom: '4px' }}>this stress lasted</div>
                <div style={{ ...navicueType.texture, color: palette.accent, fontSize: '18px', fontFamily: 'monospace', fontWeight: 300 }}>{pct}%</div>
                <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', marginTop: '4px' }}>of history</div>
              </motion.div>
            )}
            {!zooming && (
              <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px' }}>tap to zoom out</motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>A flicker in 4.5 billion years.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Breathe with the mountain.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Deep time. Still here.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}