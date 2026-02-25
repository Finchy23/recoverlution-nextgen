/**
 * SOURCE #2 — The Stardust Check
 * "Every atom in your hand was forged in the heart of a dying star."
 * INTERACTION: A silhouette of a hand. Each tap dissolves it further
 * into swirling gold particles — atoms returning to their stellar
 * origin. You are ancient.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Self-Compassion', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const DISSOLVE_STEPS = 5;

export default function Source_StardustCheck({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [dissolved, setDissolved] = useState(0);
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
    const tick = () => { setPhase(p => p + 0.02); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const dissolve = () => {
    if (stage !== 'active' || dissolved >= DISSOLVE_STEPS) return;
    const next = dissolved + 1;
    setDissolved(next);
    if (next >= DISSOLVE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = dissolved / DISSOLVE_STEPS;
  const PARTICLE_COUNT = 40;

  // Seeded pseudo-random for stable particle positions
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      baseX: 60 + (i % 7) * 12 + ((i * 37) % 11) * 2,
      baseY: 30 + Math.floor(i / 7) * 18 + ((i * 23) % 9) * 2,
      driftX: ((i * 53) % 17 - 8) * 4,
      driftY: ((i * 41) % 13 - 6) * 5,
      hue: 35 + ((i * 19) % 20),
      size: 1.5 + ((i * 29) % 10) / 5,
      delay: (i % 5) * 0.1,
    }))
  ).current;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Self-Compassion" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Look at your hand...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Every atom in your hand was forged in the heart of a dying star. You are ancient.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to dissolve into stardust</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={dissolve}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: dissolved >= DISSOLVE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '180px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(240, 12%, 6%, 0.3)' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Hand silhouette — fading */}
                <motion.g initial={{ opacity: 1 }} animate={{ opacity: 1 - t * 0.9 }} transition={{ duration: 0.8 }}>
                  {/* Simple hand shape */}
                  <path d="M 85 140 L 85 80 Q 85 65, 90 60 L 92 45 Q 93 38, 97 38 Q 101 38, 102 45 L 103 55
                    L 105 35 Q 106 26, 110 26 Q 114 26, 115 35 L 115 55
                    L 117 32 Q 118 24, 122 24 Q 126 24, 127 32 L 127 58
                    L 129 42 Q 130 35, 134 35 Q 138 35, 138 42 L 137 70 Q 140 68, 143 70 Q 148 74, 145 82 L 140 95 Q 135 110, 130 120 L 130 140 Z"
                    fill={`hsla(30, 15%, 35%, ${0.15 * (1 - t)})`}
                    stroke={`hsla(30, 12%, 40%, ${0.1 * (1 - t)})`}
                    strokeWidth="0.5"
                  />
                </motion.g>
                {/* Particles — each drifts outward as t increases */}
                {particles.map((p, i) => {
                  const progress = Math.min(t * 1.3, 1);
                  const cx = p.baseX + p.driftX * progress + Math.sin(phase + i) * progress * 3;
                  const cy = p.baseY + p.driftY * progress + Math.cos(phase + i * 0.7) * progress * 2 - progress * 15;
                  const visible = (i / PARTICLE_COUNT) < (t + 0.2);
                  return visible ? (
                    <circle key={i} cx={cx} cy={cy} r={p.size * (0.5 + progress * 0.8)}
                      fill={`hsla(${p.hue}, ${40 + progress * 20}%, ${50 + progress * 15}%, ${0.1 + progress * 0.35})`}
                    />
                  ) : null;
                })}
                {/* Stellar glow at full dissolution */}
                {t >= 1 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ duration: 2 }}>
                    <circle cx="110" cy="85" r="50" fill="hsla(45, 35%, 55%, 0.1)" />
                    <circle cx="110" cy="85" r="30" fill="hsla(45, 40%, 58%, 0.15)" />
                  </motion.g>
                )}
              </svg>
            </div>
            <motion.div key={dissolved} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {dissolved === 0 ? 'A hand. Solid. Familiar.' : dissolved < DISSOLVE_STEPS ? 'Dissolving into atoms...' : 'Stardust. You are ancient.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: DISSOLVE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < dissolved ? 'hsla(45, 45%, 55%, 0.5)' : palette.primaryFaint, opacity: i < dissolved ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Your hand dissolved. Gold atoms adrift. Every one forged in a dying star. You are 13.8 billion years old.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Cosmic perspective. Daily stressors framed in cosmic time. The Overview Effect: from orbit, borders disappear.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Hand. Atoms. Stars.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}