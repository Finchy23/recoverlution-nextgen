/**
 * STOIC #8 — The Inner Citadel
 * "Be like the rock against which the waves continually break."
 * INTERACTION: A geometric cube sits at center. Storm debris particles
 * slam into it — each tap intensifies the storm. The cube never moves.
 * No mark. No damage. Firm.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Self-Compassion', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const STORM_STEPS = 5;

export default function Stoic_InnerCitadel({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [storm, setStorm] = useState(0);
  const [phase, setPhase] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    const tick = () => { setPhase(p => p + 0.04); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const intensify = () => {
    if (stage !== 'active' || storm >= STORM_STEPS) return;
    const next = storm + 1;
    setStorm(next);
    if (next >= STORM_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = storm / STORM_STEPS;
  const debrisCount = 5 + storm * 6;

  // Debris particles — seeded for consistency
  const debris = useRef(
    Array.from({ length: 35 }, (_, i) => ({
      startX: (i % 2 === 0) ? -5 : 215,
      startY: 10 + (i * 29 % 120),
      speed: 1.5 + (i * 17 % 8) * 0.3,
      size: 1 + (i * 23 % 5) * 0.4,
      yDrift: ((i * 41 % 9) - 4) * 0.3,
    }))
  ).current;

  // Isometric cube vertices
  const cx = 105, cy = 85;
  const s = 22;
  const cubePoints = {
    top: `${cx},${cy - s} ${cx + s * 0.87},${cy - s * 0.5} ${cx},${cy} ${cx - s * 0.87},${cy - s * 0.5}`,
    left: `${cx - s * 0.87},${cy - s * 0.5} ${cx},${cy} ${cx},${cy + s} ${cx - s * 0.87},${cy + s * 0.5}`,
    right: `${cx},${cy} ${cx + s * 0.87},${cy - s * 0.5} ${cx + s * 0.87},${cy + s * 0.5} ${cx},${cy + s}`,
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Self-Compassion" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A shape holds still...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Be like the rock against which the waves continually break. It stands firm and tames the fury of the water around it.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to intensify the storm</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={intensify}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: storm >= STORM_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '210px', height: '170px', borderRadius: radius.md, overflow: 'hidden', background: `hsla(220, ${8 + t * 6}%, ${7 - t * 2}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 210 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Storm debris — flying across */}
                {debris.slice(0, debrisCount).map((d, i) => {
                  const progress = ((phase * d.speed + i * 0.5) % 3) / 3;
                  const fromLeft = d.startX < 100;
                  const x = fromLeft ? (-10 + progress * 230) : (220 - progress * 230);
                  const y = d.startY + Math.sin(phase + i) * d.yDrift * 8;
                  // Check if near cube — bounce away
                  const nearCube = Math.abs(x - cx) < 25 && Math.abs(y - cy) < 25;
                  return (
                    <circle key={i} cx={x} cy={y}
                      r={nearCube ? d.size * 0.3 : d.size}
                      fill={`hsla(0, 0%, ${28 + (i % 4) * 3}%, ${(0.06 + t * 0.06) * (nearCube ? 0.3 : 1)})`}
                    />
                  );
                })}

                {/* The cube — absolutely still */}
                <polygon points={cubePoints.top}
                  fill={`hsla(210, ${8 + t * 5}%, ${22 + t * 4}%, ${0.15 + t * 0.05})`}
                  stroke="hsla(210, 8%, 30%, 0.08)" strokeWidth="0.5" />
                <polygon points={cubePoints.left}
                  fill={`hsla(210, ${6 + t * 4}%, ${18 + t * 3}%, ${0.12 + t * 0.04})`}
                  stroke="hsla(210, 8%, 30%, 0.08)" strokeWidth="0.5" />
                <polygon points={cubePoints.right}
                  fill={`hsla(210, ${7 + t * 5}%, ${20 + t * 4}%, ${0.13 + t * 0.05})`}
                  stroke="hsla(210, 8%, 30%, 0.08)" strokeWidth="0.5" />

                {/* Impact sparks — brief flashes near cube surface */}
                {t > 0.3 && Array.from({ length: Math.floor(t * 6) }, (_, i) => {
                  const a = (phase * 2 + i * 1.3) % (Math.PI * 2);
                  const dist = 26 + Math.sin(phase + i * 2) * 3;
                  return (
                    <circle key={`s${i}`}
                      cx={cx + Math.cos(a) * dist}
                      cy={cy + Math.sin(a) * dist * 0.6}
                      r={0.8}
                      fill={`hsla(30, 15%, 40%, ${0.08 * Math.abs(Math.sin(phase * 3 + i))})`}
                    />
                  );
                })}

                {/* "FIRM" label */}
                {storm >= STORM_STEPS && (
                  <motion.text x="105" y="155" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(210, 10%, 38%, 0.2)" letterSpacing="3"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.2 }}
                    transition={{ delay: 0.5, duration: 1.5 }}>
                    FIRM
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={storm} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {storm === 0 ? 'A cube. Calm.' : storm < STORM_STEPS ? `Storm level ${storm}. No marks.` : 'Maximum fury. Unmarked. Firm.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: STORM_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < storm ? 'hsla(210, 12%, 38%, 0.45)' : palette.primaryFaint, opacity: i < storm ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Maximum storm. Debris everywhere. The cube: unmarked. Not a scratch. Be the rock. Stand firm. Tame the fury.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Emotional regulation through stability imagery. The nervous system primed for endurance. Not resistance, simply firmness.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Storm. Rock. Firm.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}