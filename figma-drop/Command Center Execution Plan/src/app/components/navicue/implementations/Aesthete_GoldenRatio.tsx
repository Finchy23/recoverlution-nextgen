/**
 * AESTHETE #1 -- The Golden Ratio
 * "Order exists. You just stopped looking for it."
 * INTERACTION: A Fibonacci spiral slowly draws itself on screen.
 * Tap to overlay it on a shifting abstract field -- watch the geometry
 * emerge from the chaos. Each tap reveals another layer of order.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('pattern_glitch', 'Somatic Regulation', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LAYERS = [
  { label: 'the spiral', opacity: 0.15 },
  { label: 'the rectangles', opacity: 0.25 },
  { label: 'the symmetry', opacity: 0.35 },
  { label: 'the order', opacity: 0.5 },
];

export default function Aesthete_GoldenRatio({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [revealed, setRevealed] = useState(0);
  const [spiralProgress, setSpiralProgress] = useState(0);
  const timersRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    let p = 0;
    const tick = () => {
      p += 0.004;
      if (p > 1) p = 1;
      setSpiralProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const revealLayer = () => {
    if (stage !== 'active' || revealed >= LAYERS.length) return;
    const next = revealed + 1;
    setRevealed(next);
    if (next >= LAYERS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  // Generate Fibonacci spiral path
  const buildSpiralPath = (progress: number) => {
    const points: string[] = [];
    const maxAngle = progress * Math.PI * 6;
    for (let a = 0; a <= maxAngle; a += 0.1) {
      const r = Math.pow(1.1618, a) * 2;
      const x = 110 + Math.cos(a) * r;
      const y = 110 + Math.sin(a) * r;
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')}`;
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Somatic Regulation" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Aligning the eye...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Order exists. You just stopped looking for it.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to find the geometry in the chaos</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={revealLayer}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: revealed >= LAYERS.length ? 'default' : 'pointer' }}>
            {/* Golden ratio field */}
            <div style={{ position: 'relative', width: '220px', height: '220px' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 220" style={{ position: 'absolute', inset: 0 }}>
                {/* Chaos dots -- random scatter */}
                {Array.from({ length: 40 }, (_, i) => (
                  <circle key={`c${i}`}
                    cx={20 + Math.sin(i * 7.3) * 90 + 90}
                    cy={20 + Math.cos(i * 5.1) * 90 + 90}
                    r={1 + Math.random() * 1.5}
                    fill={palette.textFaint}
                    opacity={0.08 + (revealed / LAYERS.length) * 0.06}
                  />
                ))}
                {/* Golden rectangles -- revealed progressively */}
                {revealed >= 2 && (
                  <>
                    <motion.rect initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} x="42" y="42" width="136" height="84" fill="none" stroke={palette.accent} strokeWidth="0.5" />
                    <motion.rect initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} x="42" y="42" width="84" height="84" fill="none" stroke={palette.accent} strokeWidth="0.5" />
                    <motion.rect initial={{ opacity: 0 }} animate={{ opacity: 0.08 }} x="126" y="42" width="52" height="52" fill="none" stroke={palette.accent} strokeWidth="1" />
                  </>
                )}
                {/* Spiral */}
                <motion.path
                  d={buildSpiralPath(spiralProgress)}
                  fill="none"
                  stroke={palette.accent}
                  strokeWidth="1"
                  initial={{ opacity: 0.1 }}
                  animate={{ opacity: revealed >= 1 ? 0.4 : 0.1 }}
                  transition={{ duration: 0.8 }}
                />
                {/* Center point */}
                {revealed >= 3 && (
                  <motion.circle initial={{ r: 0 }} animate={{ r: 3 }} cx="110" cy="110" fill={palette.accent} opacity={0.5} />
                )}
              </svg>
              {/* Overlay glow */}
              {revealed >= 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.08 }}
                  style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle, ${palette.accent}, transparent)` }} />
              )}
            </div>
            {/* Layer label */}
            {revealed > 0 && revealed <= LAYERS.length && (
              <motion.div key={revealed} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                style={{ ...navicueType.texture, color: palette.accent, fontSize: '11px', fontStyle: 'italic' }}>
                {LAYERS[revealed - 1].label}
              </motion.div>
            )}
            {/* Progress */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {LAYERS.map((_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i < revealed ? palette.accent : palette.primaryFaint, opacity: i < revealed ? 0.5 : 0.15 }} />
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.3 }}>
              {revealed >= LAYERS.length ? 'the pattern was always there' : 'tap to reveal another layer'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Align your eye with the pattern.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Order exists in the chaos. Beauty is geometry remembering itself.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            φ = 1.618...
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}