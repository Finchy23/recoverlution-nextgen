/**
 * ATHLETE #3 -- The Movement Snack
 * "BDNF is fertilizer for your new neurons."
 * INTERACTION: An exploding kinetic shape -- a compressed polygon that
 * bursts outward with each tap. 5 explosive bursts. The shape
 * reforms larger each time. Neurons growing.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Self-Compassion', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const BURST_COUNT = 5;

export default function Athlete_MovementSnack({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [bursts, setBursts] = useState(0);
  const [exploding, setExploding] = useState(false);
  const [particles, setParticles] = useState<{ id: number; angle: number; dist: number; size: number }[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const burst = () => {
    if (stage !== 'active' || bursts >= BURST_COUNT || exploding) return;
    setExploding(true);
    const newParticles = Array.from({ length: 8 + bursts * 2 }, (_, i) => ({
      id: Date.now() + i,
      angle: (i / (8 + bursts * 2)) * Math.PI * 2 + Math.random() * 0.3,
      dist: 30 + Math.random() * 25,
      size: 1.5 + Math.random() * 1.5,
    }));
    setParticles(newParticles);
    addTimer(() => {
      setExploding(false);
      setParticles([]);
      const next = bursts + 1;
      setBursts(next);
      if (next >= BURST_COUNT) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
      }
    }, 800);
  };

  const t = bursts / BURST_COUNT;
  const shapeR = 15 + t * 18;
  const sides = 5 + bursts;

  const buildPolygon = (cx: number, cy: number, r: number, n: number) => {
    const pts = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
    });
    return pts.join(' ');
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Self-Compassion" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Energy compresses...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Twenty air squats. Now. Flush the system. BDNF is fertilizer for your new neurons. Movement releases it.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to burst</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={burst}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: bursts >= BURST_COUNT ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(30, ${8 + t * 10}%, ${7 + t * 3}%, 0.3)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <radialGradient id={`${svgId}-burstGlow`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(30, 35%, 50%, ${exploding ? 0.15 : t * 0.06})`} />
                    <stop offset="80%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <circle cx="100" cy="100" r="90" fill={`url(#${svgId}-burstGlow)`} />

                {/* Core polygon -- grows with each burst */}
                <motion.polygon
                  points={buildPolygon(100, 100, exploding ? shapeR * 0.6 : shapeR, sides)}
                  fill={`hsla(30, ${20 + t * 15}%, ${30 + t * 12}%, ${0.06 + t * 0.04})`}
                  stroke={`hsla(30, ${20 + t * 15}%, ${38 + t * 12}%, ${0.12 + t * 0.08})`}
                  strokeWidth={0.6 + t * 0.4}
                  initial={{ scale: 1 }}
                  animate={{ scale: exploding ? 0.7 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                  style={{ transformOrigin: '100px 100px' }}
                />

                {/* Explosion particles */}
                {particles.map(p => (
                  <motion.circle key={p.id}
                    initial={{ cx: 100, cy: 100, r: p.size, opacity: 0.25 }}
                    animate={{ cx: 100 + Math.cos(p.angle) * p.dist, cy: 100 + Math.sin(p.angle) * p.dist, r: p.size * 0.3, opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    fill={`hsla(${30 + p.angle * 15}, 30%, 50%, 0.2)`}
                  />
                ))}

                {/* BDNF label -- grows as neurons fertilized */}
                {t > 0 && (
                  <text x="100" y="170" textAnchor="middle" fontSize={5 + t * 2} fontFamily="monospace"
                    fill={`hsla(30, 20%, 45%, ${0.06 + t * 0.08})`}>
                    BDNF +{Math.round(t * 100)}%
                  </text>
                )}

                {/* Growth rings -- one per completed burst */}
                {Array.from({ length: bursts }, (_, i) => (
                  <circle key={i} cx="100" cy="100" r={shapeR + 5 + i * 6}
                    fill="none" stroke={`hsla(30, 15%, 40%, ${0.03})`} strokeWidth={safeSvgStroke(0.3)} />
                ))}
              </svg>
            </div>
            <motion.div key={bursts} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {bursts === 0 ? 'Compressed. Ready to explode.' : bursts < BURST_COUNT ? `Burst ${bursts}. Shape growing. Neurons fed.` : 'System flushed. Neurons fertilized.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: BURST_COUNT }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < bursts ? 'hsla(30, 30%, 50%, 0.5)' : palette.primaryFaint, opacity: i < bursts ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five bursts. The shape exploded and reformed larger every time. BDNF released. Neurons fertilized. Movement is medicine.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Neurogenesis. High-intensity exercise triggers BDNF, brain-derived neurotrophic factor. Fertilizer for new neural pathways. The body builds the mind.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Compress. Burst. Grow.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}